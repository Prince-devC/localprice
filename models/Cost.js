const db = require('../database/connection');

class Cost {
  // Récupérer tous les coûts
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM costs ORDER BY type, value');
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des coûts: ${error.message}`);
    }
  }

  // Récupérer les coûts par type
  static async getByType(type) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM costs WHERE type = ? ORDER BY value',
        [type]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des coûts par type: ${error.message}`);
    }
  }

  // Récupérer les coûts de transport
  static async getTransportCosts() {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM costs WHERE type = 'transport' ORDER BY value"
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des coûts de transport: ${error.message}`);
    }
  }

  // Récupérer les coûts de stockage
  static async getStorageCosts() {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM costs WHERE type = 'stockage' ORDER BY value"
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des coûts de stockage: ${error.message}`);
    }
  }

  // Calculer le coût total de transport
  static async calculateTransportCost(distance, volume = 1) {
    try {
      const [rows] = await db.execute(
        "SELECT value FROM costs WHERE type = 'transport' ORDER BY value LIMIT 1"
      );
      
      if (rows.length === 0) {
        return 0;
      }
      
      return rows[0].value * distance * volume;
    } catch (error) {
      throw new Error(`Erreur lors du calcul du coût de transport: ${error.message}`);
    }
  }

  // Calculer le coût total de stockage
  static async calculateStorageCost(days, volume, unit = 'tonne') {
    try {
      const [rows] = await db.execute(
        "SELECT value FROM costs WHERE type = 'stockage' AND unit = ? ORDER BY value LIMIT 1",
        [`per_day_per_${unit}`]
      );
      
      if (rows.length === 0) {
        return 0;
      }
      
      return rows[0].value * days * volume;
    } catch (error) {
      throw new Error(`Erreur lors du calcul du coût de stockage: ${error.message}`);
    }
  }

  // Créer un nouveau coût
  static async create(costData) {
    try {
      const { type, value, unit, description } = costData;
      
      const [result] = await db.execute(
        'INSERT INTO costs (type, value, unit, description) VALUES (?, ?, ?, ?)',
        [type, value, unit, description]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du coût: ${error.message}`);
    }
  }

  // Mettre à jour un coût
  static async update(id, costData) {
    try {
      const { type, value, unit, description } = costData;
      
      const [result] = await db.execute(
        'UPDATE costs SET type = ?, value = ?, unit = ?, description = ? WHERE id = ?',
        [type, value, unit, description, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du coût: ${error.message}`);
    }
  }

  // Supprimer un coût
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM costs WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du coût: ${error.message}`);
    }
  }
}

module.exports = Cost;

