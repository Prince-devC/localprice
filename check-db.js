const db = require('./database/connection');

async function checkDB() {
  try {
    console.log('Vérification de l\'intégrité de la base de données...');

    // Vérifier les tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('Tables présentes:', tables.map(t => t.name));

    // Compter les lignes dans quelques tables
    const productCount = await db.get('SELECT COUNT(*) as count FROM products;');
    console.log('Nombre de produits:', productCount.count);

    const priceCount = await db.get('SELECT COUNT(*) as count FROM prices;');
    console.log('Nombre de prix:', priceCount.count);

    // Autres vérifications si nécessaire

    console.log('Vérification terminée avec succès!');
  } catch (err) {
    console.error('Erreur lors de la vérification:', err);
  } finally {
    db.close();
  }
}

checkDB();