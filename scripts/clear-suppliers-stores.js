const db = require('../database/connection');

async function clearTables() {
  try {
    console.log('[clear] Démarrage de la purge des tables fournisseurs et magasins...');
    // Désactiver les contraintes si nécessaire (SQLite)
    await db.exec('PRAGMA foreign_keys = OFF;');

    // Supprimer d'abord les tables dépendantes
    await db.run('DELETE FROM supplier_product_availability_history;');
    await db.run('DELETE FROM supplier_product_availability;');
    await db.run('DELETE FROM supplier_prices;');
    await db.run('DELETE FROM product_prices;');

    // Puis vider les tables principales
    await db.run('DELETE FROM suppliers;');
    await db.run('DELETE FROM stores;');

    // Optionnel: réactiver les FKs
    await db.exec('PRAGMA foreign_keys = ON;');

    // Vérifications rapides
    const suppliersCount = await db.get('SELECT COUNT(*) AS c FROM suppliers;');
    const storesCount = await db.get('SELECT COUNT(*) AS c FROM stores;');
    console.log(`[clear] suppliers restants: ${suppliersCount.c}`);
    console.log(`[clear] stores restants: ${storesCount.c}`);
    console.log('[clear] Purge terminée avec succès.');
    await db.close();
  } catch (err) {
    console.error('[clear] Erreur lors de la purge:', err);
    try { await db.close(); } catch (_) {}
    process.exit(1);
  }
}

clearTables();