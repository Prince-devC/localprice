const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const AgriculturalPrice = require('../models/AgriculturalPrice');
const Language = require('../models/Language');

// Assure la présence des colonnes optionnelles et de la table de liaison
const ensurePriceSchema = async () => {
  try { await db.exec(`ALTER TABLE prices ADD COLUMN latitude REAL;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN longitude REAL;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN geo_accuracy REAL;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN source TEXT;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN source_type TEXT;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN source_contact_name TEXT;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN source_contact_phone TEXT;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN source_contact_relation TEXT;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN sub_locality TEXT;`); } catch (e) {}
  try { await db.exec(`ALTER TABLE prices ADD COLUMN submission_method TEXT;`); } catch (e) {}
  try { await db.exec(`CREATE TABLE IF NOT EXISTS price_source_languages (
    price_id BIGINT NOT NULL,
    language_id INTEGER NOT NULL,
    PRIMARY KEY (price_id, language_id),
    FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
  );`); } catch (e) {}
};

const toInt = (v) => {
  if (v === undefined || v === null) return null;
  const n = parseInt(String(v).trim(), 10);
  return Number.isNaN(n) ? null : n;
};

const parseGeopoint = (gps) => {
  if (!gps) return { latitude: null, longitude: null, geo_accuracy: null };
  const parts = String(gps).trim().split(/\s+/);
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  // Kobo: lat lon altitude accuracy (parfois lat lon accuracy)
  const accCandidate = parts.length >= 4 ? parts[3] : (parts.length >= 3 ? parts[2] : null);
  const acc = accCandidate !== null && accCandidate !== undefined ? parseFloat(accCandidate) : null;
  return {
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lon) ? lon : null,
    geo_accuracy: Number.isFinite(acc) ? acc : null,
  };
};

const getSecretFromRequest = (req) => {
  const auth = req.headers['authorization'] || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  const headerSecret = req.headers['x-kobo-webhook-secret'] || req.headers['x-webhook-secret'] || null;
  const querySecret = req.query && (req.query.token || req.query.secret) || null;
  return bearer || headerSecret || querySecret || null;
};

// Santé
router.get('/health', async (req, res) => {
  res.json({ ok: true });
});

