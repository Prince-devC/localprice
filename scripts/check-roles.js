const db = require('../database/connection');

async function main() {
  try {
    const userId = process.argv[2] || 'd2ddaada-ba1f-49ed-8d93-dd4a598f346d';
    const email = process.argv[3] || 'admin@lokali.bj';

    const [roleRows] = await db.execute(
      'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?',
      [userId]
    );
    console.log('[check] user_roles names:', Array.isArray(roleRows) ? roleRows.map(r => r.name) : roleRows);

    const [userRows] = await db.execute(
      'SELECT id, email, role FROM users WHERE id = ? OR email = ? LIMIT 1',
      [userId, email]
    );
    console.log('[check] users row:', userRows);
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await db.close(); } catch (_) {}
  }
}

main();