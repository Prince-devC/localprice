# Guide de déploiement Lokali (gratuit pour commencer)

Ce guide explique comment déployer Lokali avec des offres gratuites, sans domaine personnalisé au début, tout en gardant backend, frontend et emails fonctionnels.

- Backend API : Render
- Frontend React : Vercel
- Base de données et auth : Supabase (déjà en place)
- Emails : Mailtrap pour les tests + un fournisseur SMTP gratuit pour les envois réels

Quand tu achèteras `lokali.bj`, tu pourras brancher le domaine sans refaire tout le déploiement.

---

## 0. Prérequis

- Un compte GitHub avec le dépôt `lokali` (celui que tu pousses déjà vers `TripleCrownDiamond/lokali`)
- Un compte :
  - Render (https://render.com)
  - Vercel (https://vercel.com)
  - Supabase (déjà existant pour la base de données)
  - Mailtrap (https://mailtrap.io) pour les tests
  - Un fournisseur d’emails gratuit (par exemple Brevo, Mailjet, etc.) pour les envois réels

---

## 1. Préparer le dépôt GitHub

Si ce n’est pas déjà fait :

1. Configurer le remote GitHub principal (si besoin) :

   ```bash
   git remote set-url origin https://github.com/TripleCrownDiamond/lokali.git
   ```

2. Pousser la branche principale :

   ```bash
   git push origin main
   ```

Render et Vercel pointeront tous les deux sur ce dépôt.

---

## 2. Déployer le backend sur Render

### 2.1 Créer le service web

1. Aller sur https://render.com
2. Créer un nouveau “Web Service”
3. Connecter ton compte GitHub
4. Choisir le repo `TripleCrownDiamond/lokali`
5. Paramètres principaux :

- Root directory : racine du repo (là où il y a `server.js` et `package.json`)
- Runtime : Node
- Build command : `npm install`
- Start command : `npm start`

Render va ensuite installer les dépendances et lancer `node server.js`.

### 2.2 Variables d’environnement backend

Dans l’onglet “Environment” du service Render, créer les variables suivantes (en copiant depuis ton fichier `.env` local, mais sans le committer) :

Indispensables :

- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Emails (SMTP générique, utilisé d’abord avec Mailtrap puis avec un vrai fournisseur) :

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_REQUIRE_TLS`
- `SMTP_AUTH_METHOD`

Identité emails :

- `MAIL_FROM_NAME`
- `MAIL_FROM_ADDRESS`
- `MAIL_REPLY_TO`
- `MAIL_BRAND_NAME`
- `MAIL_ACTION_URL` (provisoirement : URL Vercel, voir section 3)
- `MAIL_UNSUBSCRIBE_URL` (URL Vercel)
- `MAIL_UNSUBSCRIBE_EMAIL`
- `MAIL_UNSUBSCRIBE_ONECLICK`

Webhook Kobo :

- `KOBO_WEBHOOK_SECRET`

Ne pas définir `PORT` : Render fournit sa propre valeur et `server.js` l’utilise automatiquement.

### 2.3 Tester l’API Render

Une fois le déploiement terminé, Render fournit une URL du type :

- `https://lokali-api.onrender.com`

Tester la route de santé :

- Ouvrir `https://lokali-api.onrender.com/api/test`
- Réponse attendue : `{"message":"API Lokali fonctionne!"}`

Si ça marche, le backend est opérationnel.

---

## 3. Déployer le frontend sur Vercel

Le frontend est dans le dossier `client` (Create React App).

### 3.1 Importer le projet

1. Aller sur https://vercel.com
2. “New Project” → “Import Git Repository”
3. Choisir `TripleCrownDiamond/lokali`
4. Important : dans les paramètres, définir :

- Root Directory : `client`
- Framework Preset : React (Create React App)
- Build Command : `npm run build`
- Output Directory : `build`

### 3.2 Variable d’environnement frontend

Dans les variables d’environnement du projet Vercel (scope “Production”) :

- `REACT_APP_API_URL` = `https://lokali-api.onrender.com/api`

Le fichier `client/src/services/api.js` utilise cette variable si elle est définie, sinon `/api`. En production, on force l’URL complète de l’API Render.

### 3.3 Déployer et tester

Vercel va builder le projet et donner une URL comme :

- `https://lokali.vercel.app`

Tester :

- Ouvrir le site
- Vérifier que les pages chargent et que les appels API partent vers `https://lokali-api.onrender.com/api/...`

---

## 4. Emails : tests avec Mailtrap puis envois réels gratuits

### 4.1 Environnement de test avec Mailtrap

Tu utilises déjà Mailtrap en développement. Pour tester tous les flux sans envoyer de vrais emails :

- Conserver les identifiants Mailtrap (sandbox) dans les variables SMTP
- Tous les emails envoyés par l’API seront visibles uniquement dans ton dashboard Mailtrap

C’est idéal pour vérifier les contenus, les liens, les traductions, etc. sans spammer de vraies boîtes.

### 4.2 Passer à un fournisseur gratuit pour des emails réels

Pour envoyer des emails vers de vraies adresses gratuitement, tu peux utiliser un fournisseur SMTP gratuit, par exemple :

- Brevo (anciennement Sendinblue) : quota gratuit quotidien
- Mailjet (offre gratuite limitée)

Le principe est toujours le même :

1. Créer un compte chez le fournisseur choisi (Brevo, Mailjet, etc.).
2. Dans la section SMTP / API, récupérer :
   - hôte SMTP (host)
   - port (souvent 587 ou 465)
   - nom d’utilisateur (user)
   - mot de passe (pass) ou clé API
3. Créer une adresse d’expéditeur (par exemple ton adresse Gmail ou une adresse fournie par le service) et la valider si nécessaire.
4. Mettre à jour sur Render les variables :

- `SMTP_HOST` = host du fournisseur
- `SMTP_PORT` = port SMTP
- `SMTP_SECURE` = `true` si tu utilises le port 465, sinon `false`
- `SMTP_USER` = identifiant / clé API
- `SMTP_PASS` = mot de passe / clé API
- `SMTP_REQUIRE_TLS` = souvent `true` pour le port 587
- `SMTP_AUTH_METHOD` = en général `LOGIN` ou laisser la valeur par défaut du provider

5. Ajuster l’identité des emails :

- `MAIL_FROM_NAME` = Lokali (ou autre nom d’affichage)
- `MAIL_FROM_ADDRESS` = une adresse autorisée par ton fournisseur (par ex. ton adresse de test ou une adresse gérée par le service)
- `MAIL_REPLY_TO` = l’adresse où tu veux réellement recevoir les réponses

6. Adapter les URLs dans les emails pour pointer vers ton frontend déployé :

- `MAIL_ACTION_URL=https://lokali.vercel.app/dashboard`
- `MAIL_UNSUBSCRIBE_URL=https://lokali.vercel.app/profile#notifications`

Avec cette configuration, les emails envoyés par Lokali arriveront dans de vraies boîtes (Gmail, Outlook, etc.), tout en restant sur des offres gratuites de départ.

---

## 5. Supabase (base de données et auth)

Supabase est déjà utilisé pour :

- la base Postgres (`SUPABASE_DB_URL`)
- l’authentification (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

Rappels :

- Ne pas exposer les clés `SERVICE_ROLE_KEY` dans le frontend (elles restent uniquement sur Render).
- Les règles RLS et la configuration Supabase restent à gérer dans l’interface Supabase, indépendamment de Render et Vercel.

---

## 6. Webhook Kobo

Quand le backend est sur Render, l’URL du webhook Kobo devient :

- `https://lokali-api.onrender.com/api/kobo/webhook`

À faire dans KoboToolbox :

1. Aller dans les paramètres de webhook du formulaire
2. URL du webhook : l’URL Render ci-dessus
3. Secret du webhook : la valeur de `KOBO_WEBHOOK_SECRET` utilisée sur Render

Tester ensuite une soumission depuis Kobo pour vérifier que les prix arrivent bien dans la base.

---

## 7. Quand le domaine `lokali.bj` sera prêt

Quand tu auras acheté `lokali.bj`, tu pourras améliorer la config :

### 7.1 Connecter le domaine à Vercel

1. Dans Vercel, aller dans les settings du projet frontend
2. Ajouter un domaine personnalisé : `lokali.bj`
3. Vercel te donnera les enregistrements DNS à mettre chez ton registrar (CNAME ou A)
4. Une fois la propagation faite, le frontend sera accessible sur :

- `https://lokali.bj`

Tu pourras alors :

- mettre à jour `MAIL_ACTION_URL` → `https://lokali.bj/dashboard`
- mettre à jour `MAIL_UNSUBSCRIBE_URL` → `https://lokali.bj/profile#notifications`

### 7.2 Optionnel : sous-domaine API

Tu peux garder l’API sur `https://lokali-api.onrender.com` ou créer un sous-domaine (par exemple `api.lokali.bj`) :

1. Créer un nouveau service Render ou configurer un custom domain sur le service existant
2. Mettre `REACT_APP_API_URL` sur Vercel à :

- `https://api.lokali.bj/api`

3. Ajouter `https://lokali.bj` (et `https://api.lokali.bj` si besoin) dans la liste `origin` autorisée dans le middleware CORS de `server.js`.

---

## 8. Résumé rapide pour démarrer sans domaine

1. Backend : Render
   - `npm install`
   - `npm start`
   - Variables d’environnement copiées depuis `.env`
   - Tester `https://<render-app>.onrender.com/api/test`

2. Frontend : Vercel
   - Root : `client`
   - `REACT_APP_API_URL=https://<render-app>.onrender.com/api`
   - Tester `https://<vercel-app>.vercel.app`

3. Emails :
   - Pour les tests : garder Mailtrap
   - Pour les envois réels : configurer un fournisseur SMTP gratuit (Brevo, Mailjet, etc.) en remplissant les variables `SMTP_*`, et adapter `MAIL_ACTION_URL` et `MAIL_UNSUBSCRIBE_URL` aux URLs Vercel

Tu peux commencer à utiliser Lokali en ligne avec ces URLs, puis raccorder `lokali.bj` plus tard.
