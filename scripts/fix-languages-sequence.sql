-- Script SQL pour corriger la séquence désynchronisée de la table languages
-- À exécuter dans l'interface Supabase SQL Editor

-- 1. Diagnostic : Vérifier l'état actuel
SELECT 
    'Langues existantes' as diagnostic,
    COUNT(*) as count,
    COALESCE(MAX(id), 0) as max_id
FROM languages;

SELECT 
    'Séquence actuelle' as diagnostic,
    last_value as current_sequence_value
FROM languages_id_seq;

-- 2. Correction : Synchroniser la séquence avec l'ID maximum
-- Cette commande met à jour la séquence pour qu'elle génère des IDs
-- supérieurs à l'ID maximum existant
-- Ajustement recommandé :
-- Mettre la séquence sur MAX(id) et marquer is_called = true,
-- ainsi le prochain nextval() retournera MAX(id) + 1
SELECT setval('languages_id_seq', COALESCE((SELECT MAX(id) FROM languages), 0), true);

-- 3. Vérification : Tester que la séquence fonctionne correctement
SELECT 
    'Séquence après correction' as diagnostic,
    last_value as new_sequence_value
FROM languages_id_seq;

-- 4. Test : Simuler le prochain ID qui sera généré (sans l'incrémenter)
-- 4. Prévision : Afficher quel sera le prochain ID sans appeler nextval()
SELECT 
    'Prochain ID (prévision)' as diagnostic,
    (SELECT last_value FROM languages_id_seq) + 1 AS next_id_to_generate;

-- Note: Si tu veux tester l'insertion d'une nouvelle langue après cette correction,
-- tu peux utiliser cette requête (décommente-la si nécessaire) :
-- INSERT INTO languages (name) VALUES ('Test Language');
-- SELECT * FROM languages WHERE name = 'Test Language';
-- DELETE FROM languages WHERE name = 'Test Language';