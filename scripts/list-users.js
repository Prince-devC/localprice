const db = require('../database/connection');

(async () => {
  try {
    const users = await db.all('SELECT id, email, role FROM users ORDER BY email');
    console.log('Users table (id, email, role):');
    console.table(users);

    const [rows] = await db.execute(`
      SELECT ur.user_id, r.name AS role_name
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      ORDER BY ur.user_id, r.name
    `);
    console.log('User roles mapping (user_id => role):');
    console.table(rows);
  } catch (e) {
    console.error(e);
  } finally {
    try { await db.close(); } catch (_) {}
  }
})();