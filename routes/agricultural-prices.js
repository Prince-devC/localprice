const express = require('express');
const router = express.Router();
const AgriculturalPrice = require('../models/AgriculturalPrice');
const db = require('../database/connection');
const { requireRole } = require('../middleware/roleAuth');
const { requireContributor } = require('../middleware/roleAuth');

// Journalisation basique dans la base pour les tentatives non autorisées
const ensureAuditTable = async () => {
  try {
    await db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      table_name TEXT,
      record_id INTEGER,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );`);
  } catch (_) { /* ignore */ }
};

// Schéma minimal requis pour les requêtes de prix
const ensureCorePriceSchema = async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('brut','transforme')),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        symbol TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        code TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS localities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS prices (
        id BIGSERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        locality_id INTEGER NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
        unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
        price NUMERIC(12,2) NOT NULL,
        date DATE NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending','validated','rejected')),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (e) {
    // ignore: la base peut déjà exister
  }
};

// Ensure optional columns exist for geolocation and source metadata
const ensurePriceSchema = async () => {
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN latitude REAL;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN longitude REAL;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN geo_accuracy REAL;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN source TEXT;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN source_type TEXT;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN source_contact_name TEXT;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN source_contact_phone TEXT;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN source_contact_relation TEXT;`);
  } catch (e) {
    // ignore if exists
  }
  try {
    await db.exec(`ALTER TABLE prices ADD COLUMN sub_locality TEXT;`);
  } catch (e) {
    // ignore if exists
  }
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
  // Table de liaison prix ↔ langues
  try {
    await db.exec(`CREATE TABLE IF NOT EXISTS price_source_languages (
      price_id BIGINT NOT NULL,
      language_id INTEGER NOT NULL,
      PRIMARY KEY (price_id, language_id),
      FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE CASCADE,
      FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
    );`);
  } catch (e) {
    // ignore
  }
};

