const db = require('./database/connection');

async function replaceDatabase() {
  try {
    console.log('🔄 Remplacement complet de la base de données...');
    
    // 1. Supprimer toutes les tables existantes
    console.log('🗑️  Suppression des tables existantes...');
    const dropQueries = [
      'DROP TABLE IF EXISTS audit_logs',
      'DROP TABLE IF EXISTS prices',
      'DROP TABLE IF EXISTS costs',
      'DROP TABLE IF EXISTS localities',
      'DROP TABLE IF EXISTS regions',
      'DROP TABLE IF EXISTS units',
      'DROP TABLE IF EXISTS products',
      'DROP TABLE IF EXISTS product_categories',
      'DROP TABLE IF EXISTS users',
      'DROP TABLE IF EXISTS categories',
      'DROP TABLE IF EXISTS stores',
      'DROP TABLE IF EXISTS product_prices',
      'DROP TABLE IF EXISTS user_favorites',
      'DROP TABLE IF EXISTS reviews'
    ];
    
    for (const query of dropQueries) {
      try {
        await db.execute(query);
        console.log(`✅ Supprimé: ${query.split(' ')[4]}`);
      } catch (error) {
        console.log(`⚠️  Non trouvé: ${query.split(' ')[4]}`);
      }
    }
    
    // 2. Créer le nouveau schéma étape par étape
    console.log('\\n📝 Création du nouveau schéma...');
    
    // Table users
    await db.execute(`
      CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        role ENUM('guest', 'contributor', 'admin') DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table users créée');
    
    // Table product_categories
    await db.execute(`
      CREATE TABLE product_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        type ENUM('brut', 'transforme') NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table product_categories créée');
    
    // Table products
    await db.execute(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id INT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table products créée');
    
    // Table units
    await db.execute(`
      CREATE TABLE units (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(20) NOT NULL UNIQUE,
        symbol VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table units créée');
    
    // Table regions
    await db.execute(`
      CREATE TABLE regions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table regions créée');
    
    // Table localities
    await db.execute(`
      CREATE TABLE localities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        region_id INT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table localities créée');
    
    // Table costs
    await db.execute(`
      CREATE TABLE costs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('transport', 'stockage') NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table costs créée');
    
    // Table prices
    await db.execute(`
      CREATE TABLE prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        locality_id INT NOT NULL,
        unit_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        submitted_by VARCHAR(255),
        status ENUM('pending', 'validated', 'rejected') DEFAULT 'pending',
        validated_by VARCHAR(255),
        validated_at TIMESTAMP NULL,
        comment TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE CASCADE,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table prices créée');
    
    // Table audit_logs
    await db.execute(`
      CREATE TABLE audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(50),
        record_id INT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table audit_logs créée');
    
    // 3. Insérer les données de base
    console.log('\\n📊 Insertion des données de base...');
    
    // Catégories
    await db.execute(`
      INSERT INTO product_categories (name, type, description) VALUES
      ('Céréales', 'brut', 'Blé, maïs, riz, orge, avoine'),
      ('Légumineuses', 'brut', 'Haricots, pois, lentilles, soja'),
      ('Tubercules', 'brut', 'Pommes de terre, manioc, igname'),
      ('Fruits', 'brut', 'Bananes, mangues, oranges, pommes'),
      ('Légumes', 'brut', 'Tomates, oignons, carottes, choux'),
      ('Épices', 'brut', 'Poivre, gingembre, curcuma, cannelle'),
      ('Huiles végétales', 'transforme', 'Huile de palme, tournesol, soja'),
      ('Farines', 'transforme', 'Farine de blé, maïs, manioc'),
      ('Conserves', 'transforme', 'Légumes en conserve, fruits au sirop'),
      ('Boissons', 'transforme', 'Jus de fruits, boissons alcoolisées')
    `);
    console.log('✅ Catégories insérées');
    
    // Unités
    await db.execute(`
      INSERT INTO units (name, symbol) VALUES
      ('Kilogramme', 'kg'),
      ('Tonne', 't'),
      ('Litre', 'L'),
      ('Quintal', 'q'),
      ('Unité', 'unité'),
      ('Sachet', 'sachet'),
      ('Bouteille', 'bouteille'),
      ('Boîte', 'boîte')
    `);
    console.log('✅ Unités insérées');
    
    // Régions
    await db.execute(`
      INSERT INTO regions (name) VALUES
      ('Dakar'), ('Thiès'), ('Diourbel'), ('Fatick'), ('Kaolack'),
      ('Kolda'), ('Ziguinchor'), ('Kédougou'), ('Tambacounda'),
      ('Matam'), ('Saint-Louis'), ('Louga')
    `);
    console.log('✅ Régions insérées');
    
    // Localités
    await db.execute(`
      INSERT INTO localities (name, region_id, latitude, longitude) VALUES
      ('Dakar', 1, 14.6928, -17.4467),
      ('Pikine', 1, 14.7644, -17.3906),
      ('Thiès', 2, 14.7833, -16.9167),
      ('Mbour', 2, 14.4167, -16.9667),
      ('Diourbel', 3, 14.6500, -16.2333),
      ('Kaolack', 5, 14.1500, -16.0833),
      ('Kolda', 6, 12.8833, -14.9500),
      ('Ziguinchor', 7, 12.5833, -16.2667)
    `);
    console.log('✅ Localités insérées');
    
    // Produits
    await db.execute(`
      INSERT INTO products (name, category_id, description) VALUES
      ('Riz local', 1, 'Riz cultivé localement'),
      ('Maïs', 1, 'Maïs grain'),
      ('Blé', 1, 'Blé dur'),
      ('Millet', 1, 'Millet commun'),
      ('Sorgho', 1, 'Sorgho blanc'),
      ('Haricots blancs', 2, 'Haricots blancs secs'),
      ('Pois de terre', 2, 'Pois de terre frais'),
      ('Lentilles', 2, 'Lentilles rouges'),
      ('Pommes de terre', 3, 'Pommes de terre fraîches'),
      ('Manioc', 3, 'Racines de manioc'),
      ('Bananes', 4, 'Bananes plantain'),
      ('Mangues', 4, 'Mangues fraîches'),
      ('Tomates', 5, 'Tomates fraîches'),
      ('Oignons', 5, 'Oignons secs'),
      ('Carottes', 5, 'Carottes fraîches'),
      ('Poivre noir', 6, 'Poivre noir en grains'),
      ('Gingembre', 6, 'Racines de gingembre'),
      ('Huile de palme', 7, 'Huile de palme raffinée'),
      ('Farine de blé', 8, 'Farine de blé T45'),
      ('Farine de maïs', 8, 'Farine de maïs')
    `);
    console.log('✅ Produits insérées');
    
    // Coûts
    await db.execute(`
      INSERT INTO costs (type, value, unit, description) VALUES
      ('transport', 50.00, 'per_km', 'Coût de transport par km'),
      ('transport', 25.00, 'per_km', 'Coût de transport local par km'),
      ('stockage', 100.00, 'per_day_per_tonne', 'Coût de stockage par jour et par tonne'),
      ('stockage', 5.00, 'per_day_per_kg', 'Coût de stockage par jour et par kg')
    `);
    console.log('✅ Coûts insérés');
    
    // Utilisateurs
    await db.execute(`
      INSERT INTO users (id, email, role) VALUES
      ('admin_001', 'admin@localprice.sn', 'admin'),
      ('contributor_001', 'contributeur@localprice.sn', 'contributor')
    `);
    console.log('✅ Utilisateurs insérés');
    
    // Prix d'exemple
    await db.execute(`
      INSERT INTO prices (product_id, locality_id, unit_id, price, date, submitted_by, status) VALUES
      (1, 1, 1, 450.00, '2024-01-15', 'contributor_001', 'pending'),
      (1, 2, 1, 420.00, '2024-01-15', 'contributor_001', 'pending'),
      (2, 1, 1, 200.00, '2024-01-15', 'contributor_001', 'pending'),
      (2, 3, 1, 180.00, '2024-01-15', 'contributor_001', 'pending'),
      (3, 1, 1, 350.00, '2024-01-15', 'contributor_001', 'pending'),
      (4, 1, 1, 300.00, '2024-01-15', 'contributor_001', 'pending'),
      (5, 1, 1, 250.00, '2024-01-15', 'contributor_001', 'pending'),
      (6, 1, 1, 800.00, '2024-01-15', 'contributor_001', 'pending'),
      (7, 1, 1, 400.00, '2024-01-15', 'contributor_001', 'pending'),
      (8, 1, 1, 600.00, '2024-01-15', 'contributor_001', 'pending')
    `);
    console.log('✅ Prix insérés');
    
    console.log('\n🎉 Base de données agricole créée avec succès !');
    
    // Vérification finale
    const [products] = await db.execute('SELECT COUNT(*) as count FROM products');
    const [prices] = await db.execute('SELECT COUNT(*) as count FROM prices');
    const [localities] = await db.execute('SELECT COUNT(*) as count FROM localities');
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
    
    console.log('\n📊 Données finales:');
    console.log(`   - Produits: ${products[0].count}`);
    console.log(`   - Prix: ${prices[0].count}`);
    console.log(`   - Localités: ${localities[0].count}`);
    console.log(`   - Utilisateurs: ${users[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

replaceDatabase();
