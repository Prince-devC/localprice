const db = require('../database/connection');

class Store {
  // Récupérer tous les magasins
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM stores ORDER BY name');
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des magasins: ${error.message}`);
    }
  }

  // Récupérer un magasin par ID
  static async getById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM stores WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du magasin: ${error.message}`);
    }
  }

  // Rechercher des magasins par ville
  static async getByCity(city) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM stores WHERE city LIKE ? ORDER BY name',
        [`%${city}%`]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de magasins: ${error.message}`);
    }
  }

  // Rechercher des magasins par code postal
  static async getByPostalCode(postalCode) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM stores WHERE postal_code = ? ORDER BY name',
        [postalCode]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de magasins: ${error.message}`);
    }
  }

  // Créer un nouveau magasin
  static async create(storeData) {
    try {
      const {
        name, address, city, postal_code, phone, email, website,
        latitude, longitude, opening_hours
      } = storeData;

      const [result] = await db.execute(
        `INSERT INTO stores (name, address, city, postal_code, phone, email, website, latitude, longitude, opening_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, address, city, postal_code, phone, email, website, latitude, longitude, JSON.stringify(opening_hours)]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du magasin: ${error.message}`);
    }
  }

  // Mettre à jour un magasin
  static async update(id, storeData) {
    try {
      const {
        name, address, city, postal_code, phone, email, website,
        latitude, longitude, opening_hours
      } = storeData;

      const [result] = await db.execute(
        `UPDATE stores SET 
         name = ?, address = ?, city = ?, postal_code = ?, phone = ?, 
         email = ?, website = ?, latitude = ?, longitude = ?, opening_hours = ?
         WHERE id = ?`,
        [name, address, city, postal_code, phone, email, website, 
         latitude, longitude, JSON.stringify(opening_hours), id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du magasin: ${error.message}`);
    }
  }

  // Supprimer un magasin
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM stores WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du magasin: ${error.message}`);
    }
  }

  // Recherche géographique (magasins dans un rayon donné)
  static async getNearby(latitude, longitude, radiusKm = 10) {
    try {
      const [rows] = await db.execute(
        `SELECT *, 
         (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
          sin(radians(latitude)))) AS distance
         FROM stores 
         HAVING distance < ?
         ORDER BY distance`,
        [latitude, longitude, latitude, radiusKm]
      );
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche géographique: ${error.message}`);
    }
  }
}

module.exports = Store;
