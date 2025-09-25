-- Données d'exemple pour LocalPrice
-- À exécuter après l'importation du schéma principal

USE localprice;

-- Insertion de produits d'exemple
INSERT INTO products (name, description, category_id, brand, barcode, image_url) VALUES
-- Alimentation
('Lait entier 1L', 'Lait UHT entier', 1, 'Lactel', '1234567890123', NULL),
('Pain de mie complet', 'Pain de mie complet 500g', 1, 'Harrys', '2345678901234', NULL),
('Pommes Golden', 'Pommes Golden 1kg', 1, 'Producteur Local', '3456789012345', NULL),
('Café moulu', 'Café arabica moulu 250g', 1, 'Carte Noire', '4567890123456', NULL),
('Pâtes spaghetti', 'Pâtes spaghetti 500g', 1, 'Barilla', '5678901234567', NULL),
('Huile d\'olive', 'Huile d\'olive extra vierge 1L', 1, 'Puget', '6789012345678', NULL),

-- Électronique
('Smartphone Samsung Galaxy', 'Smartphone Android 128GB', 2, 'Samsung', '7890123456789', NULL),
('Écouteurs Bluetooth', 'Écouteurs sans fil avec réduction de bruit', 2, 'Sony', '8901234567890', NULL),
('Chargeur USB-C', 'Chargeur rapide USB-C 20W', 2, 'Apple', '9012345678901', NULL),
('Câble HDMI', 'Câble HDMI 2m', 2, 'Amazon Basics', '0123456789012', NULL),

-- Vêtements
('T-shirt coton', 'T-shirt 100% coton', 3, 'Uniqlo', '1234567890124', NULL),
('Jean slim', 'Jean slim homme', 3, 'Levi\'s', '2345678901235', NULL),
('Sweat à capuche', 'Sweat à capuche gris', 3, 'Nike', '3456789012346', NULL),
('Chaussures de sport', 'Baskets de running', 3, 'Adidas', '4567890123457', NULL),

-- Maison & Jardin
('Aspirateur', 'Aspirateur sans fil', 4, 'Dyson', '5678901234568', NULL),
('Cafetière', 'Machine à café automatique', 4, 'Krups', '6789012345679', NULL),
('Oreiller mémoire', 'Oreiller à mémoire de forme', 4, 'Tempur', '7890123456780', NULL),
('Plante verte', 'Ficus benjamina en pot', 4, 'Jardiland', '8901234567891', NULL),

-- Santé & Beauté
('Shampoing', 'Shampoing pour cheveux normaux', 5, 'L\'Oréal', '9012345678902', NULL),
('Crème hydratante', 'Crème hydratante visage', 5, 'Nivea', '0123456789013', NULL),
('Dentifrice', 'Dentifrice blanchissant', 5, 'Colgate', '1234567890125', NULL),
('Vitamines C', 'Complément alimentaire vitamine C', 5, 'Arkopharma', '2345678901236', NULL),

-- Sports & Loisirs
('Ballon de football', 'Ballon de football taille 5', 6, 'Adidas', '3456789012347', NULL),
('Raquette de tennis', 'Raquette de tennis professionnelle', 6, 'Wilson', '4567890123458', NULL),
('Vélo de ville', 'Vélo de ville 21 vitesses', 6, 'Decathlon', '5678901234569', NULL),
('Tapis de yoga', 'Tapis de yoga antidérapant', 6, 'Lululemon', '6789012345670', NULL);

-- Insertion de prix d'exemple pour les produits
-- Prix pour le Lait entier 1L
INSERT INTO product_prices (product_id, store_id, price, unit, is_available) VALUES
(1, 1, 1.20, 'bouteille', TRUE),
(1, 2, 1.15, 'bouteille', TRUE),
(1, 3, 1.25, 'bouteille', TRUE),
(1, 4, 1.18, 'bouteille', TRUE),

-- Prix pour le Pain de mie complet
(2, 1, 2.50, 'paquet', TRUE),
(2, 2, 2.45, 'paquet', TRUE),
(2, 3, 2.60, 'paquet', TRUE),
(2, 4, 2.55, 'paquet', TRUE),