// GET /api/agricultural-prices - Récupérer les prix validés (public)
router.get('/', async (req, res) => {
  try {
    // S'assurer que les tables nécessaires existent en dev local
    await ensureCorePriceSchema();
    await ensurePriceSchema();
    await ensureAuditTable();

    const filters = {
      id: req.query.id,
      product_id: req.query.product_id,
      locality_id: req.query.locality_id,
      category_id: req.query.category_id,
      region_id: req.query.region_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      search: req.query.search,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0
    };

    // Récupérer les données paginées et le nombre total
    const [prices, totalCount] = await Promise.all([
      AgriculturalPrice.getValidatedPrices(filters),
      AgriculturalPrice.countValidatedPrices(filters)
    ]);
    
    res.json({
      success: true,
      data: prices,
      pagination: {
        total: totalCount,
        limit: parseInt(filters.limit),
        offset: parseInt(filters.offset),
        page: Math.floor(parseInt(filters.offset) / parseInt(filters.limit)) + 1,
        totalPages: Math.ceil(totalCount / parseInt(filters.limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des prix agricoles:', error && (error.stack || error.message) || error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/agricultural-prices/statistics - Statistiques des prix
router.get('/statistics', async (req, res) => {
  try {
    const filters = {
      product_id: req.query.product_id,
      locality_id: req.query.locality_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    const stats = await AgriculturalPrice.getPriceStatistics(filters);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/agricultural-prices/evolution - Évolution temporelle des prix
router.get('/evolution', async (req, res) => {
  try {
    const filters = {
      product_id: req.query.product_id,
      locality_id: req.query.locality_id
    };

    const evolution = await AgriculturalPrice.getPriceEvolution(filters);
    res.json({ success: true, data: evolution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/agricultural-prices/map - Prix pour la carte interactive
router.get('/map', async (req, res) => {
  try {
    const filters = {
      product_id: req.query.product_id,
      category_id: req.query.category_id,
      date_from: req.query.date_from
    };

    const prices = await AgriculturalPrice.getPricesForMap(filters);
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/agricultural-prices/basket-index - Indice panier de base
router.get('/basket-index', async (req, res) => {
  try {
    const essentialProducts = req.query.products ? 
      req.query.products.split(',').map(id => parseInt(id)) : 
      [1, 2, 3, 4, 5]; // Produits par défaut

    const basketIndex = await AgriculturalPrice.getBasketIndex(essentialProducts);
    res.json({ success: true, data: { basket_index: basketIndex } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/agricultural-prices - Soumettre un nouveau prix (utilisateur connecté)
router.post('/', requireRole(['user','contributor','admin','super_admin']), async (req, res) => {
  try {
    await ensurePriceSchema();
    const { product_id, locality_id, unit_id, price, date, comment, latitude, longitude, geo_accuracy, source,
      source_type, source_contact_name, source_contact_phone, source_contact_relation, source_language_ids, sub_locality } = req.body;

    if (!product_id || !locality_id || !unit_id || !price || !date) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être fournis'
      });
    }
    // Normaliser la date en YYYY-MM-DD
    const normalizeDate = (d) => {
      if (d === undefined || d === null || d === '') return null;
      const s = String(d).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      if (m) {
        const [_, dd, mm, yyyy] = m;
        return `${yyyy}-${mm}-${dd}`;
      }
      return null;
    };
    const dateNorm = normalizeDate(date);
    if (!dateNorm) {
      return res.status(400).json({ success: false, message: 'Date invalide (format attendu YYYY-MM-DD)' });
    }
    // Normaliser les identifiants et le prix (formats FR/Intl)
    const toDecimalStrict = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const raw = String(v).trim();
      const sNoSpaces = raw.replace(/\s/g, '');
      const commaPos = sNoSpaces.lastIndexOf(',');
      const dotPos = sNoSpaces.lastIndexOf('.');
      let s;
      if (commaPos >= 0 && dotPos >= 0) {
        if (commaPos > dotPos) { // décimal via virgule
          s = sNoSpaces.replace(/\./g, '').replace(',', '.');
        } else { // décimal via point
          s = sNoSpaces.replace(/,/g, '');
        }
      } else if (commaPos >= 0) {
        s = sNoSpaces.replace(',', '.');
      } else {
        s = sNoSpaces;
      }
      const n = Number(s);
      return Number.isNaN(n) ? null : n;
    };
    const productIdNum = parseInt(product_id);
    const localityIdNum = parseInt(locality_id);
    const unitIdNum = parseInt(unit_id);
    const priceNum = toDecimalStrict(price);
    if (Number.isNaN(productIdNum) || Number.isNaN(localityIdNum) || Number.isNaN(unitIdNum)) {
      return res.status(400).json({ success: false, message: 'Identifiants invalides' });
    }
    if (priceNum === null) {
      return res.status(400).json({ success: false, message: 'Prix invalide' });
    }
    // Latitude/longitude OPTIONNELLES: enregistrer si fournies (même si précision > 10m, avec confirmation côté client)
    const toNumber = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const s = String(v).trim().replace(',', '.');
      const n = Number(s);
      return Number.isNaN(n) ? null : n;
    };
    const latNum = toNumber(latitude);
    const lonNum = toNumber(longitude);
    const accNum = toNumber(geo_accuracy);
    const warnings = [];
    if (latNum !== null && (latNum < -90 || latNum > 90)) {
      return res.status(400).json({ success: false, message: 'Latitude invalide' });
    }
    if (lonNum !== null && (lonNum < -180 || lonNum > 180)) {
      return res.status(400).json({ success: false, message: 'Longitude invalide' });
    }
    // Avertissement non bloquant: si lat/lon fournis et précision > 10m ou absente
    if ((latNum !== null || lonNum !== null) && (accNum === null || accNum > 10)) {
      warnings.push('geo_accuracy_high');
    }

    // Validation de la fiabilité de la source (facultatif mais recommandé)
    const allowedTypes = ['producteur','transformateur','cooperative','grossiste','commercant','autre'];
    let sourceTypeNorm = null;
    if (source_type) {
      const st = String(source_type).toLowerCase();
      sourceTypeNorm = allowedTypes.includes(st) ? st : 'autre';
    }
    if (source_contact_phone) {
      const phoneTrimmed = String(source_contact_phone).trim();
      const phoneSanitized = phoneTrimmed.replace(/[\s-]/g, '');
      if (!/^\+?\d{7,15}$/.test(phoneSanitized)) {
        return res.status(400).json({ success: false, message: 'Numéro de téléphone de contact invalide' });
      }
    }

    //

    const priceId = await AgriculturalPrice.submitPrice({ 
      product_id: productIdNum, locality_id: localityIdNum, unit_id: unitIdNum, price: priceNum, date: dateNorm, comment, latitude: latNum, longitude: lonNum, geo_accuracy: accNum, source,
      source_type: sourceTypeNorm, source_contact_name, source_contact_phone, source_contact_relation, sub_locality
    }, req.user.id);

    // Associer les langues de communication si fournies
    if (Array.isArray(source_language_ids) && source_language_ids.length > 0) {
      const uniqueIds = [...new Set(source_language_ids.map(id => parseInt(id)).filter(id => !Number.isNaN(id)))];
      for (const langId of uniqueIds) {
        try {
          await db.run(
            'INSERT INTO price_source_languages (price_id, language_id) VALUES (?, ?) ON CONFLICT (price_id, language_id) DO NOTHING',
            [priceId, langId]
          );
        } catch (e) {
          // ignore insert errors
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Prix soumis avec succès, en attente de validation',
      data: { id: priceId },
      warnings: warnings.length ? warnings : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/agricultural-prices/pending - Prix en attente (admin)
router.get('/pending', requireRole('admin'), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const prices = await AgriculturalPrice.getPendingPrices(parseInt(limit), parseInt(offset));
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/agricultural-prices/:id - Mettre à jour un prix en attente
router.put('/:id', requireContributor, async (req, res) => {
  try {
    await ensurePriceSchema();
    const { id } = req.params;
    const updates = req.body || {};
    const warnings = [];
    // Interdictions: ne pas autoriser la modification du produit ou de la localité
    if (updates.hasOwnProperty('product_id') || updates.hasOwnProperty('locality_id')) {
      await ensureAuditTable();
      try {
        await db.run(
          `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            (req.user && req.user.id) || null,
            'unauthorized_field_change',
            'prices',
            parseInt(id),
            null,
            JSON.stringify({ product_id: updates.product_id, locality_id: updates.locality_id }),
            req.ip || null,
            req.headers['user-agent'] || null
          ]
        );
      } catch (_) {}
      return res.status(400).json({ success: false, message: 'Modification du produit ou de la localité non autorisée' });
    }

    // Normalisations pour éviter les erreurs de cast côté base
    const toDecimalStrict = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const raw = String(v).trim();
      const sNoSpaces = raw.replace(/\s/g, '');
      const commaPos = sNoSpaces.lastIndexOf(',');
      const dotPos = sNoSpaces.lastIndexOf('.');
      let s;
      if (commaPos >= 0 && dotPos >= 0) {
        if (commaPos > dotPos) { // décimal via virgule
          s = sNoSpaces.replace(/\./g, '').replace(',', '.');
        } else { // décimal via point
          s = sNoSpaces.replace(/,/g, '');
        }
      } else if (commaPos >= 0) {
        s = sNoSpaces.replace(',', '.');
      } else {
        s = sNoSpaces;
      }
      const n = Number(s);
      return Number.isNaN(n) ? null : n;
    };
    const toNumber = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const s = String(v).trim().replace(',', '.');
      const n = Number(s);
      return Number.isNaN(n) ? null : n;
    };
    const normalizeDate = (d) => {
      if (d === undefined || d === null || d === '') return null;
      const s = String(d).trim();
      // ISO ou ISO-like: 2025-10-31 ou 2025-10-31T...
      const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s].*)?$/);
      if (isoMatch) return isoMatch[1];
      // Formats FR: dd/mm/yyyy ou dd-mm-yyyy
      const frMatch = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      if (frMatch) {
        const [_, dd, mm, yyyy] = frMatch;
        return `${yyyy}-${mm}-${dd}`;
      }
      return null;
    };
    const allowedTypes = ['producteur','transformateur','cooperative','grossiste','commercant','autre'];

    const norm = {};
    // product_id et locality_id sont ignorés par la politique ci-dessus
    if (updates.hasOwnProperty('unit_id')) {
      const v = parseInt(updates.unit_id);
      if (Number.isNaN(v)) return res.status(400).json({ success: false, message: 'unit_id invalide' });
      norm.unit_id = v;
    }
    if (updates.hasOwnProperty('price')) {
      const v = toDecimalStrict(updates.price);
      if (v === null) return res.status(400).json({ success: false, message: 'Prix invalide' });
      norm.price = v;
    }
    if (updates.hasOwnProperty('date')) {
      const v = normalizeDate(updates.date);
      if (!v) return res.status(400).json({ success: false, message: 'Date invalide (format attendu YYYY-MM-DD)' });
      norm.date = v;
    }
    if (updates.hasOwnProperty('latitude')) {
      const v = toNumber(updates.latitude);
      if (v !== null && (v < -90 || v > 90)) return res.status(400).json({ success: false, message: 'Latitude invalide' });
      norm.latitude = v;
    }
    if (updates.hasOwnProperty('longitude')) {
      const v = toNumber(updates.longitude);
      if (v !== null && (v < -180 || v > 180)) return res.status(400).json({ success: false, message: 'Longitude invalide' });
      norm.longitude = v;
    }
    if (updates.hasOwnProperty('geo_accuracy')) {
      norm.geo_accuracy = toNumber(updates.geo_accuracy);
    }
    // Exigence de précision: si lat/lon sont fournis, geo_accuracy ≤ 10m
    const latProvided = updates.hasOwnProperty('latitude');
    const lonProvided = updates.hasOwnProperty('longitude');
    const accProvided = updates.hasOwnProperty('geo_accuracy');
    if ((latProvided && norm.latitude !== null) || (lonProvided && norm.longitude !== null)) {
      if (!accProvided || norm.geo_accuracy === null || norm.geo_accuracy > 10) {
        warnings.push('geo_accuracy_high');
      }
    }
    if (updates.hasOwnProperty('source')) {
      norm.source = updates.source;
    }
    if (updates.hasOwnProperty('source_type')) {
      const st = String(updates.source_type || '').toLowerCase();
      norm.source_type = allowedTypes.includes(st) ? st : 'autre';
    }
    if (updates.hasOwnProperty('source_contact_name')) {
      norm.source_contact_name = updates.source_contact_name;
    }
    if (updates.hasOwnProperty('source_contact_phone')) {
      const phoneTrimmed = String(updates.source_contact_phone).trim();
      const phoneSanitized = phoneTrimmed.replace(/[\s-]/g, '');
      if (!/^\+?\d{7,15}$/.test(phoneSanitized)) {
        return res.status(400).json({ success: false, message: 'Numéro de téléphone de contact invalide' });
      }
      norm.source_contact_phone = phoneSanitized;
    }
    if (updates.hasOwnProperty('source_contact_relation')) {
      norm.source_contact_relation = updates.source_contact_relation;
    }
    if (updates.hasOwnProperty('comment')) {
      norm.comment = updates.comment;
    }
    if (updates.hasOwnProperty('sub_locality')) {
      norm.sub_locality = updates.sub_locality;
    }
    if (updates.hasOwnProperty('source_language_ids')) {
      norm.source_language_ids = updates.source_language_ids;
    }

    // Déterminer si l'utilisateur est admin
    const roles = (req.user && req.user.roles) || [];
    const isAdmin = roles.includes('admin') || roles.includes('super_admin');

    const success = await AgriculturalPrice.updatePendingPrice(
      id,
      norm,
      { requireOwner: !isAdmin, userId: req.user.id }
    );

    if (success) {
      let updated = null;
      try {
        updated = await db.get(
          `SELECT id, product_id, locality_id, unit_id, price, date, comment,
                  latitude, longitude, geo_accuracy, sub_locality, source, source_type,
                  source_contact_name, source_contact_phone, source_contact_relation,
                  status, updated_at
           FROM prices WHERE id = ?`,
          [id]
        );
      } catch (_) {}
      res.json({ success: true, message: 'Prix mis à jour', data: updated || { id, ...norm }, warnings: warnings.length ? warnings : undefined });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou non modifié' });
    }
  } catch (error) {
    const msg = error.message || 'Erreur serveur';
    let code = 500;
    if (msg.includes('Prix introuvable')) code = 404;
    else if (msg.includes('Non autorisé') || msg.includes('Impossible de modifier un prix non en attente')) code = 403;
    res.status(code).json({ success: false, message: msg });
  }
});

// DELETE /api/agricultural-prices/:id - Supprimer un prix (contributor propriétaire) si pending/rejected
router.delete('/:id', requireContributor, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await AgriculturalPrice.deletePrice(id, req.user.id);
    if (success) {
      res.json({ success: true, message: 'Prix supprimé' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou non supprimé' });
    }
  } catch (error) {
    const msg = error.message || 'Erreur serveur';
    const code = msg.includes('Seuls les prix') || msg.includes('Non autorisé') ? 403 : 500;
    res.status(code).json({ success: false, message: msg });
  }
});

// POST /api/agricultural-prices/:id/validate - Valider un prix (admin)
router.post('/:id/validate', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const success = await AgriculturalPrice.validatePrice(id, req.user.id, comment);
    
    if (success) {
      res.json({ success: true, message: 'Prix validé avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou déjà traité' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/agricultural-prices/:id/reject - Rejeter un prix (admin)
router.post('/:id/reject', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'La raison du rejet est obligatoire'
      });
    }

    const success = await AgriculturalPrice.rejectPrice(id, req.user.id, rejection_reason);
    
    if (success) {
      res.json({ success: true, message: 'Prix rejeté avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou déjà traité' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/agricultural-prices/my - Récupérer les prix soumis par l'utilisateur courant
// Restreint aux contributeurs uniquement
router.get('/my', requireRole('contributor'), async (req, res) => {
  try {
    await ensurePriceSchema();
    const { status = 'all', limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    const data = await AgriculturalPrice.getPricesByUser(userId, {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur get my agricultural prices:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
