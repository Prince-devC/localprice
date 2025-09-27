# 🛒 Lokali - Application de Comparaison de Prix Locaux

Lokali est une application web moderne qui permet aux utilisateurs de comparer les prix des produits dans leurs magasins locaux. L'application offre une interface intuitive pour rechercher des produits, comparer les prix entre différents magasins, et trouver les meilleures offres près de chez eux.

## ✨ Fonctionnalités Principales

### 🔍 Pour les Utilisateurs
- **Recherche intelligente** : Recherche par nom, catégorie, ou localisation
- **Comparaison de prix** : Comparaison des prix entre différents magasins
- **Carte interactive** : Visualisation des magasins sur une carte
- **Filtres avancés** : Filtrer par catégorie, gamme de prix, ville
- **Compte utilisateur** : Inscription, connexion, gestion du profil
- **Interface responsive** : Optimisée pour mobile, tablette et desktop
- **Calculateur de coûts** : Calculer les coûts totaux d'achat

### 👨‍💼 Pour les Administrateurs
- **Tableau de bord** : Statistiques et métriques en temps réel
- **Gestion des magasins** : Ajouter, modifier, supprimer des magasins
- **Gestion des produits** : Catalogue de produits avec catégories
- **Gestion des prix** : Mise à jour des prix par magasin
- **Modération** : Validation des soumissions de prix
- **Rapports** : Analyses détaillées des données

## 🛠️ Stack Technologique

### Backend
- **Node.js** avec Express.js
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **CORS** pour les requêtes cross-origin
- **Helmet** pour la sécurité
- **Express Rate Limit** pour limiter les requêtes

### Frontend
- **React 18** avec hooks
- **React Router** pour la navigation
- **Styled Components** pour le styling
- **React Query** pour la gestion des données
- **React Hook Form** pour les formulaires
- **React Hot Toast** pour les notifications
- **React Icons** pour les icônes
- **Leaflet** pour les cartes interactives
- **Axios** pour les requêtes HTTP

## 📋 Prérequis

- **Node.js** (version 16 ou supérieure)
- **MySQL** (version 8.0 ou supérieure) ou **MAMP**
- **npm** ou **yarn**
- **Git**

## 🚀 Installation et Configuration

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd Lokali
```

### 2. Configuration de la base de données

#### Option A : Avec MAMP (Recommandé pour le développement)
1. **Installer MAMP** : Télécharger depuis [mamp.info](https://www.mamp.info/)
2. **Démarrer MAMP** : Lancer l'application et démarrer les serveurs
3. **Accéder à phpMyAdmin** : http://localhost:8888/phpMyAdmin/
4. **Créer la base de données** :
   ```sql
   CREATE DATABASE localprice;
   ```
5. **Importer le schéma** :
   - Sélectionner la base `localprice`
   - Aller dans l'onglet "Importer"
   - Choisir le fichier `database/schema-simple.sql`
   - Cliquer sur "Exécuter"

#### Option B : Avec MySQL standard
1. **Installer MySQL** : Suivre les instructions officielles
2. **Créer la base de données** :
   ```sql
   CREATE DATABASE localprice;
   ```
3. **Importer le schéma** :
   ```bash
   mysql -u root -p localprice < database/schema-simple.sql
   ```

### 3. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet :

```bash
cp env.example .env
```

Éditer le fichier `.env` avec vos paramètres :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=localprice

# Configuration du serveur
PORT=5001
NODE_ENV=development

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici

# Configuration MAMP (si utilisé)
MAMP_PORT=3306
```

### 4. Installation des dépendances

#### Backend
```bash
npm install
```

#### Frontend
```bash
cd client
npm install
cd ..
```

### 5. Création d'un utilisateur administrateur

```bash
# Créer un utilisateur admin
node create-admin-user.js
```

**Identifiants par défaut :**
- **Email** : admin@localprice.com
- **Nom d'utilisateur** : admin
- **Mot de passe** : admin123

### 6. Démarrage de l'application

