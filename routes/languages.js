const express = require('express');
const router = express.Router();
const Language = require('../models/Language');
const { requireAdmin, requireRole } = require('../middleware/roleAuth');

// GET /api/languages - liste des langues (seed par défaut si vide)
router.get('/', async (req, res) => {
  try {
    let languages = await Language.getAll();
    if (!languages || languages.length === 0) {
      // Seed par défaut: Français, Fon
      try {
        await Language.create('Français');
      } catch (e) {}
      try {
        await Language.create('Fon');
      } catch (e) {}
      languages = await Language.getAll();
    }
    res.json({ success: true, data: languages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/languages - créer une langue (éviter doublons)
// Création autorisée aux utilisateurs (authentifiés)
router.post('/', requireRole('user'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Nom de langue requis' });
    }
    try {
      const id = await Language.create(name);
      res.status(201).json({ success: true, message: 'Langue créée', data: { id } });
    } catch (error) {
      if (error.code === 'DUPLICATE') {
        return res.status(409).json({ success: false, message: 'La langue existe déjà' });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/languages/:id - mettre à jour une langue (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Nom de langue requis' });
    }
    try {
      const success = await Language.update(req.params.id, name);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Langue non trouvée' });
      }
      res.json({ success: true, message: 'Langue mise à jour' });
    } catch (error) {
      if (error.code === 'DUPLICATE') {
        return res.status(409).json({ success: false, message: 'La langue existe déjà' });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/languages/:id - supprimer une langue (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await Language.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Langue non trouvée' });
    }
    res.json({ success: true, message: 'Langue supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;