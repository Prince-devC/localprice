const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticateSupabaseToken, optionalSupabaseToken } = require('./auth');

// Ensure table exists at runtime (defensive, Postgres-only)
const ensureContributionSchema = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS contribution_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id uuid NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      address TEXT,
      commune TEXT,
      activity TEXT,
      cooperative_member BOOLEAN DEFAULT FALSE,
      cooperative_name TEXT,
      has_smartphone BOOLEAN DEFAULT TRUE,
      has_internet BOOLEAN DEFAULT TRUE,
      submission_method TEXT DEFAULT 'web' CHECK (submission_method IN ('web','mobile','sms','whatsapp','offline')),
      contact_phone TEXT,
      has_whatsapp BOOLEAN DEFAULT FALSE,
      experience_level TEXT CHECK (experience_level IN ('debutant','intermediaire','expert')),
      notes TEXT,
      reviewed_by uuid,
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_contrib_requests_user ON contribution_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_contrib_requests_status ON contribution_requests(status);
    CREATE INDEX IF NOT EXISTS idx_contrib_requests_created ON contribution_requests(created_at);
  `;
  await db.exec(sql);

  // Ajoute les colonnes manquantes si la table existe déjà (idempotent, Postgres)
  await db.exec(`ALTER TABLE contribution_requests ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT FALSE;`);
  await db.exec(`ALTER TABLE contribution_requests ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('debutant','intermediaire','expert'));`);

  // S'assure que la séquence est correctement liée et positionnée après le MAX(id)
  // Évite l'erreur: duplicate key value violates unique constraint "contribution_requests_pkey"
  await db.exec(`ALTER SEQUENCE IF EXISTS contribution_requests_id_seq OWNED BY contribution_requests.id;`);
  await db.exec(`SELECT setval(pg_get_serial_sequence('contribution_requests','id'), COALESCE((SELECT MAX(id) FROM contribution_requests), 1), true);`);
};

const ensurePreferencesSchema = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id uuid PRIMARY KEY,
      has_smartphone_default BOOLEAN DEFAULT TRUE,
      has_internet_default BOOLEAN DEFAULT TRUE,
      preferred_method TEXT DEFAULT 'web' CHECK (preferred_method IN ('web','offline','whatsapp','sms','mobile')),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
  `;
  await db.exec(sql);
};

