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

## 🧾 Générer un XLSForm Kobo (soumission de prix)
- Script Python: `scripts/generate_kobo_xlsform.py`
- Prérequis: `pip install openpyxl requests`
- Générer depuis la base SQLite (par défaut):
  - `python scripts/generate_kobo_xlsform.py`
- Générer via l’API (backend sur `http://localhost:5001`):
  - `python scripts/generate_kobo_xlsform.py --use-api --api-url http://localhost:5001/api`
- Sortie par défaut: `scripts/output/kobo_price_submission.xlsx`
- Le formulaire inclut:
  - Catégorie → Produit (filtré par catégorie)
  - Localité + Sous-localité
  - Prix (FCFA) + Unité
  - Date (<= aujourd’hui), Commentaire (<= 500 chars)
  - Source + Type de source
  - Contact (nom, téléphone `01XXXXXXXX`, relation)
  - Géopoint (optionnel), Langue de communication

## 🔔 Webhook Kobo (REST)
- Endpoint: `POST /api/kobo/webhook` (santé: `GET /api/kobo/health`).
- Sécurité: configurez `KOBO_WEBHOOK_SECRET` dans votre `.env`.
  - Envoyez le secret via l’un des mécanismes suivants:
    - `Authorization: Bearer <secret>`
    - `X-Kobo-Webhook-Secret: <secret>` (ou `X-Webhook-Secret`)
    - `?token=<secret>` dans l’URL
- Type: `JSON` (dans KoboToolbox: Services REST → Type JSON).
- Corps attendu (champs principaux):
  - `product_id` (number), `unit_id` (number), `locality_id` (number), `price` (number), `date` (ISO `YYYY-MM-DD`).
  - Optionnels: `comment`, `gps` ("lat lon [alt] [acc]"), `sub_locality`, `source`, `source_type`, `source_contact_name`, `source_contact_phone`, `source_contact_relation`, `source_language_id`.
  - Support des champs "other":
    - `category_id: "other"` + `new_category_name`, `new_category_type` (`brut`|`transforme`)
    - `product_id: "other"` + `new_product_name`
    - `unit_id: "other"` + `new_unit_name` (+ `new_unit_symbol`)
    - `source_language_id: "other"` + `new_language_name`
- Réponse:
  - Succès: `{ success: true, message: "Soumission Kobo reçue", data: { price_id } }`
  - Erreur: `{ success: false, message: "..." }`

### Exemple de test (PowerShell)
```powershell
$headers = @{ Authorization = 'Bearer dev_secret_123' }
$body = @{ 
  product_id = 1; unit_id = 1; locality_id = 35; price = 450; 
  date = (Get-Date -Format 'yyyy-MM-dd'); comment = 'Test via webhook'; 
  gps = '6.4000 2.5000 50 5'; source = 'Marché local'; source_type = 'vendeur';
  source_contact_name = 'Alice'; source_contact_phone = '0123456789';
  source_contact_relation = 'vendeur'; sub_locality = 'Quartier central';
  source_language_id = 1;
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:5001/api/kobo/webhook -Headers $headers -ContentType 'application/json' -Body $body
```
Remplacez le port par celui défini dans `PORT` si différent (ex.: 5002 en dev).

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

## 🔄 Changements récents
- Suppression de l’outil calculateur public et de sa page dédiée.
- Retrait de l’entrée correspondante dans le menu du Dashboard.
- Suppression de la route `'/cost-comparator'` et des liens de navigation associés.
- Nettoyage côté client des imports liés au calculateur; les endpoints API de calcul (`/api/costs/*`) restent disponibles côté backend.