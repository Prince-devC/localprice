const db = require('../database/connection');

class Unit {
  // Récupérer toutes les unités
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM units ORDER BY name');
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des unités: ${error.message}`);
    }
  }

  // Récupérer une unité par ID
  static async getById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM units WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'unité: ${error.message}`);
    }
  }

  // Créer une nouvelle unité
  static async create(unitData) {
    try {
      const { name, symbol } = unitData;
      
      const [result] = await db.execute(
        'INSERT INTO units (name, symbol) VALUES (?, ?)',
        [name, symbol]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'unité: ${error.message}`);
    }
  }

  // Mettre à jour une unité
  static async update(id, unitData) {
    try {
      const { name, symbol } = unitData;
      
      const [result] = await db.execute(
        'UPDATE units SET name = ?, symbol = ? WHERE id = ?',
        [name, symbol, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'unité: ${error.message}`);
    }
  }

  // Supprimer une unité
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM units WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'unité: ${error.message}`);
    }
  }
}

module.exports = Unit;

