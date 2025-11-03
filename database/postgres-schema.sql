-- Schéma Postgres (Supabase) pour Lokali
-- Traduction depuis SQLite, avec ajustements de types, contraintes et index
-- Note: Cette version suppose Supabase Auth. La table `users` ci-dessous
-- référence `auth.users(id)` pour lier les comptes aux profils applicatifs.

BEGIN;

-- ==========================
-- Utilisateurs (profil app)
-- ==========================
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    -- Conserver l'expiration sous forme epoch si le code actuel s'y attend
    email_verification_expires BIGINT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user','contributor','admin','super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- Catégories, Produits, Unités, Langues
-- ================================
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('brut','transforme')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    symbol TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liaisons des langues aux prix (pivot)
CREATE TABLE IF NOT EXISTS price_source_languages (
    price_id BIGINT NOT NULL REFERENCES prices(id) ON DELETE CASCADE,
    language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (price_id, language_id)
);
CREATE INDEX IF NOT EXISTS idx_psl_price ON price_source_languages(price_id);
CREATE INDEX IF NOT EXISTS idx_psl_language ON price_source_languages(language_id);

-- =========
-- Régions
-- =========
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========
-- Localités
-- ===========
CREATE TABLE IF NOT EXISTS localities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====
-- Prix
-- =====
CREATE TABLE IF NOT EXISTS prices (
    id BIGSERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    locality_id INTEGER NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    price NUMERIC(12,2) NOT NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','validated','rejected')),
    submitted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    validated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMPTZ,
    comment TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    source TEXT,
    source_type TEXT,
    source_contact_name TEXT,
    source_contact_phone TEXT,
    source_contact_relation TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour prices
CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_locality ON prices(locality_id);
CREATE INDEX IF NOT EXISTS idx_prices_unit ON prices(unit_id);
CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(date);
CREATE INDEX IF NOT EXISTS idx_prices_status ON prices(status);
CREATE INDEX IF NOT EXISTS idx_prices_product_date ON prices(product_id, date);
CREATE INDEX IF NOT EXISTS idx_prices_product_locality ON prices(product_id, locality_id);
CREATE INDEX IF NOT EXISTS idx_prices_submitted_by ON prices(submitted_by);
CREATE INDEX IF NOT EXISTS idx_prices_validated_by ON prices(validated_by);

-- ======================
-- Magasins et prix magasin
-- ======================
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    opening_hours JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_coordinates ON stores(latitude, longitude);

CREATE TABLE IF NOT EXISTS product_prices (
    id BIGSERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    price NUMERIC(12,2) NOT NULL,
    unit TEXT DEFAULT 'unité',
    date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
    is_available BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (product_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_store ON product_prices(store_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price ON product_prices(price);
CREATE INDEX IF NOT EXISTS idx_product_prices_availability ON product_prices(is_available);
CREATE INDEX IF NOT EXISTS idx_product_prices_status ON product_prices(status);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_price ON product_prices(product_id, price);
CREATE INDEX IF NOT EXISTS idx_product_prices_date ON product_prices(date);

-- ======================
-- Options de période de filtre
-- ======================
CREATE TABLE IF NOT EXISTS filter_period_options (
    id SERIAL PRIMARY KEY,
    period_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    days_count INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_filter_period_options_active ON filter_period_options(is_active, sort_order);

-- =========
-- Coûts
-- =========
CREATE TABLE IF NOT EXISTS costs (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('transport','stockage')),
    value NUMERIC(12,2) NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============
-- Logs d'audit
-- ===============
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- Fournisseurs et liaisons aux prix
-- ==============================
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('producteur','transformateur','cooperative','grossiste')),
    contact_phone TEXT,
    contact_email TEXT,
    address TEXT,
    locality_id INTEGER NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_prices (
    id BIGSERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    locality_id INTEGER NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
    price_id BIGINT NOT NULL REFERENCES prices(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (supplier_id, price_id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_prices_supplier ON supplier_prices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_product ON supplier_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_locality ON supplier_prices(locality_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_price ON supplier_prices(price_id);

CREATE TABLE IF NOT EXISTS supplier_product_availability (
    id BIGSERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    available_quantity DOUBLE PRECISION,
    quantity_unit TEXT,
    expected_restock_date DATE,
    available_from DATE,
    available_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (supplier_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_supplier ON supplier_product_availability(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_product ON supplier_product_availability(product_id);

CREATE TABLE IF NOT EXISTS supplier_product_availability_history (
    id BIGSERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    available_quantity DOUBLE PRECISION,
    quantity_unit TEXT,
    expected_restock_date DATE,
    period_start DATE,
    period_end DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_hist_supplier ON supplier_product_availability_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_hist_product ON supplier_product_availability_history(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_hist_date ON supplier_product_availability_history(date);

-- ========================
-- Demandes de contribution
-- ========================
CREATE TABLE IF NOT EXISTS contribution_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    address TEXT,
    commune TEXT,
    activity TEXT,
    cooperative_member BOOLEAN DEFAULT FALSE,
    cooperative_name TEXT,
    has_smartphone BOOLEAN DEFAULT TRUE,
    has_internet BOOLEAN DEFAULT TRUE,
    submission_method TEXT DEFAULT 'web' CHECK (submission_method IN ('web','mobile','sms','whatsapp','offline')),
    contact_phone TEXT,
    has_whatsapp BOOLEAN DEFAULT FALSE,
    experience_level TEXT CHECK (experience_level IN ('debutant','intermediaire','expert')),
    notes TEXT,
    reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contrib_requests_user ON contribution_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_contrib_requests_status ON contribution_requests(status);
CREATE INDEX IF NOT EXISTS idx_contrib_requests_created ON contribution_requests(created_at);

-- ========================
-- Rôles et liaison utilisateurs
-- ========================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (name IN ('user','contributor','admin','super_admin'))
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- ===============================
-- Offres payantes et souscriptions
-- ===============================
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    period TEXT NOT NULL CHECK (period IN ('monthly','yearly')),
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);

CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','paused')),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_offer ON subscriptions(offer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ===========================
-- Préférences utilisateur
-- ===========================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    has_smartphone_default BOOLEAN DEFAULT TRUE,
    has_internet_default BOOLEAN DEFAULT TRUE,
    preferred_method TEXT DEFAULT 'web' CHECK (preferred_method IN ('web','offline','whatsapp','sms','mobile')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

COMMIT;