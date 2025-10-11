-- Données d'exemple pour les tables d'options SQLite - Bénin

-- Insertion des régions (départements du Bénin)
INSERT OR IGNORE INTO regions (name, code) VALUES
('Alibori', 'AL'),
('Atacora', 'AT'),
('Atlantique', 'AQ'),
('Borgou', 'BO'),
('Collines', 'CO'),
('Couffo', 'CF'),
('Donga', 'DO'),
('Littoral', 'LI'),
('Mono', 'MO'),
('Ouémé', 'OU'),
('Plateau', 'PL'),
('Zou', 'ZO');

-- Insertion des communes du Bénin par département (sans doublons)
INSERT OR IGNORE INTO localities (name, region_id, latitude, longitude) VALUES
-- Alibori
('Banikoara', 1, 11.2989, 2.4394),
('Gogounou', 1, 10.8333, 2.8333),
('Kandi', 1, 11.1342, 2.9386),
('Karimama', 1, 12.0667, 3.3833),
('Malanville', 1, 11.8667, 3.3833),
('Ségbana', 1, 10.9333, 3.4333),

-- Atacora
('Boukoumbé', 2, 10.1833, 1.1000),
('Cobly', 2, 9.7833, 1.3167),
('Kérou', 2, 10.8167, 1.9667),
('Kouandé', 2, 10.3333, 1.6833),
('Matéri', 2, 10.0667, 1.2667),
('Natitingou', 2, 10.3167, 1.3833),
('Pehunco', 2, 10.0167, 1.4167),
('Tanguiéta', 2, 10.6167, 1.2667),
('Toucountouna', 2, 10.5833, 1.0833),

-- Atlantique
('Abomey-Calavi', 3, 6.4489, 2.3553),
('Allada', 3, 6.6650, 2.1514),
('Kpomassè', 3, 6.3667, 2.1167),
('Ouidah', 3, 6.3622, 2.0856),
('Sô-Ava', 3, 6.4667, 2.4167),
('Toffo', 3, 6.8500, 2.0833),
('Tori-Bossito', 3, 6.5167, 1.9833),
('Zè', 3, 6.8167, 2.3167),

-- Borgou
('Bembèrèkè', 4, 10.2167, 2.6667),
('Kalale', 4, 10.3000, 3.3833),
('Nikki', 4, 9.9333, 3.2167),
('Parakou', 4, 9.3372, 2.6303),
('Pèrèrè', 4, 9.7000, 2.8500),
('Sinendé', 4, 10.0167, 2.4167),

-- Collines
('Bantè', 5, 8.4167, 1.8833),
('Dassa-Zoumè', 5, 7.7500, 2.1833),
('Glazoué', 5, 7.9667, 2.2333),
('Ouèssè', 5, 8.4833, 2.4167),
('Savalou', 5, 7.9333, 1.9667),
('Savè', 5, 8.0342, 2.4864),

-- Couffo
('Aplahoué', 6, 6.9333, 1.6833),
('Djakotomey', 6, 7.1000, 1.6667),
('Dogbo', 6, 7.1167, 1.7833),
('Klouékanmè', 6, 7.0167, 2.0167),
('Lalo', 6, 6.8833, 1.8833),
('Toviklin', 6, 6.5667, 1.8167),

-- Donga
('Bassila', 7, 9.0167, 1.6667),
('Copargo', 7, 9.1000, 1.3833),
('Djougou', 7, 9.7086, 1.6658),
('Ouaké', 7, 9.5833, 1.3833),

-- Littoral
('Cotonou', 8, 6.3703, 2.3912),

-- Mono
('Athiémé', 9, 6.5667, 1.6667),
('Bopa', 9, 6.8667, 1.9667),
('Comè', 9, 6.4000, 1.8833),
('Grand-Popo', 9, 6.2833, 1.8167),
('Houéyogbé', 9, 6.5833, 1.9000),
('Lokossa', 9, 6.6386, 1.7175),

-- Ouémé
('Adjarra', 10, 6.4833, 2.6167),
('Adjohoun', 10, 6.7333, 2.4833),
('Aguégués', 10, 6.5833, 2.4833),
('Akpro-Missérété', 10, 6.5500, 2.5833),
('Avrankou', 10, 6.4667, 2.5833),
('Bonou', 10, 6.9000, 2.4667),
('Dangbo', 10, 6.5833, 2.5500),
('Porto-Novo', 10, 6.4969, 2.6289),
('Sèmè-Kpodji', 10, 6.3667, 2.7000),

-- Plateau
('Adja-Ouèrè', 11, 7.1167, 2.5833),
('Ifangni', 11, 7.1333, 2.6333),
('Kétou', 11, 7.3631, 2.6044),
('Pobè', 11, 7.1167, 2.6667),
('Sakété', 11, 6.7333, 2.6500),

-- Zou
('Abomey', 12, 7.1847, 1.9914),
('Agbangnizoun', 12, 7.1167, 2.0500),
('Bohicon', 12, 7.1786, 2.0667),
('Cové', 12, 7.2167, 2.2833),
('Djidja', 12, 7.3333, 1.8333),
('Ouinhi', 12, 7.0833, 2.4833),
('Za-Kpota', 12, 7.1000, 2.1833),
('Zangnanado', 12, 7.2833, 2.3500),
('Zogbodomey', 12, 7.0667, 2.2500);

-- Insertion des catégories de produits béninois
INSERT OR IGNORE INTO product_categories (name, type, description) VALUES
('Céréales', 'brut', 'Maïs, riz, mil, sorgho, fonio'),
('Tubercules', 'brut', 'Igname, manioc, patate douce'),
('Légumineuses', 'brut', 'Niébé, arachide, soja, voandzou'),
('Légumes', 'brut', 'Tomate, oignon, piment, gombo, épinard'),
('Fruits', 'brut', 'Ananas, mangue, orange, banane, avocat'),
('Produits transformés', 'transforme', 'Gari, tapioca, farine, huile, akassa');

-- Insertion des produits béninois
INSERT OR IGNORE INTO products (name, category_id, description) VALUES
-- Céréales
('Maïs', 1, 'Maïs'),
('Riz paddy', 1, 'Riz paddy'),
('Riz étuvé', 1, 'Riz étuvé'),
('Mil', 1, 'Mil'),
('Sorgho', 1, 'Sorgho'),

-- Tubercules
('Igname', 2, 'Igname'),
('Manioc', 2, 'Tubercule de manioc'),
('Patate douce', 2, 'Patate douce'),

-- Légumineuses
('Niébé', 3, 'Haricot niébé'),
('Arachide', 3, 'Arachide décortiquée'),
('Soja', 3, 'Graine de soja'),
('Voandzou', 3, 'Voandzou'),

-- Légumes
('Tomate', 4, 'Tomate'),
('Oignon', 4, 'Oignon'),
('Piment', 4, 'Piment rouge'),
('Gombo', 4, 'Gombo'),
('Épinard', 4, 'Épinard'),

-- Fruits
('Ananas', 5, 'Ananas pain de sucre'),
('Mangue', 5, 'Mangue'),
('Orange', 5, 'Orange'),
('Banane', 5, 'Banane'),
('Avocat', 5, 'Avocat'),

-- Produits transformés
('Gari', 6, 'Gari'),
('Tapioca', 6, 'Tapioca'),
('Farine de maïs', 6, 'Farine de maïs'),
('Huile de palme', 6, 'Huile de palme rouge');

-- Insertion des unités
INSERT OR IGNORE INTO units (name, symbol) VALUES
('Kilogramme', 'kg'),
('Gramme', 'g'),
('Litre', 'l'),
('Sac de 10kg', 'sac 10kg'),
('Sac de 20kg', 'sac 20kg'),
('Sac de 50kg', 'sac 50kg'),
('Sac de 100kg', 'sac 100kg'),
('Tohoungodo', 'tohoungodo'),
('Boîte', 'boîte'),
('Paquet', 'paquet'),
('Unité', 'unité');

-- Insertion des options de filtres pour les produits béninois
INSERT OR IGNORE INTO filter_product_options (product_id, display_name, is_active, sort_order) VALUES
(1, 'Maïs', 1, 1),
(2, 'Riz paddy', 1, 2),
(3, 'Riz étuvé', 1, 3),
(4, 'Mil', 1, 4),
(5, 'Sorgho', 1, 5),
(6, 'Igname', 1, 6),
(7, 'Manioc', 1, 7),
(8, 'Patate douce', 1, 8),
(9, 'Niébé', 1, 9),
(10, 'Arachide', 1, 10),
(11, 'Soja', 1, 11),
(12, 'Voandzou', 1, 12),
(13, 'Tomate', 1, 13),
(14, 'Oignon', 1, 14),
(15, 'Piment', 1, 15),
(16, 'Gombo', 1, 16),
(17, 'Épinard', 1, 17),
(18, 'Ananas', 1, 18),
(19, 'Mangue', 1, 19),
(20, 'Orange', 1, 20),
(21, 'Banane', 1, 21),
(22, 'Avocat', 1, 22),
(23, 'Gari', 1, 23),
(24, 'Tapioca', 1, 24),
(25, 'Farine de maïs', 1, 25),
(26, 'Huile de palme', 1, 26);

