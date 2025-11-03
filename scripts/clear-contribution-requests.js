const db = require('../database/connection');

(async () => {
  try {
    const res = await db.execute('TRUNCATE TABLE contribution_requests RESTART IDENTITY CASCADE');
    console.log('Contribution requests table truncated successfully.');
    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed to clear contribution_requests:', err);
    process.exit(1);
  }
})();