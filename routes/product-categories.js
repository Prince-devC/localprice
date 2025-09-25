const express = require('express');
const router = express.Router();
const ProductCategory = require('../models/ProductCategory');
const { requireAdmin } = require('../middleware/roleAuth');

// GET /api/product-categories - Récupérer toutes les catégories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await ProductCategory.getAll();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/product-categories/:id - Récupérer une catégorie par ID
router.get('/:id', async (req, res) => {
  try {
    const category = await ProductCategory.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/product-categories - Créer une nouvelle catégorie (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, type, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le type sont requis'
      });
    }

    if (!['brut', 'transforme'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Le type doit être "brut" ou "transforme"'
      });
    }

    const categoryId = await ProductCategory.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: { id: categoryId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/product-categories/:id - Mettre à jour une catégorie (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, type, description } = req.body;

    if (type && !['brut', 'transforme'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Le type doit être "brut" ou "transforme"'
      });
    }

    const success = await ProductCategory.update(req.params.id, req.body);
    
    if (success) {
      res.json({ success: true, message: 'Catégorie mise à jour avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/product-categories/:id - Supprimer une catégorie (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await ProductCategory.delete(req.params.id);
    
    if (success) {
      res.json({ success: true, message: 'Catégorie supprimée avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

