const db = require('../database/connection');

class Supplier {
  // Récupérer tous les fournisseurs avec leur localité
  static async getAll() {
    try {
      const rows = await db.all(
        `SELECT 
           s.id,
           s.name,
           s.type,
           s.contact_phone,
           s.contact_email,
           s.address,
           s.locality_id,
           s.latitude AS supplier_latitude,
           s.longitude AS supplier_longitude,
           l.name AS locality_name,
           l.latitude AS locality_latitude,
           l.longitude AS locality_longitude
         FROM suppliers s
         JOIN localities l ON s.locality_id = l.id
         ORDER BY s.name`
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des fournisseurs: ${error.message}`);
    }
  }

  // Récupérer un résumé complet d'un fournisseur: détails, prix liés, disponibilités
  static async getSummaryById(supplierId) {
    try {
      const details = await db.get(
        `SELECT 
           s.id,
           s.name,
           s.type,
           s.contact_phone,
           s.contact_email,
           s.address,
           s.locality_id,
           s.latitude AS supplier_latitude,
           s.longitude AS supplier_longitude,
           l.name AS locality_name,
           l.latitude AS locality_latitude,
           l.longitude AS locality_longitude
         FROM suppliers s
         JOIN localities l ON s.locality_id = l.id
         WHERE s.id = ?`,
        [supplierId]
      );

      if (!details) {
        return null;
      }

      const prices = await db.all(
        `SELECT 
           sp.product_id,
           pr.name AS product_name,
           pc.name AS category_name,
           pc.type AS category_type,
           p.id AS price_id,
           p.price,
           p.date,
           u.name AS unit_name,
           u.symbol AS unit_symbol,
           l.name AS locality_name
         FROM supplier_prices sp
         JOIN prices p ON sp.price_id = p.id
         JOIN products pr ON sp.product_id = pr.id
         JOIN product_categories pc ON pr.category_id = pc.id
         JOIN units u ON p.unit_id = u.id
         JOIN localities l ON p.locality_id = l.id
         WHERE sp.supplier_id = ? AND p.status = 'validated'
         ORDER BY p.date DESC`,
        [supplierId]
      );

      const availability = await db.all(
        `SELECT 
           spa.product_id,
           pr.name AS product_name,
           spa.is_available,
           spa.available_quantity,
           spa.quantity_unit,
           spa.expected_restock_date,
           spa.available_from,
           spa.available_until,
           spa.notes
         FROM supplier_product_availability spa
         JOIN products pr ON spa.product_id = pr.id
         WHERE spa.supplier_id = ?`,
        [supplierId]
      );

      return { details, prices, availability };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du résumé fournisseur: ${error.message}`);
    }
  }
}

module.exports = Supplier;