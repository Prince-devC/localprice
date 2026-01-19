# 🛒 Lokali — Plateforme de Transparence Agricole

Lokali est une plateforme de transparence de prix des produits agricoles et de mise en relation des coopératives et acheteurs. Elle collecte, modère et publie des prix locaux (agricoles), avec un annuaire de fournisseurs et des outils de comparaison. Elle intègre un flux de collecte (formulaires ou webhook Kobo), une modération côté administrateur, et une interface publique orientée recherche/visualisation.

## 🎯 Vue d’ensemble
- Collecte des prix via formulaire ou webhook Kobo (REST)
- Stockage des données dans PostgreSQL (Supabase)
- Modération: validation/refus des contributions/prix (via routes Admin)
- Publication: carte/table des prix filtrables, fiches fournisseurs détaillées
- Contact: formulaire de contact fournisseur (auth requise)
- Auth: intégration Supabase + JWT côté API
- Notifications email: envoi de mails (approbation/refus), URLs par défaut sur http://localhost:3000
- Paramètres: endpoints pour la configuration (Kobo, etc.)
- SEO: endpoints dédiés pour le référencement

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
- Backend: Node.js (Express), PostgreSQL (Supabase)
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

2) Configurer la base Postgres (Supabase)
```bash
# Renseigner l’URL de connexion Supabase dans .env
# Exemple:
# SUPABASE_DB_URL=postgres://postgres:password@host:5432/postgres?sslmode=require

# Appliquer le schéma Postgres (optionnel en local si non géré par migrations)
# Voir: database/postgres-schema.sql et database/postgres-indexes.sql
```

3) Démarrer les serveurs
```bash
# Option recommandée: backend + frontend
npm run start:all

# Ou séparément
npm run dev     # Backend sur http://localhost:5000
npm run client  # Frontend sur http://localhost:3000
```

Frontend: `http://localhost:3000/`  |  Backend API: `http://localhost:5000/`

## 🧭 Routes principales
- `/` — Carte/Table des prix
- `/suppliers` — Liste des fournisseurs (prix, disponibilités colorées)
- `/supplier/:id/contact` — Contact du fournisseur (auth requise)
 - `/login`, `/register` — Auth utilisateur (UI)

## 📁 Structure (simplifiée)
```
lokali/
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
│   ├── postgres.js
│   ├── postgres-schema.sql
│   └── postgres-indexes.sql
├── routes/
│   ├── suppliers.js
│   ├── agricultural-prices.js
│   ├── contributions.js
│   ├── admin.js
│   ├── filter-options.js
│   ├── localities.js
│   ├── products.js
│   ├── product-categories.js
│   ├── stores.js
│   ├── seo.js
│   ├── settings.js
│   ├── auth.js
│   └── units.js
├── scripts/
│   ├── check-table-counts.js
│   └── inspect-refs.js
└── server.js
```

## 🔌 API (extraits utiles)
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
- `POST /api/contributions/apply` — Soumettre une demande de contribution
- `GET /api/contributions/me` — Consulter ma dernière demande
- `GET /api/seo/*` — Métadonnées SEO
- `GET/PUT /api/settings/kobo` — Paramétrage Kobo (secret, url, etc.)

## 🗃️ Base de Données
- Postgres (Supabase) — configurez `SUPABASE_DB_URL` dans `.env`.
- Schéma: `database/postgres-schema.sql` et index `database/postgres-indexes.sql`.
- Connexion: `database/connection.js` bascule sur l’adaptateur Postgres.

- ## 🧾 Générer un XLSForm Kobo (soumission de prix)
- Script Python: `scripts/generate_kobo_xlsform.py`
- Prérequis: `pip install openpyxl requests`
- Générer via l’API (recommandé):
  - `python scripts/generate_kobo_xlsform.py --use-api --api-url http://localhost:5000/api`
  - Sortie par défaut: `scripts/output/kobo_price_submission.xlsx`
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
Invoke-RestMethod -Method POST -Uri http://localhost:5000/api/kobo/webhook -Headers $headers -ContentType 'application/json' -Body $body
```
Remplacez le port par celui défini dans `PORT` si différent (ex.: 5002 en dev).

## 🐛 Dépannage
- `net::ERR_CONNECTION_REFUSED` (client): démarrer `npm run client`; si port 3000 occupé (Windows):
  - `netstat -ano | findstr :3000` puis `taskkill /PID <PID> /F`
  - ou lancer sur `3000`: `cd client; $env:PORT=3000; npm start`
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