-- Insertion des options de filtres pour les localités (toutes les communes du Bénin)
INSERT OR IGNORE INTO filter_locality_options (locality_id, display_name, is_active, sort_order) VALUES
-- Alibori
(1, 'Banikoara', 1, 1),
(2, 'Gogounou', 1, 2),
(3, 'Kandi', 1, 3),
(4, 'Karimama', 1, 4),
(5, 'Malanville', 1, 5),
(6, 'Ségbana', 1, 6),
-- Atacora
(7, 'Boukoumbé', 1, 7),
(8, 'Cobly', 1, 8),
(9, 'Kérou', 1, 9),
(10, 'Kouandé', 1, 10),
(11, 'Matéri', 1, 11),
(12, 'Natitingou', 1, 12),
(13, 'Pehunco', 1, 13),
(14, 'Tanguiéta', 1, 14),
(15, 'Toucountouna', 1, 15),
-- Atlantique
(16, 'Abomey-Calavi', 1, 16),
(17, 'Allada', 1, 17),
(18, 'Kpomassè', 1, 18),
(19, 'Ouidah', 1, 19),
(20, 'Sô-Ava', 1, 20),
(21, 'Toffo', 1, 21),
(22, 'Tori-Bossito', 1, 22),
(23, 'Zè', 1, 23),
-- Borgou
(24, 'Bembèrèkè', 1, 24),
(25, 'Kalalé', 1, 25),
(26, 'Nikki', 1, 26),
(27, 'Parakou', 1, 27),
(28, 'Pèrèrè', 1, 28),
(29, 'Sinendé', 1, 29),
-- Collines
(30, 'Bantè', 1, 30),
(31, 'Dassa-Zoumè', 1, 31),
(32, 'Glazoué', 1, 32),
(33, 'Ouèssè', 1, 33),
(34, 'Savalou', 1, 34),
(35, 'Savè', 1, 35),
-- Couffo
(36, 'Aplahoué', 1, 36),
(37, 'Djakotomey', 1, 37),
(38, 'Dogbo', 1, 38),
(39, 'Klouékanmè', 1, 39),
(40, 'Lalo', 1, 40),
(41, 'Toviklin', 1, 41),
-- Donga
(42, 'Bassila', 1, 42),
(43, 'Copargo', 1, 43),
(44, 'Djougou', 1, 44),
(45, 'Ouaké', 1, 45),
-- Littoral
(46, 'Cotonou', 1, 46),
-- Mono
(47, 'Athiémé', 1, 47),
(48, 'Bopa', 1, 48),
(49, 'Comè', 1, 49),
(50, 'Grand-Popo', 1, 50),
(51, 'Houéyogbé', 1, 51),
(52, 'Lokossa', 1, 52),
-- Ouémé
(53, 'Adjarra', 1, 53),
(54, 'Adjohoun', 1, 54),
(55, 'Aguégués', 1, 55),
(56, 'Akpro-Missérété', 1, 56),
(57, 'Avrankou', 1, 57),
(58, 'Bonou', 1, 58),
(59, 'Dangbo', 1, 59),
(60, 'Porto-Novo', 1, 60),
(61, 'Sèmè-Kpodji', 1, 61),
-- Plateau
(62, 'Adja-Ouèrè', 1, 62),
(63, 'Ifangni', 1, 63),
(64, 'Kétou', 1, 64),
(65, 'Pobè', 1, 65),
(66, 'Sakété', 1, 66),
-- Zou
(67, 'Abomey', 1, 67),
(68, 'Agbangnizoun', 1, 68),
(69, 'Bohicon', 1, 69),
(70, 'Cové', 1, 70),
(71, 'Djidja', 1, 71),
(72, 'Ouinhi', 1, 72),
(73, 'Za-Kpota', 1, 73),
(74, 'Zangnanado', 1, 74),
(75, 'Zogbodomey', 1, 75);

-- Insertion des options de filtres pour les régions (départements du Bénin)
INSERT OR IGNORE INTO filter_region_options (region_id, display_name, is_active, sort_order) VALUES
(1, 'Alibori', 1, 1),
(2, 'Atacora', 1, 2),
(3, 'Atlantique', 1, 3),
(4, 'Borgou', 1, 4),
(5, 'Collines', 1, 5),
(6, 'Couffo', 1, 6),
(7, 'Donga', 1, 7),
(8, 'Littoral', 1, 8),
(9, 'Mono', 1, 9),
(10, 'Ouémé', 1, 10),
(11, 'Plateau', 1, 11),
(12, 'Zou', 1, 12);

-- Insertion des options de filtres pour les catégories
INSERT OR IGNORE INTO filter_category_options (category_id, display_name, is_active, sort_order) VALUES
(1, 'Céréales', 1, 1),
(2, 'Tubercules', 1, 2),
(3, 'Légumineuses', 1, 3),
(4, 'Légumes', 1, 4),
(5, 'Fruits', 1, 5),
(6, 'Produits transformés', 1, 6);

-- Insertion des options de filtres pour les périodes
INSERT OR IGNORE INTO filter_period_options (period_key, display_name, days_count, is_active, sort_order) VALUES
('today', 'Aujourd''hui', 1, 1, 1),
('week', 'Cette semaine', 7, 1, 2),
('month', 'Ce mois', 30, 1, 3),
('quarter', 'Ce trimestre', 90, 1, 4),
('year', 'Cette année', 365, 1, 5),
('all', 'Toutes les périodes', 0, 1, 6);

-- Insertion des coûts de transport et de stockage
INSERT OR IGNORE INTO costs (type, value, unit, description) VALUES
('transport', 50.0, 'per_km_per_tonne', 'Coût de transport par km et par tonne'),
('stockage', 100.0, 'per_day_per_tonne', 'Coût de stockage par jour et par tonne'),
('stockage', 0.1, 'per_day_per_kg', 'Coût de stockage par jour et par kg'),
('stockage', 1000.0, 'per_day_per_q', 'Coût de stockage par jour et par quintal');

-- Insertion de quelques magasins d'exemple
INSERT OR IGNORE INTO stores (name, address, city, postal_code, phone, email, website, latitude, longitude, opening_hours) VALUES
('Super Marché Cotonou', 'Avenue Clozel, Cotonou', 'Cotonou', '01BP1234', '+229 21 31 12 34', 'contact@supermarche-cotonou.bj', 'https://supermarche-cotonou.bj', 6.3703, 2.3912, '{"lundi": "7h-20h", "mardi": "7h-20h", "mercredi": "7h-20h", "jeudi": "7h-20h", "vendredi": "7h-20h", "samedi": "7h-20h", "dimanche": "8h-18h"}'),
('Marché Dantokpa', 'Quartier Dantokpa, Cotonou', 'Cotonou', '01BP5678', '+229 21 31 56 78', 'info@marche-dantokpa.bj', '', 6.3500, 2.4000, '{"lundi": "6h-19h", "mardi": "6h-19h", "mercredi": "6h-19h", "jeudi": "6h-19h", "vendredi": "6h-19h", "samedi": "6h-19h", "dimanche": "7h-18h"}'),
('Super Marché Porto-Novo', 'Avenue Jean Paul II, Porto-Novo', 'Porto-Novo', '01BP9012', '+229 20 21 90 12', 'contact@supermarche-pn.bj', 'https://supermarche-pn.bj', 6.4969, 2.6289, '{"lundi": "7h-20h", "mardi": "7h-20h", "mercredi": "7h-20h", "jeudi": "7h-20h", "vendredi": "7h-20h", "samedi": "7h-20h", "dimanche": "8h-18h"}'),
('Marché de Bohicon', 'Centre-ville, Bohicon', 'Bohicon', '01BP3456', '+229 23 45 67 89', 'info@marche-bohicon.bj', '', 7.1786, 2.0667, '{"lundi": "6h-19h", "mardi": "6h-19h", "mercredi": "6h-19h", "jeudi": "6h-19h", "vendredi": "6h-19h", "samedi": "6h-19h", "dimanche": "7h-18h"}');

