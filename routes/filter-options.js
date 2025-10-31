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

    const validTypes = ['period'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'option invalide: seul "period" est supporté'
      });
    }

    const table = 'filter_period_options';

    const ok = await FilterOptions.updateOptionStatus(table, id, is_active);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Option non trouvée' });
    }
    res.json({ success: true, message: 'Statut mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/filter-options/products - Ajouter une nouvelle option de produit (admin)
// Endpoint POST /api/filter-options/products supprimé:
// Les options produits sont désormais dérivées dynamiquement de la table `products`.

// POST /api/filter-options/localities - Ajouter une nouvelle option de localité (admin)
// Endpoint POST /api/filter-options/localities supprimé:
// Les options localités sont désormais dérivées dynamiquement de la table `localities`.

// DELETE /api/filter-options/:type/:id - Supprimer une option de filtre (admin)
router.delete('/:type/:id', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;

    const validTypes = ['period'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'option invalide: seul "period" est supporté'
      });
    }

    const table = 'filter_period_options';

    const ok = await FilterOptions.deleteOption(table, id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Option non trouvée' });
    }
    res.json({ success: true, message: 'Option supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;