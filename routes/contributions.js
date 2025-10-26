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
};

// POST /api/contributions/apply - Soumettre une demande pour devenir contributeur
router.post('/apply', authenticateSupabaseToken, async (req, res) => {
  try {
    await ensureContributionSchema();
    const userId = req.supabaseUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
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
      notes = null,
    } = req.body || {};

    // Vérifier si l'utilisateur est déjà contributeur/admin via le mapping user_roles
    const [roleRows] = await db.execute(
      'SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ?',
      [userId]
    );
    const roleNames = Array.isArray(roleRows) ? roleRows.map(r => r.name) : [];
    // Fallback via email si présent
    let userRoleCandidate = null;
    if (req.supabaseUser?.email) {
      const [userRows] = await db.execute('SELECT role FROM users WHERE email = ? LIMIT 1', [req.supabaseUser.email]);
      userRoleCandidate = (Array.isArray(userRows) && userRows.length) ? userRows[0]?.role : null;
    }
    const isAlreadyContributor = roleNames.includes('contributor') || roleNames.includes('admin') ||
      (userRoleCandidate === 'contributor' || userRoleCandidate === 'admin' || userRoleCandidate === 'super_admin');
    if (isAlreadyContributor) {
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

    // Insère la demande
    const [result] = await db.execute(
      `INSERT INTO contribution_requests (
        user_id, address, commune, activity, cooperative_member, cooperative_name,
        has_smartphone, has_internet, submission_method, contact_phone, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        contact_phone || null,
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
    const userId = req.supabaseUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
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

module.exports = router;