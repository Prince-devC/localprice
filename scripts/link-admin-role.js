/**
 * Lier un rôle (par défaut admin) à un utilisateur Supabase.
 * Usage:
 *   node scripts/link-admin-role.js --user_id <SUPABASE_UUID> [--email <email>] [--role admin]
 *
 * Si --email n'est pas fourni, tentative de récupération via Supabase Admin API
 * en utilisant SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.
 */
const db = require('../database/connection');
require('dotenv').config();

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { role: 'admin' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--user_id') out.user_id = args[++i];
    else if (a === '--email') out.email = args[++i];
    else if (a === '--role') out.role = args[++i];
  }
  return out;
}

async function ensureRoles() {
  await db.exec(`
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
  `);
  await db.run('INSERT OR IGNORE INTO roles (name) VALUES (?)', ['user']);
  await db.run('INSERT OR IGNORE INTO roles (name) VALUES (?)', ['contributor']);
  await db.run('INSERT OR IGNORE INTO roles (name) VALUES (?)', ['admin']);
  await db.run('INSERT OR IGNORE INTO roles (name) VALUES (?)', ['super_admin']);
}

async function fetchEmailFromSupabase(userId) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  try {
    const resp = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.email || null;
  } catch (_) {
    return null;
  }
}

async function upsertLocalUser(userId, email) {
  const existing = await db.get('SELECT email FROM users WHERE id = ?', [userId]);
  if (existing) {
    return; // déjà présent, rien à faire
  }
  if (!email) {
    // Pas d'email disponible: ignorer la création du miroir, on liera juste le rôle
    return;
  }
  await db.run(
    `INSERT OR IGNORE INTO users (id, email, email_verified, role)
     VALUES (?, ?, 1, 'user')`,
    [userId, email]
  );
}

async function getRoleId(name) {
  const row = await db.get('SELECT id FROM roles WHERE name = ?', [name]);
  if (!row) throw new Error(`Rôle introuvable: ${name}`);
  return row.id;
}

async function linkRole(userId, roleName) {
  const roleId = await getRoleId(roleName);
  await db.run(
    'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
    [userId, roleId]
  );
}

async function main() {
  try {
    const { user_id, email: emailArg, role } = parseArgs();
    if (!user_id) throw new Error('--user_id est requis');
    if (!['user','contributor','admin','super_admin'].includes(role)) {
      throw new Error(`Rôle invalide: ${role}`);
    }

    await ensureRoles();

    let email = emailArg;
    if (!email) {
      email = await fetchEmailFromSupabase(user_id);
    }
    if (!email) {
      const existing = await db.get('SELECT email FROM users WHERE id = ?', [user_id]);
      if (existing?.email) {
        email = existing.email;
      }
    }
    if (!email) {
      throw new Error('Email non fourni et non récupérable depuis Supabase. Fournissez --email.');
    }

    await upsertLocalUser(user_id, email);
    await linkRole(user_id, role);

    console.log(`OK: Rôle '${role}' lié à l'utilisateur ${user_id} (${email}).`);
    process.exit(0);
  } catch (e) {
    console.error('Erreur:', e.message);
    process.exit(1);
  } finally {
    try { await db.close(); } catch (_) {}
  }
}

main();