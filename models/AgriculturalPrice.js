const db = require('../database/connection');

class AgriculturalPrice {
  // Récupérer les prix validés pour l'affichage public
  static async getValidatedPrices(filters = {}) {
    try {
      let query = `
        SELECT p.id, pr.name as product_name, pc.name as category_name, pc.type as category_type,
               l.name as locality_name, r.name as region_name, u.name as unit_name, u.symbol as unit_symbol,
               p.price, p.date, p.created_at
        FROM prices p
        JOIN products pr ON p.product_id = pr.id
        JOIN product_categories pc ON pr.category_id = pc.id
        JOIN localities l ON p.locality_id = l.id
        JOIN regions r ON l.region_id = r.id
        JOIN units u ON p.unit_id = u.id
        WHERE p.status = 'validated'
      `;
      
      const params = [];
      
      if (filters.product_id) {
        query += ` AND p.product_id = ?`;
        params.push(filters.product_id);
      }
      
      if (filters.locality_id) {
        query += ` AND p.locality_id = ?`;
        params.push(filters.locality_id);
      }
      
      if (filters.category_id) {
        query += ` AND pr.category_id = ?`;
        params.push(filters.category_id);
      }
      
      if (filters.region_id) {
        query += ` AND l.region_id = ?`;
        params.push(filters.region_id);
      }
      
      if (filters.date_from) {
        query += ` AND p.date >= ?`;
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        query += ` AND p.date <= ?`;
        params.push(filters.date_to);
      }
      
      if (filters.price_min) {
        query += ` AND p.price >= ?`;
        params.push(filters.price_min);
      }
      
      if (filters.price_max) {
        query += ` AND p.price <= ?`;
        params.push(filters.price_max);
      }
      
      query += ` ORDER BY p.date DESC, p.price ASC`;
      
      if (filters.limit) {
        query += ` LIMIT ${parseInt(filters.limit)}`;
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix validés: ${error.message}`);
    }
  }

  // Récupérer les prix en attente de validation (admin)
  static async getPendingPrices(limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT p.id, pr.name as product_name, pc.name as category_name,
                l.name as locality_name, r.name as region_name, u.name as unit_name,
                p.price, p.date, p.comment, p.created_at,
                u.email as submitted_by_email
         FROM prices p
         JOIN products pr ON p.product_id = pr.id
         JOIN product_categories pc ON pr.category_id = pc.id
         JOIN localities l ON p.locality_id = l.id
         JOIN regions r ON l.region_id = r.id
         JOIN units u ON p.unit_id = u.id
         JOIN users u ON p.submitted_by = u.id
         WHERE p.status = 'pending'
         ORDER BY p.created_at ASC
         LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix en attente: ${error.message}`);
    }
  }

  // Valider un prix (admin)
  static async validatePrice(priceId, adminId, comment = null) {
    try {
      const [result] = await db.execute(
        `UPDATE prices 
         SET status = 'validated', validated_by = ?, validated_at = NOW(), comment = ?
         WHERE id = ? AND status = 'pending'`,
        [adminId, comment, priceId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Prix non trouvé ou déjà traité');
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la validation du prix: ${error.message}`);
    }
  }

  // Rejeter un prix (admin)
  static async rejectPrice(priceId, adminId, rejectionReason) {
    try {
      const [result] = await db.execute(
        `UPDATE prices 
         SET status = 'rejected', validated_by = ?, validated_at = NOW(), rejection_reason = ?
         WHERE id = ? AND status = 'pending'`,
        [adminId, rejectionReason, priceId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Prix non trouvé ou déjà traité');
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors du rejet du prix: ${error.message}`);
    }
  }

  // Soumettre un nouveau prix (contributor)
  static async submitPrice(priceData, contributorId) {
    try {
      const { product_id, locality_id, unit_id, price, date, comment } = priceData;
      
      const [result] = await db.execute(
        `INSERT INTO prices (product_id, locality_id, unit_id, price, date, submitted_by, comment, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [product_id, locality_id, unit_id, price, date, contributorId, comment]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la soumission du prix: ${error.message}`);
    }
  }

  // Récupérer les statistiques des prix
  static async getPriceStatistics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_prices,
          MIN(price) as min_price,
          MAX(price) as max_price,
          AVG(price) as avg_price,
          STDDEV(price) as price_volatility,
          COUNT(DISTINCT product_id) as unique_products,
          COUNT(DISTINCT locality_id) as unique_localities
        FROM prices p
        JOIN products pr ON p.product_id = pr.id
        JOIN localities l ON p.locality_id = l.id
        WHERE p.status = 'validated'
      `;
      
      const params = [];
      
      if (filters.product_id) {
        query += ` AND p.product_id = ?`;
        params.push(filters.product_id);
      }
      
      if (filters.locality_id) {
        query += ` AND p.locality_id = ?`;
        params.push(filters.locality_id);
      }
      
      if (filters.date_from) {
        query += ` AND p.date >= ?`;
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        query += ` AND p.date <= ?`;
        params.push(filters.date_to);
      }
      
      const [rows] = await db.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Récupérer l'évolution temporelle des prix
  static async getPriceEvolution(filters = {}) {
    try {
      let query = `
        SELECT p.date, AVG(p.price) as avg_price, COUNT(*) as price_count
        FROM prices p
        WHERE p.status = 'validated'
      `;
      
      const params = [];
      
      if (filters.product_id) {
        query += ` AND p.product_id = ?`;
        params.push(filters.product_id);
      }
      
      if (filters.locality_id) {
        query += ` AND p.locality_id = ?`;
        params.push(filters.locality_id);
      }
      
      query += ` GROUP BY p.date ORDER BY p.date ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'évolution: ${error.message}`);
    }
  }

  // Récupérer les prix géolocalisés pour la carte
  static async getPricesForMap(filters = {}) {
    try {
      let query = `
        SELECT p.id, pr.name as product_name, l.name as locality_name,
               l.latitude, l.longitude, p.price, u.symbol as unit_symbol,
               p.date, pc.name as category_name
        FROM prices p
        JOIN products pr ON p.product_id = pr.id
        JOIN localities l ON p.locality_id = l.id
        JOIN units u ON p.unit_id = u.id
        JOIN product_categories pc ON pr.category_id = pc.id
        WHERE p.status = 'validated' AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL
      `;
      
      const params = [];
      
      if (filters.product_id) {
        query += ` AND p.product_id = ?`;
        params.push(filters.product_id);
      }
      
      if (filters.category_id) {
        query += ` AND pr.category_id = ?`;
        params.push(filters.category_id);
      }
      
      if (filters.date_from) {
        query += ` AND p.date >= ?`;
        params.push(filters.date_from);
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix pour la carte: ${error.message}`);
    }
  }

  // Calculer l'indice panier de base
  static async getBasketIndex(essentialProducts = [1, 2, 3, 4, 5]) {
    try {
      const [rows] = await db.execute(
        `SELECT AVG(p.price) as basket_index
         FROM prices p
         WHERE p.status = 'validated' 
         AND p.product_id IN (${essentialProducts.map(() => '?').join(',')})
         AND p.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
        essentialProducts
      );
      
      return rows[0].basket_index || 0;
    } catch (error) {
      throw new Error(`Erreur lors du calcul de l'indice panier: ${error.message}`);
    }
  }
}

module.exports = AgriculturalPrice;

