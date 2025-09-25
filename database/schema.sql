-- Création de la base de données
CREATE DATABASE IF NOT EXISTS localprice;
USE localprice;

-- Table des magasins
CREATE TABLE IF NOT EXISTS stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des catégories de produits
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    brand VARCHAR(100),
    barcode VARCHAR(50) UNIQUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Table des prix des produits par magasin
CREATE TABLE IF NOT EXISTS product_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    store_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'unit',
    is_available BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_store (product_id, store_id)
);

-- Table des utilisateurs (pour les fonctionnalités futures)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'store_owner') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des favoris utilisateur
CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Table des avis et notes
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    store_id INT NOT NULL,
    product_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Index pour optimiser les recherches
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_prices_store ON product_prices(store_id);
CREATE INDEX idx_product_prices_product ON product_prices(product_id);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_postal_code ON stores(postal_code);

-- Insertion de données de test
INSERT INTO categories (name, description) VALUES
('Alimentation', 'Produits alimentaires et boissons'),
('Électronique', 'Appareils électroniques et informatiques'),
('Vêtements', 'Vêtements et accessoires'),
('Maison & Jardin', 'Articles pour la maison et le jardin'),
('Santé & Beauté', 'Produits de santé et cosmétiques'),
('Sports & Loisirs', 'Équipements sportifs et de loisirs');

-- Insertion de magasins de test
INSERT INTO stores (name, address, city, postal_code, phone, latitude, longitude) VALUES
('Super U', '123 Rue de la Paix', 'Paris', '75001', '01 23 45 67 89', 48.8566, 2.3522),
('Carrefour', '456 Avenue des Champs', 'Paris', '75008', '01 98 76 54 32', 48.8566, 2.3522),
('Leclerc', '789 Boulevard Saint-Germain', 'Paris', '75005', '01 11 22 33 44', 48.8566, 2.3522),
('Intermarché', '321 Rue de Rivoli', 'Paris', '75004', '01 55 66 77 88', 48.8566, 2.3522);
