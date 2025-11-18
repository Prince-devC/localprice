# 🔧 Guide de Dépannage - Lokali

## 🚨 Problèmes Courants et Solutions (Windows + Supabase)

### 1) Ports occupés (3000 côté client, 5000 côté API)

#### ❌ "Something is already running on port 3000" (React)
**Cause** : Une instance React existante ou autre service utilise 3000.
**Solutions (PowerShell)** :
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
# Relancer sur 3000
cd client; $env:PORT=3000; npm start
```

#### ❌ "EADDRINUSE: address already in use :::5000" (API)
**Cause** : Un service utilise le port 5000.
**Solutions (PowerShell)** :
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
# Ou démarrer temporairement sur un autre port
$env:PORT=5002; npm run dev
```

### 2) CORS bloqué

#### ❌ "Access to XMLHttpRequest has been blocked by CORS policy"
**Cause** : Origines non autorisées.
**Solution** : Vérifier `server.js` — la configuration CORS doit inclure :
```js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
```

### 3) Variables d’environnement `PORT` fantômes

#### ❌ Le serveur démarre sur 3001 malgré le code en 3000/5000
**Cause** : `PORT` défini dans la session PowerShell.
**Solution (PowerShell)** :
```powershell
Remove-Item Env:PORT -ErrorAction SilentlyContinue
```
Relancez `npm run start:all`.

### 4) Connexion Base de Données (Supabase Postgres)

#### ❌ "ECONNREFUSED" ou timeout côté DB
**Causes** : URL Supabase absente/incorrecte, réseau, permissions.
**Vérifications** :
- `.env` contient `SUPABASE_DB_URL` (format `postgresql://...@db.<ref>.supabase.co:6543/postgres?sslmode=require`).
- Ports/Firewall ne bloquent pas.
- Utilisez `psql` pour tester la connexion.

### 5) Authentification / JWT

#### ❌ "Invalid token" / 401
**Causes** : `JWT_SECRET` incorrect, token expiré.
**Solutions** :
```powershell
# .env : définir un secret fort
JWT_SECRET=<random_secure_string>
# Redémarrer API
npm run dev
```

### 6) Dépendances / Build

#### ❌ "Cannot find module 'express'" (ou React packages)
**Cause** : `node_modules` absents/corrompus.
**Solutions (PowerShell)** :
```powershell
rm -r -fo node_modules, package-lock.json
npm install
cd client; rm -r -fo node_modules, package-lock.json; npm install; cd ..
```

#### ❌ "Failed to compile" (client)
**Cause** : erreur de syntaxe ou import manquant.
**Solution** : lire le terminal, corriger, relancer.

### 7) Rate limiting (429)

#### ❌ "Too Many Requests"
**Cause** : limite atteinte.
**Solution** : ajuster dans `server.js` :
```js
const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
```

### 8) Divers

- Dev SSL: `NODE_TLS_REJECT_UNAUTHORIZED=0` est activé côté dev pour simplifier les tests.
- Proxy client: `client/package.json` → `"proxy": "http://localhost:5000"`.
- Test API rapide: `GET http://localhost:5000/api/test` doit retourner `{ message: "API Lokali fonctionne!" }`.

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
netstat -tulpn | grep :5000
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
curl http://localhost:5000/api/stores

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
