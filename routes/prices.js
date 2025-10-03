const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET /api/prices/product/:productId - Récupérer les prix d'un produit
router.get('/product/:productId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT pp.*, s.name as store_name, s.address, s.city, s.postal_code
       FROM product_prices pp
       JOIN stores s ON pp.store_id = s.id
       WHERE pp.product_id = ? AND pp.is_available = TRUE
       ORDER BY pp.price ASC`,
      [req.params.productId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/prices/store/:storeId - Récupérer les prix d'un magasin
router.get('/store/:storeId', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const [rows] = await db.execute(
      `SELECT pp.*, p.name as product_name, p.brand, c.name as category_name
       FROM product_prices pp
       JOIN products p ON pp.product_id = p.id
       LEFT JOIN product_categories c ON p.category_id = c.id
       WHERE pp.store_id = ? AND pp.is_available = TRUE
       ORDER BY p.name
       LIMIT ?`,
      [req.params.storeId, parseInt(limit)]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/prices - Ajouter ou mettre à jour un prix
router.post('/', async (req, res) => {
  try {
    const { product_id, store_id, price, unit = 'unit', is_available = true } = req.body;

    if (!product_id || !store_id || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id, store_id et price sont requis' 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO product_prices (product_id, store_id, price, unit, is_available)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       price = VALUES(price),
       unit = VALUES(unit),
       is_available = VALUES(is_available),
       last_updated = CURRENT_TIMESTAMP`,
      [product_id, store_id, price, unit, is_available]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Prix sauvegardé avec succès', 
      data: { id: result.insertId || result.affectedRows } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/prices - Supprimer un prix
router.delete('/', async (req, res) => {
  try {
    const { product_id, store_id } = req.query;

    if (!product_id || !store_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id et store_id sont requis' 
      });
    }

    const [result] = await db.execute(
      'DELETE FROM product_prices WHERE product_id = ? AND store_id = ?',
      [product_id, store_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Prix non trouvé' });
    }

    res.json({ success: true, message: 'Prix supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
