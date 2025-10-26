# 🛒 Lokali — Comparaison de Prix Locaux (État Actuel)

Lokali est une application web permettant de visualiser et comparer les prix agricoles par localité. L’accueil affiche une carte et/ou une table des prix, centrée sur le Bénin, avec des filtres simples/avancés.

## ✨ Fonctionnalités Actuelles
- Carte et table des prix agricoles (accueil)
- Filtres produits, catégories, localités, période, prix min/max
- Détails des points (produit, prix, unité, localité, date)
- Pages : Recherche, Comparaison, Admin
- Page Fournisseurs (`/suppliers`) :
  - Liste avec `SupplierCard` (prix, coordonnées)
  - **Disponibilités colorées** (vert/orange/rouge) et badges prix
  - Bouton `Contacter` (redirige vers login si non authentifié)
- Page Contact Fournisseur (`/supplier/:id/contact`) — **authentification requise**

## 🛠️ Stack Technologique
- Backend: Node.js (Express), SQLite (`sqlite3`)
- Frontend: React 18, React Router 6, Styled Components, React-Leaflet, Axios
- Autres: Helmet, CORS, express-rate-limit

## 📋 Prérequis
- `Node.js` 16+ et `npm`

## 🚀 Installation et Démarrage
1) Installer les dépendances
```bash
npm install
cd client && npm install && cd ..
```

2) Initialiser la base SQLite
```bash
# Crée/rafraîchit la base et charge le schéma et les données
node init-db.js

# Option: recréation forcée (supprime le fichier DB, puis réapplique)
node force-recreate-db.js
```

3) Démarrer les serveurs
```bash
# Option recommandée: backend + frontend
npm run start:all

# Ou séparément
npm run dev     # Backend sur http://localhost:5001
npm run client  # Frontend sur http://localhost:3000
```

Frontend: `http://localhost:3000/`  |  Backend API: `http://localhost:5001/`

## 🧭 Routes principales
- `/` — Carte/Table des prix
- `/suppliers` — Liste des fournisseurs (prix, disponibilités colorées)
- `/supplier/:id/contact` — Contact du fournisseur (auth requise)

## 📁 Structure (simplifiée)
```
localprice/
├── client/
│   ├── src/
│   │   ├── components/SupplierCard.js
│   │   ├── pages/SuppliersPage.js
│   │   ├── pages/SupplierContact.js
│   │   ├── components/PriceMap.js
│   │   ├── pages/PriceMapPage.js
│   │   └── App.js
├── database/
│   ├── connection.js
│   ├── sqlite-schema.sql
│   └── sqlite-data.sql
├── routes/
│   ├── suppliers.js
│   ├── agricultural-prices.js
│   ├── filter-options.js
│   ├── localities.js
│   ├── products.js
│   ├── product-categories.js
│   ├── stores.js
│   └── units.js
├── scripts/
│   ├── debug-data-exec.js
│   └── verify-db.js
├── init-db.js
├── force-recreate-db.js
└── server.js
```

## 🔌 API (extraits utiles au frontend)
- `GET /api/suppliers` — Liste des fournisseurs
- `GET /api/suppliers/:id/summary` — Prix/disponibilités/coordonnées par fournisseur
- `GET /api/agricultural-prices` — Liste des prix validés (filtres pris en charge)
- `GET /api/filter-options/products` — Options de filtre produits
- `GET /api/filter-options/categories` — Options de filtre catégories
- `GET /api/filter-options/localities` — Options de filtre localités
- `GET /api/localities` — Localités
- `GET /api/products` — Produits
- `GET /api/product-categories` — Catégories
- `GET /api/stores` — Fournisseurs
- `GET /api/units` — Unités

## 🗃️ Base de Données
- Fichier SQLite: `database/lokali.db` (créé automatiquement).
- Schéma: `database/sqlite-schema.sql`.
- Données de seed: `database/sqlite-data.sql`.
- Outils:
  - `node init-db.js` — exécute schéma + seed
  - `node force-recreate-db.js` — supprime le fichier DB puis réapplique
  - `node scripts/verify-db.js` — vérifie le contenu (fournisseurs/prix/disponibilités)
  - `node scripts/debug-data-exec.js` — identifie une requête SQL fautive dans le seed

## 🐛 Dépannage
- `net::ERR_CONNECTION_REFUSED` (client): démarrer `npm run client`; si port 3000 occupé (Windows):
  - `netstat -ano | findstr :3000` puis `taskkill /PID <PID> /F`
  - ou lancer sur `3001`: `cd client; $env:PORT=3001; npm start`
- Erreur HMR: fermer les instances React en double, forcer le refresh (Ctrl+Shift+R), redémarrer le client.
- Erreur DB EBUSY: arrêter le backend/client avant `force-recreate-db.js`.

## 🤝 Contribution
- Ouvrir une branche feature (voir `BRANCH_NAMING_CONVENTION.md`).
- Garder des changements ciblés et documentés.
- Ajouter des tests si pertinent, respecter le style du codebase.

## 📝 Licence
Projet sous licence MIT.