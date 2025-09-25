const db = require('./database/connection');

async function validateSamplePrices() {
  try {
    console.log('🔄 Validation de quelques prix d\'exemple...');
    
    // Valider les 5 premiers prix
    const [result] = await db.execute(
      `UPDATE prices 
       SET status = 'validated', validated_by = 'admin_001', validated_at = NOW()
       WHERE id IN (1, 2, 3, 4, 5) AND status = 'pending'`
    );
    
    console.log(`✅ ${result.affectedRows} prix validés`);
    
    // Vérifier les prix validés
    const [validatedPrices] = await db.execute(`
      SELECT p.id, pr.name as product_name, l.name as locality_name, 
             p.price, u.symbol as unit_symbol, p.status
      FROM prices p
      JOIN products pr ON p.product_id = pr.id
      JOIN localities l ON p.locality_id = l.id
      JOIN units u ON p.unit_id = u.id
      WHERE p.status = 'validated'
      ORDER BY p.id
    `);
    
    console.log('📊 Prix validés:');
    validatedPrices.forEach(price => {
      console.log(`   - ${price.product_name} à ${price.locality_name}: ${price.price} ${price.unit_symbol}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

validateSamplePrices();

