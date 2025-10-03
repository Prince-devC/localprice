const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('Test de connectivité API pour le frontend...');
    
    // Test des APIs utilisées par le frontend
    const apis = [
      'http://localhost:5001/api/product-categories',
      'http://localhost:5001/api/localities', 
      'http://localhost:5001/api/filter-options/products',
      'http://localhost:5001/api/filter-options/categories',
      'http://localhost:5001/api/filter-options/localities',
      'http://localhost:5001/api/agricultural-prices?limit=5'
    ];
    
    for (const api of apis) {
      try {
        const response = await axios.get(api);
        console.log(`✅ ${api}: ${response.data.success ? 'SUCCESS' : 'FAILED'}`);
        if (response.data.data) {
          console.log(`   - Données: ${response.data.data.length} éléments`);
        }
      } catch (error) {
        console.log(`❌ ${api}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du test:', error.message);
  }
}

testFrontendAPI();
