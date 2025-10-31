const express = require('express');
const router = express.Router();
const AgriculturalPrice = require('../models/AgriculturalPrice');
const ProductCategory = require('../models/ProductCategory');
const Locality = require('../models/Locality');
const Unit = require('../models/Unit');
const Cost = require('../models/Cost');
const { requireAdmin, requireRole } = require('../middleware/roleAuth');
const db = require('../database/connection');
const axios = require('axios');
const { sendContributionStatusEmail, sendPriceStatusEmail } = require('../utils/mailer');
// Ensure optional column for submission method exists
async function ensureSubmissionMethodColumn() {
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN submission_method TEXT;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`UPDATE prices SET submission_method = 'Formulaire Web' WHERE submission_method IS NULL;`);
  } catch (e) {
    // ignore
  }
}

// Modération: tables bannis/supprimés (créées à la volée)
async function ensureModerationTables() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS banned_users (
      user_id TEXT PRIMARY KEY,
      banned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      banned_by TEXT
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS deleted_users (
      user_id TEXT PRIMARY KEY,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_by TEXT
    )
  `);
}


// GET /api/admin/dashboard - Tableau de bord admin
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Statistiques générales
    const [priceStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_prices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_prices,
        SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) as validated_prices,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_prices
      FROM prices
    `);

    // Statistiques utilisateurs (Supabase si configuré, sinon fallback SQLite)
    let userStats;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      const baseUrl = supabaseUrl.replace(/\/$/, '');
      const perPage = 200;
      let page = 1;
      let supaUsers = [];
      while (true) {
        const url = `${baseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
        const resp = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
          timeout: 10000,
        });
        const data = resp?.data || {};
        const chunk = Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : [];
        supaUsers = supaUsers.concat(chunk);
        if (!chunk.length || chunk.length < perPage || page > 20) break;
        page++;
      }
      // Dédupliquer les utilisateurs par id
      const uniqueUsersMap = new Map();
      for (const u of supaUsers) uniqueUsersMap.set(String(u.id), u);
      const uniqueUsers = Array.from(uniqueUsersMap.values());
      const supaIdSet = new Set(uniqueUsers.map(u => String(u.id)));
      const supaEmailSet = new Set(uniqueUsers.map(u => String(u.email || '').toLowerCase()).filter(Boolean));

      // Récupérer les rôles locaux et lier par id OU email (pour compat)
      const [contributorsRows] = await db.execute(`
        SELECT DISTINCT ur.user_id, u.email 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        LEFT JOIN users u ON u.id = ur.user_id
        WHERE r.name = 'contributor'
      `);
      const [adminsRows] = await db.execute(`
        SELECT DISTINCT ur.user_id, u.email 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        LEFT JOIN users u ON u.id = ur.user_id
        WHERE r.name IN ('admin', 'super_admin')
      `);
      const [deletedRows] = await db.execute(`SELECT user_id FROM deleted_users`);
      const deletedSet = new Set((deletedRows || []).map(r => String(r.user_id)));

      const total_users = uniqueUsers.filter(u => !deletedSet.has(String(u.id))).length;
      const matchRow = (row) => supaIdSet.has(String(row.user_id)) || (row.email && supaEmailSet.has(String(row.email).toLowerCase()));
      const contributors = (contributorsRows || []).filter(matchRow).length;
      const admins = (adminsRows || []).filter(matchRow).length;
      // Compter les super_admins et les exclure du total
      const [superAdminsRows] = await db.execute(`
        SELECT DISTINCT ur.user_id, u.email 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        LEFT JOIN users u ON u.id = ur.user_id
        WHERE r.name = 'super_admin'
      `);
      const superAdminsCount = (superAdminsRows || []).filter(matchRow).length;
      const adjusted_total = Math.max(0, total_users - superAdminsCount);

      userStats = { total_users: adjusted_total, contributors, admins };
    } else {
      const [[{ total_users }]] = await db.execute(`SELECT COUNT(*) as total_users FROM users`);
      const [[{ contributors }]] = await db.execute(`
        SELECT COUNT(DISTINCT ur.user_id) as contributors
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name = 'contributor'
      `);
      const [[{ admins }]] = await db.execute(`
        SELECT COUNT(DISTINCT ur.user_id) as admins
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name IN ('admin', 'super_admin')
      `);
      const [[{ super_admins }]] = await db.execute(`
        SELECT COUNT(DISTINCT ur.user_id) as super_admins
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name = 'super_admin'
      `);
      const adjusted_total = Math.max(0, total_users - super_admins);
      userStats = { total_users: adjusted_total, contributors, admins };
    }

    const [productStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(DISTINCT category_id) as total_categories
      FROM products
    `);

    const [localityStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_localities,
        COUNT(DISTINCT region_id) as total_regions
      FROM localities
    `);

    // Statistiques des demandes de contribution
    const [[{ pending: contrib_pending }]] = await db.execute(`
      SELECT COUNT(*) as pending FROM contribution_requests WHERE status = 'pending'
    `);
    const [[{ approved: contrib_approved }]] = await db.execute(`
      SELECT COUNT(*) as approved FROM contribution_requests WHERE status = 'approved'
    `);
    const [[{ rejected: contrib_rejected }]] = await db.execute(`
      SELECT COUNT(*) as rejected FROM contribution_requests WHERE status = 'rejected'
    `);
    const contributionStats = {
      pending: contrib_pending || 0,
      approved: contrib_approved || 0,
      rejected: contrib_rejected || 0,
    };

    // Statistiques de modération (bannis/supprimés)
    await ensureModerationTables();
    const [[{ banned_users }]] = await db.execute(`
      SELECT COUNT(*) as banned_users FROM banned_users
    `);
    const [[{ deleted_users }]] = await db.execute(`
      SELECT COUNT(*) as deleted_users FROM deleted_users
    `);
    const moderationStats = {
      banned_users: banned_users || 0,
      deleted_users: deleted_users || 0,
    };

    // Statistiques des offres
    const [[{ total_offers }]] = await db.execute(`
      SELECT COUNT(*) as total_offers FROM offers
    `);
    const [[{ active_offers }]] = await db.execute(`
      SELECT COUNT(*) as active_offers FROM offers WHERE is_active = 1
    `);
    const offerStats = {
      total_offers: total_offers || 0,
      active_offers: active_offers || 0,
    };

    // Prix récents
    const [recentPrices] = await db.execute(`
      SELECT p.id, pr.name as product_name, l.name as locality_name, 
             p.price, p.status, p.created_at
      FROM prices p
      JOIN products pr ON p.product_id = pr.id
      JOIN localities l ON p.locality_id = l.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        priceStats: priceStats[0],
        userStats,
        productStats: productStats[0],
        localityStats: localityStats[0],
        contributionStats,
        moderationStats,
        offerStats,
        recentPrices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/pending-prices - Prix en attente de validation
router.get('/pending-prices', requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const prices = await AgriculturalPrice.getPendingPrices(parseInt(limit), parseInt(offset));
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users - Liste des utilisateurs avec rôles (pivot)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, role } = req.query;
    const perPage = Math.max(1, parseInt(limit));
    const page = Math.floor(parseInt(offset) / perPage) + 1;

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Si clé service Supabase dispo, utiliser l'API admin pour lister les utilisateurs réels
    if (supabaseUrl && serviceKey) {
      const baseUrl = supabaseUrl.replace(/\/$/, '');
      const url = `${baseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
      const resp = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        timeout: 10000,
      });

      const supaData = resp?.data || {};
      const supaUsers = Array.isArray(supaData.users) ? supaData.users : Array.isArray(supaData) ? supaData : [];

      // Récupérer les rôles locaux pour enrichir les utilisateurs Supabase
      const [roleRows] = await db.execute(`
        SELECT ur.user_id, r.name AS role_name
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
      `);
      const roleMap = {};
      for (const row of (roleRows || [])) {
        roleMap[row.user_id] = roleMap[row.user_id] || [];
        roleMap[row.user_id].push(row.role_name);
      }

      const [localUsers] = await db.execute('SELECT id, email, role, created_at FROM users');
      const emailRoleMap = {};
      for (const lu of (localUsers || [])) {
        if (lu.email) emailRoleMap[lu.email] = lu.role || 'user';
      }

      let data = supaUsers.map((u) => {
        const roles = roleMap[u.id] || (emailRoleMap[u.email] ? [emailRoleMap[u.email]] : []);

        // Métadonnées possibles
        const umd = u.user_metadata || {}; // Supabase moderne (camelCase)
        const rmd = u.raw_user_meta_data || {}; // Ancien alias
        const identity = Array.isArray(u.identities)
          ? u.identities.find(i => i && i.identity_data && (i.identity_data.full_name || i.identity_data.name || i.identity_data.given_name || i.identity_data.family_name))
          : null;
        const idData = (identity && identity.identity_data) || {};

        // Déterminer prénom/nom (priorité firstName/lastName)
        let first_name = umd.firstName || rmd.firstName || idData.given_name || null;
        let last_name = umd.lastName || rmd.lastName || idData.family_name || null;

        // Déterminer display_name avec une stratégie de fallback alignée avec le Header
        let displayName = null;
        if (first_name || last_name) {
          displayName = `${first_name || ''} ${last_name || ''}`.trim();
        }
        if (!displayName) {
          displayName = umd.display_name
            || umd.full_name
            || umd.name
            || rmd.display_name
            || rmd.full_name
            || rmd.name
            || idData.full_name
            || idData.name
            || null;
        }
        if (!displayName) {
          displayName = umd.username || rmd.username || (u.email ? u.email.split('@')[0] : null);
        }

        const username = (umd.username) || (rmd.username) || (u.email ? u.email.split('@')[0] : null);

        return {
          id: u.id,
          username,
          email: u.email,
          created_at: u.created_at,
          roles,
          first_name,
          last_name,
          display_name: displayName,
        };
      });

      if (role) {
        data = data.filter((u) => Array.isArray(u.roles) && u.roles.includes(role));
      }

      await ensureModerationTables();
      const [bannedRows] = await db.execute(`SELECT user_id FROM banned_users`);
      const [deletedRows] = await db.execute(`SELECT user_id FROM deleted_users`);
      const bannedSet = new Set((bannedRows || []).map(r => String(r.user_id)));
      const deletedSet = new Set((deletedRows || []).map(r => String(r.user_id)));

      data = data.map(u => ({
        ...u,
        is_banned: bannedSet.has(String(u.id)),
        is_deleted: deletedSet.has(String(u.id)),
      }));

      const includeDeleted = String(req.query.include_deleted || '').toLowerCase() === 'true';
      if (!includeDeleted) {
        data = data.filter(u => !u.is_deleted);
      }

      return res.json({ success: true, data });
    }

    // Fallback: liste locale depuis SQLite si pas de clé service
    await ensureModerationTables();
    let query = `
      SELECT u.id, u.username, u.email, u.created_at,
             GROUP_CONCAT(r.name) AS roles,
             CASE WHEN bu.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_banned,
             CASE WHEN du.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_deleted
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      LEFT JOIN banned_users bu ON bu.user_id = u.id
      LEFT JOIN deleted_users du ON du.user_id = u.id
    `;
    const params = [];
    if (role) {
      query += ` WHERE u.id IN (
        SELECT ur2.user_id FROM user_roles ur2
        JOIN roles r2 ON r2.id = ur2.role_id
        WHERE r2.name = ?
      )`;
      params.push(role);
    }
    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [users] = await db.execute(query, params);
    let data = (users || []).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      created_at: u.created_at,
      roles: (u.roles ? u.roles.split(',') : []),
      first_name: null,
      last_name: null,
      display_name: null,
      is_banned: !!u.is_banned,
      is_deleted: !!u.is_deleted,
    }));
    // Filtrer pour n'afficher que les comptes ayant un identifiant Supabase (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    data = data.filter(u => uuidRegex.test(String(u.id)));
    
    // Exclure les supprimés par défaut (inclure via include_deleted=true)
    const includeDeleted = String(req.query.include_deleted || '').toLowerCase() === 'true';
    if (!includeDeleted) {
      data = data.filter(u => !u.is_deleted);
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/contributors - Liste des contributeurs acceptés avec stats et préférences
router.get('/contributors', requireAdmin, async (req, res) => {
  try {
    await ensureModerationTables();
    const { limit = 100, offset = 0, active_only } = req.query;

    // Récupérer les utilisateurs ayant le rôle contributor
    const [contributorsRows] = await db.execute(
      `SELECT DISTINCT u.id, u.email, u.username
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       LEFT JOIN users u ON u.id = ur.user_id
       LEFT JOIN banned_users bu ON bu.user_id = u.id
       LEFT JOIN deleted_users du ON du.user_id = u.id
       WHERE r.name = 'contributor'
         AND du.user_id IS NULL
         AND u.id NOT IN (
           SELECT ur2.user_id
           FROM user_roles ur2
           JOIN roles r2 ON r2.id = ur2.role_id
           WHERE r2.name = 'super_admin'
         )
       ORDER BY u.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );

    // Compter les prix soumis par utilisateur
    const [countRows] = await db.execute(`
      SELECT submitted_by AS user_id,
             COUNT(*) AS total_prices,
             SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) AS validated_prices,
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_prices,
             SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_prices
      FROM prices
      WHERE submitted_by IS NOT NULL
      GROUP BY submitted_by
    `);
    const countMap = new Map((countRows || []).map(r => [String(r.user_id), r]));

    // Préférences du compte
    const [prefRows] = await db.execute(`
      SELECT user_id,
             has_smartphone_default AS pref_has_smartphone,
             has_internet_default AS pref_has_internet,
             preferred_method
      FROM user_preferences
    `);
    const prefMap = new Map((prefRows || []).map(r => [String(r.user_id), r]));

    // Enrichir avec Supabase (affichage)
    let enriched = contributorsRows || [];
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      if (supabaseUrl && serviceKey) {
        const base = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
        const promises = (contributorsRows || []).map(async (u) => {
          try {
            const resp = await axios.get(`${base}/admin/users/${u.id}`, {
              headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
              timeout: 8000,
            });
            const supaUser = resp?.data || null;
            const firstName = supaUser?.user_metadata?.firstName || null;
            const lastName = supaUser?.user_metadata?.lastName || null;
            const usernameMeta = supaUser?.user_metadata?.username || null;
            const displayName = ([firstName, lastName].filter(Boolean).join(' ').trim()) || usernameMeta || u.username || u.email || 'Utilisateur';
            return { ...u, display_name: displayName, first_name: firstName || null, last_name: lastName || null };
          } catch (_) {
            const displayName = u.username || u.email || 'Utilisateur';
            return { ...u, display_name: displayName };
          }
        });
        enriched = await Promise.all(promises);
      }
    } catch (_) {
      enriched = contributorsRows || [];
    }

    // Fusionner stats et préférences
    let data = (enriched || []).map(u => {
      const stats = countMap.get(String(u.id)) || { total_prices: 0, validated_prices: 0, pending_prices: 0, rejected_prices: 0 };
      const prefs = prefMap.get(String(u.id)) || { pref_has_smartphone: 1, pref_has_internet: 1, preferred_method: 'web' };
      return {
        id: u.id,
        email: u.email,
        username: u.username,
        display_name: u.display_name,
        total_prices: stats.total_prices || 0,
        validated_prices: stats.validated_prices || 0,
        pending_prices: stats.pending_prices || 0,
        rejected_prices: stats.rejected_prices || 0,
        pref_has_smartphone: prefs.pref_has_smartphone,
        pref_has_internet: prefs.pref_has_internet,
        preferred_method: prefs.preferred_method,
      };
    });

    const onlyActive = String(active_only || '').toLowerCase() === 'true';
    if (onlyActive) {
      data = data.filter(d => (d.validated_prices || 0) > 0 || (d.total_prices || 0) > 0);
    }

    // Trier par prix validés puis total
    data.sort((a, b) => (b.validated_prices - a.validated_prices) || (b.total_prices - a.total_prices));

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// === Gestion des rôles via pivot (super admin) ===
// POST /api/admin/users/:id/roles/:role - Ajouter un rôle
router.post('/users/:id/roles/:role', requireRole('super_admin'), async (req, res) => {
  try {
    const { id, role } = req.params;
    // Interdiction explicite d'assigner super_admin
    if (role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Assignation du rôle super_admin interdite' });
    }
    if (!['user','contributor','admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }
    const [[roleRow]] = await db.execute('SELECT id FROM roles WHERE name = ?', [role]);
    if (!roleRow) {
      return res.status(404).json({ success: false, message: 'Rôle introuvable' });
    }
    await db.execute(
      'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [id, roleRow.id]
    );
    // Optionnel: mettre à jour le rôle principal dans users
    await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ success: true, message: 'Rôle ajouté' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/users/:id/roles/:role - Retirer un rôle
router.delete('/users/:id/roles/:role', requireRole('super_admin'), async (req, res) => {
  try {
    const { id, role } = req.params;
    const [[roleRow]] = await db.execute('SELECT id FROM roles WHERE name = ?', [role]);
    if (!roleRow) {
      return res.status(404).json({ success: false, message: 'Rôle introuvable' });
    }
    await db.execute(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [id, roleRow.id]
    );
    res.json({ success: true, message: 'Rôle retiré' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/audit-logs - Logs d'audit
router.get('/audit-logs', requireAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const [logs] = await db.execute(`
      SELECT al.*, u.username, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `);
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/validate-price - Valider un prix
router.post('/validate-price/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    await ensureSubmissionMethodColumn();
    const success = await AgriculturalPrice.validatePrice(id, req.user.id, comment);
    
    if (success) {
      // Notify contributor by email
      try {
        const row = await db.get(
          `SELECT p.id, p.price, p.date, p.comment, p.submitted_by,
                  pr.name AS product_name,
                  l.name AS locality_name,
                  un.name AS unit_name, un.symbol AS unit_symbol,
                  usr.email AS user_email, usr.username AS user_username
           FROM prices p
           JOIN products pr ON p.product_id = pr.id
           JOIN localities l ON p.locality_id = l.id
           JOIN units un ON p.unit_id = un.id
           LEFT JOIN users usr ON p.submitted_by = usr.id
           WHERE p.id = ?
           LIMIT 1`,
          [id]
        );
        const recipient = row && row.user_email;
        let displayName = null;
        try {
          const supabaseUrl = process.env.SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
          if (supabaseUrl && serviceKey && row && row.submitted_by) {
            const base = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
            const resp = await axios.get(`${base}/admin/users/${row.submitted_by}`, {
              headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
              timeout: 8000,
            });
            const supaUser = resp?.data || null;
            const firstName = supaUser?.user_metadata?.firstName || null;
            const lastName = supaUser?.user_metadata?.lastName || null;
            const usernameMeta = supaUser?.user_metadata?.username || null;
            displayName = ([firstName, lastName].filter(Boolean).join(' ').trim()) || usernameMeta || row.user_username || row.user_email || 'Utilisateur';
          }
        } catch (_) {
          displayName = row?.user_username || row?.user_email || 'Utilisateur';
        }
        if (!displayName) displayName = row?.user_username || row?.user_email || 'Utilisateur';
        if (recipient) await sendPriceStatusEmail(recipient, 'approved', {
          name: displayName,
          productName: row?.product_name,
          localityName: row?.locality_name,
          unitName: row?.unit_name,
          unitSymbol: row?.unit_symbol,
          price: row?.price,
          date: row?.date,
          comment: row?.comment,
        });
      } catch (e) {
        console.warn('[admin] Échec envoi email validation prix:', e?.message || e);
      }
      res.json({ success: true, message: 'Prix validé avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou déjà traité' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/reject-price - Rejeter un prix
router.post('/reject-price/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'La raison du rejet est obligatoire'
      });
    }
    await ensureSubmissionMethodColumn();
    const success = await AgriculturalPrice.rejectPrice(id, req.user.id, rejection_reason);
    
    if (success) {
      // Notify contributor by email with rejection reason
      try {
        const row = await db.get(
          `SELECT p.id, p.price, p.date, p.comment, p.submitted_by,
                  pr.name AS product_name,
                  l.name AS locality_name,
                  un.name AS unit_name, un.symbol AS unit_symbol,
                  usr.email AS user_email, usr.username AS user_username
           FROM prices p
           JOIN products pr ON p.product_id = pr.id
           JOIN localities l ON p.locality_id = l.id
           JOIN units un ON p.unit_id = un.id
           LEFT JOIN users usr ON p.submitted_by = usr.id
           WHERE p.id = ?
           LIMIT 1`,
          [id]
        );
        const recipient = row && row.user_email;
        let displayName = null;
        try {
          const supabaseUrl = process.env.SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
          if (supabaseUrl && serviceKey && row && row.submitted_by) {
            const base = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
            const resp = await axios.get(`${base}/admin/users/${row.submitted_by}`, {
              headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
              timeout: 8000,
            });
            const supaUser = resp?.data || null;
            const firstName = supaUser?.user_metadata?.firstName || null;
            const lastName = supaUser?.user_metadata?.lastName || null;
            const usernameMeta = supaUser?.user_metadata?.username || null;
            displayName = ([firstName, lastName].filter(Boolean).join(' ').trim()) || usernameMeta || row.user_username || row.user_email || 'Utilisateur';
          }
        } catch (_) {
          displayName = row?.user_username || row?.user_email || 'Utilisateur';
        }
        if (!displayName) displayName = row?.user_username || row?.user_email || 'Utilisateur';
        if (recipient) await sendPriceStatusEmail(recipient, 'rejected', {
          name: displayName,
          productName: row?.product_name,
          localityName: row?.locality_name,
          unitName: row?.unit_name,
          unitSymbol: row?.unit_symbol,
          price: row?.price,
          date: row?.date,
          reason: rejection_reason,
        });
      } catch (e) {
        console.warn('[admin] Échec envoi email rejet prix:', e?.message || e);
      }
      res.json({ success: true, message: 'Prix rejeté avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou déjà traité' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;




// ===== Gestion des demandes de contribution =====
router.get('/contribution-requests', requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    let query = `
      SELECT cr.*, u.email, u.username
      FROM contribution_requests cr
      LEFT JOIN users u ON cr.user_id = u.id
    `;
    const params = [];
    if (status) {
      query += ` WHERE cr.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY cr.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const [rows] = await db.execute(query, params);

    // Enrichir avec le nom d'affichage depuis Supabase (firstName/lastName/username)
    let enriched = rows;
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      if (supabaseUrl && serviceKey) {
        const base = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
        const promises = (rows || []).map(async (r) => {
          try {
            const resp = await axios.get(`${base}/admin/users/${r.user_id}`, {
              headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
              timeout: 8000,
            });
            const supaUser = resp?.data || null;
            const firstName = supaUser?.user_metadata?.firstName || null;
            const lastName = supaUser?.user_metadata?.lastName || null;
            const usernameMeta = supaUser?.user_metadata?.username || null;
            const displayName = ([firstName, lastName].filter(Boolean).join(' ').trim()) || usernameMeta || r.username || r.email || 'Utilisateur';
            return { ...r, display_name: displayName, first_name: firstName || null, last_name: lastName || null };
          } catch (_) {
            const displayName = r.username || r.email || 'Utilisateur';
            return { ...r, display_name: displayName };
          }
        });
        enriched = await Promise.all(promises);
      }
    } catch (_) {
      enriched = rows;
    }

    return res.json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/contribution-requests/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Récupère la demande pour connaître l'utilisateur
    const [rows] = await db.execute('SELECT * FROM contribution_requests WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }
    const request = rows[0];

    // Met à jour la demande
    await db.execute(
      'UPDATE contribution_requests SET status = "approved", reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.id, id]
    );

    // Ajoute le rôle via la table pivot
    const [[roleRow]] = await db.execute('SELECT id FROM roles WHERE name = "contributor" LIMIT 1');
    const roleId = roleRow && roleRow.id;
    if (!roleId) {
      return res.status(500).json({ success: false, message: 'Rôle contributor introuvable' });
    }
    await db.execute('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', [request.user_id, roleId]);

    // Envoi d'email (meilleure expérience utilisateur)
    try {
      const [[userRow]] = await db.execute('SELECT email, username FROM users WHERE id = ? LIMIT 1', [request.user_id]);
      const recipient = userRow && userRow.email;
      let displayName = null;
      try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          const base = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
          const resp = await axios.get(`${base}/admin/users/${request.user_id}`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
            timeout: 8000,
          });
          const supaUser = resp?.data || null;
          const firstName = supaUser?.user_metadata?.firstName || null;
          const lastName = supaUser?.user_metadata?.lastName || null;
          const usernameMeta = supaUser?.user_metadata?.username || null;
          displayName = ([firstName, lastName].filter(Boolean).join(' ').trim()) || usernameMeta || userRow?.username || userRow?.email || 'Utilisateur';
        }
      } catch (_) {
        displayName = userRow?.username || userRow?.email || 'Utilisateur';
      }
      await sendContributionStatusEmail(recipient, 'approved', { name: displayName });
    } catch (e) {
      console.warn('[admin] Échec envoi email approuvé:', e?.message || e);
    }

    return res.json({ success: true, message: 'Demande approuvée, utilisateur promu contributeur' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/contribution-requests/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    if (!rejection_reason) {
      return res.status(400).json({ success: false, message: 'La raison du rejet est requise' });
    }

    // Vérifie la demande
    const [rows] = await db.execute('SELECT user_id FROM contribution_requests WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }
    const userId = rows[0].user_id;
    await db.execute(
      'UPDATE contribution_requests SET status = "rejected", reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?',
      [req.user.id, rejection_reason, id]
    );

    // Envoi d'email (feedback en cas de rejet)
    try {
      const [[userRow]] = await db.execute('SELECT email, username FROM users WHERE id = ? LIMIT 1', [userId]);
      const recipient = userRow && userRow.email;
      let displayName = null;
      try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          const base = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
          const resp = await axios.get(`${base}/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
            timeout: 8000,
          });
          const supaUser = resp?.data || null;
          const firstName = supaUser?.user_metadata?.firstName || null;
          const lastName = supaUser?.user_metadata?.lastName || null;
          const usernameMeta = supaUser?.user_metadata?.username || null;
          displayName = ([firstName, lastName].filter(Boolean).join(' ').trim()) || usernameMeta || userRow?.username || userRow?.email || 'Utilisateur';
        }
      } catch (_) {
        displayName = userRow?.username || userRow?.email || 'Utilisateur';
      }
      await sendContributionStatusEmail(recipient, 'rejected', { name: displayName, reason: rejection_reason });
    } catch (e) {
      console.warn('[admin] Échec envoi email rejet:', e?.message || e);
    }

    return res.json({ success: true, message: 'Demande rejetée' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


// Offres payantes - liste
router.get('/offers', requireAdmin, async (req, res) => {
  try {
    const { is_active, limit = 100, offset = 0 } = req.query;
    let query = `SELECT * FROM offers`;
    const params = [];
    if (typeof is_active !== 'undefined') {
      query += ` WHERE is_active = ?`;
      params.push(is_active ? 1 : 0);
    }
    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




// PUT /api/admin/users/ban - Bannir/Débannir des utilisateurs (multi)
router.put('/users/ban', requireRole('super_admin'), async (req, res) => {
  try {
    await ensureModerationTables();
    const { user_ids = [], is_banned } = req.body || {};
    if (!Array.isArray(user_ids) || user_ids.length === 0 || typeof is_banned === 'undefined') {
      return res.status(400).json({ success: false, message: 'user_ids (array) et is_banned requis' });
    }

    // Exclure tout compte super_admin
    const [superAdminRows] = await db.execute(
      `SELECT DISTINCT ur.user_id AS id FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE r.name = 'super_admin' AND ur.user_id IN (${user_ids.map(() => '?').join(',')})`,
      user_ids
    );
    const protectedIds = new Set((superAdminRows || []).map(r => String(r.id)));

    const targets = user_ids.filter(id => !protectedIds.has(String(id)));
    if (targets.length === 0) {
      return res.json({ success: true, affected: 0, skipped: Array.from(protectedIds) });
    }

    if (is_banned) {
      for (const id of targets) {
        await db.execute(
          `INSERT OR IGNORE INTO banned_users (user_id, banned_by) VALUES (?, ?)`,
          [id, req.user.id]
        );
      }
    } else {
      await db.execute(
        `DELETE FROM banned_users WHERE user_id IN (${targets.map(() => '?').join(',')})`,
        targets
      );
    }

    return res.json({ success: true, affected: targets.length, skipped: Array.from(protectedIds) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/users/bulk-delete - Supprimer (soft) des utilisateurs (multi)
router.post('/users/bulk-delete', requireRole('super_admin'), async (req, res) => {
  try {
    await ensureModerationTables();
    const { user_ids = [] } = req.body || {};
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'user_ids (array) requis' });
    }

    // Exclure tout compte super_admin
    const [superAdminRows] = await db.execute(
      `SELECT DISTINCT ur.user_id AS id FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE r.name = 'super_admin' AND ur.user_id IN (${user_ids.map(() => '?').join(',')})`,
      user_ids
    );
    const protectedIds = new Set((superAdminRows || []).map(r => String(r.id)));

    const targets = user_ids.filter(id => !protectedIds.has(String(id)));
    if (targets.length === 0) {
      return res.json({ success: true, affected: 0, skipped: Array.from(protectedIds) });
    }

    for (const id of targets) {
      await db.execute(
        `INSERT OR IGNORE INTO deleted_users (user_id, deleted_by) VALUES (?, ?)`,
        [id, req.user.id]
      );
      await db.execute(`DELETE FROM user_roles WHERE user_id = ?`, [id]);
      await db.execute(`UPDATE users SET role = NULL WHERE id = ?`, [id]);
    }

    return res.json({ success: true, affected: targets.length, skipped: Array.from(protectedIds) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});



