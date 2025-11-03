\set ON_ERROR_STOP 1

BEGIN;

-- Nettoyage des valeurs non-UUID avant conversion
-- (évite l'échec de USING text::uuid)
DELETE FROM public.banned_users
WHERE user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

DELETE FROM public.deleted_users
WHERE user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

UPDATE public.banned_users
SET banned_by = NULL
WHERE banned_by IS NOT NULL
  AND banned_by !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

UPDATE public.deleted_users
SET deleted_by = NULL
WHERE deleted_by IS NOT NULL
  AND deleted_by !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

UPDATE public.audit_logs
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Conversion des colonnes TEXT -> UUID
ALTER TABLE public.banned_users
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.banned_users
  ALTER COLUMN banned_by TYPE uuid USING banned_by::uuid;

ALTER TABLE public.deleted_users
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.deleted_users
  ALTER COLUMN deleted_by TYPE uuid USING deleted_by::uuid;

ALTER TABLE public.audit_logs
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Ajout des contraintes de FK si manquantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'banned_users_user_id_fkey'
  ) THEN
    ALTER TABLE public.banned_users
      ADD CONSTRAINT banned_users_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'banned_users_banned_by_fkey'
  ) THEN
    ALTER TABLE public.banned_users
      ADD CONSTRAINT banned_users_banned_by_fkey
      FOREIGN KEY (banned_by) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deleted_users_user_id_fkey'
  ) THEN
    ALTER TABLE public.deleted_users
      ADD CONSTRAINT deleted_users_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deleted_users_deleted_by_fkey'
  ) THEN
    ALTER TABLE public.deleted_users
      ADD CONSTRAINT deleted_users_deleted_by_fkey
      FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index pour optimiser les jointures
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_users_user_id ON public.deleted_users(user_id);

COMMIT;

-- Vérification rapide (compteurs invalides doivent être à 0)
\echo Post-migration: vérification des valeurs restantes non-UUID
SELECT 'banned_users.user_id invalid' AS check, COUNT(*) AS invalid_count
FROM public.banned_users
WHERE user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

SELECT 'deleted_users.user_id invalid' AS check, COUNT(*) AS invalid_count
FROM public.deleted_users
WHERE user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

SELECT 'audit_logs.user_id invalid' AS check, COUNT(*) AS invalid_count
FROM public.audit_logs
WHERE user_id IS NOT NULL
  AND user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';