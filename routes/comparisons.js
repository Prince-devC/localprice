const express = require('express');
const router = express.Router();
const ProductPrice = require('../models/ProductPrice');
const Product = require('../models/Product');

// GET /api/comparisons/cheapest - Récupérer les produits les moins chers
router.get('/cheapest', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const products = await ProductPrice.getCheapestProducts(parseInt(limit));
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/comparisons/category/:categoryId/best - Meilleurs prix par catégorie
router.get('/category/:categoryId/best', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const products = await ProductPrice.getBestPricesByCategory(
      req.params.categoryId, 
      parseInt(limit)
    );
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/comparisons/product/:productId/localities - Dernier prix validé par localité pour un produit
router.get('/product/:productId/localities', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const rows = await ProductPrice.getProductLocalityComparison(
      req.params.productId,
      parseInt(limit)
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/comparisons/price-range - Rechercher par gamme de prix
router.get('/price-range', async (req, res) => {
  try {
    const { min_price, max_price, limit = 50 } = req.query;
    
    if (!min_price || !max_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'min_price et max_price requis' 
      });
    }

    const products = await ProductPrice.searchByPriceRange(
      parseFloat(min_price), 
      parseFloat(max_price), 
      parseInt(limit)
    );
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/comparisons/compare-products - Comparer plusieurs produits
router.post('/compare-products', async (req, res) => {
  try {
    const { product_ids } = req.body;
    
    if (!product_ids || !Array.isArray(product_ids)) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_ids doit être un tableau' 
      });
    }

    const comparisons = [];
    
    for (const productId of product_ids) {
      const product = await Product.getById(productId);
      const prices = await ProductPrice.getByProduct(productId);
      const stats = await ProductPrice.getPriceStats(productId);
      
      comparisons.push({
        product,
        prices,
        stats
      });
    }

    res.json({ success: true, data: comparisons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/comparisons/compare-stores - Comparer les prix entre magasins
router.post('/compare-stores', async (req, res) => {
  try {
    const { store_ids, category_id, limit = 50 } = req.body;
    
    if (!store_ids || !Array.isArray(store_ids)) {
      return res.status(400).json({ 
        success: false, 
        message: 'store_ids doit être un tableau' 
      });
    }

    let query = `SELECT p.name as product_name, p.brand, pp.price, pp.unit, 
                        s.name as store_name, s.city, c.name as category_name
                 FROM product_prices pp
                 JOIN products p ON pp.product_id = p.id
                 JOIN stores s ON pp.store_id = s.id
                 LEFT JOIN product_categories c ON p.category_id = c.id
                 WHERE pp.store_id IN (${store_ids.map(() => '?').join(',')})
                 AND pp.is_available = TRUE`;

    const params = [...store_ids];

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    query += ` ORDER BY p.name, pp.price ASC LIMIT ?`;
    params.push(parseInt(limit));

    const db = require('../database/connection');
    const [rows] = await db.execute(query, params);

    // Grouper par produit
    const groupedProducts = {};
    rows.forEach(row => {
      if (!groupedProducts[row.product_name]) {
        groupedProducts[row.product_name] = {
          product_name: row.product_name,
          brand: row.brand,
          category_name: row.category_name,
          prices: []
        };
      }
      groupedProducts[row.product_name].prices.push({
        store_name: row.store_name,
        city: row.city,
        price: row.price,
        unit: row.unit
      });
    });

    res.json({ success: true, data: Object.values(groupedProducts) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/comparisons/search - Recherche globale avec comparaison
router.get('/search', async (req, res) => {
  try {
    const { q, category_id, min_price, max_price, city, limit = 20 } = req.query;
    
    let query = `SELECT DISTINCT p.*, c.name as category_name, 
                        MIN(pp.price) as min_price,
                        MAX(pp.price) as max_price,
                        AVG(pp.price) as avg_price,
                        COUNT(DISTINCT pp.store_id) as store_count
                 FROM products p
                 LEFT JOIN product_categories c ON p.category_id = c.id
                 JOIN product_prices pp ON p.id = pp.product_id
                 JOIN stores s ON pp.store_id = s.id
                 WHERE pp.is_available = TRUE`;

    const params = [];

    if (q) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${q}%`);
    }

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    if (min_price) {
      query += ` AND pp.price >= ?`;
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ` AND pp.price <= ?`;
      params.push(parseFloat(max_price));
    }

    if (city) {
      query += ` AND s.city LIKE ?`;
      params.push(`%${city}%`);
    }

    query += ` GROUP BY p.id ORDER BY min_price ASC LIMIT ?`;
    params.push(parseInt(limit));

    const db = require('../database/connection');
    const [rows] = await db.execute(query, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
