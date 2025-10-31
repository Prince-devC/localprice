const db = require('../database/connection');

(async () => {
  try {
    const rows = await db.all(`
      SELECT p.id, p.product_id, p.locality_id, p.unit_id, p.price, p.date,
             pr.id AS pr_id, l.id AS l_id, u.id AS u_id, pc.id AS pc_id, r.id AS r_id
      FROM prices p
      LEFT JOIN products pr ON p.product_id = pr.id
      LEFT JOIN localities l ON p.locality_id = l.id
      LEFT JOIN units u ON p.unit_id = u.id
      LEFT JOIN product_categories pc ON pr.category_id = pc.id
      LEFT JOIN regions r ON l.region_id = r.id
      WHERE p.status = 'validated'
        AND (pr.id IS NULL OR l.id IS NULL OR u.id IS NULL OR pc.id IS NULL OR r.id IS NULL)
    `);
    console.log('Broken validated prices (missing join refs):', rows.length);
    console.log(rows);
  } catch (e) {
    console.error('Query error:', e);
  } finally {
    process.exit(0);
  }
})();