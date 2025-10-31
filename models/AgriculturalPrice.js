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
        `SELECT 
            p.id,
            p.product_id,
            p.locality_id,
            p.unit_id,
            pr.name as product_name,
            pc.name as category_name,
            l.name as locality_name,
            r.name as region_name,
            u.name as unit_name,
            u.symbol as unit_symbol,
            p.price,
            p.date,
            p.comment,
            p.created_at,
            p.status,
            p.latitude,
            p.longitude,
            p.geo_accuracy,
            p.sub_locality,
            p.submission_method,
            p.source,
            p.source_type,
            p.source_contact_name,
            p.source_contact_phone,
            p.source_contact_relation,
            users.id as submitted_by_id,
            users.username as submitted_by_username,
            users.email as submitted_by_email,
            (
              SELECT cr.address 
              FROM contribution_requests cr 
              WHERE cr.user_id = users.id AND cr.status = 'approved'
              ORDER BY COALESCE(cr.reviewed_at, cr.created_at) DESC
              LIMIT 1
            ) AS contributor_address,
            (
              SELECT cr.contact_phone 
              FROM contribution_requests cr 
              WHERE cr.user_id = users.id AND cr.status = 'approved'
              ORDER BY COALESCE(cr.reviewed_at, cr.created_at) DESC
              LIMIT 1
            ) AS contributor_phone,
            (
              SELECT GROUP_CONCAT(lg.name, ', ')
              FROM price_source_languages psl
              JOIN languages lg ON psl.language_id = lg.id
              WHERE psl.price_id = p.id
            ) AS source_languages
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

  // Mettre à jour un prix en attente (admin ou contributeur propriétaire)
  static async updatePendingPrice(priceId, updates = {}, options = {}) {
    try {
      // Champs autorisés à la mise à jour
      const allowed = new Set([
        'product_id', 'locality_id', 'unit_id', 'price', 'date', 'comment',
        'latitude', 'longitude', 'geo_accuracy', 'source', 'source_type',
        'source_contact_name', 'source_contact_phone', 'source_contact_relation',
        'sub_locality'
      ]);
      const keys = Object.keys(updates || {}).filter(k => allowed.has(k));
      if (keys.length === 0) return false;

      // Contrainte: ne mettre à jour que si status = 'pending'
      const priceRow = await db.get(`SELECT id, status, submitted_by FROM prices WHERE id = ?`, [priceId]);
      if (!priceRow) throw new Error('Prix introuvable');
      if (priceRow.status !== 'pending') throw new Error('Impossible de modifier un prix non en attente');

      // Si options.requireOwner = true, vérifier le propriétaire
      if (options && options.requireOwner && options.userId) {
        if (String(priceRow.submitted_by) !== String(options.userId)) {
          throw new Error('Non autorisé à modifier ce prix');
        }
      }

      // Construire la requête UPDATE
      const setClauses = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => updates[k]);
      values.push(priceId);

      const result = await db.run(
        `UPDATE prices SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      // Mettre à jour les langues de source si fournies
      if (Array.isArray(updates.source_language_ids)) {
        const langIds = [...new Set(updates.source_language_ids.map(id => parseInt(id)).filter(id => !Number.isNaN(id)))];
        await db.run(`DELETE FROM price_source_languages WHERE price_id = ?`, [priceId]);
        for (const langId of langIds) {
          try {
            await db.run(`INSERT OR IGNORE INTO price_source_languages (price_id, language_id) VALUES (?, ?)`, [priceId, langId]);
          } catch (e) {
            // ignore
          }
        }
      }

      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du prix: ${error.message}`);
    }
  }

  // Supprimer un prix (autorisé si propriétaire et status pending/rejected)
  static async deletePrice(priceId, userId) {
    try {
      // Vérifier l'existence et l'autorisation
      const row = await db.get(`SELECT id, status, submitted_by FROM prices WHERE id = ?`, [priceId]);
      if (!row) throw new Error('Prix introuvable');
      if (String(row.submitted_by) !== String(userId)) throw new Error('Non autorisé à supprimer ce prix');
      if (!['pending', 'rejected'].includes(String(row.status))) throw new Error('Seuls les prix en attente ou rejetés peuvent être supprimés');

      const result = await db.run(`DELETE FROM prices WHERE id = ?`, [priceId]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du prix: ${error.message}`);
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
      const { product_id, locality_id, unit_id, price, date, comment, latitude = null, longitude = null, geo_accuracy = null, source = null,
        source_type = null, source_contact_name = null, source_contact_phone = null, source_contact_relation = null, sub_locality = null,
        submission_method = 'Formulaire Web' } = priceData;

      // Détecter les colonnes réellement présentes dans la table `prices`
      const cols = await db.all(`PRAGMA table_info(prices)`);
      const has = (name) => cols.some(c => String(c.name) === String(name));

      // Colonnes de base toujours présentes
      const insertCols = ['product_id','locality_id','unit_id','price','date','submitted_by','comment','status'];
      const insertVals = [product_id, locality_id, unit_id, price, date, contributorId, comment, 'pending'];

      // Colonnes optionnelles selon le schéma courant
      if (has('latitude')) { insertCols.push('latitude'); insertVals.push(latitude); }
      if (has('longitude')) { insertCols.push('longitude'); insertVals.push(longitude); }
      if (has('geo_accuracy')) { insertCols.push('geo_accuracy'); insertVals.push(geo_accuracy); }
      if (has('source')) { insertCols.push('source'); insertVals.push(source); }
      if (has('source_type')) { insertCols.push('source_type'); insertVals.push(source_type); }
      if (has('source_contact_name')) { insertCols.push('source_contact_name'); insertVals.push(source_contact_name); }
      if (has('source_contact_phone')) { insertCols.push('source_contact_phone'); insertVals.push(source_contact_phone); }
      if (has('source_contact_relation')) { insertCols.push('source_contact_relation'); insertVals.push(source_contact_relation); }
      if (has('sub_locality')) { insertCols.push('sub_locality'); insertVals.push(sub_locality); }
      if (has('submission_method')) { insertCols.push('submission_method'); insertVals.push(submission_method); }

      const placeholders = insertCols.map(() => '?').join(', ');
      const sql = `INSERT INTO prices (${insertCols.join(', ')}) VALUES (${placeholders})`;
      const result = await db.run(sql, insertVals);
      return result.lastID;
    } catch (error) {
      throw new Error(`Erreur lors de la soumission du prix: ${error.message}`);
    }
  }

  // Récupérer les prix soumis par un utilisateur (avec jointures pour l'affichage)
  static async getPricesByUser(userId, { status = 'all', limit = 50, offset = 0 } = {}) {
    try {
      let query = `
        SELECT p.id, p.product_id, p.locality_id, p.unit_id, p.price, p.date, p.status,
               p.comment, p.latitude, p.longitude, p.geo_accuracy, p.sub_locality, p.source, p.source_type,
               p.rejection_reason,
               p.source_contact_name, p.source_contact_phone, p.source_contact_relation, p.created_at,
               pr.name as product_name, pc.name as category_name, pc.type as category_type,
               l.name as locality_name, l.latitude as locality_latitude, l.longitude as locality_longitude,
               r.name as region_name, u.name as unit_name, u.symbol as unit_symbol,
               (
                 SELECT GROUP_CONCAT(lg.name, ', ')
                 FROM price_source_languages psl
                 JOIN languages lg ON psl.language_id = lg.id
                 WHERE psl.price_id = p.id
               ) AS source_languages
        FROM prices p
        JOIN products pr ON p.product_id = pr.id
        JOIN product_categories pc ON pr.category_id = pc.id
        JOIN localities l ON p.locality_id = l.id
        JOIN regions r ON l.region_id = r.id
        JOIN units u ON p.unit_id = u.id
        WHERE p.submitted_by = ?
      `;
      const params = [userId];

      if (status && status !== 'all') {
        query += ` AND p.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));

      const rows = await db.all(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prix utilisateur: ${error.message}`);
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

