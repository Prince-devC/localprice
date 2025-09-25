const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET /api/categories - Récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories/:id - Récupérer une catégorie par ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories - Créer une nouvelle catégorie
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Le nom de la catégorie est requis' });
    }

    const [result] = await db.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
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

// PUT /api/categories/:id - Mettre à jour une catégorie
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Le nom de la catégorie est requis' });
    }

    const [result] = await db.execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
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

// DELETE /api/categories/:id - Supprimer une catégorie
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    res.json({ success: true, message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
