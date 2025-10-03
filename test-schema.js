const db = require('./database/connection');

async function testSchema() {
  try {
    console.log('Test de la structure de la table product_prices...');
    
    // Vérifier la structure de la table
    const [rows] = await db.execute("PRAGMA table_info(product_prices)");
    console.log('Structure de la table product_prices:');
    rows.forEach(row => {
      console.log(`- ${row.name}: ${row.type} (nullable: ${row.notnull === 0})`);
    });
    
    // Vérifier si la table existe
    const [tables] = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='product_prices'");
    console.log('Table product_prices existe:', tables.length > 0);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testSchema();
