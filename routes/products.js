const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductPrice = require('../models/ProductPrice');

// GET /api/products - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const products = await Product.getAll(parseInt(limit), parseInt(offset));
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/search/:term - Rechercher des produits par nom
router.get('/search/:term', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const products = await Product.searchByName(req.params.term, parseInt(limit));
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/category/:categoryId - Récupérer des produits par catégorie
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const products = await Product.getByCategory(req.params.categoryId, parseInt(limit));
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/barcode/:barcode - Rechercher un produit par code-barres
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const product = await Product.getByBarcode(req.params.barcode);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id/prices - Récupérer les prix d'un produit
router.get('/:id/prices', async (req, res) => {
  try {
    const prices = await ProductPrice.getByProduct(req.params.id);
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id/compare - Comparer les prix d'un produit
router.get('/:id/compare', async (req, res) => {
  try {
    const { stores } = req.query;
    const storeIds = stores ? stores.split(',').map(id => parseInt(id)) : [];
    const prices = await ProductPrice.comparePrices(req.params.id, storeIds);
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id/stats - Obtenir les statistiques de prix d'un produit
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await ProductPrice.getPriceStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products/search/advanced - Recherche avancée
router.post('/search/advanced', async (req, res) => {
  try {
    const products = await Product.searchAdvanced(req.body);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - Créer un nouveau produit
router.post('/', async (req, res) => {
  try {
    const productId = await Product.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Produit créé avec succès', 
      data: { id: productId } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - Mettre à jour un produit
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, message: 'Produit mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