-- Prix pour les Pommes Golden
(3, 1, 3.20, 'kg', TRUE),
(3, 2, 3.10, 'kg', TRUE),
(3, 3, 3.30, 'kg', TRUE),
(3, 4, 3.15, 'kg', TRUE),

-- Prix pour le Café moulu
(4, 1, 4.50, 'paquet', TRUE),
(4, 2, 4.30, 'paquet', TRUE),
(4, 3, 4.60, 'paquet', TRUE),
(4, 4, 4.40, 'paquet', TRUE),

-- Prix pour les Pâtes spaghetti
(5, 1, 1.80, 'paquet', TRUE),
(5, 2, 1.75, 'paquet', TRUE),
(5, 3, 1.85, 'paquet', TRUE),
(5, 4, 1.82, 'paquet', TRUE),

-- Prix pour l'Huile d'olive
(6, 1, 8.90, 'bouteille', TRUE),
(6, 2, 8.70, 'bouteille', TRUE),
(6, 3, 9.10, 'bouteille', TRUE),
(6, 4, 8.95, 'bouteille', TRUE),

-- Prix pour le Smartphone Samsung Galaxy
(7, 1, 599.99, 'unité', TRUE),
(7, 2, 579.99, 'unité', TRUE),
(7, 3, 619.99, 'unité', TRUE),
(7, 4, 589.99, 'unité', TRUE),

-- Prix pour les Écouteurs Bluetooth
(8, 1, 199.99, 'paire', TRUE),
(8, 2, 189.99, 'paire', TRUE),
(8, 3, 209.99, 'paire', TRUE),
(8, 4, 195.99, 'paire', TRUE),

-- Prix pour le Chargeur USB-C
(9, 1, 29.99, 'unité', TRUE),
(9, 2, 27.99, 'unité', TRUE),
(9, 3, 31.99, 'unité', TRUE),
(9, 4, 28.99, 'unité', TRUE),

-- Prix pour le T-shirt coton
(11, 1, 19.99, 'unité', TRUE),
(11, 2, 18.99, 'unité', TRUE),
(11, 3, 21.99, 'unité', TRUE),
(11, 4, 20.99, 'unité', TRUE),

-- Prix pour le Jean slim
(12, 1, 89.99, 'unité', TRUE),
(12, 2, 84.99, 'unité', TRUE),
(12, 3, 94.99, 'unité', TRUE),
(12, 4, 87.99, 'unité', TRUE),

-- Prix pour l'Aspirateur
(15, 1, 299.99, 'unité', TRUE),
(15, 2, 279.99, 'unité', TRUE),
(15, 3, 319.99, 'unité', TRUE),
(15, 4, 289.99, 'unité', TRUE),

-- Prix pour la Cafetière
(16, 1, 149.99, 'unité', TRUE),
(16, 2, 139.99, 'unité', TRUE),
(16, 3, 159.99, 'unité', TRUE),
(16, 4, 144.99, 'unité', TRUE),

-- Prix pour le Shampoing
(19, 1, 4.99, 'bouteille', TRUE),
(19, 2, 4.79, 'bouteille', TRUE),
(19, 3, 5.19, 'bouteille', TRUE),
(19, 4, 4.89, 'bouteille', TRUE),

-- Prix pour le Ballon de football
(25, 1, 24.99, 'unité', TRUE),
(25, 2, 22.99, 'unité', TRUE),
(25, 3, 26.99, 'unité', TRUE),
(25, 4, 23.99, 'unité', TRUE),

-- Prix pour la Raquette de tennis
(26, 1, 89.99, 'unité', TRUE),
(26, 2, 84.99, 'unité', TRUE),
(26, 3, 94.99, 'unité', TRUE),
(26, 4, 87.99, 'unité', TRUE);

-- Insertion d'un utilisateur de test
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@localprice.fr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('testuser', 'test@localprice.fr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Note: Le mot de passe pour les utilisateurs de test est "password"