#### Option A : Script automatique (Recommandé)
```bash
# Démarrer les deux serveurs simultanément
npm run start:all
```

#### Option B : Démarrage manuel
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

## 🌐 Accès à l'Application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5001
- **phpMyAdmin** : http://localhost:8888/phpMyAdmin/ (si MAMP)

## 👤 Comptes de Test

### Administrateur
- **Email** : admin@localprice.com
- **Nom d'utilisateur** : admin
- **Mot de passe** : admin123

### Utilisateur standard
- **Email** : user@localprice.com
- **Nom d'utilisateur** : user
- **Mot de passe** : user123

## 📁 Structure du Projet

```
Lokali/
├── client/                    # Application React
│   ├── public/               # Fichiers publics
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── Header.js     # Header responsive
│   │   │   ├── PriceMap.js   # Carte des prix
│   │   │   ├── ProductCard.js
│   │   │   └── ...
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── Home.js
│   │   │   ├── Comparison.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── ...
│   │   ├── services/        # Services API
│   │   │   └── api.js
│   │   ├── contexts/        # Contextes React
│   │   │   └── AuthContext.js
│   │   └── App.js
│   └── package.json
├── routes/                   # Routes API Express
│   ├── auth.js
│   ├── stores.js
│   ├── products.js
│   └── ...
├── models/                   # Modèles de données
│   ├── Store.js
│   ├── Product.js
│   └── ...
├── database/                 # Configuration et schéma DB
│   ├── connection.js
│   ├── schema-simple.sql
│   └── sample-data.sql
├── middleware/               # Middlewares Express
│   └── roleAuth.js
├── server.js                # Point d'entrée du serveur
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mettre à jour le profil

### Magasins
- `GET /api/stores` - Liste des magasins
- `GET /api/stores/:id` - Détails d'un magasin
- `GET /api/stores/search/city/:city` - Recherche par ville
- `GET /api/stores/nearby` - Magasins à proximité

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/products/search/:term` - Recherche de produits
- `GET /api/products/:id/prices` - Prix d'un produit

### Comparaisons
- `GET /api/comparisons/cheapest` - Produits les moins chers
- `GET /api/comparisons/category/:id/best` - Meilleurs prix par catégorie
- `POST /api/comparisons/compare-products` - Comparer plusieurs produits

### Administration
- `GET /api/admin/dashboard` - Tableau de bord admin
- `GET /api/admin/pending-prices` - Prix en attente
- `PUT /api/admin/prices/:id/approve` - Approuver un prix
- `PUT /api/admin/prices/:id/reject` - Rejeter un prix

## 🎨 Interface Utilisateur

### Pages Principales
- **🏠 Accueil** : Présentation et recherche rapide
- **🔍 Recherche** : Recherche avancée avec filtres
- **📊 Comparaison** : Outil de comparaison de prix
- **🏪 Magasins** : Liste et détails des magasins
- **🗺️ Carte des Prix** : Visualisation géographique
- **💰 Calculateur** : Calcul des coûts d'achat
- **👤 Profil** : Gestion du compte utilisateur
- **⚙️ Administration** : Interface d'administration

### Design
- **Interface moderne** et responsive
- **Palette de couleurs** cohérente
- **Animations fluides** avec Framer Motion
- **Optimisée** pour mobile, tablette et desktop
- **Accessibilité** améliorée

## 🔒 Sécurité

- **Authentification JWT** sécurisée
- **Hachage des mots de passe** avec bcrypt
- **Validation des données** côté serveur
- **Protection CORS** configurée
- **Rate limiting** pour éviter les abus
- **Headers de sécurité** avec Helmet
- **Validation des rôles** utilisateur

## 🚀 Déploiement

### Développement avec MAMP
1. Placer le projet dans le dossier `htdocs` de MAMP
2. Démarrer MAMP
3. Configurer la base de données via phpMyAdmin
4. Importer le schéma de base de données
5. Configurer les variables d'environnement
6. Démarrer l'application

