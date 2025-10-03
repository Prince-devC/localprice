const fs = require('fs');
const path = require('path');
const db = require('./database/connection');

async function cleanDB() {
  try {
    console.log('Nettoyage de la base de données...');
    
    // Supprimer toutes les tables dans l'ordre inverse des dépendances
    const dropQueries = [
      'DROP TABLE IF EXISTS audit_logs',
      'DROP TABLE IF EXISTS stores',
      'DROP TABLE IF EXISTS prices',
      'DROP TABLE IF EXISTS filter_period_options',
      'DROP TABLE IF EXISTS filter_category_options',
      'DROP TABLE IF EXISTS filter_region_options',
      'DROP TABLE IF EXISTS filter_locality_options',
      'DROP TABLE IF EXISTS filter_product_options',
      'DROP TABLE IF EXISTS units',
      'DROP TABLE IF EXISTS localities',
      'DROP TABLE IF EXISTS regions',
      'DROP TABLE IF EXISTS products',
      'DROP TABLE IF EXISTS product_categories',
      'DROP TABLE IF EXISTS users'
    ];

    for (const query of dropQueries) {
      await db.exec(query);
    }

    console.log('Base de données nettoyée avec succès!');
  } catch (error) {
    console.error('Erreur lors du nettoyage de la DB:', error);
  }
}

cleanDB();
