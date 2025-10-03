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

      return result.insertId || result.affectedRows;
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

  // Obtenir les meilleurs prix par catégorie
  static async getBestPricesByCategory(categoryId, limit = 20) {
    try {
      const [rows] = await db.execute(
        `SELECT p.id as product_id, p.name as product_name, pp.price, pp.unit, 
                s.name as store_name, s.city, pp.last_updated
         FROM product_prices pp
         JOIN products p ON pp.product_id = p.id
         JOIN stores s ON pp.store_id = s.id
         WHERE p.category_id = ? AND pp.is_available = TRUE
         AND pp.price = (
           SELECT MIN(pp2.price) 
           FROM product_prices pp2 
           WHERE pp2.product_id = pp.product_id AND pp2.is_available = TRUE
         )
         ORDER BY pp.price ASC
         LIMIT ${parseInt(limit)}`,
        [categoryId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des meilleurs prix: ${error.message}`);
    }
  }

  // Rechercher les produits les moins chers
  static async getCheapestProducts(limit = 20) {
    try {
      const [rows] = await db.execute(
        `SELECT p.id as product_id, p.name as product_name, pp.price, pp.unit,
                s.name as store_name, s.city, c.name as category_name
         FROM product_prices pp
         JOIN products p ON pp.product_id = p.id
         JOIN stores s ON pp.store_id = s.id
         LEFT JOIN product_categories c ON p.category_id = c.id
         WHERE pp.is_available = TRUE
         ORDER BY pp.price ASC
         LIMIT ${parseInt(limit)}`
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
         LIMIT ${parseInt(limit)}`,
        [minPrice, maxPrice]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par gamme de prix: ${error.message}`);
    }
  }
}

module.exports = ProductPrice;
