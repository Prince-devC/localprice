const db = require('../database/connection');

(async () => {
  try {
    const tables = ['prices', 'products', 'product_categories', 'localities', 'regions', 'units'];
    for (const t of tables) {
      const row = await db.get(`SELECT COUNT(*) AS n FROM ${t}`);
      console.log(`${t}:`, row.n);
    }
  } catch (e) {
    console.error('Query error:', e);
  } finally {
    process.exit(0);
  }
})();