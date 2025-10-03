-- Schéma SQLite pour Lokali - Version avec tables d'options

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'contributor' CHECK (role IN ('guest', 'contributor', 'admin')),
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
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

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

-- Tables d'options pour les filtres (noms en anglais)

-- Table des options de produits pour les filtres
CREATE TABLE IF NOT EXISTS filter_product_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Table des options de localités pour les filtres
CREATE TABLE IF NOT EXISTS filter_locality_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    locality_id INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE CASCADE
);

-- Table des options de régions pour les filtres
CREATE TABLE IF NOT EXISTS filter_region_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
);

-- Table des options de catégories pour les filtres
CREATE TABLE IF NOT EXISTS filter_category_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE
);

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

-- Index pour les tables d'options
CREATE INDEX IF NOT EXISTS idx_filter_product_options_active ON filter_product_options(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_filter_locality_options_active ON filter_locality_options(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_filter_region_options_active ON filter_region_options(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_filter_category_options_active ON filter_category_options(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_filter_period_options_active ON filter_period_options(is_active, sort_order);

-- Index pour la table des magasins
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_coordinates ON stores(latitude, longitude);

-- Index pour la table des prix de produits
CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_store ON product_prices(store_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_status ON product_prices(status);
CREATE INDEX IF NOT EXISTS idx_product_prices_date ON product_prices(date);