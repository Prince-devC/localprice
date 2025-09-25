# 🚀 Démarrage Rapide - LocalPrice

## ⚡ Installation Express (5 minutes)

### 1. Prérequis
- **MAMP** installé et démarré (ou MySQL)
- **Node.js** installé (version 16+)
- **Git** installé

### 2. Cloner et configurer
```bash
# Cloner le projet
git clone <url-du-repo>
cd LocalPrice

# Copier la configuration
cp env.example .env
```

### 3. Configuration de la Base de Données

#### Avec MAMP (Recommandé)
1. **Démarrer MAMP** et aller sur http://localhost:8888/phpMyAdmin/
2. **Créer la base** : `localprice`
3. **Importer le schéma** : `database/schema-simple.sql`
4. **Configurer .env** :
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=localprice
   MAMP_PORT=3306
   ```

#### Avec MySQL standard
```bash
# Créer la base
mysql -u root -p -e "CREATE DATABASE localprice;"

# Importer le schéma
mysql -u root -p localprice < database/schema-simple.sql
```

### 4. Installation des dépendances
```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### 5. Créer un admin
```bash
# Créer l'utilisateur administrateur
node create-admin-user.js
```

### 6. Démarrer l'application
```bash
# Option 1: Script automatique (recommandé)
npm run start:all

# Option 2: Manuel
# Terminal 1: npm run dev
# Terminal 2: npm run client
```

## 🌐 Accès

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5001
- **phpMyAdmin** : http://localhost:8888/phpMyAdmin/

## 👤 Comptes de Test

### Admin
- **Email** : admin@localprice.com
- **Username** : admin
- **Password** : admin123

### User
- **Email** : user@localprice.com
- **Username** : user
- **Password** : user123

## 🎯 Fonctionnalités Disponibles

✅ **Recherche de produits**  
✅ **Comparaison de prix**  
✅ **Carte interactive**  
✅ **Gestion des magasins**  
✅ **Interface d'administration**  
✅ **Authentification**  
✅ **Design responsive**  

## 🐛 Dépannage Rapide

### Erreur MySQL
- Vérifier que MAMP est démarré
- Vérifier le port (3306 pour MAMP)
- Vérifier les identifiants dans .env

### Erreur de port
- Vérifier que le port 5001 est libre
- Modifier le port dans .env si nécessaire

### Erreur CORS
- Vérifier que le frontend pointe vers http://localhost:5001

## 📁 Structure

```
LocalPrice/
├── client/          # React App
├── routes/          # API Routes
├── models/          # Data Models
├── database/        # DB Schema
├── server.js        # Express Server
└── package.json
```

## 🚀 Prochaines Étapes

1. **Personnaliser** l'interface
2. **Ajouter** vos magasins et produits
3. **Configurer** l'authentification
4. **Déployer** en production

---

**Prêt à démarrer ?** Suivez les étapes ci-dessus et votre application LocalPrice sera opérationnelle en 5 minutes ! 🎉