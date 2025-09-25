const db = require('../database/connection');

class Locality {
  // Récupérer toutes les localités
  static async getAll() {
    try {
      const [rows] = await db.execute(
        `SELECT l.*, r.name as region_name 
         FROM localities l 
         LEFT JOIN regions r ON l.region_id = r.id 
         ORDER BY l.name`
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des localités: ${error.message}`);
    }
  }

  // Récupérer une localité par ID
  static async getById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT l.*, r.name as region_name 
         FROM localities l 
         LEFT JOIN regions r ON l.region_id = r.id 
         WHERE l.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la localité: ${error.message}`);
    }
  }

  // Récupérer les localités par région
  static async getByRegion(regionId) {
    try {
      const [rows] = await db.execute(
        `SELECT l.*, r.name as region_name 
         FROM localities l 
         LEFT JOIN regions r ON l.region_id = r.id 
         WHERE l.region_id = ? 
         ORDER BY l.name`,
        [regionId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des localités par région: ${error.message}`);
    }
  }

  // Récupérer les localités avec coordonnées GPS
  static async getWithCoordinates() {
    try {
      const [rows] = await db.execute(
        `SELECT l.*, r.name as region_name 
         FROM localities l 
         LEFT JOIN regions r ON l.region_id = r.id 
         WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
         ORDER BY l.name`
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des localités avec coordonnées: ${error.message}`);
    }
  }

  // Créer une nouvelle localité
  static async create(localityData) {
    try {
      const { name, region_id, latitude, longitude } = localityData;
      
      const [result] = await db.execute(
        'INSERT INTO localities (name, region_id, latitude, longitude) VALUES (?, ?, ?, ?)',
        [name, region_id, latitude, longitude]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la localité: ${error.message}`);
    }
  }

  // Mettre à jour une localité
  static async update(id, localityData) {
    try {
      const { name, region_id, latitude, longitude } = localityData;
      
      const [result] = await db.execute(
        'UPDATE localities SET name = ?, region_id = ?, latitude = ?, longitude = ? WHERE id = ?',
        [name, region_id, latitude, longitude, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la localité: ${error.message}`);
    }
  }

  // Supprimer une localité
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM localities WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la localité: ${error.message}`);
    }
  }
}

module.exports = Locality;

