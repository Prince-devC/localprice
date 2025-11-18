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
# Linux/macOS
cp env.example .env
# Windows PowerShell
Copy-Item env.example .env
```

## 🗃️ Base de données Postgres (Supabase)
- Configurez une instance Supabase ou Postgres accessible.
- Renseignez la chaîne de connexion dans `.env` via `SUPABASE_DB_URL`.
- Schéma disponible dans `database/postgres-schema.sql` et `database/postgres-indexes.sql`.
- Optionnel: appliquez ces fichiers via `psql` en local si nécessaire.

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
npm run dev    # API sur http://localhost:5000
# Terminal 2
npm run client # React sur http://localhost:3000
```

## 🌐 Accès
- Frontend: `http://localhost:3000/`
- Backend API: `http://localhost:5000/`

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
      $env:PORT=3000; npm start
      ```
- Erreur DB: vérifiez `SUPABASE_DB_URL` et la disponibilité du service Postgres.
- Certificats SSL: en dev, la variable `NODE_TLS_REJECT_UNAUTHORIZED=0` est activée pour faciliter les tests.
- CORS: le frontend doit pointer vers `http://localhost:5000`.

## 📁 Structure (simplifiée)
```
localprice/
├── client/          # React (UI)
├── routes/          # API Express
├── models/          # Modèles de données
├── database/        # Connexion + schéma Postgres
├── scripts/         # Outils Postgres/Supabase
├── server.js        # Serveur Express
└── package.json
```

## 🚀 Prochaines étapes
- Personnaliser l’interface
- Ajouter vos fournisseurs/produits
- Configurer l’authentification (si besoin de rôles avancés)
- Déployer en production

> Voir aussi: `README.md` (détails des fonctionnalités) et `BRANCH_NAMING_CONVENTION.md` (workflow Git).