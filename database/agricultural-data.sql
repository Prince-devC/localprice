-- Données de base pour LocalPrice - Version Agricole

-- Catégories de produits agricoles
INSERT INTO product_categories (name, type, description) VALUES
('Céréales', 'brut', 'Blé, maïs, riz, orge, avoine'),
('Légumineuses', 'brut', 'Haricots, pois, lentilles, soja'),
('Tubercules', 'brut', 'Pommes de terre, manioc, igname'),
('Fruits', 'brut', 'Bananes, mangues, oranges, pommes'),
('Légumes', 'brut', 'Tomates, oignons, carottes, choux'),
('Épices', 'brut', 'Poivre, gingembre, curcuma, cannelle'),
('Huiles végétales', 'transforme', 'Huile de palme, tournesol, soja'),
('Farines', 'transforme', 'Farine de blé, maïs, manioc'),
('Conserves', 'transforme', 'Légumes en conserve, fruits au sirop'),
('Boissons', 'transforme', 'Jus de fruits, boissons alcoolisées');

-- Unités de mesure
INSERT INTO units (name, symbol) VALUES
('Kilogramme', 'kg'),
('Tonne', 't'),
('Litre', 'L'),
('Quintal', 'q'),
('Unité', 'unité'),
('Sachet', 'sachet'),
('Bouteille', 'bouteille'),
('Boîte', 'boîte');

-- Régions
INSERT INTO regions (name) VALUES
('Dakar'),
('Thiès'),
('Diourbel'),
('Fatick'),
('Kaolack'),
('Kolda'),
('Ziguinchor'),
('Kédougou'),
('Tambacounda'),
('Matam'),
('Saint-Louis'),
('Louga');

-- Localités principales
INSERT INTO localities (name, region_id, latitude, longitude) VALUES
('Dakar', 1, 14.6928, -17.4467),
('Pikine', 1, 14.7644, -17.3906),
('Guédiawaye', 1, 14.7833, -17.4000),
('Thiès', 2, 14.7833, -16.9167),
('Mbour', 2, 14.4167, -16.9667),
('Diourbel', 3, 14.6500, -16.2333),
('Fatick', 4, 14.3333, -16.4167),
('Kaolack', 5, 14.1500, -16.0833),
('Kolda', 6, 12.8833, -14.9500),
('Ziguinchor', 7, 12.5833, -16.2667),
('Kédougou', 8, 12.5500, -12.1833),
('Tambacounda', 9, 13.7667, -13.6667),
('Matam', 10, 15.6500, -13.2500),
('Saint-Louis', 11, 16.0167, -16.5000),
('Louga', 12, 15.6167, -16.2167);

-- Produits agricoles
INSERT INTO products (name, category_id, description) VALUES
-- Céréales
('Riz local', 1, 'Riz cultivé localement'),
('Maïs', 1, 'Maïs grain'),
('Blé', 1, 'Blé dur'),
('Millet', 1, 'Millet commun'),
('Sorgho', 1, 'Sorgho blanc'),

-- Légumineuses
('Haricots blancs', 2, 'Haricots blancs secs'),
('Pois de terre', 2, 'Pois de terre frais'),
('Lentilles', 2, 'Lentilles rouges'),
('Soja', 2, 'Graines de soja'),

-- Tubercules
('Pommes de terre', 3, 'Pommes de terre fraîches'),
('Manioc', 3, 'Racines de manioc'),
('Igname', 3, 'Tubercules d\'igname'),

-- Fruits
('Bananes', 4, 'Bananes plantain'),
('Mangues', 4, 'Mangues fraîches'),
('Oranges', 4, 'Oranges douces'),
('Pommes', 4, 'Pommes importées'),

-- Légumes
('Tomates', 5, 'Tomates fraîches'),
('Oignons', 5, 'Oignons secs'),
('Carottes', 5, 'Carottes fraîches'),
('Choux', 5, 'Choux verts'),

-- Épices
('Poivre noir', 6, 'Poivre noir en grains'),
('Gingembre', 6, 'Racines de gingembre'),
('Curcuma', 6, 'Poudre de curcuma'),