-- Insertion de quelques prix de produits d'exemple
INSERT OR IGNORE INTO product_prices (product_id, store_id, price, unit, date, status, is_available) VALUES
-- Maïs
(1, 1, 350.00, 'kg', '2024-01-15', 'active', 1),
(1, 2, 340.00, 'kg', '2024-01-15', 'active', 1),
(1, 3, 360.00, 'kg', '2024-01-15', 'active', 1),
(1, 4, 320.00, 'kg', '2024-01-15', 'active', 1),
-- Riz paddy
(2, 1, 450.00, 'kg', '2024-01-15', 'active', 1),
(2, 2, 440.00, 'kg', '2024-01-15', 'active', 1),
(2, 3, 460.00, 'kg', '2024-01-15', 'active', 1),
(2, 4, 430.00, 'kg', '2024-01-15', 'active', 1),
-- Igname
(6, 1, 280.00, 'kg', '2024-01-15', 'active', 1),
(6, 2, 270.00, 'kg', '2024-01-15', 'active', 1),
(6, 3, 290.00, 'kg', '2024-01-15', 'active', 1),
(6, 4, 260.00, 'kg', '2024-01-15', 'active', 1),
-- Tomate
(13, 1, 400.00, 'kg', '2024-01-15', 'active', 1),
(13, 2, 380.00, 'kg', '2024-01-15', 'active', 1),
(13, 3, 420.00, 'kg', '2024-01-15', 'active', 1),
(13, 4, 370.00, 'kg', '2024-01-15', 'active', 1),
-- Oignon
(14, 1, 300.00, 'kg', '2024-01-15', 'active', 1),
(14, 2, 290.00, 'kg', '2024-01-15', 'active', 1),
(14, 3, 310.00, 'kg', '2024-01-15', 'active', 1),
(14, 4, 280.00, 'kg', '2024-01-15', 'active', 1),
-- Gari
(23, 1, 250.00, 'kg', '2024-01-15', 'active', 1),
(23, 2, 240.00, 'kg', '2024-01-15', 'active', 1),
(23, 3, 260.00, 'kg', '2024-01-15', 'active', 1),
(23, 4, 230.00, 'kg', '2024-01-15', 'active', 1),
-- Huile de palme
(26, 1, 800.00, 'l', '2024-01-15', 'active', 1),
(26, 2, 780.00, 'l', '2024-01-15', 'active', 1),
(26, 3, 820.00, 'l', '2024-01-15', 'active', 1),
(26, 4, 760.00, 'l', '2024-01-15', 'active', 1);

-- Insertion de quelques prix d'exemple pour les produits béninois avec historique
INSERT OR IGNORE INTO prices (product_id, locality_id, unit_id, price, date, status, submitted_by) VALUES
-- Maïs - Prix historiques
(1, 46, 1, 280.00, '2023-12-01', 'validated', 'user1'),
(1, 46, 1, 320.00, '2023-12-15', 'validated', 'user1'),
(1, 46, 1, 350.00, '2024-01-15', 'validated', 'user1'),
(1, 60, 1, 300.00, '2023-12-01', 'validated', 'user2'),
(1, 60, 1, 340.00, '2024-01-15', 'validated', 'user2'),
(1, 69, 1, 250.00, '2023-12-01', 'validated', 'user3'),
(1, 69, 1, 320.00, '2024-01-15', 'validated', 'user3'),

-- Riz paddy - Prix historiques
(2, 46, 1, 400.00, '2023-12-01', 'validated', 'user1'),
(2, 46, 1, 450.00, '2024-01-15', 'validated', 'user1'),
(2, 60, 1, 420.00, '2023-12-01', 'validated', 'user2'),
(2, 60, 1, 460.00, '2024-01-15', 'validated', 'user2'),

-- Igname - Prix historiques
(6, 46, 1, 320.00, '2023-12-01', 'validated', 'user1'),
(6, 46, 1, 280.00, '2024-01-15', 'validated', 'user1'),
(6, 60, 1, 350.00, '2023-12-01', 'validated', 'user2'),
(6, 60, 1, 290.00, '2024-01-15', 'validated', 'user2'),

-- Tomate - Prix historiques
(13, 46, 1, 350.00, '2023-12-01', 'validated', 'user1'),
(13, 46, 1, 400.00, '2024-01-15', 'validated', 'user1'),
(13, 60, 1, 380.00, '2023-12-01', 'validated', 'user2'),
(13, 60, 1, 420.00, '2024-01-15', 'validated', 'user2'),

-- Oignon - Prix historiques
(14, 46, 1, 350.00, '2023-12-01', 'validated', 'user1'),
(14, 46, 1, 300.00, '2024-01-15', 'validated', 'user1'),
(14, 60, 1, 280.00, '2023-12-01', 'validated', 'user2'),
(14, 60, 1, 310.00, '2024-01-15', 'validated', 'user2'),

-- Gari - Prix historiques
(23, 46, 1, 200.00, '2023-12-01', 'validated', 'user1'),
(23, 46, 1, 250.00, '2024-01-15', 'validated', 'user1'),
(23, 60, 1, 220.00, '2023-12-01', 'validated', 'user2'),
(23, 60, 1, 260.00, '2024-01-15', 'validated', 'user2'),

-- Huile de palme - Prix historiques
(26, 46, 3, 750.00, '2023-12-01', 'validated', 'user1'),
(26, 46, 3, 800.00, '2024-01-15', 'validated', 'user1'),
(26, 60, 3, 900.00, '2023-12-01', 'validated', 'user2'),
(26, 60, 3, 820.00, '2024-01-15', 'validated', 'user2'),

-- Produits supplémentaires avec variations
-- Riz étuvé
(3, 46, 1, 480.00, '2023-12-01', 'validated', 'user1'),
(3, 46, 1, 520.00, '2024-01-15', 'validated', 'user1'),
(3, 60, 1, 500.00, '2023-12-01', 'validated', 'user2'),
(3, 60, 1, 480.00, '2024-01-15', 'validated', 'user2'),

-- Mil
(4, 46, 1, 380.00, '2023-12-01', 'validated', 'user1'),
(4, 46, 1, 420.00, '2024-01-15', 'validated', 'user1'),
(4, 60, 1, 360.00, '2023-12-01', 'validated', 'user2'),
(4, 60, 1, 400.00, '2024-01-15', 'validated', 'user2'),

-- Sorgho
(5, 46, 1, 340.00, '2023-12-01', 'validated', 'user1'),
(5, 46, 1, 380.00, '2024-01-15', 'validated', 'user1'),
(5, 60, 1, 320.00, '2023-12-01', 'validated', 'user2'),
(5, 60, 1, 360.00, '2024-01-15', 'validated', 'user2'),

-- Manioc
(7, 46, 1, 180.00, '2023-12-01', 'validated', 'user1'),
(7, 46, 1, 220.00, '2024-01-15', 'validated', 'user1'),
(7, 60, 1, 200.00, '2023-12-01', 'validated', 'user2'),
(7, 60, 1, 190.00, '2024-01-15', 'validated', 'user2'),

-- Patate douce
(8, 46, 1, 240.00, '2023-12-01', 'validated', 'user1'),
(8, 46, 1, 280.00, '2024-01-15', 'validated', 'user1'),
(8, 60, 1, 260.00, '2023-12-01', 'validated', 'user2'),
(8, 60, 1, 250.00, '2024-01-15', 'validated', 'user2'),

-- Niébé
(9, 46, 1, 600.00, '2023-12-01', 'validated', 'user1'),
(9, 46, 1, 680.00, '2024-01-15', 'validated', 'user1'),
(9, 60, 1, 620.00, '2023-12-01', 'validated', 'user2'),
(9, 60, 1, 650.00, '2024-01-15', 'validated', 'user2'),

-- Arachide
(10, 46, 1, 800.00, '2023-12-01', 'validated', 'user1'),
(10, 46, 1, 750.00, '2024-01-15', 'validated', 'user1'),
(10, 60, 1, 780.00, '2023-12-01', 'validated', 'user2'),
(10, 60, 1, 820.00, '2024-01-15', 'validated', 'user2'),

-- Soja
(11, 46, 1, 700.00, '2023-12-01', 'validated', 'user1'),
(11, 46, 1, 780.00, '2024-01-15', 'validated', 'user1'),
(11, 60, 1, 720.00, '2023-12-01', 'validated', 'user2'),
(11, 60, 1, 760.00, '2024-01-15', 'validated', 'user2'),

-- Piment
(15, 46, 1, 1200.00, '2023-12-01', 'validated', 'user1'),
(15, 46, 1, 1400.00, '2024-01-15', 'validated', 'user1'),
(15, 60, 1, 1300.00, '2023-12-01', 'validated', 'user2'),
(15, 60, 1, 1250.00, '2024-01-15', 'validated', 'user2'),

-- Gombo
(16, 46, 1, 500.00, '2023-12-01', 'validated', 'user1'),
(16, 46, 1, 580.00, '2024-01-15', 'validated', 'user1'),
(16, 60, 1, 520.00, '2023-12-01', 'validated', 'user2'),
(16, 60, 1, 550.00, '2024-01-15', 'validated', 'user2'),

-- Ananas
(18, 46, 1, 300.00, '2023-12-01', 'validated', 'user1'),
(18, 46, 1, 350.00, '2024-01-15', 'validated', 'user1'),
(18, 60, 1, 320.00, '2023-12-01', 'validated', 'user2'),
(18, 60, 1, 330.00, '2024-01-15', 'validated', 'user2'),

