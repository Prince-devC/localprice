const db = require('../database/connection');

async function ensurePeriodOptionsTable() {
  try {
    // Vérifier si la table existe (PRAGMA émulé côté Postgres)
    const cols = await db.all('PRAGMA table_info(filter_period_options)');
    if (!Array.isArray(cols) || cols.length === 0) {
      // Créer la table (Postgres uniquement)
      await db.exec(`
        CREATE TABLE IF NOT EXISTS filter_period_options (
          id SERIAL PRIMARY KEY,
          period_key TEXT UNIQUE,
          display_name TEXT,
          days_count INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      // Insérer des options par défaut
      await db.run(
        `INSERT INTO filter_period_options (period_key, display_name, days_count, is_active, sort_order)
         VALUES ('last_7_days', '7 jours', 7, TRUE, 10)
         ON CONFLICT (period_key) DO NOTHING`
      );
      await db.run(
        `INSERT INTO filter_period_options (period_key, display_name, days_count, is_active, sort_order)
         VALUES ('last_30_days', '30 jours', 30, TRUE, 20)
         ON CONFLICT (period_key) DO NOTHING`
      );
      await db.run(
        `INSERT INTO filter_period_options (period_key, display_name, days_count, is_active, sort_order)
         VALUES ('last_90_days', '90 jours', 90, TRUE, 30)
         ON CONFLICT (period_key) DO NOTHING`
      );
    }
  } catch (err) {
    // Si la création échoue, continuer; la récupération déclenchera l'erreur explicite
    console.warn('Impossible de vérifier/créer filter_period_options:', err.message);
  }
}

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
      await ensurePeriodOptionsTable();
      const whereActive = 'is_active = TRUE';
      const rows = await db.all(`
        SELECT id, period_key, display_name, days_count, is_active, sort_order
        FROM filter_period_options
        WHERE ${whereActive}
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
      const results = await Promise.allSettled([
        this.getProductOptions(),
        this.getLocalityOptions(),
        this.getRegionOptions(),
        this.getCategoryOptions(),
        this.getPeriodOptions()
      ]);

      const pick = (idx) => (results[idx].status === 'fulfilled' ? results[idx].value : []);
      const [products, localities, regions, categories, periods] = [
        pick(0), pick(1), pick(2), pick(3), pick(4)
      ];

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
        `UPDATE ${table} SET is_active = ?, updated_at = NOW() WHERE id = ?`,
        [!!isActive, id]
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