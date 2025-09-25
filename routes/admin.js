const express = require('express');
const router = express.Router();
const AgriculturalPrice = require('../models/AgriculturalPrice');
const ProductCategory = require('../models/ProductCategory');
const Locality = require('../models/Locality');
const Unit = require('../models/Unit');
const Cost = require('../models/Cost');
const { requireAdmin } = require('../middleware/roleAuth');
const db = require('../database/connection');

// GET /api/admin/dashboard - Tableau de bord admin
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Statistiques générales
    const [priceStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_prices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_prices,
        SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) as validated_prices,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_prices
      FROM prices
    `);

    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'contributor' THEN 1 ELSE 0 END) as contributors,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins
      FROM users
    `);

    const [productStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(DISTINCT category_id) as total_categories
      FROM products
    `);

    const [localityStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_localities,
        COUNT(DISTINCT region_id) as total_regions
      FROM localities
    `);

    // Prix récents
    const [recentPrices] = await db.execute(`
      SELECT p.id, pr.name as product_name, l.name as locality_name, 
             p.price, p.status, p.created_at
      FROM prices p
      JOIN products pr ON p.product_id = pr.id
      JOIN localities l ON p.locality_id = l.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        priceStats: priceStats[0],
        userStats: userStats[0],
        productStats: productStats[0],
        localityStats: localityStats[0],
        recentPrices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/pending-prices - Prix en attente de validation
router.get('/pending-prices', requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const prices = await AgriculturalPrice.getPendingPrices(parseInt(limit), parseInt(offset));
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users - Liste des utilisateurs
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, role } = req.query;
    
    let query = `
      SELECT id, username, email, role, created_at
      FROM users
    `;
    const params = [];
    
    if (role) {
      query += ` WHERE role = ?`;
      params.push(role);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    
    const [users] = await db.execute(query, params);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/role - Changer le rôle d'un utilisateur
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['contributor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }
    
    const [result] = await db.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({ success: true, message: 'Rôle mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/audit-logs - Logs d'audit
router.get('/audit-logs', requireAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const [logs] = await db.execute(`
      SELECT al.*, u.username, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `);
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/validate-price - Valider un prix
router.post('/validate-price/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    const success = await AgriculturalPrice.validatePrice(id, req.user.id, comment);
    
    if (success) {
      res.json({ success: true, message: 'Prix validé avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou déjà traité' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/reject-price - Rejeter un prix
router.post('/reject-price/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'La raison du rejet est obligatoire'
      });
    }
    
    const success = await AgriculturalPrice.rejectPrice(id, req.user.id, rejection_reason);
    
    if (success) {
      res.json({ success: true, message: 'Prix rejeté avec succès' });
    } else {
      res.status(404).json({ success: false, message: 'Prix non trouvé ou déjà traité' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

