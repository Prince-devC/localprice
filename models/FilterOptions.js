const db = require('../database/connection');

class FilterOptions {
  // Récupérer les options de produits pour les filtres
  static async getProductOptions() {
    try {
      const rows = await db.all(`
        SELECT fpo.id, fpo.product_id, fpo.display_name, fpo.is_active, fpo.sort_order,
               p.name as product_name, p.description as product_description,
               pc.name as category_name, pc.type as category_type
        FROM filter_product_options fpo
        JOIN products p ON fpo.product_id = p.id
        JOIN product_categories pc ON p.category_id = pc.id
        WHERE fpo.is_active = 1
        ORDER BY fpo.sort_order ASC, fpo.display_name ASC
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
        SELECT flo.id, flo.locality_id, flo.display_name, flo.is_active, flo.sort_order,
               l.name as locality_name, l.latitude, l.longitude,
               r.name as region_name, r.code as region_code
        FROM filter_locality_options flo
        JOIN localities l ON flo.locality_id = l.id
        JOIN regions r ON l.region_id = r.id
        WHERE flo.is_active = 1
        ORDER BY flo.sort_order ASC, flo.display_name ASC
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
        SELECT fro.id, fro.region_id, fro.display_name, fro.is_active, fro.sort_order,
               r.name as region_name, r.code as region_code
        FROM filter_region_options fro
        JOIN regions r ON fro.region_id = r.id
        WHERE fro.is_active = 1
        ORDER BY fro.sort_order ASC, fro.display_name ASC
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
        SELECT fco.id, fco.category_id, fco.display_name, fco.is_active, fco.sort_order,
               pc.name as category_name, pc.type as category_type, pc.description
        FROM filter_category_options fco
        JOIN product_categories pc ON fco.category_id = pc.id
        WHERE fco.is_active = 1
        ORDER BY fco.sort_order ASC, fco.display_name ASC
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
      const validTables = [
        'filter_product_options',
        'filter_locality_options',
        'filter_region_options',
        'filter_category_options',
        'filter_period_options'
      ];

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

  // Ajouter une nouvelle option de filtre pour un produit
  static async addProductOption(productId, displayName, sortOrder = 999) {
    try {
      const result = await db.run(
        `INSERT INTO filter_product_options (product_id, display_name, is_active, sort_order)
         VALUES (?, ?, 1, ?)`,
        [productId, displayName, sortOrder]
      );

      return result.lastID;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de l'option de produit: ${error.message}`);
    }
  }

  // Ajouter une nouvelle option de filtre pour une localité
  static async addLocalityOption(localityId, displayName, sortOrder = 999) {
    try {
      const result = await db.run(
        `INSERT INTO filter_locality_options (locality_id, display_name, is_active, sort_order)
         VALUES (?, ?, 1, ?)`,
        [localityId, displayName, sortOrder]
      );

      return result.lastID;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de l'option de localité: ${error.message}`);
    }
  }

  // Supprimer une option de filtre
  static async deleteOption(table, id) {
    try {
      const validTables = [
        'filter_product_options',
        'filter_locality_options',
        'filter_region_options',
        'filter_category_options',
        'filter_period_options'
      ];

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