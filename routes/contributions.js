const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticateSupabaseToken } = require('./auth');

// Ensure table exists at runtime (defensive)
const ensureContributionSchema = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS contribution_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      address TEXT,
      commune TEXT,
      activity TEXT,
      cooperative_member INTEGER DEFAULT 0 CHECK (cooperative_member IN (0,1)),
      cooperative_name TEXT,
      has_smartphone INTEGER DEFAULT 1 CHECK (has_smartphone IN (0,1)),
      has_internet INTEGER DEFAULT 1 CHECK (has_internet IN (0,1)),
      submission_method TEXT DEFAULT 'web' CHECK (submission_method IN ('web','mobile','sms','whatsapp','offline')),
      contact_phone TEXT,
      has_whatsapp INTEGER DEFAULT 0 CHECK (has_whatsapp IN (0,1)),
      experience_level TEXT CHECK (experience_level IN ('debutant','intermediaire','expert')),
      notes TEXT,
      reviewed_by TEXT,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_contrib_requests_user ON contribution_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_contrib_requests_status ON contribution_requests(status);
    CREATE INDEX IF NOT EXISTS idx_contrib_requests_created ON contribution_requests(created_at);
  `;
  await db.exec(sql);

  // Ajoute les colonnes manquantes si la table existe déjà (idempotent)
  try {
    await db.exec(`ALTER TABLE contribution_requests ADD COLUMN has_whatsapp INTEGER DEFAULT 0 CHECK (has_whatsapp IN (0,1));`);
  } catch (e) {
    // ignore if column exists
  }
  try {
    await db.exec(`ALTER TABLE contribution_requests ADD COLUMN experience_level TEXT CHECK (experience_level IN ('debutant','intermediaire','expert'));`);
  } catch (e) {
    // ignore if column exists
  }
};

const ensurePreferencesSchema = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      has_smartphone_default INTEGER DEFAULT 1 CHECK (has_smartphone_default IN (0,1)),
      has_internet_default INTEGER DEFAULT 1 CHECK (has_internet_default IN (0,1)),
      preferred_method TEXT DEFAULT 'web' CHECK (preferred_method IN ('web','offline','whatsapp','sms','mobile')),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      await db.execute('INSERT OR IGNORE INTO users (id, username, email, role) VALUES (?, ?, ?, ?)', [userId, usernameMeta, email, 'user']);
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
      'SELECT id FROM contribution_requests WHERE user_id = ? AND status = "pending" ORDER BY created_at DESC LIMIT 1',
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
    const [result] = await db.execute(
      `INSERT INTO contribution_requests (
        user_id, address, commune, activity, cooperative_member, cooperative_name,
        has_smartphone, has_internet, submission_method, contact_phone, has_whatsapp, experience_level, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address || null,
        commune || null,
        activity || null,
        Number(cooperative_member) ? 1 : 0,
        cooperative_name || null,
        Number(has_smartphone) ? 1 : 0,
        Number(has_internet) ? 1 : 0,
        submission_method || 'web',
        phone,
        Number(has_whatsapp) ? 1 : 0,
        exp,
        notes || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Demande soumise, en attente de validation admin',
      data: { id: result?.lastID || null }
    });
  } catch (error) {
    console.error('Erreur apply contribution:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contributions/me - Récupère la dernière demande de l’utilisateur
router.get('/me', authenticateSupabaseToken, async (req, res) => {
  try {
    await ensureContributionSchema();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
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

router.get('/preferences', authenticateSupabaseToken, async (req, res) => {
  try {
    await ensurePreferencesSchema();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
    }
    const [rows] = await db.execute('SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1', [userId]);
    const data = rows && rows[0] ? rows[0] : {
      user_id: userId,
      has_smartphone_default: 1,
      has_internet_default: 1,
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
    const { has_smartphone_default = 1, has_internet_default = 1, preferred_method = 'web' } = req.body || {};

    const sql = `
      INSERT INTO user_preferences (user_id, has_smartphone_default, has_internet_default, preferred_method, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        has_smartphone_default = excluded.has_smartphone_default,
        has_internet_default = excluded.has_internet_default,
        preferred_method = excluded.preferred_method,
        updated_at = CURRENT_TIMESTAMP
    `;
    await db.execute(sql, [userId, Number(has_smartphone_default) ? 1 : 0, Number(has_internet_default) ? 1 : 0, preferred_method]);

    return res.json({ success: true, message: 'Préférences mises à jour' });
  } catch (error) {
    console.error('Erreur update preferences:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;