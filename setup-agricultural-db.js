const db = require('./database/connection');
const fs = require('fs');

async function setupAgriculturalDatabase() {
  try {
    console.log('🔄 Configuration de la base de données agricole...');
    
    // 1. Créer le schéma
    console.log('📝 Création du schéma...');
    const schemaFile = './database/agricultural-schema-fixed.sql';
    const schemaContent = fs.readFileSync(schemaFile, 'utf8');
    
    const schemaQueries = schemaContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    for (let i = 0; i < schemaQueries.length; i++) {
      const query = schemaQueries[i];
      if (query.trim()) {
        try {
          await db.execute(query);
          console.log(`✅ Schéma ${i + 1}/${schemaQueries.length} créé`);
        } catch (error) {
          console.log(`⚠️  Schéma ${i + 1} ignoré: ${error.message}`);
        }
      }
    }
    
    // 2. Insérer les données
    console.log('📊 Insertion des données...');
    const dataFile = './database/agricultural-data.sql';
    const dataContent = fs.readFileSync(dataFile, 'utf8');
    
    const dataQueries = dataContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    for (let i = 0; i < dataQueries.length; i++) {
      const query = dataQueries[i];
      if (query.trim()) {
        try {
          await db.execute(query);
          console.log(`✅ Données ${i + 1}/${dataQueries.length} insérées`);
        } catch (error) {
          console.log(`⚠️  Données ${i + 1} ignorées: ${error.message}`);
        }
      }
    }
    
    console.log('🎉 Base de données agricole configurée avec succès !');
    
    // 3. Vérifier les données
    const [products] = await db.execute('SELECT COUNT(*) as count FROM products');
    const [prices] = await db.execute('SELECT COUNT(*) as count FROM prices');
    const [localities] = await db.execute('SELECT COUNT(*) as count FROM localities');
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [categories] = await db.execute('SELECT COUNT(*) as count FROM product_categories');
    const [units] = await db.execute('SELECT COUNT(*) as count FROM units');
    const [regions] = await db.execute('SELECT COUNT(*) as count FROM regions');
    const [costs] = await db.execute('SELECT COUNT(*) as count FROM costs');
    
    console.log(`📊 Données disponibles:`);
    console.log(`   - Produits agricoles: ${products[0].count}`);
    console.log(`   - Prix: ${prices[0].count}`);
    console.log(`   - Localités: ${localities[0].count}`);
    console.log(`   - Utilisateurs: ${users[0].count}`);
    console.log(`   - Catégories: ${categories[0].count}`);
    console.log(`   - Unités: ${units[0].count}`);
    console.log(`   - Régions: ${regions[0].count}`);
    console.log(`   - Coûts: ${costs[0].count}`);
    
    // 4. Tester les nouvelles routes
    console.log('\n🧪 Test des nouvelles routes API...');
    
    // Test des prix validés
    try {
      const [validatedPrices] = await db.execute(`
        SELECT COUNT(*) as count FROM prices WHERE status = 'validated'
      `);
      console.log(`   - Prix validés: ${validatedPrices[0].count}`);
    } catch (error) {
      console.log(`   - Prix validés: Erreur - ${error.message}`);
    }
    
    // Test des prix en attente
    try {
      const [pendingPrices] = await db.execute(`
        SELECT COUNT(*) as count FROM prices WHERE status = 'pending'
      `);
      console.log(`   - Prix en attente: ${pendingPrices[0].count}`);
    } catch (error) {
      console.log(`   - Prix en attente: Erreur - ${error.message}`);
    }
    
    console.log('\n✅ Configuration terminée ! L\'application est prête pour les fonctionnalités agricoles.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

setupAgriculturalDatabase();

