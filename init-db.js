const fs = require('fs');
const path = require('path');
const db = require('./database/connection');

async function initDB() {
  try {
    // Créer ou ouvrir la base de données (elle sera créée si elle n'existe pas)
    console.log('Connexion à la base de données...');

    // Exécuter le schéma
    const schemaPath = path.join(__dirname, 'database', 'sqlite-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schemaSQL);
    console.log('Schéma exécuté avec succès.');

    // Exécuter les données si disponible
    const dataPath = path.join(__dirname, 'database', 'sqlite-data.sql');
    if (fs.existsSync(dataPath)) {
      const dataSQL = fs.readFileSync(dataPath, 'utf8');
      await db.exec(dataSQL);
      console.log('Données insérées avec succès.');
    } else {
      console.log('Fichier sqlite-data.sql non trouvé, pas de données insérées.');
    }

    console.log('Base de données initialisée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la DB:', error);
  }
}

initDB();