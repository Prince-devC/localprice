const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { requireRole, optionalAuth } = require('../middleware/roleAuth');

// Ensure app_settings table exists
async function ensureSettingsTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_by TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await db.execute(createSql);
}

// Helper to load Kobo settings
async function loadKoboSettings() {
  await ensureSettingsTable();
  const [rows] = await db.execute(
    `SELECT key, value FROM app_settings WHERE key IN ('kobo_server_url','kobo_username','kobo_password')`
  );
  const out = { server_url: null, username: null, password: null };
  (rows || []).forEach(r => {
    if (r.key === 'kobo_server_url') out.server_url = r.value || null;
    if (r.key === 'kobo_username') out.username = r.value || null;
    if (r.key === 'kobo_password') out.password = r.value || null;
  });
  return out;
}

// GET Kobo settings (authenticated optional, read-only)
router.get('/kobo', optionalAuth, async (req, res) => {
  try {
    const settings = await loadKoboSettings();
    res.json({ success: true, data: settings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur lecture paramètres: ' + e.message });
  }
});

// PUT Kobo settings (super admin only)
router.put('/kobo', requireRole('super_admin'), async (req, res) => {
  try {
    await ensureSettingsTable();
    const { server_url, username, password } = req.body || {};
    const userId = (req.user && req.user.id) || (req.supabaseUser && req.supabaseUser.id) || null;
    const upsertSql = `
      INSERT INTO app_settings (key, value, updated_by, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
    `;
    const pairs = [
      ['kobo_server_url', server_url],
      ['kobo_username', username],
      ['kobo_password', password]
    ];
    for (const [k, v] of pairs) {
      if (typeof v !== 'undefined') {
        await db.execute(upsertSql, [k, v || null, userId]);
      }
    }
    const settings = await loadKoboSettings();
    res.json({ success: true, data: settings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour paramètres: ' + e.message });
  }
});

module.exports = router;