const db = require('../database/connection');

async function clearTables() {
  try {
    console.log('[clear] Démarrage de la purge des tables fournisseurs et magasins...');
    await db.execute(
      'TRUNCATE TABLE supplier_product_availability_history, supplier_product_availability, supplier_prices, product_prices, suppliers, stores RESTART IDENTITY CASCADE'
    );
    console.log('[clear] Purge terminée avec succès.');
    await db.close();
  } catch (err) {
    console.error('[clear] Erreur lors de la purge:', err);
    try { await db.close(); } catch (_) {}
    process.exit(1);
  }
}

clearTables();