-- Produits transformés
('Huile de palme', 7, 'Huile de palme raffinée'),
('Farine de blé', 8, 'Farine de blé T45'),
('Farine de maïs', 8, 'Farine de maïs'),
('Tomates en conserve', 9, 'Tomates pelées en boîte'),
('Jus de mangue', 10, 'Jus de mangue 100% pur');

-- Coûts de transport et stockage
INSERT INTO costs (type, value, unit, description) VALUES
('transport', 50.00, 'per_km', 'Coût de transport par km'),
('transport', 25.00, 'per_km', 'Coût de transport local par km'),
('stockage', 100.00, 'per_day_per_tonne', 'Coût de stockage par jour et par tonne'),
('stockage', 5.00, 'per_day_per_kg', 'Coût de stockage par jour et par kg');

-- Utilisateur admin de test
INSERT INTO users (id, email, role) VALUES
('admin_001', 'admin@localprice.sn', 'admin'),
('contributor_001', 'contributeur@localprice.sn', 'contributor');

-- Prix d'exemple (en attente de validation)
INSERT INTO prices (product_id, locality_id, unit_id, price, date, submitted_by, status) VALUES
(1, 1, 1, 450.00, '2024-01-15', 'contributor_001', 'pending'),
(1, 2, 1, 420.00, '2024-01-15', 'contributor_001', 'pending'),
(2, 1, 1, 200.00, '2024-01-15', 'contributor_001', 'pending'),
(2, 3, 1, 180.00, '2024-01-15', 'contributor_001', 'pending'),
(3, 1, 1, 350.00, '2024-01-15', 'contributor_001', 'pending'),
(4, 1, 1, 300.00, '2024-01-15', 'contributor_001', 'pending'),
(5, 1, 1, 250.00, '2024-01-15', 'contributor_001', 'pending'),
(6, 1, 1, 800.00, '2024-01-15', 'contributor_001', 'pending'),
(7, 1, 1, 400.00, '2024-01-15', 'contributor_001', 'pending'),
(8, 1, 1, 600.00, '2024-01-15', 'contributor_001', 'pending'),
(9, 1, 1, 500.00, '2024-01-15', 'contributor_001', 'pending'),
(10, 1, 1, 300.00, '2024-01-15', 'contributor_001', 'pending'),
(11, 1, 1, 200.00, '2024-01-15', 'contributor_001', 'pending'),
(12, 1, 1, 150.00, '2024-01-15', 'contributor_001', 'pending'),
(13, 1, 1, 180.00, '2024-01-15', 'contributor_001', 'pending'),
(14, 1, 1, 300.00, '2024-01-15', 'contributor_001', 'pending'),
(15, 1, 1, 400.00, '2024-01-15', 'contributor_001', 'pending'),
(16, 1, 1, 250.00, '2024-01-15', 'contributor_001', 'pending'),
(17, 1, 1, 200.00, '2024-01-15', 'contributor_001', 'pending'),
(18, 1, 1, 150.00, '2024-01-15', 'contributor_001', 'pending'),
(19, 1, 1, 100.00, '2024-01-15', 'contributor_001', 'pending'),
(20, 1, 1, 80.00, '2024-01-15', 'contributor_001', 'pending'),
(21, 1, 1, 120.00, '2024-01-15', 'contributor_001', 'pending'),
(22, 1, 1, 200.00, '2024-01-15', 'contributor_001', 'pending'),
(23, 1, 1, 180.00, '2024-01-15', 'contributor_001', 'pending'),
(24, 1, 1, 160.00, '2024-01-15', 'contributor_001', 'pending'),
(25, 1, 1, 140.00, '2024-01-15', 'contributor_001', 'pending'),
(26, 1, 1, 100.00, '2024-01-15', 'contributor_001', 'pending'),
(27, 1, 1, 80.00, '2024-01-15', 'contributor_001', 'pending'),
(28, 1, 1, 60.00, '2024-01-15', 'contributor_001', 'pending'),
(29, 1, 1, 40.00, '2024-01-15', 'contributor_001', 'pending'),
(30, 1, 1, 30.00, '2024-01-15', 'contributor_001', 'pending');

