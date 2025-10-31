-- Supabase CSV import using psql \copy
-- Run from the project root so CSV paths resolve: scripts/export/*.csv
-- Requires: psql client and a Supabase Postgres connection string (sslmode=require)

\set ON_ERROR_STOP 1

-- Optional: clear existing data for a clean import (will cascade based on FKs)
-- Uncomment TRUNCATE if you want to fully replace the data.
-- TRUNCATE TABLE
--   public.user_roles,
--   public.subscriptions,
--   public.product_prices,
--   public.supplier_product_availability_history,
--   public.supplier_product_availability,
--   public.supplier_prices,
--   public.prices,
--   public.suppliers,
--   public.localities,
--   public.products,
--   public.stores,
--   public.regions,
--   public.languages,
--   public.units,
--   public.product_categories,
--   public.filter_period_options,
--   public.costs,
--   public.offers,
--   public.roles,
--   public.contribution_requests,
--   public.user_preferences,
--   public.audit_logs,
--   public.users
-- RESTART IDENTITY CASCADE;

-- 1) Base dimension tables (no FKs or minimal)
\echo Importing: product_categories
\copy public.product_categories FROM 'scripts/export/product_categories.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: units
\copy public.units FROM 'scripts/export/units.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: languages
\copy public.languages FROM 'scripts/export/languages.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: regions
\copy public.regions FROM 'scripts/export/regions.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: stores
\copy public.stores FROM 'scripts/export/stores.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: offers
\copy public.offers FROM 'scripts/export/offers.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: roles
\copy public.roles FROM 'scripts/export/roles.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: filter_period_options
\copy public.filter_period_options FROM 'scripts/export/filter_period_options.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: costs
\copy public.costs FROM 'scripts/export/costs.csv' WITH (FORMAT csv, HEADER true, NULL '')

-- 2) Dependent dimensions
\echo Importing: products
\copy public.products FROM 'scripts/export/products.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: localities
\copy public.localities FROM 'scripts/export/localities.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: suppliers
\copy public.suppliers FROM 'scripts/export/suppliers.csv' WITH (FORMAT csv, HEADER true, NULL '')

-- 3) Facts and relationships
\echo Importing: prices
\copy public.prices FROM 'scripts/export/prices.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: product_prices
\copy public.product_prices FROM 'scripts/export/product_prices.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: supplier_product_availability
\copy public.supplier_product_availability FROM 'scripts/export/supplier_product_availability.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: supplier_product_availability_history
\copy public.supplier_product_availability_history FROM 'scripts/export/supplier_product_availability_history.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: supplier_prices
\copy public.supplier_prices FROM 'scripts/export/supplier_prices.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: subscriptions
\copy public.subscriptions FROM 'scripts/export/subscriptions.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: user_roles
\copy public.user_roles FROM 'scripts/export/user_roles.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: contribution_requests
\copy public.contribution_requests FROM 'scripts/export/contribution_requests.csv' WITH (FORMAT csv, HEADER true, NULL '')

-- 4) Users: stage CSV then map to auth.users by email
DROP TABLE IF EXISTS public.users_staging;
CREATE TABLE public.users_staging (
  id text,
  username text,
  email text,
  password_hash text,
  email_verified boolean,
  email_verification_token text,
  email_verification_expires bigint,
  role text,
  created_at timestamptz,
  updated_at timestamptz
);

\echo Importing: users (staging)
\copy public.users_staging FROM 'scripts/export/users.csv' WITH (FORMAT csv, HEADER true, NULL '')

-- Insert into public.users by matching auth.users via email
-- Note: ensure all Supabase Auth accounts exist beforehand.
INSERT INTO public.users (
  id,
  username,
  email,
  password_hash,
  email_verified,
  email_verification_token,
  email_verification_expires,
  created_at,
  updated_at
)
SELECT au.id,
       s.username,
       s.email,
       s.password_hash,
       COALESCE(s.email_verified, false),
       s.email_verification_token,
       s.email_verification_expires,
       COALESCE(s.created_at, now()),
       COALESCE(s.updated_at, now())
FROM public.users_staging s
JOIN auth.users au ON lower(au.email) = lower(s.email);

-- Optional: map "role" from users_staging to user_roles if present
INSERT INTO public.user_roles (user_id, role_id, assigned_at)
SELECT u.id,
       r.id,
       COALESCE(s.created_at, now())
FROM public.users_staging s
JOIN public.users u ON lower(u.email) = lower(s.email)
JOIN public.roles r ON lower(r.name) = lower(s.role)
WHERE s.role IS NOT NULL AND s.role <> ''
ON CONFLICT DO NOTHING;

\echo Importing: user_preferences
\copy public.user_preferences FROM 'scripts/export/user_preferences.csv' WITH (FORMAT csv, HEADER true, NULL '')

\echo Importing: audit_logs
\copy public.audit_logs FROM 'scripts/export/audit_logs.csv' WITH (FORMAT csv, HEADER true, NULL '')

-- 5) Recalibrate sequences to max(id)
SELECT setval(pg_get_serial_sequence('public.product_categories','id'), COALESCE((SELECT max(id) FROM public.product_categories), 1));
SELECT setval(pg_get_serial_sequence('public.products','id'), COALESCE((SELECT max(id) FROM public.products), 1));
SELECT setval(pg_get_serial_sequence('public.units','id'), COALESCE((SELECT max(id) FROM public.units), 1));
SELECT setval(pg_get_serial_sequence('public.languages','id'), COALESCE((SELECT max(id) FROM public.languages), 1));
SELECT setval(pg_get_serial_sequence('public.regions','id'), COALESCE((SELECT max(id) FROM public.regions), 1));
SELECT setval(pg_get_serial_sequence('public.localities','id'), COALESCE((SELECT max(id) FROM public.localities), 1));
SELECT setval(pg_get_serial_sequence('public.prices','id'), COALESCE((SELECT max(id) FROM public.prices), 1));
SELECT setval(pg_get_serial_sequence('public.stores','id'), COALESCE((SELECT max(id) FROM public.stores), 1));
SELECT setval(pg_get_serial_sequence('public.product_prices','id'), COALESCE((SELECT max(id) FROM public.product_prices), 1));
SELECT setval(pg_get_serial_sequence('public.filter_period_options','id'), COALESCE((SELECT max(id) FROM public.filter_period_options), 1));
SELECT setval(pg_get_serial_sequence('public.costs','id'), COALESCE((SELECT max(id) FROM public.costs), 1));
SELECT setval(pg_get_serial_sequence('public.suppliers','id'), COALESCE((SELECT max(id) FROM public.suppliers), 1));
SELECT setval(pg_get_serial_sequence('public.supplier_prices','id'), COALESCE((SELECT max(id) FROM public.supplier_prices), 1));
SELECT setval(pg_get_serial_sequence('public.supplier_product_availability','id'), COALESCE((SELECT max(id) FROM public.supplier_product_availability), 1));
SELECT setval(pg_get_serial_sequence('public.supplier_product_availability_history','id'), COALESCE((SELECT max(id) FROM public.supplier_product_availability_history), 1));
SELECT setval(pg_get_serial_sequence('public.offers','id'), COALESCE((SELECT max(id) FROM public.offers), 1));
SELECT setval(pg_get_serial_sequence('public.subscriptions','id'), COALESCE((SELECT max(id) FROM public.subscriptions), 1));
SELECT setval(pg_get_serial_sequence('public.roles','id'), COALESCE((SELECT max(id) FROM public.roles), 1));
SELECT setval(pg_get_serial_sequence('public.contribution_requests','id'), COALESCE((SELECT max(id) FROM public.contribution_requests), 1));
SELECT setval(pg_get_serial_sequence('public.audit_logs','id'), COALESCE((SELECT max(id) FROM public.audit_logs), 1));

-- Cleanup staging (optional)
DROP TABLE IF EXISTS public.users_staging;

\echo Import completed.