const db = require('../database/connection');

(async () => {
  try {
    const [rows] = await db.execute(`
      SELECT cr.user_id,
             u.email,
             u.username,
             MAX(CASE WHEN r.name = 'contributor' THEN 1 ELSE 0 END) AS has_contributor_role,
             STRING_AGG(DISTINCT r.name, ',') AS roles
      FROM contribution_requests cr
      LEFT JOIN users u ON u.id = cr.user_id
      LEFT JOIN user_roles ur ON ur.user_id = cr.user_id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE cr.status = 'approved'
      GROUP BY cr.user_id, u.email, u.username
      ORDER BY u.email NULLS LAST
    `);
    console.log('Approved requests -> contributor role mapping:');
    console.table(rows);

    const [missing] = await db.execute(`
      SELECT DISTINCT cr.user_id, u.email, u.username
      FROM contribution_requests cr
      LEFT JOIN users u ON u.id = cr.user_id
      WHERE cr.status = 'approved'
        AND NOT EXISTS (
          SELECT 1
          FROM user_roles ur
          JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = cr.user_id AND r.name = 'contributor'
        )
      ORDER BY u.email NULLS LAST
    `);
    console.log('Users with approved request missing contributor role:', missing.length);
    if (missing.length > 0) {
      console.table(missing);
    }
  } catch (e) {
    console.error('Erreur vérification:', e.message || e);
    process.exitCode = 1;
  } finally {
    try { await db.close(); } catch (_) {}
  }
})();