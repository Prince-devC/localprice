const express = require('express');
const router = express.Router();
const AgriculturalPrice = require('../models/AgriculturalPrice');
const db = require('../database/connection');
const { requireRole } = require('../middleware/roleAuth');
const { requireContributor } = require('../middleware/roleAuth');

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
      price_id INTEGER NOT NULL,
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
    console.error('Erreur lors de la récupération des prix agricoles:', error);
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

// POST /api/agricultural-prices - Soumettre un nouveau prix (contributor)
router.post('/', requireRole('contributor'), async (req, res) => {
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
    // Latitude/longitude OPTIONNELLES: enregistrer si fournies (même si précision > 10m, avec confirmation côté client)
    let latNum = null;
    let lonNum = null;
    let accNum = null;
    if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      latNum = Number(latitude);
      lonNum = Number(longitude);
      accNum = geo_accuracy !== undefined && geo_accuracy !== null ? Number(geo_accuracy) : null;
      if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
        return res.status(400).json({ success: false, message: 'Latitude invalide' });
      }
      if (Number.isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
        return res.status(400).json({ success: false, message: 'Longitude invalide' });
      }
      // Nota: accNum peut être > 10. Dans ce cas, nous conservons lat/lon
      // et la précision pour permettre une vérification ultérieure.
    }

    // Validation de la fiabilité de la source (facultatif mais recommandé)
    const allowedTypes = ['producteur','transformateur','cooperative','grossiste','commercant','autre'];
    if (source_type && !allowedTypes.includes(String(source_type).toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Type de source invalide' });
    }
    if (source_contact_phone) {
      const phoneTrimmed = String(source_contact_phone).trim();
      if (!/^01\d{8}$/.test(phoneTrimmed)) {
        return res.status(400).json({ success: false, message: 'Numéro de téléphone de contact invalide (format 01XXXXXXXX)' });
      }
    }

    const priceId = await AgriculturalPrice.submitPrice({ 
      product_id, locality_id, unit_id, price, date, comment, latitude: latNum, longitude: lonNum, geo_accuracy: accNum, source,
      source_type, source_contact_name, source_contact_phone, source_contact_relation, sub_locality
    }, req.user.id);

    // Associer les langues de communication si fournies
    if (Array.isArray(source_language_ids) && source_language_ids.length > 0) {
      const uniqueIds = [...new Set(source_language_ids.map(id => parseInt(id)).filter(id => !Number.isNaN(id)))];
      for (const langId of uniqueIds) {
        try {
          await db.run('INSERT OR IGNORE INTO price_source_languages (price_id, language_id) VALUES (?, ?)', [priceId, langId]);
        } catch (e) {
          // ignore insert errors
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Prix soumis avec succès, en attente de validation',
      data: { id: priceId }
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

    // Déterminer si l'utilisateur est admin
    const roles = (req.user && req.user.roles) || [];
    const isAdmin = roles.includes('admin') || roles.includes('super_admin');

    const success = await AgriculturalPrice.updatePendingPrice(
      id,
      updates,
      { requireOwner: !isAdmin, userId: req.user.id }
    );

    if (success) {
      res.json({ success: true, message: 'Prix mis à jour' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou non modifié' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