-- Mangue
(19, 46, 1, 400.00, '2023-12-01', 'validated', 'user1'),
(19, 46, 1, 380.00, '2024-01-15', 'validated', 'user1'),
(19, 60, 1, 420.00, '2023-12-01', 'validated', 'user2'),
(19, 60, 1, 450.00, '2024-01-15', 'validated', 'user2'),

-- Banane
(21, 46, 1, 200.00, '2023-12-01', 'validated', 'user1'),
(21, 46, 1, 250.00, '2024-01-15', 'validated', 'user1'),
(21, 60, 1, 220.00, '2023-12-01', 'validated', 'user2'),
(21, 60, 1, 240.00, '2024-01-15', 'validated', 'user2'),

-- Tapioca
(24, 46, 1, 280.00, '2023-12-01', 'validated', 'user1'),
(24, 46, 1, 320.00, '2024-01-15', 'validated', 'user1'),
(24, 60, 1, 300.00, '2023-12-01', 'validated', 'user2'),
(24, 60, 1, 290.00, '2024-01-15', 'validated', 'user2'),

-- Farine de maïs
(25, 46, 1, 350.00, '2023-12-01', 'validated', 'user1'),
(25, 46, 1, 400.00, '2024-01-15', 'validated', 'user1'),
(25, 60, 1, 380.00, '2023-12-01', 'validated', 'user2'),
(25, 60, 1, 370.00, '2024-01-15', 'validated', 'user2'),

-- Prix historiques étendus avec dates aléatoires (2023-2025)
-- Aujourd'hui - 3 octobre 2025
(1, 46, 1, 380.00, '2025-10-03', 'validated', 'user1'),
(2, 46, 1, 480.00, '2025-10-03', 'validated', 'user1'),
(6, 46, 1, 300.00, '2025-10-03', 'validated', 'user1'),
(13, 46, 1, 450.00, '2025-10-03', 'validated', 'user1'),
(14, 46, 1, 320.00, '2025-10-03', 'validated', 'user1'),
(23, 46, 1, 280.00, '2025-10-03', 'validated', 'user1'),

-- Semaine dernière (26 septembre - 2 octobre 2025)
(1, 60, 1, 370.00, '2025-09-28', 'validated', 'user2'),
(2, 60, 1, 470.00, '2025-09-30', 'validated', 'user2'),
(6, 60, 1, 295.00, '2025-09-26', 'validated', 'user2'),
(13, 60, 1, 440.00, '2025-10-01', 'validated', 'user2'),
(14, 60, 1, 315.00, '2025-09-29', 'validated', 'user2'),
(23, 60, 1, 275.00, '2025-10-02', 'validated', 'user2'),

-- Mois dernier (septembre 2025)
(1, 69, 1, 360.00, '2025-09-15', 'validated', 'user3'),
(2, 69, 1, 460.00, '2025-09-10', 'validated', 'user3'),
(6, 69, 1, 285.00, '2025-09-20', 'validated', 'user3'),
(13, 69, 1, 430.00, '2025-09-05', 'validated', 'user3'),
(14, 69, 1, 310.00, '2025-09-25', 'validated', 'user3'),
(23, 69, 1, 270.00, '2025-09-12', 'validated', 'user3'),

-- 3 mois (juillet 2025)
(3, 46, 1, 540.00, '2025-07-15', 'validated', 'user1'),
(4, 46, 1, 440.00, '2025-07-20', 'validated', 'user1'),
(5, 46, 1, 400.00, '2025-07-10', 'validated', 'user1'),
(7, 46, 1, 240.00, '2025-07-25', 'validated', 'user1'),
(8, 46, 1, 300.00, '2025-07-05', 'validated', 'user1'),
(9, 46, 1, 700.00, '2025-07-30', 'validated', 'user1'),

-- 6 mois (avril 2025)
(10, 46, 1, 780.00, '2025-04-12', 'validated', 'user1'),
(11, 46, 1, 800.00, '2025-04-18', 'validated', 'user1'),
(15, 46, 1, 1450.00, '2025-04-22', 'validated', 'user1'),
(16, 46, 1, 600.00, '2025-04-08', 'validated', 'user1'),
(18, 46, 1, 370.00, '2025-04-15', 'validated', 'user1'),
(19, 46, 1, 390.00, '2025-04-25', 'validated', 'user1'),

-- 1 an (octobre 2024)
(21, 46, 1, 260.00, '2024-10-10', 'validated', 'user1'),
(24, 46, 1, 340.00, '2024-10-15', 'validated', 'user1'),
(25, 46, 1, 420.00, '2024-10-20', 'validated', 'user1'),
(26, 46, 3, 850.00, '2024-10-05', 'validated', 'user1'),
(1, 27, 1, 340.00, '2024-10-25', 'validated', 'user4'),
(2, 27, 1, 440.00, '2024-10-30', 'validated', 'user4'),

-- 2 ans (octobre 2023)
(1, 16, 1, 300.00, '2023-10-12', 'validated', 'user5'),
(2, 16, 1, 420.00, '2023-10-18', 'validated', 'user5'),
(6, 16, 1, 260.00, '2023-10-22', 'validated', 'user5'),
(13, 16, 1, 380.00, '2023-10-08', 'validated', 'user5'),
(14, 16, 1, 280.00, '2023-10-15', 'validated', 'user5'),
(23, 16, 1, 230.00, '2023-10-25', 'validated', 'user5'),

-- Prix aléatoires supplémentaires pour différentes périodes
-- Janvier 2025
(1, 17, 1, 365.00, '2025-01-20', 'validated', 'user6'),
(2, 17, 1, 465.00, '2025-01-25', 'validated', 'user6'),
(6, 17, 1, 290.00, '2025-01-15', 'validated', 'user6'),

-- Mars 2025
(13, 17, 1, 435.00, '2025-03-10', 'validated', 'user6'),
(14, 17, 1, 305.00, '2025-03-15', 'validated', 'user6'),
(23, 17, 1, 265.00, '2025-03-20', 'validated', 'user6'),

-- Mai 2025
(3, 60, 1, 530.00, '2025-05-12', 'validated', 'user2'),
(4, 60, 1, 430.00, '2025-05-18', 'validated', 'user2'),
(5, 60, 1, 390.00, '2025-05-22', 'validated', 'user2'),

-- Août 2025
(7, 60, 1, 230.00, '2025-08-08', 'validated', 'user2'),
(8, 60, 1, 290.00, '2025-08-15', 'validated', 'user2'),
(9, 60, 1, 690.00, '2025-08-25', 'validated', 'user2'),

-- Juin 2024
(10, 60, 1, 770.00, '2024-06-12', 'validated', 'user2'),
(11, 60, 1, 790.00, '2024-06-18', 'validated', 'user2'),
(15, 60, 1, 1350.00, '2024-06-22', 'validated', 'user2'),

-- Décembre 2023
(16, 60, 1, 520.00, '2023-12-08', 'validated', 'user2'),
(18, 60, 1, 310.00, '2023-12-15', 'validated', 'user2'),
(19, 60, 1, 410.00, '2023-12-25', 'validated', 'user2'),

-- Février 2024
(21, 69, 1, 245.00, '2024-02-10', 'validated', 'user3'),
(24, 69, 1, 315.00, '2024-02-15', 'validated', 'user3'),
(25, 69, 1, 385.00, '2024-02-20', 'validated', 'user3'),

-- Novembre 2024
(26, 69, 3, 830.00, '2024-11-05', 'validated', 'user3'),
(1, 19, 1, 355.00, '2024-11-12', 'validated', 'user7'),
(2, 19, 1, 455.00, '2024-11-18', 'validated', 'user7'),

-- Septembre 2024
(6, 19, 1, 275.00, '2024-09-22', 'validated', 'user7'),
(13, 19, 1, 415.00, '2024-09-08', 'validated', 'user7'),
(14, 19, 1, 295.00, '2024-09-15', 'validated', 'user7'),

-- ========================================
-- 500 NOUVELLES ENTRÉES DE PRIX AVEC VARIATIONS
-- ========================================

-- AUJOURD'HUI - 3 octobre 2025 (Prix de référence actuels)
(1, 46, 1, 385.00, '2025-10-03', 'validated', 'user1'),
(2, 46, 1, 485.00, '2025-10-03', 'validated', 'user1'),
(6, 46, 1, 305.00, '2025-10-03', 'validated', 'user1'),
(13, 46, 1, 455.00, '2025-10-03', 'validated', 'user1'),
(14, 46, 1, 325.00, '2025-10-03', 'validated', 'user1'),
(23, 46, 1, 285.00, '2025-10-03', 'validated', 'user1'),
(3, 46, 1, 545.00, '2025-10-03', 'validated', 'user1'),
(4, 46, 1, 445.00, '2025-10-03', 'validated', 'user1'),
(5, 46, 1, 405.00, '2025-10-03', 'validated', 'user1'),
(7, 46, 1, 245.00, '2025-10-03', 'validated', 'user1'),
(8, 46, 1, 305.00, '2025-10-03', 'validated', 'user1'),
(9, 46, 1, 705.00, '2025-10-03', 'validated', 'user1'),
(10, 46, 1, 785.00, '2025-10-03', 'validated', 'user1'),
(11, 46, 1, 805.00, '2025-10-03', 'validated', 'user1'),
(15, 46, 1, 1455.00, '2025-10-03', 'validated', 'user1'),
(16, 46, 1, 605.00, '2025-10-03', 'validated', 'user1'),
(18, 46, 1, 375.00, '2025-10-03', 'validated', 'user1'),
(19, 46, 1, 395.00, '2025-10-03', 'validated', 'user1'),
(21, 46, 1, 265.00, '2025-10-03', 'validated', 'user1'),
(24, 46, 1, 345.00, '2025-10-03', 'validated', 'user1'),

