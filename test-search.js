const AgriculturalPrice = require('./models/AgriculturalPrice');

async function testSearch() {
  console.log('=== Test de la fonctionnalité de recherche ===');
  
  try {
    // Test 1: Recherche sans filtre
    console.log('\n1. Récupération de tous les prix (sans filtre):');
    const allPrices = await AgriculturalPrice.getValidatedPrices({ limit: 5 });
    console.log(`Nombre de résultats: ${allPrices.length}`);
    allPrices.forEach(price => {
      console.log(`- ${price.product_name} (${price.locality_name})`);
    });

    // Test 2: Recherche avec le terme "riz"
    console.log('\n2. Recherche avec le terme "riz":');
    const rizPrices = await AgriculturalPrice.getValidatedPrices({ 
      search: 'riz',
      limit: 10 
    });
    console.log(`Nombre de résultats pour "riz": ${rizPrices.length}`);
    rizPrices.forEach(price => {
      console.log(`- ${price.product_name} (${price.locality_name})`);
    });

    // Test 3: Recherche avec un terme qui devrait donner peu de résultats
    console.log('\n3. Recherche avec le terme "tomate":');
    const tomatePrices = await AgriculturalPrice.getValidatedPrices({ 
      search: 'tomate',
      limit: 10 
    });
    console.log(`Nombre de résultats pour "tomate": ${tomatePrices.length}`);
    tomatePrices.forEach(price => {
      console.log(`- ${price.product_name} (${price.locality_name})`);
    });

    // Test 4: Recherche avec un terme inexistant
    console.log('\n4. Recherche avec un terme inexistant "xyz123":');
    const noResults = await AgriculturalPrice.getValidatedPrices({ 
      search: 'xyz123',
      limit: 10 
    });
    console.log(`Nombre de résultats pour "xyz123": ${noResults.length}`);

  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testSearch();