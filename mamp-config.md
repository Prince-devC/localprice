# Configuration MAMP pour LocalPrice

## Configuration de la Base de Données

### 1. Démarrer MAMP
1. Ouvrir MAMP
2. Cliquer sur "Start Servers"
3. Attendre que les serveurs Apache et MySQL soient démarrés

### 2. Accéder à phpMyAdmin
1. Ouvrir un navigateur
2. Aller sur `http://localhost:8888/phpMyAdmin/`
3. Se connecter avec les identifiants par défaut :
   - Utilisateur : `root`
   - Mot de passe : `root`

### 3. Créer la Base de Données
1. Cliquer sur "Nouvelle base de données"
2. Nom : `localprice`
3. Interclassement : `utf8mb4_unicode_ci`
4. Cliquer sur "Créer"

### 4. Importer le Schéma
1. Sélectionner la base de données `localprice`
2. Aller dans l'onglet "Importer"
3. Cliquer sur "Choisir un fichier"
4. Sélectionner le fichier `database/schema.sql`
5. Cliquer sur "Exécuter"

## Configuration de l'Application

### 1. Fichier .env
Créer un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration de la base de données MAMP
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=localprice

# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici

# Configuration MAMP
MAMP_PORT=8889
```

### 2. Ports MAMP
- **Apache** : 8888 (par défaut)
- **MySQL** : 8889 (par défaut)
- **Application Node.js** : 5000

## Démarrage de l'Application

### Option 1 : Script Automatique
```bash
./start.sh
```

### Option 2 : Démarrage Manuel

#### Terminal 1 - Backend
```bash
cd /Applications/MAMP/htdocs/LocalPrice
npm install
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd /Applications/MAMP/htdocs/LocalPrice/client
npm install
npm start
```

## Accès à l'Application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **phpMyAdmin** : http://localhost:8888/phpMyAdmin/

## Données de Test

Le schéma de base de données inclut des données de test :
- 4 magasins (Super U, Carrefour, Leclerc, Intermarché)
- 6 catégories de produits
- Données d'exemple pour tester l'application

## Dépannage

### Problème de Connexion MySQL
1. Vérifier que MAMP est démarré
2. Vérifier le port MySQL dans MAMP (8889 par défaut)
3. Vérifier les identifiants dans le fichier .env

### Problème de Port
1. Vérifier que le port 5000 est libre
2. Modifier le port dans le fichier .env si nécessaire

### Problème de CORS
1. Vérifier que le frontend pointe vers le bon port du backend
2. Vérifier la configuration CORS dans server.js

## Structure des Fichiers MAMP

```
/Applications/MAMP/htdocs/LocalPrice/
├── client/                 # Application React
├── routes/                # Routes API
├── models/                # Modèles de données
├── database/              # Schéma et configuration DB
├── server.js             # Serveur Express
├── package.json          # Dépendances Node.js
├── .env                  # Configuration (à créer)
└── start.sh              # Script de démarrage
```