-- HIER - 2 octobre 2025 (Variations légères -5% à +8%)
(1, 60, 1, 375.00, '2025-10-02', 'validated', 'user2'),
(2, 60, 1, 475.00, '2025-10-02', 'validated', 'user2'),
(6, 60, 1, 298.00, '2025-10-02', 'validated', 'user2'),
(13, 60, 1, 465.00, '2025-10-02', 'validated', 'user2'),
(14, 60, 1, 318.00, '2025-10-02', 'validated', 'user2'),
(23, 60, 1, 278.00, '2025-10-02', 'validated', 'user2'),
(3, 60, 1, 535.00, '2025-10-02', 'validated', 'user2'),
(4, 60, 1, 435.00, '2025-10-02', 'validated', 'user2'),
(5, 60, 1, 395.00, '2025-10-02', 'validated', 'user2'),
(7, 60, 1, 240.00, '2025-10-02', 'validated', 'user2'),
(8, 60, 1, 295.00, '2025-10-02', 'validated', 'user2'),
(9, 60, 1, 695.00, '2025-10-02', 'validated', 'user2'),
(10, 60, 1, 775.00, '2025-10-02', 'validated', 'user2'),
(11, 60, 1, 795.00, '2025-10-02', 'validated', 'user2'),
(15, 60, 1, 1445.00, '2025-10-02', 'validated', 'user2'),
(16, 60, 1, 595.00, '2025-10-02', 'validated', 'user2'),
(18, 60, 1, 365.00, '2025-10-02', 'validated', 'user2'),
(19, 60, 1, 385.00, '2025-10-02', 'validated', 'user2'),
(21, 60, 1, 255.00, '2025-10-02', 'validated', 'user2'),
(24, 60, 1, 335.00, '2025-10-02', 'validated', 'user2'),

-- AVANT-HIER - 1er octobre 2025 (Variations moyennes -10% à +12%)
(1, 69, 1, 365.00, '2025-10-01', 'validated', 'user3'),
(2, 69, 1, 465.00, '2025-10-01', 'validated', 'user3'),
(6, 69, 1, 290.00, '2025-10-01', 'validated', 'user3'),
(13, 69, 1, 475.00, '2025-10-01', 'validated', 'user3'),
(14, 69, 1, 310.00, '2025-10-01', 'validated', 'user3'),
(23, 69, 1, 270.00, '2025-10-01', 'validated', 'user3'),
(3, 69, 1, 525.00, '2025-10-01', 'validated', 'user3'),
(4, 69, 1, 425.00, '2025-10-01', 'validated', 'user3'),
(5, 69, 1, 385.00, '2025-10-01', 'validated', 'user3'),
(7, 69, 1, 235.00, '2025-10-01', 'validated', 'user3'),
(8, 69, 1, 285.00, '2025-10-01', 'validated', 'user3'),
(9, 69, 1, 685.00, '2025-10-01', 'validated', 'user3'),
(10, 69, 1, 765.00, '2025-10-01', 'validated', 'user3'),
(11, 69, 1, 785.00, '2025-10-01', 'validated', 'user3'),
(15, 69, 1, 1435.00, '2025-10-01', 'validated', 'user3'),
(16, 69, 1, 585.00, '2025-10-01', 'validated', 'user3'),
(18, 69, 1, 355.00, '2025-10-01', 'validated', 'user3'),
(19, 69, 1, 375.00, '2025-10-01', 'validated', 'user3'),
(21, 69, 1, 245.00, '2025-10-01', 'validated', 'user3'),
(24, 69, 1, 325.00, '2025-10-01', 'validated', 'user3'),

-- SEMAINE DERNIÈRE (25-30 septembre 2025) - Variations importantes
(1, 17, 1, 355.00, '2025-09-30', 'validated', 'user4'),
(2, 17, 1, 455.00, '2025-09-30', 'validated', 'user4'),
(6, 17, 1, 280.00, '2025-09-30', 'validated', 'user4'),
(13, 17, 1, 485.00, '2025-09-30', 'validated', 'user4'),
(14, 17, 1, 300.00, '2025-09-30', 'validated', 'user4'),
(23, 17, 1, 260.00, '2025-09-30', 'validated', 'user4'),
(3, 17, 1, 515.00, '2025-09-29', 'validated', 'user4'),
(4, 17, 1, 415.00, '2025-09-29', 'validated', 'user4'),
(5, 17, 1, 375.00, '2025-09-29', 'validated', 'user4'),
(7, 17, 1, 225.00, '2025-09-29', 'validated', 'user4'),
(8, 17, 1, 275.00, '2025-09-28', 'validated', 'user4'),
(9, 17, 1, 675.00, '2025-09-28', 'validated', 'user4'),
(10, 17, 1, 755.00, '2025-09-27', 'validated', 'user4'),
(11, 17, 1, 775.00, '2025-09-27', 'validated', 'user4'),
(15, 17, 1, 1425.00, '2025-09-26', 'validated', 'user4'),
(16, 17, 1, 575.00, '2025-09-26', 'validated', 'user4'),
(18, 17, 1, 345.00, '2025-09-25', 'validated', 'user4'),
(19, 17, 1, 365.00, '2025-09-25', 'validated', 'user4'),
(21, 17, 1, 235.00, '2025-09-25', 'validated', 'user4'),
(24, 17, 1, 315.00, '2025-09-25', 'validated', 'user4'),

-- IL Y A 2 SEMAINES (18-24 septembre 2025)
(1, 27, 1, 345.00, '2025-09-24', 'validated', 'user5'),
(2, 27, 1, 445.00, '2025-09-24', 'validated', 'user5'),
(6, 27, 1, 270.00, '2025-09-23', 'validated', 'user5'),
(13, 27, 1, 495.00, '2025-09-23', 'validated', 'user5'),
(14, 27, 1, 290.00, '2025-09-22', 'validated', 'user5'),
(23, 27, 1, 250.00, '2025-09-22', 'validated', 'user5'),
(3, 27, 1, 505.00, '2025-09-21', 'validated', 'user5'),
(4, 27, 1, 405.00, '2025-09-21', 'validated', 'user5'),
(5, 27, 1, 365.00, '2025-09-20', 'validated', 'user5'),
(7, 27, 1, 215.00, '2025-09-20', 'validated', 'user5'),
(8, 27, 1, 265.00, '2025-09-19', 'validated', 'user5'),
(9, 27, 1, 665.00, '2025-09-19', 'validated', 'user5'),
(10, 27, 1, 745.00, '2025-09-18', 'validated', 'user5'),
(11, 27, 1, 765.00, '2025-09-18', 'validated', 'user5'),
(15, 27, 1, 1415.00, '2025-09-18', 'validated', 'user5'),
(16, 27, 1, 565.00, '2025-09-18', 'validated', 'user5'),
(18, 27, 1, 335.00, '2025-09-18', 'validated', 'user5'),
(19, 27, 1, 355.00, '2025-09-18', 'validated', 'user5'),
(21, 27, 1, 225.00, '2025-09-18', 'validated', 'user5'),
(24, 27, 1, 305.00, '2025-09-18', 'validated', 'user5'),

-- IL Y A 3 SEMAINES (11-17 septembre 2025)
(1, 16, 1, 335.00, '2025-09-17', 'validated', 'user6'),
(2, 16, 1, 435.00, '2025-09-16', 'validated', 'user6'),
(6, 16, 1, 260.00, '2025-09-16', 'validated', 'user6'),
(13, 16, 1, 505.00, '2025-09-15', 'validated', 'user6'),
(14, 16, 1, 280.00, '2025-09-15', 'validated', 'user6'),
(23, 16, 1, 240.00, '2025-09-14', 'validated', 'user6'),
(3, 16, 1, 495.00, '2025-09-14', 'validated', 'user6'),
(4, 16, 1, 395.00, '2025-09-13', 'validated', 'user6'),
(5, 16, 1, 355.00, '2025-09-13', 'validated', 'user6'),
(7, 16, 1, 205.00, '2025-09-12', 'validated', 'user6'),
(8, 16, 1, 255.00, '2025-09-12', 'validated', 'user6'),
(9, 16, 1, 655.00, '2025-09-11', 'validated', 'user6'),
(10, 16, 1, 735.00, '2025-09-11', 'validated', 'user6'),
(11, 16, 1, 755.00, '2025-09-11', 'validated', 'user6'),
(15, 16, 1, 1405.00, '2025-09-11', 'validated', 'user6'),
(16, 16, 1, 555.00, '2025-09-11', 'validated', 'user6'),
(18, 16, 1, 325.00, '2025-09-11', 'validated', 'user6'),
(19, 16, 1, 345.00, '2025-09-11', 'validated', 'user6'),
(21, 16, 1, 215.00, '2025-09-11', 'validated', 'user6'),
(24, 16, 1, 295.00, '2025-09-11', 'validated', 'user6'),

