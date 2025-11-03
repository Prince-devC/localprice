-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  id bigint NOT NULL DEFAULT nextval('audit_logs_id_seq'::regclass),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id bigint,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.banned_users (
  user_id text NOT NULL,
  banned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  banned_by text,
  CONSTRAINT banned_users_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.contribution_requests (
  id bigint NOT NULL DEFAULT nextval('contribution_requests_id_seq'::regclass),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  address text,
  commune text,
  activity text,
  cooperative_member boolean DEFAULT false,
  cooperative_name text,
  has_smartphone boolean DEFAULT true,
  has_internet boolean DEFAULT true,
  submission_method text DEFAULT 'web'::text CHECK (submission_method = ANY (ARRAY['web'::text, 'mobile'::text, 'sms'::text, 'whatsapp'::text, 'offline'::text])),
  contact_phone text,
  has_whatsapp boolean DEFAULT false,
  experience_level text CHECK (experience_level = ANY (ARRAY['debutant'::text, 'intermediaire'::text, 'expert'::text])),
  notes text,
  reviewed_by uuid,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  CONSTRAINT contribution_requests_pkey PRIMARY KEY (id),
  CONSTRAINT contribution_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT contribution_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
);
CREATE TABLE public.costs (
  id integer NOT NULL DEFAULT nextval('costs_id_seq'::regclass),
  type text NOT NULL CHECK (type = ANY (ARRAY['transport'::text, 'stockage'::text])),
  value numeric NOT NULL,
  unit text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT costs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.deleted_users (
  user_id text NOT NULL,
  deleted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_by text,
  CONSTRAINT deleted_users_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.filter_period_options (
  id integer NOT NULL DEFAULT nextval('filter_period_options_id_seq'::regclass),
  period_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  days_count integer NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT filter_period_options_pkey PRIMARY KEY (id)
);
CREATE TABLE public.languages (
  id integer NOT NULL DEFAULT nextval('languages_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT languages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.localities (
  id integer NOT NULL DEFAULT nextval('localities_id_seq'::regclass),
  name text NOT NULL,
  region_id integer,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT localities_pkey PRIMARY KEY (id),
  CONSTRAINT localities_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id)
);
CREATE TABLE public.offers (
  id integer NOT NULL DEFAULT nextval('offers_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  description text,
  price numeric NOT NULL,
  currency text DEFAULT 'XOF'::text,
  period text NOT NULL CHECK (period = ANY (ARRAY['monthly'::text, 'yearly'::text])),
  features jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT offers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.otp_codes (
  phone text NOT NULL,
  email text,
  otp_hash text NOT NULL,
  delivery text NOT NULL,
  expires_at bigint NOT NULL,
  created_at bigint NOT NULL,
  CONSTRAINT otp_codes_pkey PRIMARY KEY (phone, created_at)
);
CREATE TABLE public.price_source_languages (
  price_id bigint NOT NULL,
  language_id integer NOT NULL,
  CONSTRAINT price_source_languages_pkey PRIMARY KEY (price_id, language_id),
  CONSTRAINT price_source_languages_price_id_fkey FOREIGN KEY (price_id) REFERENCES public.prices(id),
  CONSTRAINT price_source_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.prices (
  id bigint NOT NULL DEFAULT nextval('prices_id_seq'::regclass),
  product_id integer NOT NULL,
  locality_id integer NOT NULL,
  unit_id integer NOT NULL,
  price numeric NOT NULL,
  date date NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'validated'::text, 'rejected'::text])),
  submitted_by uuid,
  validated_by uuid,
  validated_at timestamp with time zone,
  comment text,
  latitude double precision,
  longitude double precision,
  source text,
  source_type text,
  source_contact_name text,
  source_contact_phone text,
  source_contact_relation text,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  geo_accuracy real,
  sub_locality text,
  submission_method text,
  CONSTRAINT prices_pkey PRIMARY KEY (id),
  CONSTRAINT prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT prices_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id),
  CONSTRAINT prices_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id),
  CONSTRAINT prices_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id),
  CONSTRAINT prices_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES public.users(id)
);
CREATE TABLE public.product_categories (
  id integer NOT NULL DEFAULT nextval('product_categories_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type = ANY (ARRAY['brut'::text, 'transforme'::text])),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_prices (
  id bigint NOT NULL DEFAULT nextval('product_prices_id_seq'::regclass),
  product_id integer NOT NULL,
  store_id integer NOT NULL,
  price numeric NOT NULL,
  unit text DEFAULT 'unité'::text,
  date date NOT NULL,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  is_available boolean DEFAULT true,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_prices_pkey PRIMARY KEY (id),
  CONSTRAINT product_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_prices_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.products (
  id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  name text NOT NULL,
  category_id integer,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id)
);
CREATE TABLE public.regions (
  id integer NOT NULL DEFAULT nextval('regions_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  code text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT regions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.roles (
  id integer NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
  name text NOT NULL UNIQUE CHECK (name = ANY (ARRAY['user'::text, 'contributor'::text, 'admin'::text, 'super_admin'::text])),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.stores (
  id integer NOT NULL DEFAULT nextval('stores_id_seq'::regclass),
  name text NOT NULL,
  address text,
  city text,
  postal_code text,
  phone text,
  email text,
  website text,
  latitude double precision,
  longitude double precision,
  opening_hours jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscriptions (
  id bigint NOT NULL DEFAULT nextval('subscriptions_id_seq'::regclass),
  user_id uuid NOT NULL,
  offer_id integer NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'canceled'::text, 'paused'::text])),
  start_date date NOT NULL,
  end_date date,
  auto_renew boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT subscriptions_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id)
);
CREATE TABLE public.supplier_prices (
  id bigint NOT NULL DEFAULT nextval('supplier_prices_id_seq'::regclass),
  supplier_id integer NOT NULL,
  product_id integer NOT NULL,
  locality_id integer NOT NULL,
  price_id bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT supplier_prices_pkey PRIMARY KEY (id),
  CONSTRAINT supplier_prices_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT supplier_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT supplier_prices_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id),
  CONSTRAINT supplier_prices_price_id_fkey FOREIGN KEY (price_id) REFERENCES public.prices(id)
);
CREATE TABLE public.supplier_product_availability (
  id bigint NOT NULL DEFAULT nextval('supplier_product_availability_id_seq'::regclass),
  supplier_id integer NOT NULL,
  product_id integer NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  available_quantity double precision,
  quantity_unit text,
  expected_restock_date date,
  available_from date,
  available_until date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT supplier_product_availability_pkey PRIMARY KEY (id),
  CONSTRAINT supplier_product_availability_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT supplier_product_availability_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.supplier_product_availability_history (
  id bigint NOT NULL DEFAULT nextval('supplier_product_availability_history_id_seq'::regclass),
  supplier_id integer NOT NULL,
  product_id integer NOT NULL,
  date date NOT NULL,
  is_available boolean NOT NULL,
  available_quantity double precision,
  quantity_unit text,
  expected_restock_date date,
  period_start date,
  period_end date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT supplier_product_availability_history_pkey PRIMARY KEY (id),
  CONSTRAINT supplier_product_availability_history_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT supplier_product_availability_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.suppliers (
  id integer NOT NULL DEFAULT nextval('suppliers_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type = ANY (ARRAY['producteur'::text, 'transformateur'::text, 'cooperative'::text, 'grossiste'::text])),
  contact_phone text,
  contact_email text,
  address text,
  locality_id integer NOT NULL,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT suppliers_pkey PRIMARY KEY (id),
  CONSTRAINT suppliers_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id)
);
CREATE TABLE public.units (
  id integer NOT NULL DEFAULT nextval('units_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  symbol text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT units_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_preferences (
  user_id uuid NOT NULL,
  has_smartphone_default boolean DEFAULT true,
  has_internet_default boolean DEFAULT true,
  preferred_method text DEFAULT 'web'::text CHECK (preferred_method = ANY (ARRAY['web'::text, 'offline'::text, 'whatsapp'::text, 'sms'::text, 'mobile'::text])),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role_id integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  username text,
  email text NOT NULL UNIQUE,
  password_hash text,
  email_verified boolean DEFAULT false,
  email_verification_token text,
  email_verification_expires bigint,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'contributor'::text, 'admin'::text, 'super_admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);