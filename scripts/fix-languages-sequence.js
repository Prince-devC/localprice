const db = require('../database/connection');

/**
 * Script pour corriger la séquence désynchronisée de la table languages
 * 
 * Le problème : La séquence SERIAL peut être désynchronisée si des données
 * ont été importées avec des IDs explicites, causant des conflits lors
 * de l'insertion de nouvelles langues.
 */

async function fixLanguagesSequence() {
  try {
    console.log('🔍 Diagnostic de la table languages...');
    
    // 1. Vérifier les langues existantes
    const languages = await db.all('SELECT id, name FROM languages ORDER BY id');
    console.log(`📊 ${languages.length} langues trouvées:`);
    languages.forEach(lang => console.log(`  - ID ${lang.id}: ${lang.name}`));
    
    if (languages.length === 0) {
      console.log('✅ Aucune langue existante, pas de correction nécessaire');
      return;
    }
    
    // 2. Trouver l'ID maximum
    const maxId = Math.max(...languages.map(l => l.id));
    console.log(`📈 ID maximum trouvé: ${maxId}`);
    
    // 3. Vérifier la valeur actuelle de la séquence
    const seqResult = await db.get('SELECT last_value FROM languages_id_seq');
    const currentSeqValue = seqResult?.last_value || 0;
    console.log(`🔢 Valeur actuelle de la séquence: ${currentSeqValue}`);
    
    // 4. Corriger la séquence si nécessaire
    if (currentSeqValue <= maxId) {
      const newSeqValue = maxId + 1;
      console.log(`🔧 Correction nécessaire: mise à jour de la séquence vers ${newSeqValue}`);
      
      await db.run(`SELECT setval('languages_id_seq', ?, false)`, [newSeqValue]);
      
      // Vérifier la correction
      const updatedSeq = await db.get('SELECT last_value FROM languages_id_seq');
      console.log(`✅ Séquence mise à jour: ${updatedSeq.last_value}`);
      
      // Test d'insertion pour vérifier
      console.log('🧪 Test d\'insertion...');
      const testResult = await db.get('SELECT nextval(\'languages_id_seq\') as next_id');
      console.log(`🎯 Prochain ID qui sera généré: ${testResult.next_id}`);
      
      console.log('✅ Correction terminée avec succès !');
    } else {
      console.log('✅ La séquence est déjà correcte, aucune action nécessaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    throw error;
  }
}

// Exécution du script
if (require.main === module) {
  fixLanguagesSequence()
    .then(() => {
      console.log('🎉 Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du script:', error.message);
      process.exit(1);
    });
}

module.exports = { fixLanguagesSequence };