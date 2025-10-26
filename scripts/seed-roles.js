/**
 * Seed des rôles dans SQLite.
 * Usage: node scripts/seed-roles.js
 */
const db = require('../database/connection');

async function ensureRoles() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE CHECK (name IN ('user','contributor','admin','super_admin'))
    );
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
  `;
  await db.exec(ddl);
}

async function upsertRole(name) {
  await db.run('INSERT OR IGNORE INTO roles (name) VALUES (?)', [name]);
}

async function main() {
  try {
    await ensureRoles();
    for (const r of ['user','contributor','admin','super_admin']) {
      await upsertRole(r);
    }
    console.log('Roles seed: OK');
    process.exit(0);
  } catch (e) {
    console.error('Seed roles error:', e.message);
    process.exit(1);
  } finally {
    try { await db.close(); } catch (_) {}
  }
}

main();