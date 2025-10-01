const db = require('./database/connection');

async function verifyData() {
  try {
    console.log('Vérification des données importées depuis sqlite-data.sql...');

    // Vérifier les régions
    const regions = await db.all("SELECT * FROM regions;");
    console.log(`Régions: ${regions.length} enregistrements trouvés`);
    if (regions.length > 0) {
      console.log('Exemple de régions:', regions.slice(0, 3).map(r => r.name).join(', '), '...');
    }

    // Vérifier les localités
    const localities = await db.all("SELECT * FROM localities;");
    console.log(`Localités: ${localities.length} enregistrements trouvés`);
    if (localities.length > 0) {
      console.log('Exemple de localités:', localities.slice(0, 3).map(l => l.name).join(', '), '...');
    }

    // Vérifier les catégories de produits
    const categories = await db.all("SELECT * FROM product_categories;");
    console.log(`Catégories de produits: ${categories.length} enregistrements trouvés`);
    if (categories.length > 0) {
      console.log('Exemple de catégories:', categories.slice(0, 3).map(c => c.name).join(', '), '...');
    }

    // Vérifier les produits
    const products = await db.all("SELECT * FROM products;");
    console.log(`Produits: ${products.length} enregistrements trouvés`);
    if (products.length > 0) {
      console.log('Exemple de produits:', products.slice(0, 3).map(p => p.name).join(', '), '...');
    }

    // Vérifier les unités
    const units = await db.all("SELECT * FROM units;");
    console.log(`Unités: ${units.length} enregistrements trouvés`);
    if (units.length > 0) {
      console.log('Exemple d\'unités:', units.slice(0, 3).map(u => u.name).join(', '), '...');
    }

    // Vérifier les options de filtres
    const filterProductOptions = await db.all("SELECT * FROM filter_product_options;");
    console.log(`Options de filtres produits: ${filterProductOptions.length} enregistrements trouvés`);

    const filterLocalityOptions = await db.all("SELECT * FROM filter_locality_options;");
    console.log(`Options de filtres localités: ${filterLocalityOptions.length} enregistrements trouvés`);

    const filterRegionOptions = await db.all("SELECT * FROM filter_region_options;");
    console.log(`Options de filtres régions: ${filterRegionOptions.length} enregistrements trouvés`);

    const filterCategoryOptions = await db.all("SELECT * FROM filter_category_options;");
    console.log(`Options de filtres catégories: ${filterCategoryOptions.length} enregistrements trouvés`);

    const filterPeriodOptions = await db.all("SELECT * FROM filter_period_options;");
    console.log(`Options de filtres périodes: ${filterPeriodOptions.length} enregistrements trouvés`);

    // Vérifier les prix
    const prices = await db.all("SELECT * FROM prices;");
    console.log(`Prix: ${prices.length} enregistrements trouvés`);
    if (prices.length > 0) {
      console.log('Exemple de prix:', prices.slice(0, 3).map(p => `Produit ID: ${p.product_id}, Prix: ${p.price}`).join(', '), '...');
    }

    console.log('Vérification terminée avec succès!');
  } catch (err) {
    console.error('Erreur lors de la vérification:', err);
  } finally {
    await db.close();
  }
}

verifyData();