# 🚀 Démarrage Rapide - Lokali

## ⚡ Prérequis
- `Node.js` 16+ et `npm`
- `Git` installé

## 📦 Installation
```bash
# Cloner le projet
git clone <url-du-repo>
cd localprice

# Copier la configuration
cp env.example .env
```

## 🗃️ Base de données SQLite
- Pas de MySQL/MAMP requis. La base SQLite est gérée localement.
- Fichiers: schéma `database/sqlite-schema.sql`, données `database/sqlite-data.sql`.

Initialisation:
```bash
# Crée/rafraîchit la base et charge le schéma + les données
node init-db.js

# Option: recréation forcée (supprime le fichier DB puis réapplique)
node force-recreate-db.js
```

## 🔧 Dépendances
```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

## 🚀 Démarrage
```bash
# Option 1 (recommandé) : démarre backend + frontend
npm run start:all

# Option 2 : démarrage séparé
# Terminal 1
npm run dev    # API sur http://localhost:5001
# Terminal 2
npm run client # React sur http://localhost:3000
```

## 🌐 Accès
- Frontend: `http://localhost:3000/`
- Backend API: `http://localhost:5001/`

## 🧭 Nouvelles pages et flux
- `GET /suppliers` (UI): liste des fournisseurs avec cartes stylées et badges prix.
- `SupplierCard` affiche prix et **disponibilités colorées**:
  - Vert: Disponible
  - Orange: Réapprovisionnement prévu (date)
  - Rouge: Indisponible
- Bouton `Contacter` sur la carte fournisseur:
  - Non authentifié → redirection vers `/login`
  - Authentifié → `/supplier/:id/contact`
- Page `SupplierContact` (route: `/supplier/:id/contact`) — **authentification requise**.
- Pages `Login` / `Register` déjà intégrées (via l’en-tête).

## 🔌 API utiles
- `GET /api/suppliers` — liste des fournisseurs
- `GET /api/suppliers/:id/summary` — prix/disponibilités/coordonnées par fournisseur

## 🐛 Dépannage rapide
- `net::ERR_CONNECTION_REFUSED` sur `http://localhost:3000/`
  - Vérifier que `npm run client` est bien démarré.
  - Si le port `3000` est occupé (Windows):
    - `netstat -ano | findstr :3000` puis `taskkill /PID <PID> /F`
    - ou démarrer sur un autre port:
      ```powershell
      cd client
      $env:PORT=3001; npm start
      ```
- Erreur DB (fichier verrouillé): arrêter backend/client avant `node force-recreate-db.js`.
- CORS: le frontend doit pointer vers `http://localhost:5001`.

## 📁 Structure (simplifiée)
```
localprice/
├── client/          # React (UI)
├── routes/          # API Express
├── models/          # Modèles de données
├── database/        # Schéma + seed SQLite
├── scripts/         # Outils DB/debug
├── server.js        # Serveur Express
└── package.json
```

## 🚀 Prochaines étapes
- Personnaliser l’interface
- Ajouter vos fournisseurs/produits
- Configurer l’authentification (si besoin de rôles avancés)
- Déployer en production

> Voir aussi: `README.md` (détails des fonctionnalités) et `BRANCH_NAMING_CONVENTION.md` (workflow Git).