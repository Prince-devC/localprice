/*
 * Migration: convert text user_id/banned_by/deleted_by/audit_logs.user_id to UUID
 * Runs using Node pg pool with .env loaded (SUPABASE_DB_URL or DATABASE_URL).
 */
require('dotenv').config();
// Supabase TLS: allow self-signed chain when sslmode=require
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0';
const db = require('../database/connection');

const regexUuid = "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$";

async function constraintExists(name) {
  const rows = await db.all('SELECT 1 FROM pg_constraint WHERE conname = $1', [name]);
  return rows.length > 0;
}

async function run() {
  console.log('Starting UUID migration using Node/pg');
  await db.execute('BEGIN');
  try {
    // Cleanup invalid values
    await db.execute(`DELETE FROM public.banned_users WHERE (user_id)::text !~* $1`, [regexUuid]);
    await db.execute(`DELETE FROM public.deleted_users WHERE (user_id)::text !~* $1`, [regexUuid]);
    await db.execute(`UPDATE public.banned_users SET banned_by = NULL WHERE banned_by IS NOT NULL AND (banned_by)::text !~* $1`, [regexUuid]);
    await db.execute(`UPDATE public.deleted_users SET deleted_by = NULL WHERE deleted_by IS NOT NULL AND (deleted_by)::text !~* $1`, [regexUuid]);
    await db.execute(`UPDATE public.audit_logs SET user_id = NULL WHERE user_id IS NOT NULL AND (user_id)::text !~* $1`, [regexUuid]);

    // Alter column types
    await db.execute(`ALTER TABLE public.banned_users ALTER COLUMN user_id TYPE uuid USING user_id::uuid`);
    await db.execute(`ALTER TABLE public.banned_users ALTER COLUMN banned_by TYPE uuid USING banned_by::uuid`);
    await db.execute(`ALTER TABLE public.deleted_users ALTER COLUMN user_id TYPE uuid USING user_id::uuid`);
    await db.execute(`ALTER TABLE public.deleted_users ALTER COLUMN deleted_by TYPE uuid USING deleted_by::uuid`);
    await db.execute(`ALTER TABLE public.audit_logs ALTER COLUMN user_id TYPE uuid USING user_id::uuid`);

    // Foreign keys (conditionally add)
    if (!(await constraintExists('banned_users_user_id_fkey'))) {
      await db.execute(`ALTER TABLE public.banned_users ADD CONSTRAINT banned_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE`);
    }
    if (!(await constraintExists('banned_users_banned_by_fkey'))) {
      await db.execute(`ALTER TABLE public.banned_users ADD CONSTRAINT banned_users_banned_by_fkey FOREIGN KEY (banned_by) REFERENCES public.users(id) ON DELETE SET NULL`);
    }
    if (!(await constraintExists('deleted_users_user_id_fkey'))) {
      await db.execute(`ALTER TABLE public.deleted_users ADD CONSTRAINT deleted_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE`);
    }
    if (!(await constraintExists('deleted_users_deleted_by_fkey'))) {
      await db.execute(`ALTER TABLE public.deleted_users ADD CONSTRAINT deleted_users_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL`);
    }
    if (!(await constraintExists('audit_logs_user_id_fkey'))) {
      await db.execute(`ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL`);
    }

    // Indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_deleted_users_user_id ON public.deleted_users(user_id)`);

    await db.execute('COMMIT');
    console.log('UUID migration completed successfully');

    // Post-checks
    const checks = [];
    checks.push(await db.all(`SELECT COUNT(*) AS invalid_count FROM public.banned_users WHERE (user_id)::text !~* $1`, [regexUuid]));
    checks.push(await db.all(`SELECT COUNT(*) AS invalid_count FROM public.deleted_users WHERE (user_id)::text !~* $1`, [regexUuid]));
    checks.push(await db.all(`SELECT COUNT(*) AS invalid_count FROM public.audit_logs WHERE user_id IS NOT NULL AND (user_id)::text !~* $1`, [regexUuid]));
    console.log('Post-migration invalid counts:', checks.map(r => r[0].invalid_count));

    const cols = await db.all(`SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name IN ('banned_users','deleted_users','audit_logs')
        AND column_name IN ('user_id','banned_by','deleted_by')
      ORDER BY table_name, column_name`);
    console.table(cols);
  } catch (err) {
    try { await db.execute('ROLLBACK'); } catch {}
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

run();