// Webhook Kobo (REST Service)
router.post('/webhook', async (req, res) => {
  try {
    // Sécurité par secret partagé
    const expected = process.env.KOBO_WEBHOOK_SECRET;
    if (!expected) {
      return res.status(500).json({ success: false, message: 'KOBO_WEBHOOK_SECRET non configuré côté serveur' });
    }
    const received = getSecretFromRequest(req);
    if (!received || String(received) !== String(expected)) {
      return res.status(401).json({ success: false, message: 'Secret webhook invalide' });
    }

    await ensurePriceSchema();

    // Kobo peut envoyer {payload: {...}} ou directement {...}
    const data = (req.body && (req.body.payload || req.body.data)) || req.body || {};

    // Résoudre l’expéditeur (utilisateur) – optionnel
    let contributorId = null;
    const submittedUserId = (data.submitted_user_id || '').toString().trim();
    const submittedUsername = (data.submitted_username || '').toString().trim();
    if (submittedUserId) {
      const row = await db.get('SELECT id FROM users WHERE id = ? LIMIT 1', [submittedUserId]);
      if (row && row.id) contributorId = row.id;
    }
    if (!contributorId && submittedUsername) {
      const row = await db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1', [submittedUsername]);
      if (row && row.id) contributorId = row.id;
    }

    // Préparer catégories/produits/unités (support des champs "other")
    let categoryId = null;
    const rawCategory = data.category_id;
    if (String(rawCategory) === 'other') {
      const name = (data.new_category_name || '').toString().trim();
      const typeRaw = (data.new_category_type || '').toString().trim();
      // Contrainte SQLite: type IN ('brut','transforme'). Mapper et stocker le type libre dans description.
      const normalizedType = ['brut','transforme'].includes(typeRaw.toLowerCase()) ? typeRaw.toLowerCase() : 'brut';
      if (!name) return res.status(400).json({ success: false, message: 'Nom de catégorie manquant pour "other"' });
      const result = await db.run(
        'INSERT INTO product_categories (name, type, description) VALUES (?, ?, ?)',
        [name, normalizedType, typeRaw || null]
      );
      categoryId = result.lastID;
    } else {
      categoryId = toInt(rawCategory);
    }

    let productId = null;
    const rawProduct = data.product_id;
    if (String(rawProduct) === 'other' || (!toInt(rawProduct) && (data.new_product_name || '').trim())) {
      const name = (data.new_product_name || '').toString().trim();
      if (!name) return res.status(400).json({ success: false, message: 'Nom de produit manquant pour "other"' });
      if (!categoryId) return res.status(400).json({ success: false, message: 'Catégorie requise pour créer le produit' });
      const result = await db.run(
        'INSERT INTO products (name, category_id, description) VALUES (?, ?, ?)',
        [name, categoryId, null]
      );
      productId = result.lastID;
    } else {
      productId = toInt(rawProduct);
    }

    let unitId = null;
    const rawUnit = data.unit_id;
    if (String(rawUnit) === 'other') {
      const nm = (data.new_unit_name || '').toString().trim();
      const sym = (data.new_unit_symbol || '').toString().trim() || null;
      if (!nm) return res.status(400).json({ success: false, message: 'Nom d’unité manquant pour "other"' });
      const result = await db.run('INSERT INTO units (name, symbol) VALUES (?, ?)', [nm, sym]);
      unitId = result.lastID;
    } else {
      unitId = toInt(rawUnit);
    }

    const localityId = toInt(data.locality_id);
    if (!productId || !unitId || !localityId) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants (produit, unité, localité)' });
    }

    const priceNum = data.price !== undefined && data.price !== null ? parseFloat(String(data.price)) : null;
    const dateStr = (data.date || '').toString().trim();
    if (!priceNum || Number.isNaN(priceNum)) {
      return res.status(400).json({ success: false, message: 'Prix invalide' });
    }
    if (!dateStr) {
      return res.status(400).json({ success: false, message: 'Date requise' });
    }

    // Géolocalisation (gps: "lat lon [alt] [acc]")
    const { latitude, longitude, geo_accuracy } = parseGeopoint(data.gps);

    // Métadonnées source
    const source = (data.source || '').toString().trim() || null;
    const source_type = (data.source_type || '').toString().trim() || null;
    const source_contact_name = (data.source_contact_name || '').toString().trim() || null;
    const source_contact_phone = (data.source_contact_phone || '').toString().trim() || null;
    const source_contact_relation = (data.source_contact_relation || '').toString().trim() || null;
    const sub_locality = (data.sub_locality || '').toString().trim() || null;

    // Soumission
    const priceId = await AgriculturalPrice.submitPrice({
      product_id: productId,
      locality_id: localityId,
      unit_id: unitId,
      price: priceNum,
      date: dateStr,
      comment: (data.comment || '').toString().trim() || null,
      latitude,
      longitude,
      geo_accuracy,
      source,
      source_type,
      source_contact_name,
      source_contact_phone,
      source_contact_relation,
      sub_locality,
      submission_method: 'Kobo'
    }, contributorId);

    // Langue de communication (optionnelle)
    let languageId = null;
    const rawLang = data.source_language_id;
    if (String(rawLang) === 'other') {
      const newLang = (data.new_language_name || '').toString().trim();
      if (newLang) {
        try {
          languageId = await Language.create(newLang);
        } catch (e) {
          // en cas de doublon, essayer de récupérer l’id
          const row = await db.get('SELECT id FROM languages WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))', [newLang]);
          languageId = row && row.id ? row.id : null;
        }
      }
    } else {
      languageId = toInt(rawLang);
    }
    if (languageId) {
      try {
        await db.run(
          'INSERT INTO price_source_languages (price_id, language_id) VALUES (?, ?) ON CONFLICT (price_id, language_id) DO NOTHING',
          [priceId, languageId]
        );
      } catch (e) {}
    }

    return res.status(201).json({ success: true, message: 'Soumission Kobo reçue', data: { price_id: priceId } });
  } catch (error) {
    console.error('[kobo webhook] error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
});

module.exports = router;