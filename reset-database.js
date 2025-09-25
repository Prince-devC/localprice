const db = require('./database/connection');
const fs = require('fs');

async function resetDatabase() {
  try {
    console.log('🔄 Réinitialisation de la base de données...');
    
    // Supprimer toutes les tables existantes
    const dropQueries = [
      'DROP TABLE IF EXISTS audit_logs',
      'DROP TABLE IF EXISTS prices',
      'DROP TABLE IF EXISTS costs',
      'DROP TABLE IF EXISTS localities',
      'DROP TABLE IF EXISTS regions',
      'DROP TABLE IF EXISTS units',
      'DROP TABLE IF EXISTS products',
      'DROP TABLE IF EXISTS product_categories',
      'DROP TABLE IF EXISTS users',
      'DROP TABLE IF EXISTS categories',
      'DROP TABLE IF EXISTS stores',
      'DROP TABLE IF EXISTS product_prices',
      'DROP TABLE IF EXISTS user_favorites',
      'DROP TABLE IF EXISTS reviews'
    ];
    
    for (const query of dropQueries) {
      try {
        await db.execute(query);
        console.log(`✅ Table supprimée: ${query.split(' ')[4]}`);
      } catch (error) {
        console.log(`⚠️  Table non trouvée: ${query.split(' ')[4]}`);
      }
    }
    
    console.log('📝 Importation du nouveau schéma agricole...');
    
    // Importer le nouveau schéma
    const sqlFile = './database/agricultural-schema.sql';
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log(`📝 ${queries.length} requêtes à exécuter...`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        try {
          await db.execute(query);
          console.log(`✅ Requête ${i + 1}/${queries.length} exécutée`);
        } catch (error) {
          console.log(`⚠️  Requête ${i + 1} ignorée: ${error.message}`);
        }
      }
    }
    
    console.log('🎉 Base de données réinitialisée avec succès !');
    
    // Vérifier les données
    const [products] = await db.execute('SELECT COUNT(*) as count FROM products');
    const [prices] = await db.execute('SELECT COUNT(*) as count FROM prices');
    const [localities] = await db.execute('SELECT COUNT(*) as count FROM localities');
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`📊 Données disponibles:`);
    console.log(`   - Produits agricoles: ${products[0].count}`);
    console.log(`   - Prix: ${prices[0].count}`);
    console.log(`   - Localités: ${localities[0].count}`);
    console.log(`   - Utilisateurs: ${users[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

resetDatabase();

