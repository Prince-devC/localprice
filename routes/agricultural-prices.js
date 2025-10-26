const express = require('express');
const router = express.Router();
const AgriculturalPrice = require('../models/AgriculturalPrice');
const { authenticateToken } = require('./auth');
const { requireRole } = require('../middleware/roleAuth');

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
router.post('/', authenticateToken, requireRole('contributor'), async (req, res) => {
  try {
    const { product_id, locality_id, unit_id, price, date, comment } = req.body;

    if (!product_id || !locality_id || !unit_id || !price || !date) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être fournis'
      });
    }

    const priceId = await AgriculturalPrice.submitPrice(req.body, req.user.id);
    
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
router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const prices = await AgriculturalPrice.getPendingPrices(parseInt(limit), parseInt(offset));
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/agricultural-prices/:id/validate - Valider un prix (admin)
router.post('/:id/validate', authenticateToken, requireRole('admin'), async (req, res) => {
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
router.post('/:id/reject', authenticateToken, requireRole('admin'), async (req, res) => {
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

module.exports = router;
