const express = require('express');
const router = express.Router();
const Cost = require('../models/Cost');
const { requireAdmin } = require('../middleware/roleAuth');

// GET /api/costs - Récupérer tous les coûts (public)
router.get('/', async (req, res) => {
  try {
    const costs = await Cost.getAll();
    res.json({ success: true, data: costs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/costs/transport - Récupérer les coûts de transport
router.get('/transport', async (req, res) => {
  try {
    const costs = await Cost.getTransportCosts();
    res.json({ success: true, data: costs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/costs/storage - Récupérer les coûts de stockage
router.get('/storage', async (req, res) => {
  try {
    const costs = await Cost.getStorageCosts();
    res.json({ success: true, data: costs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/costs/calculate-transport - Calculer le coût de transport
router.get('/calculate-transport', async (req, res) => {
  try {
    const { distance, volume = 1 } = req.query;
    
    if (!distance) {
      return res.status(400).json({
        success: false,
        message: 'La distance est requise'
      });
    }

    const cost = await Cost.calculateTransportCost(parseFloat(distance), parseFloat(volume));
    res.json({ 
      success: true, 
      data: { 
        distance: parseFloat(distance),
        volume: parseFloat(volume),
        cost: cost
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/costs/calculate-storage - Calculer le coût de stockage
router.get('/calculate-storage', async (req, res) => {
  try {
    const { days, volume, unit = 'tonne' } = req.query;
    
    if (!days || !volume) {
      return res.status(400).json({
        success: false,
        message: 'Les jours et le volume sont requis'
      });
    }

    const cost = await Cost.calculateStorageCost(parseInt(days), parseFloat(volume), unit);
    res.json({ 
      success: true, 
      data: { 
        days: parseInt(days),
        volume: parseFloat(volume),
        unit: unit,
        cost: cost
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/costs - Créer un nouveau coût (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { type, value, unit, description } = req.body;

    if (!type || !value || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Le type, la valeur et l\'unité sont requis'
      });
    }

    if (!['transport', 'stockage'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Le type doit être "transport" ou "stockage"'
      });
    }

    const costId = await Cost.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Coût créé avec succès',
      data: { id: costId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/costs/:id - Mettre à jour un coût (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { type, value, unit, description } = req.body;

    if (type && !['transport', 'stockage'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Le type doit être "transport" ou "stockage"'
      });
    }

    const success = await Cost.update(req.params.id, req.body);
    
    if (success) {
      res.json({ success: true, message: 'Coût mis à jour avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Coût non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/costs/:id - Supprimer un coût (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await Cost.delete(req.params.id);
    
    if (success) {
      res.json({ success: true, message: 'Coût supprimé avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Coût non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

