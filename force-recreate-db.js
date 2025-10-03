const fs = require('fs');
const path = require('path');
const db = require('./database/connection');

async function forceRecreateDB() {
  try {
    console.log('Suppression forcée de la base de données...');
    
    // Supprimer le fichier de base de données
    const dbPath = path.join(__dirname, 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Fichier de base de données supprimé');
    }
    
    // Recréer la base de données
    console.log('Recréation de la base de données...');
    
    // Exécuter le schéma
    const schemaPath = path.join(__dirname, 'database', 'sqlite-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schemaSQL);
    console.log('Schéma exécuté avec succès.');

    // Exécuter les données
    const dataPath = path.join(__dirname, 'database', 'sqlite-data.sql');
    const dataSQL = fs.readFileSync(dataPath, 'utf8');
    await db.exec(dataSQL);
    console.log('Données insérées avec succès.');

    console.log('Base de données recréée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la recréation de la DB:', error);
  }
}

forceRecreateDB();