### Production
1. **Serveur Node.js** configuré
2. **MySQL** installé et configuré
3. **Reverse proxy** (Nginx) configuré
4. **PM2** pour la gestion des processus
5. **SSL/HTTPS** configuré
6. **Variables d'environnement** de production

## 🐛 Dépannage

### Erreurs courantes

#### Erreur de connexion MySQL
```bash
# Vérifier que MAMP est démarré
# Vérifier le port MySQL (3306 pour MAMP, 3306 pour MySQL standard)
# Vérifier les identifiants dans .env
```

#### Erreur de port
```bash
# Vérifier que le port 5001 est libre
# Modifier le port dans .env si nécessaire
```

#### Erreur CORS
```bash
# Vérifier que le frontend pointe vers http://localhost:5001
# Vérifier la configuration CORS dans server.js
```

#### Erreur de base de données
```bash
# Vérifier que la base de données existe
# Vérifier que le schéma est importé
# Vérifier les permissions utilisateur
```

### Logs et débogage
```bash
# Voir les logs du serveur
npm run dev

# Voir les logs du client
cd client && npm start
```

## 📊 Base de Données

### Tables Principales

#### `users` - Utilisateurs
- `id` (VARCHAR) - Identifiant unique
- `username` (VARCHAR) - Nom d'utilisateur
- `email` (VARCHAR) - Email
- `password_hash` (VARCHAR) - Mot de passe haché
- `role` (ENUM) - Rôle (user, contributor, admin)
- `created_at` (TIMESTAMP) - Date de création

#### `stores` - Magasins
- `id` (INT) - Identifiant unique
- `name` (VARCHAR) - Nom du magasin
- `address` (TEXT) - Adresse
- `city` (VARCHAR) - Ville
- `latitude` (DECIMAL) - Latitude
- `longitude` (DECIMAL) - Longitude
- `phone` (VARCHAR) - Téléphone
- `email` (VARCHAR) - Email

#### `products` - Produits
- `id` (INT) - Identifiant unique
- `name` (VARCHAR) - Nom du produit
- `description` (TEXT) - Description
- `category_id` (INT) - ID de la catégorie
- `created_at` (TIMESTAMP) - Date de création

#### `product_prices` - Prix des Produits
- `id` (INT) - Identifiant unique
- `product_id` (INT) - ID du produit
- `store_id` (INT) - ID du magasin
- `price` (DECIMAL) - Prix
- `unit` (VARCHAR) - Unité
- `is_available` (BOOLEAN) - Disponibilité
- `created_at` (TIMESTAMP) - Date de création

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Créer** une Pull Request

### Guidelines de contribution
- Suivre les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les changements
- Respecter les standards de sécurité

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- **Créer une issue** sur GitHub
- **Consulter** la documentation
- **Contacter** l'équipe de développement

## 🔄 Roadmap

### Version 1.1
- [ ] Application mobile (React Native)
- [ ] Notifications push
- [ ] Système de favoris
- [ ] Avis et notes des utilisateurs
- [ ] API publique

### Version 1.2
- [ ] Intégration avec des APIs de prix externes
- [ ] Système de coupons et promotions
- [ ] Tableaux de bord avancés
- [ ] Export de données

### Version 2.0
- [ ] Intelligence artificielle pour les recommandations
- [ ] Géolocalisation en temps réel
- [ ] Intégration avec les systèmes de caisse des magasins
- [ ] Analytics avancées
- [ ] Multi-langues

## 🎯 Fonctionnalités Déjà Implémentées

✅ **Interface utilisateur complète**  
✅ **Système d'authentification**  
✅ **Gestion des magasins et produits**  
✅ **Comparaison de prix**  
✅ **Carte interactive**  
✅ **Interface d'administration**  
✅ **API REST complète**  
✅ **Design responsive**  
✅ **Sécurité avancée**  
✅ **Base de données optimisée**  

---

**Lokali** - Trouvez les meilleurs prix près de chez vous ! 🛒✨