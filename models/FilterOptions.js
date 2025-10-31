const db = require('../database/connection');

class FilterOptions {
  // Récupérer les options de produits pour les filtres
  static async getProductOptions() {
    try {
      const rows = await db.all(`
        SELECT p.id AS product_id,
               p.name AS display_name
        FROM products p
        ORDER BY p.name ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de produits: ${error.message}`);
    }
  }

  // Récupérer les options de localités pour les filtres
  static async getLocalityOptions() {
    try {
      const rows = await db.all(`
        SELECT l.id AS locality_id,
               l.name AS display_name
        FROM localities l
        ORDER BY l.name ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de localités: ${error.message}`);
    }
  }

  // Récupérer les options de régions pour les filtres
  static async getRegionOptions() {
    try {
      const rows = await db.all(`
        SELECT r.id AS region_id,
               r.name AS display_name
        FROM regions r
        ORDER BY r.name ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de régions: ${error.message}`);
    }
  }

  // Récupérer les options de catégories pour les filtres
  static async getCategoryOptions() {
    try {
      const rows = await db.all(`
        SELECT pc.id AS category_id,
               pc.name AS display_name
        FROM product_categories pc
        ORDER BY pc.name ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de catégories: ${error.message}`);
    }
  }

  // Récupérer les options de périodes pour les filtres
  static async getPeriodOptions() {
    try {
      const rows = await db.all(`
        SELECT id, period_key, display_name, days_count, is_active, sort_order
        FROM filter_period_options
        WHERE is_active = 1
        ORDER BY sort_order ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de périodes: ${error.message}`);
    }
  }

  // Récupérer toutes les options de filtres en une seule fois
  static async getAllFilterOptions() {
    try {
      const [products, localities, regions, categories, periods] = await Promise.all([
        this.getProductOptions(),
        this.getLocalityOptions(),
        this.getRegionOptions(),
        this.getCategoryOptions(),
        this.getPeriodOptions()
      ]);

      return {
        products,
        localities,
        regions,
        categories,
        periods
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de toutes les options de filtres: ${error.message}`);
    }
  }

  // Mettre à jour le statut d'une option de filtre
  static async updateOptionStatus(table, id, isActive) {
    try {
      const validTables = ['filter_period_options'];

      if (!validTables.includes(table)) {
        throw new Error('Table non valide');
      }

      const result = await db.run(
        `UPDATE ${table} SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [isActive ? 1 : 0, id]
      );

      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du statut de l'option: ${error.message}`);
    }
  }

  // Ajouter une nouvelle option de filtre pour un produit (DÉPRÉCIÉ)
  // Les options de produit sont désormais dérivées automatiquement de `products`.
  // Cette méthode est conservée pour compatibilité mais ne fait rien.
  static async addProductOption() {
    throw new Error('addProductOption n\'est plus supportée avec des filtres dynamiques');
  }

  // Ajouter une nouvelle option de filtre pour une localité (DÉPRÉCIÉ)
  // Les options de localité sont désormais dérivées automatiquement de `localities`.
  // Cette méthode est conservée pour compatibilité mais ne fait rien.
  static async addLocalityOption() {
    throw new Error('addLocalityOption n\'est plus supportée avec des filtres dynamiques');
  }

  // Supprimer une option de filtre
  static async deleteOption(table, id) {
    try {
      const validTables = ['filter_period_options'];

      if (!validTables.includes(table)) {
        throw new Error('Table non valide');
      }

      const result = await db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'option: ${error.message}`);
    }
  }
}

module.exports = FilterOptions;