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

-- Insertion des communes du Bénin par département
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
('Kandi', 4, 11.1342, 2.9386),
('Malanville', 4, 11.8667, 3.3833),
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
('Bopa', 9, 6.8667, 1.9667),
('Comè', 9, 6.4000, 1.8833),
('Grand-Popo', 9, 6.2833, 1.8167),
('Houéyogbé', 9, 6.5833, 1.9000),
('Lokossa', 9, 6.6386, 1.7175),
('Athiémé', 9, 6.5667, 1.6667),

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
(26, 'N''Dali', 1, 26),
(27, 'Nikki', 1, 27),
(28, 'Parakou', 1, 28),
(29, 'Pèrèrè', 1, 29),
(30, 'Sinendé', 1, 30),
(31, 'Tchaourou', 1, 31),
-- Collines
(32, 'Bantè', 1, 32),
(33, 'Dassa-Zoumè', 1, 33),
(34, 'Glazoué', 1, 34),
(35, 'Ouèssè', 1, 35),
(36, 'Savalou', 1, 36),
(37, 'Savè', 1, 37),
-- Couffo
(38, 'Aplahoué', 1, 38),
(39, 'Djakotomey', 1, 39),
(40, 'Dogbo', 1, 40),
(41, 'Klouékanmè', 1, 41),
(42, 'Lalo', 1, 42),
(43, 'Toviklin', 1, 43),
-- Donga
(44, 'Bassila', 1, 44),
(45, 'Copargo', 1, 45),
(46, 'Djougou', 1, 46),
(47, 'Ouaké', 1, 47),
-- Littoral
(48, 'Cotonou', 1, 48),
-- Mono
(49, 'Athiémé', 1, 49),
(50, 'Bopa', 1, 50),
(51, 'Comè', 1, 51),
(52, 'Grand-Popo', 1, 52),
(53, 'Houéyogbé', 1, 53),
(54, 'Lokossa', 1, 54),
-- Ouémé
(55, 'Adjarra', 1, 55),
(56, 'Adjohoun', 1, 56),
(57, 'Aguégués', 1, 57),
(58, 'Akpro-Missérété', 1, 58),
(59, 'Avrankou', 1, 59),
(60, 'Bonou', 1, 60),
(61, 'Dangbo', 1, 61),
(62, 'Porto-Novo', 1, 62),
(63, 'Sèmè-Kpodji', 1, 63),
-- Plateau
(64, 'Adja-Ouèrè', 1, 64),
(65, 'Ifangni', 1, 65),
(66, 'Kétou', 1, 66),
(67, 'Pobè', 1, 67),
(68, 'Sakété', 1, 68),
-- Zou
(69, 'Abomey', 1, 69),
(70, 'Agbangnizoun', 1, 70),
(71, 'Bohicon', 1, 71),
(72, 'Cové', 1, 72),
(73, 'Djidja', 1, 73),
(74, 'Ouinhi', 1, 74),
(75, 'Za-Kpota', 1, 75),
(76, 'Zangnanado', 1, 76),
(77, 'Zogbodomey', 1, 77);

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
(2, 'Légumineuses', 1, 2),
(3, 'Légumes', 1, 3),
(4, 'Fruits', 1, 4),
(5, 'Tubercules', 1, 5),
(6, 'Produits transformés', 1, 6);

-- Insertion des options de filtres pour les périodes
INSERT OR IGNORE INTO filter_period_options (period_key, display_name, days_count, is_active, sort_order) VALUES
('today', 'Aujourd''hui', 1, 1, 1),
('week', 'Cette semaine', 7, 1, 2),
('month', 'Ce mois', 30, 1, 3),
('quarter', 'Ce trimestre', 90, 1, 4),
('year', 'Cette année', 365, 1, 5),
('all', 'Toutes les périodes', 0, 1, 6);

-- Insertion de quelques prix d'exemple pour les produits béninois
INSERT OR IGNORE INTO prices (product_id, locality_id, unit_id, price, date, status, submitted_by) VALUES
-- Maïs
(1, 48, 1, 350.00, '2024-01-15', 'validated', 'user1'),
(1, 62, 1, 340.00, '2024-01-15', 'validated', 'user2'),
(1, 71, 1, 320.00, '2024-01-15', 'validated', 'user3'),
-- Riz paddy
(2, 48, 1, 450.00, '2024-01-15', 'validated', 'user1'),
(2, 62, 1, 460.00, '2024-01-15', 'validated', 'user2'),
-- Igname
(6, 48, 1, 280.00, '2024-01-15', 'validated', 'user1'),
(6, 62, 1, 290.00, '2024-01-15', 'validated', 'user2'),
-- Tomate
(13, 48, 1, 400.00, '2024-01-15', 'validated', 'user1'),
(13, 62, 1, 420.00, '2024-01-15', 'validated', 'user2'),
-- Oignon
(14, 48, 1, 300.00, '2024-01-15', 'validated', 'user1'),
(14, 62, 1, 310.00, '2024-01-15', 'validated', 'user2'),
-- Gari
(23, 48, 1, 250.00, '2024-01-15', 'validated', 'user1'),
(23, 62, 1, 260.00, '2024-01-15', 'validated', 'user2'),
-- Huile de palme
(26, 48, 3, 800.00, '2024-01-15', 'validated', 'user1'),
(26, 62, 3, 820.00, '2024-01-15', 'validated', 'user2');