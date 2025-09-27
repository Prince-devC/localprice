# 🔧 Guide de Dépannage - Lokali

## 🚨 Problèmes Courants et Solutions

### 1. Erreurs de Base de Données

#### ❌ "ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'"
**Cause** : Identifiants MySQL incorrects
**Solution** :
```bash
# Vérifier les identifiants dans .env
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_correct

# Ou utiliser les identifiants MAMP par défaut
DB_USER=root
DB_PASSWORD=root
```

#### ❌ "ER_BAD_DB_ERROR: Unknown database 'localprice'"
**Cause** : Base de données non créée
**Solution** :
```sql
-- Via phpMyAdmin ou MySQL CLI
CREATE DATABASE localprice;
```

#### ❌ "Table 'localprice.stores' doesn't exist"
**Cause** : Schéma non importé
**Solution** :
```bash
# Importer le schéma
mysql -u root -p localprice < database/schema-simple.sql

# Ou via phpMyAdmin : Importer > database/schema-simple.sql
```

### 2. Erreurs de Port

#### ❌ "EADDRINUSE: address already in use :::5001"
**Cause** : Port déjà utilisé
**Solution** :
```bash
# Trouver le processus utilisant le port
lsof -ti:5001

# Tuer le processus
kill -9 $(lsof -ti:5001)

# Ou changer le port dans .env
PORT=5002
```

#### ❌ "EADDRINUSE: address already in use :::3000"
**Cause** : Port React déjà utilisé
**Solution** :
```bash
# Tuer le processus React
kill -9 $(lsof -ti:3000)

# Ou utiliser un autre port
cd client && PORT=3001 npm start
```

### 3. Erreurs CORS

#### ❌ "Access to XMLHttpRequest has been blocked by CORS policy"
**Cause** : Configuration CORS incorrecte
**Solution** :
```javascript
// Vérifier server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
```

### 4. Erreurs de Dépendances

#### ❌ "Cannot find module 'express'"
**Cause** : Dépendances non installées
**Solution** :
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

#### ❌ "Module not found: Can't resolve 'react'"
**Cause** : Dépendances React manquantes
**Solution** :
```bash
cd client
npm install react react-dom
npm install
```

### 5. Erreurs d'Authentification

#### ❌ "Invalid token"
**Cause** : JWT secret incorrect ou token expiré
**Solution** :
```bash
# Vérifier JWT_SECRET dans .env
JWT_SECRET=your_very_secure_jwt_secret_here

# Redémarrer le serveur
npm run dev
```

#### ❌ "User not found"
**Cause** : Utilisateur non créé
**Solution** :
```bash
# Créer l'utilisateur admin
node create-admin-user.js
```

### 6. Erreurs de Build

#### ❌ "Failed to compile"
**Cause** : Erreur de syntaxe ou dépendance manquante
**Solution** :
```bash
# Vérifier les erreurs dans le terminal
# Corriger les erreurs de syntaxe
# Réinstaller les dépendances si nécessaire
```

#### ❌ "Module not found: Can't resolve 'styled-components'"
**Cause** : Styled-components non installé
**Solution** :
```bash
cd client
npm install styled-components
```

### 7. Erreurs de Performance

#### ❌ "429 Too Many Requests"
**Cause** : Rate limiting activé
**Solution** :
```javascript
// Ajuster le rate limiting dans server.js
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Augmenter la limite
});
```

#### ❌ "Network Error" ou "ERR_NETWORK"
**Cause** : Serveur non démarré ou problème de réseau
**Solution** :
```bash
# Vérifier que le serveur est démarré
npm run dev

# Vérifier l'URL dans le frontend
# Doit pointer vers http://localhost:5001
```

### 8. Erreurs de MAMP

#### ❌ "Connection refused"
**Cause** : MAMP non démarré
**Solution** :
1. Démarrer MAMP
2. Vérifier que MySQL est actif
3. Vérifier le port (généralement 3306)

#### ❌ "Port 8889 not available"
**Cause** : Port MAMP incorrect
**Solution** :
```env
# Dans .env, utiliser le port correct
MAMP_PORT=3306  # Port par défaut de MAMP
```

### 9. Erreurs de Variables d'Environnement

#### ❌ "process.env.DB_HOST is undefined"
**Cause** : Fichier .env non chargé
**Solution** :
```bash
# Vérifier que .env existe
ls -la .env

# Vérifier le contenu
cat .env

# Redémarrer le serveur
npm run dev
```

### 10. Erreurs de Permissions

#### ❌ "EACCES: permission denied"
**Cause** : Permissions insuffisantes
**Solution** :
```bash
# Donner les permissions d'exécution
chmod +x start.sh

# Ou utiliser sudo si nécessaire
sudo npm install
```

## 🔍 Diagnostic Avancé

### Vérifier l'état du système
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :5001
netstat -tulpn | grep :3000

# Vérifier les processus Node.js
ps aux | grep node

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### Logs détaillés
```bash
# Backend avec logs détaillés
DEBUG=* npm run dev

# Frontend avec logs détaillés
cd client && DEBUG=* npm start
```

### Test de connectivité
```bash
# Tester la connexion MySQL
mysql -u root -p -h localhost -P 3306

# Tester l'API
curl http://localhost:5001/api/stores

# Tester le frontend
curl http://localhost:3000
```

## 📞 Support

### Informations à fournir
1. **Système d'exploitation** : macOS, Windows, Linux
2. **Version Node.js** : `node --version`
3. **Version npm** : `npm --version`
4. **Message d'erreur complet**
5. **Logs du serveur**
6. **Configuration .env** (sans les mots de passe)

### Ressources utiles
- [Documentation Node.js](https://nodejs.org/docs/)
- [Documentation React](https://reactjs.org/docs/)
- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Documentation MAMP](https://documentation.mamp.info/)

## 🎯 Prévention

### Bonnes pratiques
1. **Toujours** utiliser des versions LTS de Node.js
2. **Vérifier** les prérequis avant l'installation
3. **Sauvegarder** la base de données régulièrement
4. **Utiliser** des variables d'environnement
5. **Tester** après chaque modification

### Maintenance
```bash
# Nettoyer le cache npm
npm cache clean --force

# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit
```

---

**Besoin d'aide ?** Créez une issue sur GitHub avec les informations de diagnostic ! 🆘
