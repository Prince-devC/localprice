const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'localprice',
  port: process.env.MAMP_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Créer le pool de connexions
const pool = mysql.createPool(dbConfig);

// Promisifier les requêtes
const promisePool = pool.promise();

// Test de connexion
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('Connexion à la base de données établie');
    connection.release();
  }
});

module.exports = promisePool;