// POST /api/contributions/apply - Soumettre une demande pour devenir contributeur
router.post('/apply', authenticateSupabaseToken, async (req, res) => {
  try {
    await ensureContributionSchema();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
    }
    const {
      address,
      commune,
      activity,
      cooperative_member = 0,
      cooperative_name = null,
      has_smartphone = 1,
      has_internet = 1,
      submission_method = 'web',
      contact_phone = null,
      has_whatsapp = 0,
      experience_level = null,
      notes = null,
    } = req.body || {};

    // Récupère le rôle actuel depuis la table users
    // Assure que l'utilisateur existe localement, sinon l'insère avec rôle par défaut 'user'
    let [users] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      const email = (req.supabaseUser && req.supabaseUser.email) || null;
      const usernameMeta = (req.supabaseUser && req.supabaseUser.user_metadata && req.supabaseUser.user_metadata.username) || null;
      await db.execute('INSERT INTO users (id, username, email, role) VALUES (?, ?, ?, ?) ON CONFLICT (id) DO NOTHING', [userId, usernameMeta, email, 'user']);
      [users] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      }
    } else {
      // Met à jour le username depuis Supabase si absent côté local
      const usernameMeta = (req.supabaseUser && req.supabaseUser.user_metadata && req.supabaseUser.user_metadata.username) || null;
      if (usernameMeta) {
        await db.execute('UPDATE users SET username = COALESCE(username, ?) WHERE id = ?', [usernameMeta, userId]);
      }
    }
    const currentRole = users[0].role;

    if (currentRole === 'contributor' || currentRole === 'admin') {
      return res.status(400).json({ success: false, message: 'Vous êtes déjà contributeur' });
    }

    // Empêche les doublons de demande en attente
    const [pending] = await db.execute(
      "SELECT id FROM contribution_requests WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    if (pending && pending.length > 0) {
      return res.status(409).json({ success: false, message: 'Une demande est déjà en attente' });
    }

    // Validation simple côté serveur
    const phone = (contact_phone || '').trim();
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Le numéro de téléphone est requis' });
    }
    // Format: commence par 01 et comporte 10 chiffres (01XXXXXXXX)
    const phoneRegex = /^01\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Format du téléphone invalide. Utilisez 01XXXXXXXX' });
    }
    const exp = (experience_level || '').toLowerCase();
    const allowedExp = ['debutant','intermediaire','expert'];
    if (!allowedExp.includes(exp)) {
      return res.status(400).json({ success: false, message: "Le niveau d'expérience est requis (Débutant/Intermédiaire/Expert)" });
    }

    // Insère la demande
    const [insertRows] = await db.execute(
      `INSERT INTO contribution_requests (
        user_id, address, commune, activity, cooperative_member, cooperative_name,
        has_smartphone, has_internet, submission_method, contact_phone, has_whatsapp, experience_level, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`,
      [
        userId,
        address || null,
        commune || null,
        activity || null,
        Boolean(Number(cooperative_member)),
        cooperative_name || null,
        Boolean(Number(has_smartphone)),
        Boolean(Number(has_internet)),
        submission_method || 'web',
        phone,
        Boolean(Number(has_whatsapp)),
        exp,
        notes || null,
      ]
    );


    return res.status(201).json({
      success: true,
      message: 'Demande soumise, en attente de validation admin',
      data: { id: insertRows && insertRows[0] ? insertRows[0].id : null }
    });
  } catch (error) {
    console.error('Erreur apply contribution:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contributions/me - Récupère la dernière demande de l’utilisateur
router.get('/me', optionalSupabaseToken, async (req, res) => {
  try {
    await ensureContributionSchema();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      // Renvoyer une réponse neutre pour éviter les loaders infinis côté client
      return res.json({ success: true, data: null });
    }

    const [rows] = await db.execute(
      `SELECT cr.*, u.email, u.username
       FROM contribution_requests cr
       LEFT JOIN users u ON cr.user_id = u.id
       WHERE cr.user_id = ?
       ORDER BY cr.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Erreur get my contribution request:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/preferences', optionalSupabaseToken, async (req, res) => {
  try {
    await ensurePreferencesSchema();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      // Fournir des préférences par défaut pour permettre le rendu côté client
      const data = {
        user_id: null,
        has_smartphone_default: true,
        has_internet_default: true,
        preferred_method: 'web',
      };
      return res.json({ success: true, data });
    }
    const [rows] = await db.execute('SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1', [userId]);
    const data = rows && rows[0] ? rows[0] : {
      user_id: userId,
      has_smartphone_default: true,
      has_internet_default: true,
      preferred_method: 'web',
    };
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur get preferences:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/preferences', authenticateSupabaseToken, async (req, res) => {
  try {
    await ensurePreferencesSchema();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
    }
    const { has_smartphone_default = true, has_internet_default = true, preferred_method = 'web' } = req.body || {};

    const sql = `
      INSERT INTO user_preferences (user_id, has_smartphone_default, has_internet_default, preferred_method, updated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON CONFLICT(user_id) DO UPDATE SET
        has_smartphone_default = excluded.has_smartphone_default,
        has_internet_default = excluded.has_internet_default,
        preferred_method = excluded.preferred_method,
        updated_at = NOW()
    `;
    await db.execute(sql, [userId, Boolean(has_smartphone_default), Boolean(has_internet_default), preferred_method]);

    return res.json({ success: true, message: 'Préférences mises à jour' });
  } catch (error) {
    console.error('Erreur update preferences:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;