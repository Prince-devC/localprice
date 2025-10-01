const express = require('express');
const router = express.Router();
const FilterOptions = require('../models/FilterOptions');
const { requireAdmin } = require('../middleware/roleAuth');

// GET /api/filter-options - Récupérer toutes les options de filtres
router.get('/', async (req, res) => {
  try {
    const options = await FilterOptions.getAllFilterOptions();
    res.json({ success: true, data: options });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/filter-options/products - Récupérer les options de produits
router.get('/products', async (req, res) => {
  try {
    const products = await FilterOptions.getProductOptions();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/filter-options/localities - Récupérer les options de localités
router.get('/localities', async (req, res) => {
  try {
    const localities = await FilterOptions.getLocalityOptions();
    res.json({ success: true, data: localities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/filter-options/regions - Récupérer les options de régions
router.get('/regions', async (req, res) => {
  try {
    const regions = await FilterOptions.getRegionOptions();
    res.json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/filter-options/categories - Récupérer les options de catégories
router.get('/categories', async (req, res) => {
  try {
    const categories = await FilterOptions.getCategoryOptions();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/filter-options/periods - Récupérer les options de périodes
router.get('/periods', async (req, res) => {
  try {
    const periods = await FilterOptions.getPeriodOptions();
    res.json({ success: true, data: periods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/filter-options/:type/:id/status - Mettre à jour le statut d'une option (admin)
router.put('/:type/:id/status', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Le statut is_active doit être un booléen'
      });
    }

    const validTypes = ['product', 'locality', 'region', 'category', 'period'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'option invalide'
      });
    }

    await FilterOptions.updateOptionStatus(type, id, is_active);
    res.json({ success: true, message: 'Statut mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/filter-options/products - Ajouter une nouvelle option de produit (admin)
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const { product_id, display_name, sort_order } = req.body;

    if (!product_id || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du produit et le nom d\'affichage sont requis'
      });
    }

    const optionId = await FilterOptions.addProductOption(product_id, display_name, sort_order);
    res.status(201).json({ 
      success: true, 
      message: 'Option de produit ajoutée avec succès',
      data: { id: optionId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/filter-options/localities - Ajouter une nouvelle option de localité (admin)
router.post('/localities', requireAdmin, async (req, res) => {
  try {
    const { locality_id, display_name, sort_order } = req.body;

    if (!locality_id || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de la localité et le nom d\'affichage sont requis'
      });
    }

    const optionId = await FilterOptions.addLocalityOption(locality_id, display_name, sort_order);
    res.status(201).json({ 
      success: true, 
      message: 'Option de localité ajoutée avec succès',
      data: { id: optionId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/filter-options/:type/:id - Supprimer une option de filtre (admin)
router.delete('/:type/:id', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;

    const validTypes = ['product', 'locality', 'region', 'category', 'period'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'option invalide'
      });
    }

    await FilterOptions.deleteOption(type, id);
    res.json({ success: true, message: 'Option supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;