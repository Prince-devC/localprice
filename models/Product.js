const db = require('../database/connection');

class Product {
  // Récupérer tous les produits
  static async getAll(limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         ORDER BY p.name 
         LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des produits: ${error.message}`);
    }
  }

  // Récupérer un produit par ID
  static async getById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du produit: ${error.message}`);
    }
  }

  // Rechercher des produits par nom
  static async searchByName(searchTerm, limit = 50) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.name LIKE ? 
         ORDER BY p.name 
         LIMIT ${parseInt(limit)}`,
        [`%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de produits: ${error.message}`);
    }
  }

  // Rechercher des produits par catégorie
  static async getByCategory(categoryId, limit = 50) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.category_id = ? 
         ORDER BY p.name 
         LIMIT ${parseInt(limit)}`,
        [categoryId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des produits par catégorie: ${error.message}`);
    }
  }

  // Rechercher des produits par code-barres
  static async getByBarcode(barcode) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.barcode = ?`,
        [barcode]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par code-barres: ${error.message}`);
    }
  }

  // Créer un nouveau produit
  static async create(productData) {
    try {
      const { name, description, category_id, brand, barcode, image_url } = productData;

      const [result] = await db.execute(
        `INSERT INTO products (name, description, category_id, brand, barcode, image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, category_id, brand, barcode, image_url]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du produit: ${error.message}`);
    }
  }

  // Mettre à jour un produit
  static async update(id, productData) {
    try {
      const { name, description, category_id, brand, barcode, image_url } = productData;

      const [result] = await db.execute(
        `UPDATE products SET 
         name = ?, description = ?, category_id = ?, brand = ?, barcode = ?, image_url = ?
         WHERE id = ?`,
        [name, description, category_id, brand, barcode, image_url, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du produit: ${error.message}`);
    }
  }

  // Supprimer un produit
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du produit: ${error.message}`);
    }
  }

  // Obtenir les prix d'un produit dans tous les magasins
  static async getPrices(productId) {
    try {
      const [rows] = await db.execute(
        `SELECT pp.*, s.name as store_name, s.address, s.city, s.postal_code
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

  // Recherche avancée avec filtres
  static async searchAdvanced(filters) {
    try {
      let query = `SELECT p.*, c.name as category_name 
                   FROM products p 
                   LEFT JOIN categories c ON p.category_id = c.id 
                   WHERE 1=1`;
      
      const params = [];

      if (filters.name) {
        query += ` AND p.name LIKE ?`;
        params.push(`%${filters.name}%`);
      }

      if (filters.category_id) {
        query += ` AND p.category_id = ?`;
        params.push(filters.category_id);
      }

      if (filters.brand) {
        query += ` AND p.brand LIKE ?`;
        params.push(`%${filters.brand}%`);
      }

      if (filters.min_price && filters.max_price) {
        query += ` AND p.id IN (
          SELECT product_id FROM product_prices 
          WHERE price BETWEEN ? AND ? AND is_available = TRUE
        )`;
        params.push(filters.min_price, filters.max_price);
      }

      query += ` ORDER BY p.name LIMIT ${parseInt(filters.limit || 50)}`;

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche avancée: ${error.message}`);
    }
  }
}

module.exports = Product;
