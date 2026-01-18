const { Pool } = require('pg');
require('dotenv').config();

function buildPool() {
  const preferLocal = String(process.env.DB_USE_LOCAL || '').toLowerCase() === 'true';
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  // Si on ne force pas le local et qu'une URL est fournie, utiliser l'URL
  if (!preferLocal && connectionString) {
    const needsSSL = /supabase\.co/.test(connectionString) || /sslmode=require/.test(connectionString);
    return new Pool({
      connectionString,
      ssl: needsSSL ? { rejectUnauthorized: false } : false,
      // Échouer rapidement si la connexion ne peut pas être établie
      connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 5000),
    });
  }

  // Fallback local: paramètres discrets via .env
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 5432);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'localprice';
  const sslEnv = String(process.env.PGSSL || '').toLowerCase();
  const ssl = sslEnv === 'true' ? { rejectUnauthorized: false } : false;

  if (!connectionString && !preferLocal) {
    console.warn('SUPABASE_DB_URL/DATABASE_URL non définie. Tentative de connexion locale Postgres via paramètres .env (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME).');
  }

  return new Pool({
    host,
    port,
    user,
    password,
    database,
    ssl,
    // Échouer rapidement en local si la base ne répond pas
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 5000),
  });
}

const pool = buildPool();

function transformInsertOrIgnore(sql) {
  // Convertit "INSERT OR IGNORE INTO ... VALUES ..." en Postgres
  // "INSERT INTO ... VALUES ... ON CONFLICT DO NOTHING"
  const re = /^(\s*INSERT\s+OR\s+IGNORE\s+INTO\s+)([^\(\s]+)(\s*\([^\)]*\)\s*VALUES\s*\([^\)]*\))/i;
  if (re.test(sql)) {
    return sql.replace(re, (_m, prefix, table, rest) => {
      return `INSERT INTO ${table}${rest} ON CONFLICT DO NOTHING`;
    });
  }
  return sql;
}

function prepare(sql, params = []) {
  // Remplace chaque '?' par $1, $2, ... pour Postgres
  let i = 0;
  const text = sql.replace(/\?/g, () => `$${++i}`);
  return { text, values: params };
}

function startsWith(sql, keyword) {
  return sql.trim().toUpperCase().startsWith(keyword);
}

function ensureReturningId(sql) {
  // Ajoute RETURNING id sur les INSERT s'il n'est pas présent
  // Ne pas l'ajouter si l'on fait "ON CONFLICT ..." (upsert), car la table peut ne pas avoir de colonne id
  if (startsWith(sql, 'INSERT') && !/RETURNING\s+/i.test(sql) && !/ON\s+CONFLICT/i.test(sql)) {
    return sql + ' RETURNING id';
  }
  return sql;
}

async function run(sql, params = []) {
  const transformed = transformInsertOrIgnore(sql);
  const sqlWithReturning = ensureReturningId(transformed);
  const q = prepare(sqlWithReturning, params);
  const res = await pool.query(q.text, q.values);
  const lastID = res.rows && res.rows[0] && res.rows[0].id !== undefined ? res.rows[0].id : null;
  return { lastID, changes: res.rowCount };
}

async function get(sql, params = []) {
  // Emulation de PRAGMA table_info(<table>) pour compatibilité avec SQLite
  const pragmaRe = /^\s*PRAGMA\s+table_info\(([^\)]+)\)\s*$/i;
  const m = sql.match(pragmaRe);
  if (m) {
    const tableName = m[1].trim();
    const res = await pool.query(
      'SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 ORDER BY ordinal_position',
      [tableName]
    );
    // Retourner le premier pour respecter la signature de get()
    return res.rows[0] || null;
  }
  const q = prepare(sql, params);
  const res = await pool.query(q.text, q.values);
  return res.rows[0] || null;
}

async function all(sql, params = []) {
  // Emulation de PRAGMA table_info(<table>)
  const pragmaRe = /^\s*PRAGMA\s+table_info\(([^\)]+)\)\s*$/i;
  const m = sql.match(pragmaRe);
  if (m) {
    const tableName = m[1].trim();
    const res = await pool.query(
      'SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 ORDER BY ordinal_position',
      [tableName]
    );
    return res.rows;
  }
  const transformed = transformInsertOrIgnore(sql);
  const q = prepare(transformed, params);
  const res = await pool.query(q.text, q.values);
  return res.rows;
}

async function execute(sql, params = []) {
  const isSelect = startsWith(sql, 'SELECT');
  const isInsert = startsWith(sql, 'INSERT');
  const isUpdate = startsWith(sql, 'UPDATE');
  const isDelete = startsWith(sql, 'DELETE');

  let finalSql = transformInsertOrIgnore(sql);
  if (isInsert) finalSql = ensureReturningId(finalSql);

  const q = prepare(finalSql, params);
  const res = await pool.query(q.text, q.values);

  if (isSelect) {
    return [res.rows];
  }
  if (isInsert) {
    const insertId = res.rows && res.rows[0] && res.rows[0].id !== undefined ? res.rows[0].id : null;
    return [{ insertId, affectedRows: res.rowCount }];
  }
  if (isUpdate || isDelete) {
    return [{ affectedRows: res.rowCount }];
  }
  // Fallback pour autres commandes
  return [{ affectedRows: res.rowCount }];
}

async function exec(sql) {
  // Exécute plusieurs statements séparés par ';'
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  for (const s of statements) {
    await pool.query(s);
  }
}

async function close() {
  await pool.end();
}

module.exports = { run, get, all, execute, exec, close };