const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

// GET /api/stores - Récupérer tous les magasins
router.get('/', async (req, res) => {
  try {
    const stores = await Store.getAll();
    res.json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stores/:id - Récupérer un magasin par ID
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.getById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Magasin non trouvé' });
    }
    res.json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stores/search/city/:city - Rechercher des magasins par ville
router.get('/search/city/:city', async (req, res) => {
  try {
    const stores = await Store.getByCity(req.params.city);
    res.json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stores/search/postal/:postalCode - Rechercher des magasins par code postal
router.get('/search/postal/:postalCode', async (req, res) => {
  try {
    const stores = await Store.getByPostalCode(req.params.postalCode);
    res.json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stores/nearby - Rechercher des magasins à proximité
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude et longitude requises' 
      });
    }

    const stores = await Store.getNearby(
      parseFloat(latitude), 
      parseFloat(longitude), 
      parseFloat(radius) || 10
    );
    
    res.json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/stores - Créer un nouveau magasin
router.post('/', async (req, res) => {
  try {
    const storeId = await Store.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Magasin créé avec succès', 
      data: { id: storeId } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/stores/:id - Mettre à jour un magasin
router.put('/:id', async (req, res) => {
  try {
    const updated = await Store.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Magasin non trouvé' });
    }
    res.json({ success: true, message: 'Magasin mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/stores/:id - Supprimer un magasin
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Store.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Magasin non trouvé' });
    }
    res.json({ success: true, message: 'Magasin supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