-- MOIS DERNIER - SEPTEMBRE 2025 (Début du mois)
(1, 19, 1, 325.00, '2025-09-10', 'validated', 'user7'),
(2, 19, 1, 425.00, '2025-09-09', 'validated', 'user7'),
(6, 19, 1, 250.00, '2025-09-08', 'validated', 'user7'),
(13, 19, 1, 515.00, '2025-09-07', 'validated', 'user7'),
(14, 19, 1, 270.00, '2025-09-06', 'validated', 'user7'),
(23, 19, 1, 230.00, '2025-09-05', 'validated', 'user7'),
(3, 19, 1, 485.00, '2025-09-04', 'validated', 'user7'),
(4, 19, 1, 385.00, '2025-09-03', 'validated', 'user7'),
(5, 19, 1, 345.00, '2025-09-02', 'validated', 'user7'),
(7, 19, 1, 195.00, '2025-09-01', 'validated', 'user7'),
(8, 19, 1, 245.00, '2025-09-01', 'validated', 'user7'),
(9, 19, 1, 645.00, '2025-09-01', 'validated', 'user7'),
(10, 19, 1, 725.00, '2025-09-01', 'validated', 'user7'),
(11, 19, 1, 745.00, '2025-09-01', 'validated', 'user7'),
(15, 19, 1, 1395.00, '2025-09-01', 'validated', 'user7'),
(16, 19, 1, 545.00, '2025-09-01', 'validated', 'user7'),
(18, 19, 1, 315.00, '2025-09-01', 'validated', 'user7'),
(19, 19, 1, 335.00, '2025-09-01', 'validated', 'user7'),
(21, 19, 1, 205.00, '2025-09-01', 'validated', 'user7'),
(24, 19, 1, 285.00, '2025-09-01', 'validated', 'user7'),

-- AOÛT 2025 - Variations saisonnières importantes
(1, 46, 1, 315.00, '2025-08-31', 'validated', 'user1'),
(2, 46, 1, 415.00, '2025-08-30', 'validated', 'user1'),
(6, 46, 1, 240.00, '2025-08-29', 'validated', 'user1'),
(13, 46, 1, 525.00, '2025-08-28', 'validated', 'user1'),
(14, 46, 1, 260.00, '2025-08-27', 'validated', 'user1'),
(23, 46, 1, 220.00, '2025-08-26', 'validated', 'user1'),
(3, 46, 1, 475.00, '2025-08-25', 'validated', 'user1'),
(4, 46, 1, 375.00, '2025-08-24', 'validated', 'user1'),
(5, 46, 1, 335.00, '2025-08-23', 'validated', 'user1'),
(7, 46, 1, 185.00, '2025-08-22', 'validated', 'user1'),
(8, 46, 1, 235.00, '2025-08-21', 'validated', 'user1'),
(9, 46, 1, 635.00, '2025-08-20', 'validated', 'user1'),
(10, 46, 1, 715.00, '2025-08-19', 'validated', 'user1'),
(11, 46, 1, 735.00, '2025-08-18', 'validated', 'user1'),
(15, 46, 1, 1385.00, '2025-08-17', 'validated', 'user1'),
(16, 46, 1, 535.00, '2025-08-16', 'validated', 'user1'),
(18, 46, 1, 305.00, '2025-08-15', 'validated', 'user1'),
(19, 46, 1, 325.00, '2025-08-14', 'validated', 'user1'),
(21, 46, 1, 195.00, '2025-08-13', 'validated', 'user1'),
(24, 46, 1, 275.00, '2025-08-12', 'validated', 'user1'),

-- JUILLET 2025 - Milieu d'été
(1, 60, 1, 305.00, '2025-07-31', 'validated', 'user2'),
(2, 60, 1, 405.00, '2025-07-30', 'validated', 'user2'),
(6, 60, 1, 230.00, '2025-07-29', 'validated', 'user2'),
(13, 60, 1, 535.00, '2025-07-28', 'validated', 'user2'),
(14, 60, 1, 250.00, '2025-07-27', 'validated', 'user2'),
(23, 60, 1, 210.00, '2025-07-26', 'validated', 'user2'),
(3, 60, 1, 465.00, '2025-07-25', 'validated', 'user2'),
(4, 60, 1, 365.00, '2025-07-24', 'validated', 'user2'),
(5, 60, 1, 325.00, '2025-07-23', 'validated', 'user2'),
(7, 60, 1, 175.00, '2025-07-22', 'validated', 'user2'),
(8, 60, 1, 225.00, '2025-07-21', 'validated', 'user2'),
(9, 60, 1, 625.00, '2025-07-20', 'validated', 'user2'),
(10, 60, 1, 705.00, '2025-07-19', 'validated', 'user2'),
(11, 60, 1, 725.00, '2025-07-18', 'validated', 'user2'),
(15, 60, 1, 1375.00, '2025-07-17', 'validated', 'user2'),
(16, 60, 1, 525.00, '2025-07-16', 'validated', 'user2'),
(18, 60, 1, 295.00, '2025-07-15', 'validated', 'user2'),
(19, 60, 1, 315.00, '2025-07-14', 'validated', 'user2'),
(21, 60, 1, 185.00, '2025-07-13', 'validated', 'user2'),
(24, 60, 1, 265.00, '2025-07-12', 'validated', 'user2'),

-- JUIN 2025 - Début d'été
(1, 69, 1, 295.00, '2025-06-30', 'validated', 'user3'),
(2, 69, 1, 395.00, '2025-06-29', 'validated', 'user3'),
(6, 69, 1, 220.00, '2025-06-28', 'validated', 'user3'),
(13, 69, 1, 545.00, '2025-06-27', 'validated', 'user3'),
(14, 69, 1, 240.00, '2025-06-26', 'validated', 'user3'),
(23, 69, 1, 200.00, '2025-06-25', 'validated', 'user3'),
(3, 69, 1, 455.00, '2025-06-24', 'validated', 'user3'),
(4, 69, 1, 355.00, '2025-06-23', 'validated', 'user3'),
(5, 69, 1, 315.00, '2025-06-22', 'validated', 'user3'),
(7, 69, 1, 165.00, '2025-06-21', 'validated', 'user3'),
(8, 69, 1, 215.00, '2025-06-20', 'validated', 'user3'),
(9, 69, 1, 615.00, '2025-06-19', 'validated', 'user3'),
(10, 69, 1, 695.00, '2025-06-18', 'validated', 'user3'),
(11, 69, 1, 715.00, '2025-06-17', 'validated', 'user3'),
(15, 69, 1, 1365.00, '2025-06-16', 'validated', 'user3'),
(16, 69, 1, 515.00, '2025-06-15', 'validated', 'user3'),
(18, 69, 1, 285.00, '2025-06-14', 'validated', 'user3'),
(19, 69, 1, 305.00, '2025-06-13', 'validated', 'user3'),
(21, 69, 1, 175.00, '2025-06-12', 'validated', 'user3'),
(24, 69, 1, 255.00, '2025-06-11', 'validated', 'user3'),

-- MAI 2025 - Printemps
(1, 17, 1, 285.00, '2025-05-31', 'validated', 'user4'),
(2, 17, 1, 385.00, '2025-05-30', 'validated', 'user4'),
(6, 17, 1, 210.00, '2025-05-29', 'validated', 'user4'),
(13, 17, 1, 555.00, '2025-05-28', 'validated', 'user4'),
(14, 17, 1, 230.00, '2025-05-27', 'validated', 'user4'),
(23, 17, 1, 190.00, '2025-05-26', 'validated', 'user4'),
(3, 17, 1, 445.00, '2025-05-25', 'validated', 'user4'),
(4, 17, 1, 345.00, '2025-05-24', 'validated', 'user4'),
(5, 17, 1, 305.00, '2025-05-23', 'validated', 'user4'),
(7, 17, 1, 155.00, '2025-05-22', 'validated', 'user4'),
(8, 17, 1, 205.00, '2025-05-21', 'validated', 'user4'),
(9, 17, 1, 605.00, '2025-05-20', 'validated', 'user4'),
(10, 17, 1, 685.00, '2025-05-19', 'validated', 'user4'),
(11, 17, 1, 705.00, '2025-05-18', 'validated', 'user4'),
(15, 17, 1, 1355.00, '2025-05-17', 'validated', 'user4'),
(16, 17, 1, 505.00, '2025-05-16', 'validated', 'user4'),
(18, 17, 1, 275.00, '2025-05-15', 'validated', 'user4'),
(19, 17, 1, 295.00, '2025-05-14', 'validated', 'user4'),
(21, 17, 1, 165.00, '2025-05-13', 'validated', 'user4'),
(24, 17, 1, 245.00, '2025-05-12', 'validated', 'user4'),

