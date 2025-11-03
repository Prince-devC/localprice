const fs = require('fs');
const path = require('path');
const db = require('../database/connection');

async function run() {
  const schemaPath = path.join(__dirname, '..', 'database', 'postgres-schema.sql');
  const indexesPath = path.join(__dirname, '..', 'database', 'postgres-indexes.sql');
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying schema from', schemaPath);
    await db.exec(schemaSql);
    if (fs.existsSync(indexesPath)) {
      const indexesSql = fs.readFileSync(indexesPath, 'utf8');
      console.log('Applying indexes from', indexesPath);
      await db.exec(indexesSql);
    }
    console.log('Database schema initialized successfully.');
  } catch (e) {
    console.error('Failed to initialize database schema:', e.message || e);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };