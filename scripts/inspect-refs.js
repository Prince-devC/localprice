const db = require('../database/connection');

(async () => {
  try {
    const products = await db.all(`SELECT id, name FROM products WHERE id IN (1,2,6,13,26)`);
    console.log('Products:', products);
    const localities = await db.all(`SELECT id, name, latitude, longitude FROM localities WHERE id IN (46,60)`);
    console.log('Localities:', localities);
    const units = await db.all(`SELECT id, name, symbol FROM units WHERE id IN (1,3)`);
    console.log('Units:', units);
  } catch (e) {
    console.error('Query error:', e);
  } finally {
    process.exit(0);
  }
})();