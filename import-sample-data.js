const db = require('./database/connection');
const fs = require('fs');
const path = require('path');

async function importSampleData() {
  try {
    console.log('🔄 Importation des données d\'exemple...');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'database', 'sample-data.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Diviser le contenu en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));

    console.log(`📝 ${queries.length} requêtes à exécuter...`);

    // Exécuter chaque requête
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        try {
          await db.execute(query);
          console.log(`✅ Requête ${i + 1}/${queries.length} exécutée`);
        } catch (error) {
          console.log(`⚠️  Requête ${i + 1} ignorée (peut-être déjà exécutée): ${error.message}`);
        }
      }
    }

    console.log('🎉 Importation terminée !');
    
    // Vérifier les données importées
    const [products] = await db.execute('SELECT COUNT(*) as count FROM products');
    const [stores] = await db.execute('SELECT COUNT(*) as count FROM stores');
    const [prices] = await db.execute('SELECT COUNT(*) as count FROM product_prices');
    
    console.log(`📊 Données importées:`);
    console.log(`   - Produits: ${products[0].count}`);
    console.log(`   - Magasins: ${stores[0].count}`);
    console.log(`   - Prix: ${prices[0].count}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error.message);
  } finally {
    process.exit(0);
  }
}

importSampleData();

