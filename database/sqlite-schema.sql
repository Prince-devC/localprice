-- Schéma SQLite pour Lokali - Version avec tables d'options

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    email_verification_expires INTEGER,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'contributor', 'admin', 'super_admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories de produits agricoles
CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('brut', 'transforme')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits agricoles
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- Table des unités de mesure
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    symbol TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des langues de communication
CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des régions
CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des localités
CREATE TABLE IF NOT EXISTS localities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    region_id INTEGER,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
);

-- Table des prix
CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    locality_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    price REAL NOT NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
    submitted_by TEXT,
    validated_by TEXT,
    validated_at DATETIME,
    comment TEXT,
    latitude REAL,
    longitude REAL,
    source TEXT,
    source_type TEXT,
    source_contact_name TEXT,
    source_contact_phone TEXT,
    source_contact_relation TEXT,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes pour accélérer les requêtes sur la table prices
CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_locality ON prices(locality_id);
CREATE INDEX IF NOT EXISTS idx_prices_unit ON prices(unit_id);
CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(date);
CREATE INDEX IF NOT EXISTS idx_prices_status ON prices(status);
CREATE INDEX IF NOT EXISTS idx_prices_product_date ON prices(product_id, date);

-- Table des prix de produits (pour les comparaisons)
DROP TABLE IF EXISTS product_prices;
CREATE TABLE product_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    price REAL NOT NULL,
    unit TEXT DEFAULT 'unité',
    date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_available INTEGER DEFAULT 1,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Contrainte unique pour permettre les UPSERT SQLite sur (product_id, store_id)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_product_store ON product_prices(product_id, store_id);

-- Indexes pour accélérer les requêtes de comparaison
CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_store ON product_prices(store_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price ON product_prices(price);
CREATE INDEX IF NOT EXISTS idx_product_prices_availability ON product_prices(is_available);
CREATE INDEX IF NOT EXISTS idx_product_prices_status ON product_prices(status);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_price ON product_prices(product_id, price);

-- Tables d'options pour les filtres (noms en anglais)

-- Table des options de produits pour les filtres (SUPPRIMÉE)
-- Les filtres produits sont désormais dérivés directement de la table `products`.

-- Table des options de localités pour les filtres (SUPPRIMÉE)
-- Les filtres localités sont désormais dérivés directement de la table `localities`.

-- Table des options de régions pour les filtres (SUPPRIMÉE)
-- Les filtres régions sont désormais dérivés directement de la table `regions`.

-- Table des options de catégories pour les filtres (SUPPRIMÉE)
-- Les filtres catégories sont désormais dérivés directement de la table `product_categories`.

-- Table des options de périodes pour les filtres
CREATE TABLE IF NOT EXISTS filter_period_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    days_count INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des magasins
CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    latitude REAL,
    longitude REAL,
    opening_hours TEXT, -- JSON as TEXT in SQLite
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des coûts
CREATE TABLE IF NOT EXISTS costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('transport', 'stockage')),
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_values TEXT, -- JSON as TEXT in SQLite
    new_values TEXT, -- JSON as TEXT in SQLite
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_prices_status ON prices(status);
CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(date);
CREATE INDEX IF NOT EXISTS idx_prices_product_locality ON prices(product_id, locality_id);
CREATE INDEX IF NOT EXISTS idx_prices_submitted_by ON prices(submitted_by);
CREATE INDEX IF NOT EXISTS idx_prices_validated_by ON prices(validated_by);
CREATE INDEX IF NOT EXISTS idx_localities_coordinates ON localities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Index pour les tables d'options supprimé (les filtres produits lisent directement `products`).

-- ==========================================
-- Table des fournisseurs et liaisons aux prix
-- ==========================================

-- Table des fournisseurs
DROP TABLE IF EXISTS suppliers;
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('producteur','transformateur','cooperative','grossiste')),
    contact_phone TEXT,
    contact_email TEXT,
    address TEXT,
    locality_id INTEGER NOT NULL,
    -- Localisation fine optionnelle (si différent du centre de la localité)
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE CASCADE
);

