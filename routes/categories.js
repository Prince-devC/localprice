const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { requireAdmin } = require('../middleware/roleAuth');

// GET /api/product_categories - Récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM product_categories ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/product_categories/:id - Récupérer une catégorie par ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM product_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/product_categories - Créer une nouvelle catégorie
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Le nom de la catégorie est requis' });
    }

    const [result] = await db.execute(
      'INSERT INTO product_categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Catégorie créée avec succès', 
      data: { id: result.insertId } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/product_categories/:id - Mettre à jour une catégorie
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Le nom de la catégorie est requis' });
    }

    const [result] = await db.execute(
      'UPDATE product_categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    res.json({ success: true, message: 'Catégorie mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/product_categories/:id - Supprimer une catégorie
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM product_categories WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    res.json({ success: true, message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
