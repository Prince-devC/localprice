const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { requireRole, optionalAuth } = require('../middleware/roleAuth');

// Assure que la table app_settings existe (réutilisée depuis settings.js)
async function ensureSettingsTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_by uuid,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await db.execute(createSql);
}

// Clés SEO stockées dans app_settings
const SEO_KEYS = [
  'seo_site_title',
  'seo_site_description',
  'seo_site_keywords',
  'seo_home_title',
  'seo_home_description',
  'seo_og_image'
];

function mapRowsToSeo(rows) {
  const out = {
    site_title: null,
    site_description: null,
    site_keywords: null,
    home_title: null,
    home_description: null,
    og_image: null,
  };
  (rows || []).forEach(r => {
    if (r.key === 'seo_site_title') out.site_title = r.value || null;
    if (r.key === 'seo_site_description') out.site_description = r.value || null;
    if (r.key === 'seo_site_keywords') out.site_keywords = r.value || null;
    if (r.key === 'seo_home_title') out.home_title = r.value || null;
    if (r.key === 'seo_home_description') out.home_description = r.value || null;
    if (r.key === 'seo_og_image') out.og_image = r.value || null;
  });
  return out;
}

// GET /api/seo/settings — lecture des paramètres SEO (auth optionnelle)
router.get('/settings', optionalAuth, async (req, res) => {
  try {
    await ensureSettingsTable();
    const [rows] = await db.execute(
      `SELECT key, value FROM app_settings WHERE key = ANY($1)`,
      [SEO_KEYS]
    );
    const data = mapRowsToSeo(rows);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur lecture paramètres SEO: ' + e.message });
  }
});

// PUT /api/seo/settings — mise à jour des paramètres SEO (super admin)
router.put('/settings', requireRole('super_admin'), async (req, res) => {
  try {
    await ensureSettingsTable();
    const {
      site_title,
      site_description,
      site_keywords,
      home_title,
      home_description,
      og_image,
    } = req.body || {};

    const userId = (req.user && req.user.id) || (req.supabaseUser && req.supabaseUser.id) || null;
    const upsertSql = `
      INSERT INTO app_settings (key, value, updated_by, updated_at)
      VALUES (?, ?, ?, NOW())
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
    `;

    const pairs = [
      ['seo_site_title', site_title],
      ['seo_site_description', site_description],
      ['seo_site_keywords', site_keywords],
      ['seo_home_title', home_title],
      ['seo_home_description', home_description],
      ['seo_og_image', og_image],
    ];

    for (const [k, v] of pairs) {
      if (typeof v !== 'undefined') {
        await db.execute(upsertSql, [k, v || null, userId]);
      }
    }

    const [rows] = await db.execute(
      `SELECT key, value FROM app_settings WHERE key = ANY($1)`,
      [SEO_KEYS]
    );
    const data = mapRowsToSeo(rows);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour paramètres SEO: ' + e.message });
  }
});

module.exports = router;