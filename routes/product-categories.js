const express = require('express');
const router = express.Router();
const ProductCategory = require('../models/ProductCategory');
const { requireAdmin, requireRole } = require('../middleware/roleAuth');

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
// Création autorisée aux utilisateurs connectés (ajout via formulaire),
// mais modification/suppression restent réservées aux admins
router.post('/', requireRole('user'), async (req, res) => {
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

    // Empêcher les doublons (insensible casse/espaces)
    const normalizedName = String(name).trim();
    const existing = await ProductCategory.getAll();
    if (existing.some(c => String(c.name).trim().toLowerCase() === normalizedName.toLowerCase())) {
      return res.status(409).json({ success: false, message: 'Catégorie déjà existante' });
    }

    const categoryId = await ProductCategory.create({ name: normalizedName, type, description });
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