-- Table de liaison: fournisseurs ↔ produits/localités/prix (prix agrégés par localité)
DROP TABLE IF EXISTS supplier_prices;
CREATE TABLE IF NOT EXISTS supplier_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    locality_id INTEGER NOT NULL,
    price_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE CASCADE,
    FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE CASCADE
);

-- Contrainte d'unicité pour éviter les doublons (un prix par fournisseur)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_supplier_price ON supplier_prices(supplier_id, price_id);

-- Index pour optimiser les liaisons et recherches
CREATE INDEX IF NOT EXISTS idx_supplier_prices_supplier ON supplier_prices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_product ON supplier_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_locality ON supplier_prices(locality_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_price ON supplier_prices(price_id);

-- Disponibilité par fournisseur et produit (état courant)
DROP TABLE IF EXISTS supplier_product_availability;
CREATE TABLE IF NOT EXISTS supplier_product_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1, -- 1: dispo, 0: indispo
    available_quantity REAL, -- quantité estimée
    quantity_unit TEXT, -- ex: 'kg', 'l', 'unité'
    expected_restock_date DATE, -- date estimée de réapprovisionnement
    available_from DATE, -- début de période de disponibilité
    available_until DATE, -- fin de période de disponibilité (optionnel)
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_supplier_product_avail ON supplier_product_availability(supplier_id, product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_supplier ON supplier_product_availability(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_product ON supplier_product_availability(product_id);

-- Historique des disponibilités et quantités par fournisseur et produit
DROP TABLE IF EXISTS supplier_product_availability_history;
CREATE TABLE IF NOT EXISTS supplier_product_availability_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    date DATE NOT NULL,
    is_available INTEGER NOT NULL,
    available_quantity REAL,
    quantity_unit TEXT,
    expected_restock_date DATE,
    period_start DATE,
    period_end DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_hist_supplier ON supplier_product_availability_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_hist_product ON supplier_product_availability_history(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_product_avail_hist_date ON supplier_product_availability_history(date);
-- Index supprimés: filtres localité/region/catégorie dérivés des tables de base.
CREATE INDEX IF NOT EXISTS idx_filter_period_options_active ON filter_period_options(is_active, sort_order);

-- Index pour la table des magasins
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_coordinates ON stores(latitude, longitude);

-- Index pour la table des prix de produits
CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_store ON product_prices(store_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_status ON product_prices(status);
CREATE INDEX IF NOT EXISTS idx_product_prices_date ON product_prices(date);

-- Table des demandes de contribution
CREATE TABLE IF NOT EXISTS contribution_requests (
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
    reviewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contrib_requests_user ON contribution_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_contrib_requests_status ON contribution_requests(status);
CREATE INDEX IF NOT EXISTS idx_contrib_requests_created ON contribution_requests(created_at);


-- ==========================================
-- Rôles et liaison utilisateurs (pivot local)
-- ==========================================

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE CHECK (name IN ('user','contributor','admin','super_admin'))
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- ==========================================
-- Offres payantes et souscriptions premium
-- ==========================================

CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'XOF',
    period TEXT NOT NULL CHECK (period IN ('monthly','yearly')),
    features TEXT, -- JSON as TEXT in SQLite
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0,1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    offer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','paused')),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew INTEGER DEFAULT 1 CHECK (auto_renew IN (0,1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_offer ON subscriptions(offer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Table des préférences utilisateur pour la collecte
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    has_smartphone_default INTEGER DEFAULT 1 CHECK (has_smartphone_default IN (0,1)),
    has_internet_default INTEGER DEFAULT 1 CHECK (has_internet_default IN (0,1)),
    preferred_method TEXT DEFAULT 'web' CHECK (preferred_method IN ('web','offline','whatsapp','sms','mobile')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);