const db = require('../database/connection');

(async () => {
  try {
    const row = await db.get("SELECT COUNT(*) AS n FROM prices WHERE status='validated'");
    console.log(row);
  } catch (e) {
    console.error('Query error:', e);
  } finally {
    process.exit(0);
  }
})();