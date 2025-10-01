const db = require('../database/connection');

class ProductCategory {
  // Récupérer toutes les catégories
  static async getAll() {
    try {
      const rows = await db.all('SELECT * FROM product_categories ORDER BY name');
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`);
    }
  }

  // Récupérer une catégorie par ID
  static async getById(id) {
    try {
      const row = await db.get('SELECT * FROM product_categories WHERE id = ?', [id]);
      return row;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la catégorie: ${error.message}`);
    }
  }

  // Créer une nouvelle catégorie
  static async create(categoryData) {
    try {
      const { name, type, description } = categoryData;
      
      const result = await db.run(
        'INSERT INTO product_categories (name, type, description) VALUES (?, ?, ?)',
        [name, type, description]
      );
      
      return result.lastID;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la catégorie: ${error.message}`);
    }
  }

  // Mettre à jour une catégorie
  static async update(id, categoryData) {
    try {
      const { name, type, description } = categoryData;
      
      const result = await db.run(
        'UPDATE product_categories SET name = ?, type = ?, description = ? WHERE id = ?',
        [name, type, description, id]
      );
      
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la catégorie: ${error.message}`);
    }
  }

  // Supprimer une catégorie
  static async delete(id) {
    try {
      const result = await db.run('DELETE FROM product_categories WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la catégorie: ${error.message}`);
    }
  }
}

module.exports = ProductCategory;

