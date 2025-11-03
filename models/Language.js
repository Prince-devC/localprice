const db = require('../database/connection');

class Language {
  static async ensureTable() {
    const ddl = `CREATE TABLE IF NOT EXISTS languages (
           id SERIAL PRIMARY KEY,
           name TEXT NOT NULL UNIQUE,
           created_at TIMESTAMPTZ DEFAULT NOW()
         )`;
    await db.exec(ddl);
  }

  static async getAll() {
    await this.ensureTable();
    const rows = await db.all('SELECT * FROM languages ORDER BY name');
    return rows;
  }

  static async create(name) {
    await this.ensureTable();
    const normalized = String(name).trim();
    if (!normalized) throw new Error('Nom de langue requis');

    // Vérification de doublon insensible à la casse et aux espaces
    const existing = await db.get(
      'SELECT id FROM languages WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))',
      [normalized]
    );
    if (existing && existing.id) {
      const err = new Error('La langue existe déjà');
      err.code = 'DUPLICATE';
      throw err;
    }

    const result = await db.run('INSERT INTO languages (name) VALUES (?)', [normalized]);
    return result.lastID;
  }

  static async update(id, name) {
    await this.ensureTable();
    const normalized = String(name).trim();
    if (!normalized) throw new Error('Nom de langue requis');

    // Empêcher doublon insensible à la casse
    const existing = await db.get(
      'SELECT id FROM languages WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND id <> ?',
      [normalized, id]
    );
    if (existing && existing.id) {
      const err = new Error('La langue existe déjà');
      err.code = 'DUPLICATE';
      throw err;
    }

    const result = await db.run('UPDATE languages SET name = ? WHERE id = ?', [normalized, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    await this.ensureTable();
    const result = await db.run('DELETE FROM languages WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = Language;