const db = require('../database/connection');

class ProductPrice {
  // Récupérer tous les prix d'un produit
  static async getByProduct(productId) {
    try {
      const [rows] = await db.execute(
        `SELECT pp.*, s.name as store_name, s.address, s.city, s.postal_code, s.phone
         FROM product_prices pp
         JOIN stores s ON pp.store_id = s.id
         WHERE pp.product_id = ? AND pp.is_available = TRUE
         ORDER BY pp.price ASC`,
        [productId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix: ${error.message}`);
    }
  }

  // Récupérer tous les prix d'un magasin
  static async getByStore(storeId, limit = 100) {
    try {
      const [rows] = await db.execute(
        `SELECT pp.*, p.name as product_name, c.name as category_name
         FROM product_prices pp
         JOIN products p ON pp.product_id = p.id
         LEFT JOIN product_categories c ON p.category_id = c.id
         WHERE pp.store_id = ? AND pp.is_available = TRUE
         ORDER BY p.name
         LIMIT ?`,
        [storeId, limit]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix du magasin: ${error.message}`);
    }
  }

  // Ajouter ou mettre à jour un prix
  static async upsert(priceData) {
    try {
      const { product_id, store_id, price, unit = 'unit', is_available = true } = priceData;

      const result = await db.run(
        `INSERT INTO product_prices (product_id, store_id, price, unit, is_available)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(product_id, store_id) DO UPDATE SET
           price = excluded.price,
           unit = excluded.unit,
           is_available = excluded.is_available,
           last_updated = CURRENT_TIMESTAMP`,
        [product_id, store_id, price, unit, is_available]
      );

      return result.lastID || result.changes;
    } catch (error) {
      throw new Error(`Erreur lors de la sauvegarde du prix: ${error.message}`);
    }
  }

  // Supprimer un prix
  static async delete(productId, storeId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM product_prices WHERE product_id = ? AND store_id = ?',
        [productId, storeId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du prix: ${error.message}`);
    }
  }

  // Comparer les prix d'un produit dans plusieurs magasins
  static async comparePrices(productId, storeIds = []) {
    try {
      let query = `SELECT pp.*, s.name as store_name, s.address, s.city, s.postal_code
                   FROM product_prices pp
                   JOIN stores s ON pp.store_id = s.id
                   WHERE pp.product_id = ? AND pp.is_available = TRUE`;

      const params = [productId];

      if (storeIds.length > 0) {
        query += ` AND pp.store_id IN (${storeIds.map(() => '?').join(',')})`;
        params.push(...storeIds);
      }

      query += ` ORDER BY pp.price ASC`;

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la comparaison des prix: ${error.message}`);
    }
  }

  // Comparer un produit dans différentes localités (dernier prix validé par localité)
  static async getProductLocalityComparison(productId, limit = 100) {
    try {
      const [rows] = await db.execute(
        `SELECT 
           pr.id AS product_id,
           pr.name AS product_name,
           l.id AS locality_id,
           l.name AS city,
           u.symbol AS unit,
           p.price AS price,
           p.date AS last_updated
         FROM prices p
         JOIN products pr ON p.product_id = pr.id
         JOIN localities l ON p.locality_id = l.id
         JOIN units u ON p.unit_id = u.id
         WHERE p.status = 'validated'
           AND p.product_id = ?
           AND p.date = (
             SELECT MAX(p2.date)
             FROM prices p2
             WHERE p2.status = 'validated'
               AND p2.product_id = p.product_id
               AND p2.locality_id = p.locality_id
           )
         ORDER BY l.name ASC
         LIMIT ?`,
        [productId, parseInt(limit)]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la comparaison par localités: ${error.message}`);
    }
  }
  // Obtenir les meilleurs prix par catégorie (basés sur fournisseurs)
  static async getBestPricesByCategory(categoryId, limit = 20) {
    try {
      const [rows] = await db.execute(
        `SELECT pr.id AS product_id,
                pr.name AS product_name,
                p.price AS price,
                u.symbol AS unit,
                s.name AS store_name,
                l.name AS city,
                c.name AS category_name,
                p.date AS last_updated
         FROM prices p
         JOIN products pr ON p.product_id = pr.id
         LEFT JOIN product_categories c ON pr.category_id = c.id
         JOIN supplier_prices sp ON sp.price_id = p.id
         JOIN suppliers s ON sp.supplier_id = s.id
         JOIN localities l ON s.locality_id = l.id
         JOIN units u ON p.unit_id = u.id
         WHERE pr.category_id = ?
           AND p.status = 'validated'
           AND p.price = (
             SELECT MIN(p2.price)
             FROM prices p2
             JOIN supplier_prices sp2 ON sp2.price_id = p2.id
             WHERE p2.product_id = p.product_id
               AND p2.status = 'validated'
           )
         ORDER BY p.price ASC
         LIMIT ?`,
        [categoryId, parseInt(limit)]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des meilleurs prix: ${error.message}`);
    }
  }

  // Rechercher les produits les moins chers (basés sur fournisseurs)
  static async getCheapestProducts(limit = 20) {
    try {
      const [rows] = await db.execute(
        `SELECT pr.id AS product_id,
                pr.name AS product_name,
                p.price AS price,
                u.symbol AS unit,
                s.name AS store_name,
                l.name AS city,
                c.name AS category_name,
                p.date AS last_updated
         FROM prices p
         JOIN products pr ON p.product_id = pr.id
         LEFT JOIN product_categories c ON pr.category_id = c.id
         JOIN supplier_prices sp ON sp.price_id = p.id
         JOIN suppliers s ON sp.supplier_id = s.id
         JOIN localities l ON s.locality_id = l.id
         JOIN units u ON p.unit_id = u.id
         WHERE p.status = 'validated'
           AND p.id = (
             SELECT p3.id
             FROM prices p3
             JOIN supplier_prices sp3 ON sp3.price_id = p3.id
             WHERE p3.product_id = p.product_id
               AND p3.status = 'validated'
             ORDER BY p3.price ASC, p3.date DESC, sp3.supplier_id ASC
             LIMIT 1
           )
         ORDER BY p.price ASC
         LIMIT ?`,
        [parseInt(limit)]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des produits les moins chers: ${error.message}`);
    }
  }

  // Obtenir les statistiques de prix
  static async getPriceStats(productId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
           MIN(price) as min_price,
           MAX(price) as max_price,
           AVG(price) as avg_price,
           COUNT(*) as store_count
         FROM product_prices 
         WHERE product_id = ? AND is_available = TRUE`,
        [productId]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Recherche de produits par gamme de prix
  static async searchByPriceRange(minPrice, maxPrice, limit = 50) {
    try {
      const [rows] = await db.execute(
        `SELECT DISTINCT p.id as product_id, p.name as product_name, p.description, 
                c.name as category_name, pp.price, pp.unit, s.name as store_name, s.city
         FROM products p
         LEFT JOIN product_categories c ON p.category_id = c.id
         JOIN product_prices pp ON p.id = pp.product_id
         JOIN stores s ON pp.store_id = s.id
         WHERE pp.price BETWEEN ? AND ? AND pp.is_available = TRUE
         ORDER BY pp.price ASC
         LIMIT ?`,
        [minPrice, maxPrice, parseInt(limit)]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par gamme de prix: ${error.message}`);
    }
  }
}

module.exports = ProductPrice;
