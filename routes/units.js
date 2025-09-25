const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const { requireAdmin } = require('../middleware/roleAuth');

// GET /api/units - Récupérer toutes les unités (public)
router.get('/', async (req, res) => {
  try {
    const units = await Unit.getAll();
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/units/:id - Récupérer une unité par ID
router.get('/:id', async (req, res) => {
  try {
    const unit = await Unit.getById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unité non trouvée' });
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/units - Créer une nouvelle unité (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, symbol } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }

    const unitId = await Unit.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Unité créée avec succès',
      data: { id: unitId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/units/:id - Mettre à jour une unité (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await Unit.update(req.params.id, req.body);
    
    if (success) {
      res.json({ success: true, message: 'Unité mise à jour avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Unité non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/units/:id - Supprimer une unité (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await Unit.delete(req.params.id);
    
    if (success) {
      res.json({ success: true, message: 'Unité supprimée avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Unité non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

