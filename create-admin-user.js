/**
 * Script de création/mise à jour d’un compte admin vérifié pour Lokali.
 * Utilisation:
 *   node create-admin-user.js --email "admin@lokali.dev" --password "Admin123!" --username "admin" [--role admin|super_admin]
 *
 * Par défaut: rôle=admin. Le compte est marqué email_verified=1.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database/connection');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

async function ensureUsersColumns() {
  const [cols] = await db.execute("PRAGMA table_info(users)");
  const names = cols.map(c => c.name);
  const stmts = [];
  if (!names.includes('username')) stmts.push("ALTER TABLE users ADD COLUMN username TEXT");
  if (!names.includes('password_hash')) stmts.push("ALTER TABLE users ADD COLUMN password_hash TEXT");
  if (!names.includes('email_verified')) stmts.push("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0");
  if (!names.includes('email_verification_token')) stmts.push("ALTER TABLE users ADD COLUMN email_verification_token TEXT");
  if (!names.includes('email_verification_expires')) stmts.push("ALTER TABLE users ADD COLUMN email_verification_expires INTEGER");
  if (!names.includes('role')) stmts.push("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user','contributor','admin','super_admin'))");
  for (const s of stmts) {
    await db.exec(s + ';');
  }
}

async function main() {
  try {
    const args = parseArgs();
    const email = args.email || process.env.ADMIN_EMAIL || 'admin@lokali.dev';
    const password = args.password || process.env.ADMIN_PASSWORD || 'Admin123!';
    const username = args.username || process.env.ADMIN_USERNAME || 'admin';
    const role = (args.role || process.env.ADMIN_ROLE || 'admin').trim();

    if (!email || !password) {
      console.error('Erreur: --email et --password sont requis.');
      process.exit(1);
    }
    if (!['admin','super_admin'].includes(role)) {
      console.error('Erreur: --role doit être "admin" ou "super_admin".');
      process.exit(1);
    }

    await ensureUsersColumns();

    const userId = String(email).trim();

    const [existing] = await db.execute('SELECT id, email, role FROM users WHERE email = ?', [email]);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(String(password), saltRounds);

    if (!existing || existing.length === 0) {
      await db.run(
        'INSERT INTO users (id, username, email, password_hash, email_verified, role) VALUES (?, ?, ?, ?, 1, ?)',
        [userId, username, email, hashedPassword, role]
      );
      console.log(`Compte admin créé: id=${userId}, email=${email}, role=${role}`);
    } else {
      await db.run(
        'UPDATE users SET username = COALESCE(?, username), password_hash = ?, email_verified = 1, role = ? WHERE id = ?',
        [username, hashedPassword, role, userId]
      );
      console.log(`Compte admin mis à jour: id=${userId}, email=${email}, role=${role}`);
    }

    console.log('Vous pouvez vous connecter via /api/auth/login avec cet email et mot de passe.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la création/mise à jour admin:', err.message);
    process.exit(1);
  } finally {
    try { await db.close(); } catch (e) {}
  }
}

main();