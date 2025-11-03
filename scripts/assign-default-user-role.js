/**
 * Assigner le rôle 'user' à tous les comptes sans rôle.
 * - Si SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont configurés, liste les utilisateurs via l'API Admin Supabase
 *   pour récupérer leur email et assurer la présence dans la table locale `users` (id, email).
 * - Sinon, opère uniquement sur la table locale `users`.
 * - Ajoute le rôle pivot `user` pour les comptes n'ayant aucun rôle dans `user_roles`.
 *
 * Usage: node scripts/assign-default-user-role.js
 */
const db = require('../database/connection');
require('dotenv').config();

async function ensureRoles() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE CHECK (name IN ('user','contributor','admin','super_admin'))
    );
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id uuid NOT NULL,
      role_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
  `;
  await db.exec(ddl);
  await db.execute('INSERT INTO roles (name) VALUES (?) ON CONFLICT (name) DO NOTHING', ['user']);
  await db.execute('INSERT INTO roles (name) VALUES (?) ON CONFLICT (name) DO NOTHING', ['contributor']);
  await db.execute('INSERT INTO roles (name) VALUES (?) ON CONFLICT (name) DO NOTHING', ['admin']);
  await db.execute('INSERT INTO roles (name) VALUES (?) ON CONFLICT (name) DO NOTHING', ['super_admin']);
}

async function getRoleId(name) {
  const [[row]] = await db.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', [name]);
  if (!row) throw new Error(`Rôle introuvable: ${name}`);
  return row.id;
}

async function hasAnyRole(userId) {
  const [[row]] = await db.execute('SELECT COUNT(*) AS c FROM user_roles WHERE user_id = ?', [userId]);
  return (row && row.c) > 0;
}

async function upsertLocalUser(userId, email) {
  const existing = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  if (existing) return;
  if (!email) return; // Ne peut pas insérer sans email (NOT NULL)
  await db.execute(
    `INSERT INTO users (id, email, email_verified, role)
     VALUES (?, ?, true, 'user')
     ON CONFLICT (id) DO NOTHING`,
    [userId, email]
  );
}

async function assignUserRoleIfNone(userId, userRoleId) {
  const hasRole = await hasAnyRole(userId);
  if (hasRole) return false;
  await db.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING', [userId, userRoleId]);
  // Met à jour le rôle principal pour cohérence (si l'entrée existe)
  await db.execute("UPDATE users SET role = COALESCE(role, 'user') WHERE id = ?", [userId]);
  return true;
}

async function fetchSupabaseUsersPage(page = 1, perPage = 200) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const baseUrl = url.replace(/\/$/, '');
  const endpoint = `${baseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
  try {
    const resp = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}`, apikey: key },
      method: 'GET'
    });
    if (!resp.ok) throw new Error(`Supabase error ${resp.status}`);
    const data = await resp.json();
    // data.users (obj) ou data (array) selon version
    const users = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : []);
    return users;
  } catch (e) {
    console.error('[supabase] fetch error:', e.message);
    return [];
  }
}

async function main() {
  let updated = 0;
  try {
    await ensureRoles();
    const userRoleId = await getRoleId('user');

    const hasSupabaseAdmin = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabaseAdmin) {
      let page = 1;
      const perPage = 200;
      while (true) {
        const users = await fetchSupabaseUsersPage(page, perPage);
        if (!users || users.length === 0) break;
        for (const u of users) {
          const userId = u.id;
          const email = u.email || null;
          await upsertLocalUser(userId, email);
          const didAssign = await assignUserRoleIfNone(userId, userRoleId);
          if (didAssign) updated++;
        }
        // Si la page renvoie moins que perPage, c'est la dernière
        if (users.length < perPage) break;
        page++;
      }
    } else {
      // Fallback: opérer uniquement sur les utilisateurs locaux
      const localUsers = await db.all('SELECT id FROM users');
      for (const lu of localUsers || []) {
        const didAssign = await assignUserRoleIfNone(lu.id, userRoleId);
        if (didAssign) updated++;
      }
    }

    console.log(`Assignation du rôle 'user' terminée. Comptes mis à jour: ${updated}.`);
    process.exit(0);
  } catch (e) {
    console.error('Erreur assign-default-user-role:', e.message);
    process.exit(1);
  } finally {
    try { await db.close(); } catch (_) {}
  }
}

main();