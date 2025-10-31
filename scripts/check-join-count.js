const db = require('../database/connection');

(async () => {
  try {
    const row = await db.get(`
      SELECT COUNT(*) AS n
      FROM prices p
      JOIN products pr ON p.product_id = pr.id
      JOIN product_categories pc ON pr.category_id = pc.id
      JOIN localities l ON p.locality_id = l.id
      JOIN regions r ON l.region_id = r.id
      JOIN units u ON p.unit_id = u.id
      WHERE p.status = 'validated'
    `);
    console.log('Joined validated price rows:', row.n);
  } catch (e) {
    console.error('Query error:', e);
  } finally {
    process.exit(0);
  }
})();