-- AVRIL 2025 - Printemps
(1, 27, 1, 275.00, '2025-04-30', 'validated', 'user5'),
(2, 27, 1, 375.00, '2025-04-29', 'validated', 'user5'),
(6, 27, 1, 200.00, '2025-04-28', 'validated', 'user5'),
(13, 27, 1, 565.00, '2025-04-27', 'validated', 'user5'),
(14, 27, 1, 220.00, '2025-04-26', 'validated', 'user5'),
(23, 27, 1, 180.00, '2025-04-25', 'validated', 'user5'),
(3, 27, 1, 435.00, '2025-04-24', 'validated', 'user5'),
(4, 27, 1, 335.00, '2025-04-23', 'validated', 'user5'),
(5, 27, 1, 295.00, '2025-04-22', 'validated', 'user5'),
(7, 27, 1, 145.00, '2025-04-21', 'validated', 'user5'),
(8, 27, 1, 195.00, '2025-04-20', 'validated', 'user5'),
(9, 27, 1, 595.00, '2025-04-19', 'validated', 'user5'),
(10, 27, 1, 675.00, '2025-04-18', 'validated', 'user5'),
(11, 27, 1, 695.00, '2025-04-17', 'validated', 'user5'),
(15, 27, 1, 1345.00, '2025-04-16', 'validated', 'user5'),
(16, 27, 1, 495.00, '2025-04-15', 'validated', 'user5'),
(18, 27, 1, 265.00, '2025-04-14', 'validated', 'user5'),
(19, 27, 1, 285.00, '2025-04-13', 'validated', 'user5'),
(21, 27, 1, 155.00, '2025-04-12', 'validated', 'user5'),
(24, 27, 1, 235.00, '2025-04-11', 'validated', 'user5'),

-- MARS 2025 - Fin d'hiver
(1, 16, 1, 265.00, '2025-03-31', 'validated', 'user6'),
(2, 16, 1, 365.00, '2025-03-30', 'validated', 'user6'),
(6, 16, 1, 190.00, '2025-03-29', 'validated', 'user6'),
(13, 16, 1, 575.00, '2025-03-28', 'validated', 'user6'),
(14, 16, 1, 210.00, '2025-03-27', 'validated', 'user6'),
(23, 16, 1, 170.00, '2025-03-26', 'validated', 'user6'),
(3, 16, 1, 425.00, '2025-03-25', 'validated', 'user6'),
(4, 16, 1, 325.00, '2025-03-24', 'validated', 'user6'),
(5, 16, 1, 285.00, '2025-03-23', 'validated', 'user6'),
(7, 16, 1, 135.00, '2025-03-22', 'validated', 'user6'),
(8, 16, 1, 185.00, '2025-03-21', 'validated', 'user6'),
(9, 16, 1, 585.00, '2025-03-20', 'validated', 'user6'),
(10, 16, 1, 665.00, '2025-03-19', 'validated', 'user6'),
(11, 16, 1, 685.00, '2025-03-18', 'validated', 'user6'),
(15, 16, 1, 1335.00, '2025-03-17', 'validated', 'user6'),
(16, 16, 1, 485.00, '2025-03-16', 'validated', 'user6'),
(18, 16, 1, 255.00, '2025-03-15', 'validated', 'user6'),
(19, 16, 1, 275.00, '2025-03-14', 'validated', 'user6'),
(21, 16, 1, 145.00, '2025-03-13', 'validated', 'user6'),
(24, 16, 1, 225.00, '2025-03-12', 'validated', 'user6'),

-- FÉVRIER 2025 - Hiver
(1, 19, 1, 255.00, '2025-02-28', 'validated', 'user7'),
(2, 19, 1, 355.00, '2025-02-27', 'validated', 'user7'),
(6, 19, 1, 180.00, '2025-02-26', 'validated', 'user7'),
(13, 19, 1, 585.00, '2025-02-25', 'validated', 'user7'),
(14, 19, 1, 200.00, '2025-02-24', 'validated', 'user7'),
(23, 19, 1, 160.00, '2025-02-23', 'validated', 'user7'),
(3, 19, 1, 415.00, '2025-02-22', 'validated', 'user7'),
(4, 19, 1, 315.00, '2025-02-21', 'validated', 'user7'),
(5, 19, 1, 275.00, '2025-02-20', 'validated', 'user7'),
(7, 19, 1, 125.00, '2025-02-19', 'validated', 'user7'),
(8, 19, 1, 175.00, '2025-02-18', 'validated', 'user7'),
(9, 19, 1, 575.00, '2025-02-17', 'validated', 'user7'),
(10, 19, 1, 655.00, '2025-02-16', 'validated', 'user7'),
(11, 19, 1, 675.00, '2025-02-15', 'validated', 'user7'),
(15, 19, 1, 1325.00, '2025-02-14', 'validated', 'user7'),
(16, 19, 1, 475.00, '2025-02-13', 'validated', 'user7'),
(18, 19, 1, 245.00, '2025-02-12', 'validated', 'user7'),
(19, 19, 1, 265.00, '2025-02-11', 'validated', 'user7'),
(21, 19, 1, 135.00, '2025-02-10', 'validated', 'user7'),
(24, 19, 1, 215.00, '2025-02-09', 'validated', 'user7'),

-- JANVIER 2025 - Début d'année
(1, 46, 1, 245.00, '2025-01-31', 'validated', 'user1'),
(2, 46, 1, 345.00, '2025-01-30', 'validated', 'user1'),
(6, 46, 1, 170.00, '2025-01-29', 'validated', 'user1'),
(13, 46, 1, 595.00, '2025-01-28', 'validated', 'user1'),
(14, 46, 1, 190.00, '2025-01-27', 'validated', 'user1'),
(23, 46, 1, 150.00, '2025-01-26', 'validated', 'user1'),
(3, 46, 1, 405.00, '2025-01-25', 'validated', 'user1'),
(4, 46, 1, 305.00, '2025-01-24', 'validated', 'user1'),
(5, 46, 1, 265.00, '2025-01-23', 'validated', 'user1'),
(7, 46, 1, 115.00, '2025-01-22', 'validated', 'user1'),
(8, 46, 1, 165.00, '2025-01-21', 'validated', 'user1'),
(9, 46, 1, 565.00, '2025-01-20', 'validated', 'user1'),
(10, 46, 1, 645.00, '2025-01-19', 'validated', 'user1'),
(11, 46, 1, 665.00, '2025-01-18', 'validated', 'user1'),
(15, 46, 1, 1315.00, '2025-01-17', 'validated', 'user1'),
(16, 46, 1, 465.00, '2025-01-16', 'validated', 'user1'),
(18, 46, 1, 235.00, '2025-01-15', 'validated', 'user1'),
(19, 46, 1, 255.00, '2025-01-14', 'validated', 'user1'),
(21, 46, 1, 125.00, '2025-01-13', 'validated', 'user1'),
(24, 46, 1, 205.00, '2025-01-12', 'validated', 'user1'),

-- DÉCEMBRE 2024 - Fin d'année précédente
(1, 60, 1, 235.00, '2024-12-31', 'validated', 'user2'),
(2, 60, 1, 335.00, '2024-12-30', 'validated', 'user2'),
(6, 60, 1, 160.00, '2024-12-29', 'validated', 'user2'),
(13, 60, 1, 605.00, '2024-12-28', 'validated', 'user2'),
(14, 60, 1, 180.00, '2024-12-27', 'validated', 'user2'),
(23, 60, 1, 140.00, '2024-12-26', 'validated', 'user2'),
(3, 60, 1, 395.00, '2024-12-25', 'validated', 'user2'),
(4, 60, 1, 295.00, '2024-12-24', 'validated', 'user2'),
(5, 60, 1, 255.00, '2024-12-23', 'validated', 'user2'),
(7, 60, 1, 105.00, '2024-12-22', 'validated', 'user2'),
(8, 60, 1, 155.00, '2024-12-21', 'validated', 'user2'),
(9, 60, 1, 555.00, '2024-12-20', 'validated', 'user2'),
(10, 60, 1, 635.00, '2024-12-19', 'validated', 'user2'),
(11, 60, 1, 655.00, '2024-12-18', 'validated', 'user2'),
(15, 60, 1, 1305.00, '2024-12-17', 'validated', 'user2'),
(16, 60, 1, 455.00, '2024-12-16', 'validated', 'user2'),
(18, 60, 1, 225.00, '2024-12-15', 'validated', 'user2'),
(19, 60, 1, 245.00, '2024-12-14', 'validated', 'user2'),
(21, 60, 1, 115.00, '2024-12-13', 'validated', 'user2'),
(24, 60, 1, 195.00, '2024-12-12', 'validated', 'user2');

