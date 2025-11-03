const db = require('../database/connection');

(async () => {
  try {
    const rows = await db.all('SELECT 1 AS ok');
    console.log('Ping OK:', rows);
    try {
      const prices = await db.all('SELECT * FROM prices LIMIT 1');
      console.log('Prices exists, sample:', prices);
    } catch (e) {
      console.error('Prices query error:', e.message || e);
    }
  } catch (e) {
    console.error('Connection error:', e.message || e);
  } finally {
    await db.close();
  }
})();