-- Script SQL pour corriger les séquences désynchronisées des tables clés
-- À exécuter dans Supabase SQL Editor

-- =====================
-- Diagnostics ciblés
-- =====================
SELECT 'units' AS table_name, COUNT(*) AS count, COALESCE(MAX(id), 0) AS max_id FROM units;
SELECT 'product_categories' AS table_name, COUNT(*) AS count, COALESCE(MAX(id), 0) AS max_id FROM product_categories;
SELECT 'products' AS table_name, COUNT(*) AS count, COALESCE(MAX(id), 0) AS max_id FROM products;

-- Afficher les valeurs actuelles des séquences
SELECT 'units' AS table_name, last_value AS current_sequence_value FROM units_id_seq;
SELECT 'product_categories' AS table_name, last_value AS current_sequence_value FROM product_categories_id_seq;
SELECT 'products' AS table_name, last_value AS current_sequence_value FROM products_id_seq;

-- =====================
-- Corrections ciblées
-- =====================
-- Mettre la séquence sur MAX(id) et marquer is_called = true
-- Ainsi le prochain nextval() retournera MAX(id) + 1
SELECT setval(pg_get_serial_sequence('units','id'), COALESCE((SELECT MAX(id) FROM units), 0), true);
SELECT setval(pg_get_serial_sequence('product_categories','id'), COALESCE((SELECT MAX(id) FROM product_categories), 0), true);
SELECT setval(pg_get_serial_sequence('products','id'), COALESCE((SELECT MAX(id) FROM products), 0), true);

-- Vérification post-correction
SELECT 'units' AS table_name, last_value AS new_sequence_value FROM units_id_seq;
SELECT 'product_categories' AS table_name, last_value AS new_sequence_value FROM product_categories_id_seq;
SELECT 'products' AS table_name, last_value AS new_sequence_value FROM products_id_seq;

-- Prévision du prochain ID (sans appeler nextval())
SELECT 'units' AS table_name, (SELECT last_value FROM units_id_seq) + 1 AS next_id_to_generate;
SELECT 'product_categories' AS table_name, (SELECT last_value FROM product_categories_id_seq) + 1 AS next_id_to_generate;
SELECT 'products' AS table_name, (SELECT last_value FROM products_id_seq) + 1 AS next_id_to_generate;

-- =====================
-- Option: Correction globale de toutes les séquences (schéma public)
-- =====================
-- Décommentez le bloc DO ci-dessous si vous souhaitez synchroniser toutes les tables
-- ayant une colonne 'id' de type SERIAL dans le schéma public.
-- Ce bloc prend MAX(id) de chaque table et applique setval(seq, max_id, true).
--
-- DO $$
-- DECLARE r RECORD;
-- BEGIN
--   FOR r IN (
--     SELECT 
--       c.table_name,
--       pg_get_serial_sequence(c.table_name, c.column_name) AS seq_name
--     FROM information_schema.columns c
--     WHERE c.table_schema = 'public' AND c.column_name = 'id'
--   ) LOOP
--     IF r.seq_name IS NOT NULL THEN
--       EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(id) FROM %I), 0), true);', r.seq_name, r.table_name);
--     END IF;
--   END LOOP;
-- END $$;