-- ======================================================
-- Fournisseurs et prix mensuels 2025 (janvier → 10 octobre)
-- ======================================================

-- Création des fournisseurs (associés aux localités clés)
INSERT OR IGNORE INTO suppliers (name, type, contact_phone, contact_email, address, locality_id) VALUES
-- Cotonou (46)
('Ferme Adjovi', 'producteur', '+229 21 00 00 11', 'ferme.adjovi@lokali.bj', 'Cotonou', 46),
('Atelier de Transformation Soja Cotonou', 'transformateur', '+229 21 00 00 12', 'atelier.soja.cotonou@lokali.bj', 'Cotonou', 46),
('Coopérative Maraîchers Cotonou', 'cooperative', '+229 21 00 00 13', 'coop.maraichers.cotonou@lokali.bj', 'Cotonou', 46),
-- Porto-Novo (60)
('Ferme Kpodo', 'producteur', '+229 20 00 00 21', 'ferme.kpodo@lokali.bj', 'Porto-Novo', 60),
('Huilerie Porto-Novo', 'transformateur', '+229 20 00 00 22', 'huilerie.porto@lokali.bj', 'Porto-Novo', 60),
('Coopérative Riziculteurs Porto-Novo', 'cooperative', '+229 20 00 00 23', 'coop.riz.porto@lokali.bj', 'Porto-Novo', 60);

-- Insertion des prix mensuels 2025 pour Cotonou (46) et Porto-Novo (60)
WITH months(mdate) AS (
  VALUES ('2025-01-10'), ('2025-02-10'), ('2025-03-10'), ('2025-04-10'),
         ('2025-05-10'), ('2025-06-10'), ('2025-07-10'), ('2025-08-10'),
         ('2025-09-10'), ('2025-10-10')
),
products(product_id, unit_id, base_price) AS (
  VALUES 
    (1, 1, 320.00),  -- Maïs (kg)
    (2, 1, 450.00),  -- Riz paddy (kg)
    (6, 1, 280.00),  -- Igname (kg)
    (13, 1, 500.00), -- Tomate (kg)
    (14, 1, 300.00), -- Oignon (kg)
    (23, 1, 260.00), -- Gari (kg)
    (26, 3, 800.00)  -- Huile de palme (l)
),
locs(locality_id, price_factor) AS (
  VALUES (46, 1.00), (60, 1.05) -- Porto-Novo légèrement plus cher
)
INSERT INTO prices (product_id, locality_id, unit_id, price, date, status, submitted_by)
SELECT p.product_id,
       l.locality_id,
       p.unit_id,
       ROUND(p.base_price * l.price_factor, 2) AS price,
       m.mdate,
       'validated',
       'seed'
FROM months m
CROSS JOIN products p
CROSS JOIN locs l;

-- Lier les derniers prix (10 octobre) aux fournisseurs correspondants
INSERT OR IGNORE INTO supplier_prices (supplier_id, product_id, locality_id, price_id)
SELECT s.id AS supplier_id,
       pr.product_id,
       pr.locality_id,
       pr.id AS price_id
FROM suppliers s
JOIN prices pr ON pr.locality_id = s.locality_id
WHERE pr.date = '2025-10-10';

-- ======================================================
-- Disponibilités actuelles par fournisseur et produit
-- ======================================================

-- Ferme Adjovi → Maïs
INSERT OR IGNORE INTO supplier_product_availability (
  supplier_id, product_id, is_available, available_quantity, quantity_unit,
  expected_restock_date, available_from, available_until, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Maïs'),
       1,
       1500,
       'kg',
       '2025-10-25',
       '2025-10-12',
       '2025-10-20',
       'Récolte en cours'
FROM suppliers s WHERE s.name = 'Ferme Adjovi';

INSERT OR IGNORE INTO supplier_product_availability_history (
  supplier_id, product_id, date, is_available, available_quantity, quantity_unit,
  expected_restock_date, period_start, period_end, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Maïs'),
       '2025-10-12',
       1,
       1500,
       'kg',
       '2025-10-25',
       '2025-10-12',
       '2025-10-20',
       'Annonce de disponibilité'
FROM suppliers s WHERE s.name = 'Ferme Adjovi';

-- Atelier de Transformation Soja Cotonou → Soja
INSERT OR IGNORE INTO supplier_product_availability (
  supplier_id, product_id, is_available, available_quantity, quantity_unit,
  expected_restock_date, available_from, available_until, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Soja'),
       1,
       2000,
       'kg',
       '2025-10-22',
       '2025-10-08',
       '2025-10-18',
       'Lots de soja transformable disponibles'
FROM suppliers s WHERE s.name = 'Atelier de Transformation Soja Cotonou';

INSERT OR IGNORE INTO supplier_product_availability_history (
  supplier_id, product_id, date, is_available, available_quantity, quantity_unit,
  expected_restock_date, period_start, period_end, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Soja'),
       '2025-10-08',
       1,
       2000,
       'kg',
       '2025-10-22',
       '2025-10-08',
       '2025-10-18',
       'Annonce de disponibilité'
FROM suppliers s WHERE s.name = 'Atelier de Transformation Soja Cotonou';

-- Coopérative Maraîchers Cotonou → Tomate
INSERT OR IGNORE INTO supplier_product_availability (
  supplier_id, product_id, is_available, available_quantity, quantity_unit,
  expected_restock_date, available_from, available_until, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Tomate'),
       1,
       1200,
       'kg',
       '2025-10-21',
       '2025-10-10',
       '2025-10-17',
       'Production maraîchère en cours'
FROM suppliers s WHERE s.name = 'Coopérative Maraîchers Cotonou';

INSERT OR IGNORE INTO supplier_product_availability_history (
  supplier_id, product_id, date, is_available, available_quantity, quantity_unit,
  expected_restock_date, period_start, period_end, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Tomate'),
       '2025-10-10',
       1,
       1200,
       'kg',
       '2025-10-21',
       '2025-10-10',
       '2025-10-17',
       'Annonce de disponibilité'
FROM suppliers s WHERE s.name = 'Coopérative Maraîchers Cotonou';

-- Ferme Kpodo → Igname
INSERT OR IGNORE INTO supplier_product_availability (
  supplier_id, product_id, is_available, available_quantity, quantity_unit,
  expected_restock_date, available_from, available_until, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Igname'),
       1,
       2500,
       'kg',
       '2025-10-28',
       '2025-10-11',
       '2025-10-23',
       'Récolte en cours'
FROM suppliers s WHERE s.name = 'Ferme Kpodo';

INSERT OR IGNORE INTO supplier_product_availability_history (
  supplier_id, product_id, date, is_available, available_quantity, quantity_unit,
  expected_restock_date, period_start, period_end, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Igname'),
       '2025-10-11',
       1,
       2500,
       'kg',
       '2025-10-28',
       '2025-10-11',
       '2025-10-23',
       'Annonce de disponibilité'
FROM suppliers s WHERE s.name = 'Ferme Kpodo';

-- Huilerie Porto-Novo → Huile de palme
INSERT OR IGNORE INTO supplier_product_availability (
  supplier_id, product_id, is_available, available_quantity, quantity_unit,
  expected_restock_date, available_from, available_until, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Huile de palme'),
       1,
       300,
       'l',
       '2025-10-24',
       '2025-10-09',
       '2025-10-19',
       'Production locale en cours'
FROM suppliers s WHERE s.name = 'Huilerie Porto-Novo';

INSERT OR IGNORE INTO supplier_product_availability_history (
  supplier_id, product_id, date, is_available, available_quantity, quantity_unit,
  expected_restock_date, period_start, period_end, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Huile de palme'),
       '2025-10-09',
       1,
       300,
       'l',
       '2025-10-24',
       '2025-10-09',
       '2025-10-19',
       'Annonce de disponibilité'
FROM suppliers s WHERE s.name = 'Huilerie Porto-Novo';

-- Coopérative Riziculteurs Porto-Novo → Riz paddy
INSERT OR IGNORE INTO supplier_product_availability (
  supplier_id, product_id, is_available, available_quantity, quantity_unit,
  expected_restock_date, available_from, available_until, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Riz paddy'),
       1,
       4000,
       'kg',
       '2025-10-26',
       '2025-10-07',
       '2025-10-20',
       'Récolte en cours'
FROM suppliers s WHERE s.name = 'Coopérative Riziculteurs Porto-Novo';

INSERT OR IGNORE INTO supplier_product_availability_history (
  supplier_id, product_id, date, is_available, available_quantity, quantity_unit,
  expected_restock_date, period_start, period_end, notes
)
SELECT s.id,
       (SELECT id FROM products WHERE name = 'Riz paddy'),
       '2025-10-07',
       1,
       4000,
       'kg',
       '2025-10-26',
       '2025-10-07',
       '2025-10-20',
       'Annonce de disponibilité'
FROM suppliers s WHERE s.name = 'Coopérative Riziculteurs Porto-Novo';