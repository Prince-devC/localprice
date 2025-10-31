const db = require('../database/connection');

(async () => {
  try {
    await db.exec(`CREATE TABLE IF NOT EXISTS contribution_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      address TEXT,
      commune TEXT,
      activity TEXT,
      cooperative_member INTEGER DEFAULT 0 CHECK (cooperative_member IN (0,1)),
      cooperative_name TEXT,
      has_smartphone INTEGER DEFAULT 1 CHECK (has_smartphone IN (0,1)),
      has_internet INTEGER DEFAULT 1 CHECK (has_internet IN (0,1)),
      submission_method TEXT DEFAULT 'web' CHECK (submission_method IN ('web','mobile','sms','whatsapp','offline')),
      contact_phone TEXT,
      has_whatsapp INTEGER DEFAULT 0 CHECK (has_whatsapp IN (0,1)),
      experience_level TEXT CHECK (experience_level IN ('debutant','intermediaire','expert')),
      notes TEXT,
      reviewed_by TEXT,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME
    );`);
    const res = await db.run('DELETE FROM contribution_requests');
    console.log(`Deleted rows: ${res.changes}`);
    await db.close();
    console.log('Contribution requests table cleared successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to clear contribution_requests:', err);
    process.exit(1);
  }
})();