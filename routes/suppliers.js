const express = require('express');
const Supplier = require('../models/Supplier');

const router = express.Router();

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    const normalized = suppliers.map((s) => {
      const hasCoordinates = s.supplier_latitude != null && s.supplier_longitude != null;
      return {
        id: s.id,
        name: s.name,
        type: s.type,
        phone: s.contact_phone || null,
        email: s.contact_email || null,
        address: s.address || null,
        city: s.locality_name || null,
        locality_id: s.locality_id,
        latitude: hasCoordinates ? s.supplier_latitude : s.locality_latitude,
        longitude: hasCoordinates ? s.supplier_longitude : s.locality_longitude,
        approx_location: !hasCoordinates,
      };
    });
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/suppliers/:id/summary - Détails, prix liés et disponibilités
router.get('/:id/summary', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID fournisseur invalide' });
    }
    const summary = await Supplier.getSummaryById(id);
    if (!summary) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;