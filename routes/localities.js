const express = require('express');
const router = express.Router();
const Locality = require('../models/Locality');
const { requireAdmin } = require('../middleware/roleAuth');

// GET /api/localities - Récupérer toutes les localités (public)
router.get('/', async (req, res) => {
  try {
    const localities = await Locality.getAll();
    res.json({ success: true, data: localities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/localities/with-coordinates - Récupérer les localités avec coordonnées GPS
router.get('/with-coordinates', async (req, res) => {
  try {
    const localities = await Locality.getWithCoordinates();
    res.json({ success: true, data: localities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/localities/region/:regionId - Récupérer les localités par région
router.get('/region/:regionId', async (req, res) => {
  try {
    const localities = await Locality.getByRegion(req.params.regionId);
    res.json({ success: true, data: localities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/localities/:id - Récupérer une localité par ID
router.get('/:id', async (req, res) => {
  try {
    const locality = await Locality.getById(req.params.id);
    if (!locality) {
      return res.status(404).json({ success: false, message: 'Localité non trouvée' });
    }
    res.json({ success: true, data: locality });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/localities - Créer une nouvelle localité (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, region_id, latitude, longitude } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }

    const localityId = await Locality.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Localité créée avec succès',
      data: { id: localityId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/localities/:id - Mettre à jour une localité (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await Locality.update(req.params.id, req.body);
    
    if (success) {
      res.json({ success: true, message: 'Localité mise à jour avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Localité non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/localities/:id - Supprimer une localité (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await Locality.delete(req.params.id);
    
    if (success) {
      res.json({ success: true, message: 'Localité supprimée avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Localité non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;



