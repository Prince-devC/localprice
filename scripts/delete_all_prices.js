const db = require('../database/postgres');

async function cleanPrices() {
  try {
    console.log('Suppression des prix dans la table `prices`...');
    await db.exec('DELETE FROM prices');
    console.log('Suppression terminée pour `prices`.');

    console.log('Suppression des prix dans la table `product_prices`...');
    // product_prices might not exist or be empty, but we try anyway as per schema
    try {
        await db.exec('DELETE FROM product_prices');
        console.log('Suppression terminée pour `product_prices`.');
    } catch (e) {
        console.log('Table product_prices non trouvée ou erreur:', e.message);
    }

    const countPrices = await db.get('SELECT COUNT(*) as count FROM prices');
    let countProductPrices = { count: 0 };
    try {
        countProductPrices = await db.get('SELECT COUNT(*) as count FROM product_prices');
    } catch (e) {
        // ignore
    }

    console.log(`Nombre de prix restants dans prices: ${countPrices.count}`);
    console.log(`Nombre de prix restants dans product_prices: ${countProductPrices ? countProductPrices.count : 0}`);

  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
  } finally {
    await db.close();
  }
}

cleanPrices();
