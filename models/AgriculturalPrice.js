const db = require('../database/connection');

class AgriculturalPrice {
  // Récupérer les prix validés pour l'affichage public
  static async getValidatedPrices(filters = {}) {
    try {
      let query = `
        SELECT p.id, p.product_id as product_id, p.locality_id as locality_id,
               pr.name as product_name, pc.name as category_name, pc.type as category_type,
               l.name as locality_name, r.name as region_name, u.name as unit_name, u.symbol as unit_symbol,
               p.price, p.date, p.created_at,
               -- Calcul de la variation de prix par rapport au prix précédent du même produit dans la même localité
               (
                 SELECT CASE 
                   WHEN prev_p.price IS NOT NULL AND prev_p.price > 0 
                   THEN ROUND(((p.price - prev_p.price) / prev_p.price) * 100, 2)
                   ELSE NULL 
                 END
                 FROM prices prev_p 
                 WHERE prev_p.product_id = p.product_id 
                   AND prev_p.locality_id = p.locality_id 
                   AND prev_p.status = 'validated'
                   AND prev_p.date < p.date
                 ORDER BY prev_p.date DESC 
                 LIMIT 1
               ) as price_change,
               -- Volume simulé basé sur la popularité du produit (valeurs réalistes)
               CASE 
                 WHEN pc.type = 'cereales' THEN ROUND((RANDOM() * 500 + 100), 0)
                 WHEN pc.type = 'legumes' THEN ROUND((RANDOM() * 200 + 50), 0)
                 WHEN pc.type = 'fruits' THEN ROUND((RANDOM() * 150 + 30), 0)
                 ELSE ROUND((RANDOM() * 100 + 20), 0)
               END as volume,
               p.date as updated_at
        FROM prices p
        JOIN products pr ON p.product_id = pr.id
        JOIN product_categories pc ON pr.category_id = pc.id
        JOIN localities l ON p.locality_id = l.id
        JOIN regions r ON l.region_id = r.id
        JOIN units u ON p.unit_id = u.id
        WHERE p.status = 'validated'
      `;
      
      const params = [];
      
      if (filters.id) {
        query += ` AND p.id = ?`;
        params.push(filters.id);
      }

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
      
      // Recherche globale dans les noms de produits et localités
      if (filters.search) {
        query += ` AND (pr.name LIKE ? OR l.name LIKE ? OR pc.name LIKE ?)`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ` ORDER BY p.date DESC, p.price ASC`;
      
      if (filters.limit) {
        query += ` LIMIT ${parseInt(filters.limit)}`;
        
        if (filters.offset) {
          query += ` OFFSET ${parseInt(filters.offset)}`;
        }
      }
      
      const rows = await db.all(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix validés: ${error.message}`);
    }
  }

  // Compter le nombre total de prix validés avec les mêmes filtres
  static async countValidatedPrices(filters = {}) {
    try {
      let query = `
        SELECT COUNT(*) as total
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
      
      // Recherche globale dans les noms de produits et localités
      if (filters.search) {
        query += ` AND (pr.name LIKE ? OR l.name LIKE ? OR pc.name LIKE ?)`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      const result = await db.get(query, params);
      return result.total || 0;
    } catch (error) {
      throw new Error(`Erreur lors du comptage des prix validés: ${error.message}`);
    }
  }

  // Récupérer les prix en attente de validation (admin)
  static async getPendingPrices(limit = 50, offset = 0) {
    try {
      const rows = await db.all(
        `SELECT p.id, pr.name as product_name, pc.name as category_name,
                l.name as locality_name, r.name as region_name, u.name as unit_name,
                p.price, p.date, p.comment, p.created_at,
                users.email as submitted_by_email
         FROM prices p
         JOIN products pr ON p.product_id = pr.id
         JOIN product_categories pc ON pr.category_id = pc.id
         JOIN localities l ON p.locality_id = l.id
         JOIN regions r ON l.region_id = r.id
         JOIN units u ON p.unit_id = u.id
         LEFT JOIN users ON p.submitted_by = users.id
         WHERE p.status = 'pending'
         ORDER BY p.created_at ASC
         LIMIT ? OFFSET ?`,
        [parseInt(limit), parseInt(offset)]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix en attente: ${error.message}`);
    }
  }

  // Valider un prix (admin)
  static async validatePrice(priceId, adminId, comment = null) {
    try {
      const result = await db.run(
        `UPDATE prices 
         SET status = 'validated', validated_by = ?, validated_at = CURRENT_TIMESTAMP, comment = ?
         WHERE id = ? AND status = 'pending'`,
        [adminId, comment, priceId]
      );
      
      if (result.changes === 0) {
        throw new Error('Prix non trouvé ou déjà traité');
      }
      
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la validation du prix: ${error.message}`);
    }
  }

  // Rejeter un prix (admin)
  static async rejectPrice(priceId, adminId, rejectionReason) {
    try {
      const result = await db.run(
        `UPDATE prices 
         SET status = 'rejected', validated_by = ?, validated_at = CURRENT_TIMESTAMP, rejection_reason = ?
         WHERE id = ? AND status = 'pending'`,
        [adminId, rejectionReason, priceId]
      );
      
      if (result.changes === 0) {
        throw new Error('Prix non trouvé ou déjà traité');
      }
      
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors du rejet du prix: ${error.message}`);
    }
  }

  // Soumettre un nouveau prix (contributor)
  static async submitPrice(priceData, contributorId) {
    try {
      const { product_id, locality_id, unit_id, price, date, comment } = priceData;
      
      const result = await db.run(
        `INSERT INTO prices (product_id, locality_id, unit_id, price, date, submitted_by, comment, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [product_id, locality_id, unit_id, price, date, contributorId, comment]
      );
      
      return result.lastID;
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
      
      const rows = await db.all(query, params);
      return rows[0] || {};
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Récupérer l'évolution temporelle des prix
  static async getPriceEvolution(filters = {}) {
    try {
      let query = `
        SELECT p.date,
               AVG(p.price) as avg_price,
               COUNT(*) as price_count,
               MIN(p.price) as min_price,
               MAX(p.price) as max_price
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
      
      const rows = await db.all(query, params);
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
               u.name as unit_name, p.date, pc.name as category_name, pc.type as category_type
        FROM prices p
        JOIN products pr ON p.product_id = pr.id
        JOIN localities l ON p.locality_id = l.id
        JOIN units u ON p.unit_id = u.id
        JOIN product_categories pc ON pr.category_id = pc.id
        WHERE p.status = 'validated' AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL
      `;
      
      const params = [];
      
      // Filtre par produit (supporte plusieurs IDs séparés par des virgules)
      if (filters.product_id) {
        const productIds = String(filters.product_id).split(',').map(id => id.trim()).filter(Boolean);
        if (productIds.length > 1) {
          query += ` AND p.product_id IN (${productIds.map(() => '?').join(',')})`;
          params.push(...productIds);
        } else {
          query += ` AND p.product_id = ?`;
          params.push(productIds[0]);
        }
      }
      
      // Filtre par catégorie (supporte plusieurs IDs)
      if (filters.category_id) {
        const categoryIds = String(filters.category_id).split(',').map(id => id.trim()).filter(Boolean);
        if (categoryIds.length > 1) {
          query += ` AND pr.category_id IN (${categoryIds.map(() => '?').join(',')})`;
          params.push(...categoryIds);
        } else {
          query += ` AND pr.category_id = ?`;
          params.push(categoryIds[0]);
        }
      }
      
      // Filtre par localité (supporte plusieurs IDs)
      if (filters.locality_id) {
        const localityIds = String(filters.locality_id).split(',').map(id => id.trim()).filter(Boolean);
        if (localityIds.length > 1) {
          query += ` AND p.locality_id IN (${localityIds.map(() => '?').join(',')})`;
          params.push(...localityIds);
        } else {
          query += ` AND p.locality_id = ?`;
          params.push(localityIds[0]);
        }
      }
      
      // Filtre par plage de dates
      if (filters.date_from) {
        query += ` AND p.date >= ?`;
        params.push(filters.date_from);
      }
      if (filters.date_to) {
        query += ` AND p.date <= ?`;
        params.push(filters.date_to);
      }
      
      // Filtre par prix minimum/maximum
      if (filters.price_min) {
        query += ` AND p.price >= ?`;
        params.push(filters.price_min);
      }
      if (filters.price_max) {
        query += ` AND p.price <= ?`;
        params.push(filters.price_max);
      }
      
      // Recherche globale
      if (filters.search) {
        query += ` AND (pr.name LIKE ? OR l.name LIKE ? OR pc.name LIKE ?)`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      const rows = await db.all(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix pour la carte: ${error.message}`);
    }
  }

  // Calculer l'indice panier de base
  static async getBasketIndex(essentialProducts = [1, 2, 3, 4, 5]) {
    try {
      const placeholders = essentialProducts.map(() => '?').join(',');
      const rows = await db.all(
        `SELECT AVG(p.price) as basket_index
         FROM prices p
         WHERE p.status = 'validated' 
         AND p.product_id IN (${placeholders})
         AND p.date >= date('now', '-30 days')`,
        essentialProducts
      );
      
      return rows[0]?.basket_index || 0;
    } catch (error) {
      throw new Error(`Erreur lors du calcul de l'indice panier: ${error.message}`);
    }
  }
}

module.exports = AgriculturalPrice;

