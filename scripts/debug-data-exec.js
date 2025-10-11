const fs = require('fs');
const path = require('path');
const db = require('../database/connection');

async function run() {
  try {
    const dataPath = path.join(__dirname, '..', 'database', 'sqlite-data.sql');
    const sql = fs.readFileSync(dataPath, 'utf8');
    // Split statements by semicolon followed by newline; keep semicolons
    const parts = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Total statements: ${parts.length}`);
    for (let i = 0; i < parts.length; i++) {
      const stmt = parts[i];
      // Skip pure comments blocks
      const noComments = stmt.replace(/--.*$/gm, '').trim();
      if (!noComments) continue;
      try {
        await db.exec(stmt + ';\n');
      } catch (err) {
        console.error(`\nERROR at statement #${i + 1}:`);
        console.error(stmt.slice(0, 500));
        console.error(`\nMessage: ${err && err.message ? err.message : err}`);
        process.exit(1);
      }
    }
    console.log('All statements executed successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Failed to run debug exec:', e);
    process.exit(1);
  }
}

run();