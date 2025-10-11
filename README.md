# 🛒 Lokali — Comparaison de Prix Locaux (État Actuel)

Lokali est une application web permettant de visualiser et comparer les prix agricoles par localité. L’accueil affiche directement la carte des prix, centrée sur le Bénin, avec des filtres simples/avancés et des marqueurs par produit.

## ✨ Fonctionnalités Actuelles

- Carte des prix agricoles (accueil) centrée sur le Bénin
- Filtres produits, catégories, localités, période, prix min/max
- Détails des points (produit, prix, unité, localité, date)
- Pages : Recherche, Détail produit, Liste/Détail fournisseurs, Comparaison, Admin

## 🛠️ Stack Technologique

- Backend: Node.js (Express), SQLite (`sqlite3`)
- Frontend: React 18, React Router 6, Styled Components, React-Leaflet, Axios
- Autres: Helmet, CORS, express-rate-limit

## 📋 Prérequis

- Node.js 16+ et npm

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
# Backend (port 5001)
npm run dev

# Frontend (port 3000)
npm run client

# Option: démarrer les deux en même temps
npm run start:all
```

Frontend: `http://localhost:3000/`  |  Backend API: `http://localhost:5001/`

## 🗺️ Page Carte (Accueil)

- Route `/` affiche `PriceMapPage`.
- Centre par défaut: `[9.3077, 2.3158]` (Bénin), `zoom=7`.
- Marqueurs colorés et dimensionnés selon le niveau de prix.
- Filtres simples/avancés, conversion automatique vers paramètres API.

## 📁 Structure (simplifiée)

```
localprice/
├── client/
│   ├── src/
│   │   ├── components/PriceMap.js
│   │   ├── pages/PriceMapPage.js
│   │   └── App.js
├── database/
│   ├── connection.js
│   ├── sqlite-schema.sql
│   └── sqlite-data.sql
├── routes/
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
- Schéma: `database/sqlite-schema.sql` (DROP + CREATE garantissent la cohérence).
- Données de seed: `database/sqlite-data.sql`.
- Outils:
  - `node init-db.js` — exécute schéma + seed
  - `node force-recreate-db.js` — supprime le fichier DB puis réapplique
  - `node scripts/verify-db.js` — vérifie le contenu (fournisseurs/prix/disponibilités)
  - `node scripts/debug-data-exec.js` — identifie une requête SQL fautive dans le seed

## 🐛 Dépannage

- Erreur HMR: `net::ERR_ABORTED ... hot-update.json`
  - Fermer les instances React en double; ne laisser qu’un seul `npm run client`.
  - Forcer l’actualisation du navigateur (Ctrl+Shift+R).
  - Redémarrer le client (`CTRL+C` puis `npm run client`).

- Erreur EBUSY lors de la recréation DB
  - Arrêter le backend/client qui utilisent la DB avant `force-recreate-db.js`.
  - Le script importe la connexion après suppression du fichier pour éviter le verrouillage.

## 🤝 Contribution

- Ouvrir une branche feature, garder des changements ciblés et documentés.
- Ajouter des tests si pertinent, respecter le style du codebase.

## 📝 Licence

Projet sous licence MIT.