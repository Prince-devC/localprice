# Lokali × FID — Proposition d’impact et méthodologie

## Qui sommes-nous
- Lokali est une plateforme ouverte de transparence des prix agricoles, conçue pour outiller les acteurs locaux (producteurs, commerçants, coopératives, collectivités) et les décideurs.
- Nous facilitons la collecte, la validation et la diffusion de données de prix au plus près des marchés, avec une approche centrée sur l’utilisateur et des outils légers (KoboToolbox, web, mobile).
- L’objectif est de réduire les asymétries d’information, améliorer la résilience des ménages et soutenir des politiques publiques fondées sur des preuves.

## Notre approche
- Données probantes: collecte structurée via KoboToolbox (XLSForm “Soumettre un prix de produit agricole”), intégration automatisée (webhook sécurisé), contrôle qualité et traçabilité.
- Validation et gouvernance: workflow d’examen des contributions, métadonnées (localité, unité, source), journalisation, règles de cohérence et détection d’anomalies.
- Ouverture et interopérabilité: API REST, formats export (CSV/XLSX), documentation, et respect de la protection des données.
- Co‑conception: implication de contributeurs locaux, retour d’usage, et amélioration continue guidée par les métriques.

## Impact (attendu et mesurable)
- Transparence des marchés: réduction des écarts de prix intra/inter‑localités et des comportements opportunistes.
- Pouvoir de négociation: hausse des revenus des petits producteurs et optimisation des décisions de vente/achat.
- Résilience: atténuation des chocs de prix et amélioration de la sécurité alimentaire.
- Politiques publiques: indicateurs opérationnels pour calibrer des interventions (subventions ciblées, information des marchés, soutien logistique).

## Éclairages (insights clés)
- Cartographie dynamique des prix et des tendances spatio‑temporelles.
- Indice de transparence (couverture × fraîcheur × dispersion) par localité.
- Détection précoce d’anomalies (pics, ruptures), alertes et retours terrain.
- Profils de contribution: qualité, régularité et diversité linguistique.

## Notre impact (mesure et visualisation)
- Conception d’évaluation: possibilités d’essais contrôlés randomisés (RCT) ou de quasi‑expérimentations (DiD, appariement), suivant contexte et éthique.
- Indicateurs principaux:
  - Prix: médiane, dispersion (écart‑type, IQR), spread inter‑localités, volatilité (EWMA), anomalies.
  - Adoption: nombre de contributeurs actifs, fréquence de soumissions, ratio validations/rejets, temps de traitement.
  - Couverture: part de localités couvertes, fraîcheur des données, diversité des produits/unités/langues.
  - Résultats: variation des revenus (si disponibles), qualité des décisions (sondages), bien‑être (proxies).
- Visualisation (tableaux de bord):
  - Tendances et comparaisons multi‑localités; carte des marchés; indicateurs synthétiques.
  - Filtres par produit, période, unité; export CSV/XLSX; API pour chercheurs.
  - Traçabilité: historique des validations, journaux et provenance (source/type/méthode).

## Bénéfices de Lokali — ce que vous y gagnez
- Producteurs et contributeurs:
  - Accès rapide à des prix fiables et à jour pour mieux négocier.
  - Réduction de l’asymétrie d’information et amélioration des revenus.
  - Outils simples (KoboCollect, web) et reconnaissance des contributions validées.
- Commerçants et coopératives:
  - Benchmarks inter‑localités pour fixer des prix équitables et compétitifs.
  - Meilleure planification d’approvisionnement et réduction des coûts liés aux incertitudes.
- Collectivités et administrations:
  - Indicateurs opérationnels pour cibler les interventions et lutter contre la spéculation.
  - Veille des marchés (volatilité, anomalies) et appui aux politiques publiques.
- Bailleurs et ONG:
  - Mesure d’impact rigoureuse (RCT/DiD), preuves pour passage à l’échelle.
  - Suivi de performance: adoption, couverture, qualité des données, résultats.
- Chercheurs et universités:
  - Accès à des données structurées (API, exports) pour analyses reproductibles.
  - Possibilités d’expérimentations et de réplications en conditions réelles.
- Consommateurs:
  - Transparence des prix et protection contre les sur‑paiements.

### Gains opérationnels
- Automatisation de la collecte (webhook sécurisé), gains de temps et réduction des coûts.
- Contrôle qualité et traçabilité des données, amélioration de la confiance.
- Interopérabilité (API, CSV/XLSX) et intégration dans des systèmes existants.

### Indicateurs de valeur
- Adoption (utilisateurs actifs, fréquence de soumission), couverture (localités, produits), qualité (validation, taux d’erreurs), délais (mise à jour, traitement), impact (dispersion des prix, revenus si observables).

## Fonctionnalités de Lokali (complet)
 - Collecte de prix agricole via KoboToolbox:
   - Génération d’XLSForm dédiée (« Soumettre un prix de produit agricole »), `form_id = price_submission`.
   - Webhook sécurisé (`/api/kobo/webhook`) avec `KOBO_WEBHOOK_SECRET` et santé (`/api/kobo/health`).
   - Tunnelisation possible (ngrok) pour tests et déploiements.
   - Périmètre pilote: collecte uniquement via Kobo; autres canaux hors scope.
- Modération et validation des contributions:
  - Flux de contributions (`/api/contributions`) et scripts qualité (ex: `find-broken-prices.js`).
  - Traçabilité des validations et provenance des données.
- Catalogue et référentiels:
  - Produits, catégories, unités, langues, localités, fournisseurs, magasins.
  - Endpoints REST dédiés (`/api/products`, `/api/product-categories`, `/api/units`, `/api/languages`, `/api/localities`, `/api/suppliers`, `/api/stores`).
- Prix et comparaisons:
  - Prix agricoles et prix produits (`/api/agricultural-prices`, `/api/prices`).
  - Comparaisons (`/api/comparisons`) et filtres (`/api/filter-options`).
- Internationalisation et accessibilité:
  - Modèle `Language`, textes côté client, possibilité de localiser l’interface.
- Administration et sécurité:
  - Rôles (`middleware/roleAuth.js`), création d’admin, gestion via routes `admin.js`.
  - Secret webhook, contrôle d’accès, bonne hygiène des endpoints.
- Intégrations et export:
  - API publique (lecture), exports CSV/XLSX (scripts), intégration Supabase (import/sync).
- Tests et performance:
  - Test de charge k6 (`tests/load/contributions-apply-k6.js`).
  - Scripts de vérification de tables et séquences.

### Authentification & rôles
- Supabase JWT: `login`, `register`, `profile`, `roles`, changement de mot de passe, OTP.
- Rôles: `user`, `contributor`, `admin`, `super_admin` avec middlewares (`requireRole`, `requireAdmin`).
- Page protégée: `SupplierContact` (route `/supplier/:id/contact`).

### Notifications & e-mails
- SMTP configurable (`env.example`): envoi d’e-mails (validation, OTP, assistance).
- Gabarits d’e-mails (`utils/emailTemplates.js`) et utilitaire d’envoi (`utils/mailer.js`).

### SEO & paramètres
- Paramètres SEO (`/api/seo/settings`) et paramètres d’application (`/api/settings`).
- Lecture/écriture sécurisées (auth optionnelle et rôles élevés pour la mise à jour).

### UI cartes et pages
- Pages: Home, Recherche, Produits, Magasins, Fournisseurs, Comparaison, Profil, Auth.
- Carte des prix (Leaflet), tableau des prix, filtres simples/avancés, pages légales (CGU/Confidentialité).

### Offres et souscriptions (admin)
- Gestion des offres, souscriptions, bannissement/suppression groupée d’utilisateurs.
- Audit logs et tableau de bord admin, génération XLSForm Kobo (`/admin/kobo/xlsform`).

### Sécurité & résilience
- Helmet, CORS, rate limiting, logs d’erreurs, pages 404/500.
- Schéma défensif (création/altération de tables si manquantes), traçabilité des sources.

### Collecte des données (pilote: Kobo uniquement)
- KoboToolbox (XLSForm + webhook sécurisé): génération via `scripts/generate_kobo_xlsform.py`, réception sur `/api/kobo/webhook`.

### Évolutions prévues — fournisseurs, magasins de stockage et coûts de transport
- Fiches fournisseurs et magasins de stockage
  - Informations: identité, localisation, contacts, horaires, capacité, fiabilité.
  - Association des prix pratiqués par lieu (traçabilité: prix → fournisseur/magasin).
  - Recherche et filtrage par disponibilité, distance, catégorie de produit.
- Outils de calcul des coûts de transport pour les commerçants
  - Paramètres: origine/destination, volume/poids, type de véhicule, coût carburant.
  - Intégration API itinéraire (OpenStreetMap/OSRM) pour distances/temps estimés.
  - Calcul: coût total de l’approvisionnement, coût unitaire livré, marge nette estimée.
  - Intégration UI: simulateur sur pages Comparaison/Prix, export CSV.
- Impact attendu
  - Aide à la décision des commerçants: choix du fournisseur/lieu optimal, itinéraires, timing.
  - Réduction des coûts logistiques et meilleure planification des achats.
  - Transparence accrue sur la chaîne d’approvisionnement locale.
 - Roadmap
  - Conception des modèles et endpoints dédiés (suppliers/stores/costs étendus).
  - Prototype du simulateur de coûts de transport et tests utilisateurs.
  - Déploiement progressif après validation du pilote Kobo.

## Exigences pour déployer et tester (pilote)
- Infrastructure:
  - Hébergement du backend Node.js (`PORT=5000`), base de données PostgreSQL.
  - Domaine/URL publique (ngrok ou reverse proxy), certificats TLS en production.
  - Supervision basique: logs, alertes d’erreurs, métriques d’adoption.
- Processus et outils:
  - Mise en place du webhook Kobo, configuration REST Service avec header bearer.
  - Formation des contributeurs (KoboCollect) et guides opérationnels.
  - Modèle de validation des prix (règles, seuils, workflow).
- Données et qualité:
  - Référentiels produits/unités/langues/localités renseignés et maintenus.
  - Plan d’échantillonnage des marchés/localités pour couverture représentative.
- Évaluation d’impact:
  - Design (RCT/DiD) selon contexte, pré‑enregistrement, calcul de puissance, protocole éthique.
  - Indicateurs: dispersion de prix, volatilité, revenus/proxies, adoption.
 - Sécurité et conformité:
   - Configuration SMTP (OTP, notifications), gestion des secrets (`.env`).
   - Politique de confidentialité, consentement et anonymisation quand nécessaire.
   - Contrôles d’accès par rôles et journalisation d’administration.

## Budget estimatif pour pilote et évaluation (indicatif, 6–9 mois)
- Ingénierie produit (backend/frontend, data, QA): `€25k – €45k`.
- DevOps & hébergement (compute, DB, sauvegardes, observabilité): `€300 – €600 / mois`.
- Accès public stable (ngrok/proxy, nom de domaine): `€8 – €20 / mois` + `€15 / an`.
- Collecte terrain & formation (ateliers, déplacements, matériel): `€10k – €30k`.
- Incitations contributeurs (micro‑incitations pour soumissions validées): `€5k – €15k`.
- Évaluation d’impact (design, suivi, analyse; externe si besoin): `€20k – €60k`.
- Communication & diffusion (supports, ateliers partenaires): `€5k – €15k`.
- Gouvernance & coordination (PM, reporting FID, achats): `€15k – €25k`.
- Contingences (risques, imprévus, sécurisation): `~10%` du budget.

### Coûts récurrents supplémentaires (selon options)
- Fournisseur SMTP (Mailtrap/SendGrid/Postmark): `€0 – €30 / mois` (volumes pilotes).
- Supabase (plan et stockage): `€0 – €25 / mois` en pilote; plus élevé si trafic.
- Tuiles cartographiques/Proxy (si usage intensif): `€0 – €50 / mois`.
- Monitoring/Logs (Sentry/Logtail): `€0 – €20 / mois`.

### Phasage proposé
- Mois 1–2: cadrage, référentiels, configuration Kobo/webhook, tableau de bord minimum.
- Mois 3–6: collecte pilote, validation, itérations UX, indicateurs d’adoption et qualité.
- Mois 6–9: évaluation d’impact (analyse intermédiaire), consolidation, plan d’extension.

## Impact attendu sur les bénéfices (liens financement → résultats)
- Information de marché fiable
  - Financement infra/collecte → plus de soumissions valides → baisse de la dispersion de prix.
  - Gains pour producteurs (meilleure négociation, réduction des sur‑paiements).
- Adoption et couverture
  - Formation/incitations → augmentation des contributeurs actifs et de la fraîcheur des données.
  - Comparaisons inter‑localités pertinentes pour coopératives et décideurs.
- Qualité et confiance
  - Ingénierie/QA → baisse des erreurs, meilleure traçabilité, crédibilité accrue auprès des bailleurs.
- Passage à l’échelle
  - Évaluation d’impact financée → preuves robustes → mobilisation de partenaires et extension géographique.


## Projets (phases et feuille de route)
- Phase 0 — préparation: cartographie des marchés, mobilisation des acteurs, design des formulaires et protocole de mesure.
- Phase 1 — pilote: déploiement dans quelques localités, calibration des indicateurs, boucle de feedback utilisateur.
- Phase 2 — évaluation: plan d’identification (RCT/DiD), collecte des variables d’issue, analyse intermédiaire.
- Phase 3 — extension: passage à l’échelle, intégration institutionnelle, pérennisation et transfert.
- Phase 4 — politique publique: recommandations opérationnelles et intégration dans les systèmes d’information.

## Actualités (communication et diffusion)
- Notes de terrain, mises à jour produit, résultats intermédiaires et briefs politiques.
- Partenariats académiques et administration des preuves (rapports, jeux de données anonymisés).
- Vitrine publique (site) et portail API pour la communauté.

## Proposer un projet (dossier FID)
- Problématique: expliciter le besoin (asymétries, volatilité, inégalités) et la valeur ajoutée de Lokali.
- Innovation: démontrer la nouveauté (procédés de transparence, gouvernance des données, UX locale).
- Méthodologie: protocole d’évaluation rigoureux (RCT ou quasi‑expérimentations), indicateurs d’impact et de mise en œuvre, plan d’échantillonnage.
- Éthique: consentement, protection des données, minimisation des risques, biais et équité.
- Faisabilité: partenariats locaux, capacité opérationnelle, budget, calendrier et gestion des risques.
- Passage à l’échelle: stratégies d’intégration avec institutions, durabilité et coûts récurrents.

## Les projets du FID, la méthodologie du FID — alignement
- Synergie innovation–recherche: co‑conception avec équipes académiques, protocoles validés, réplications.
- Évaluation rigoureuse: identification causale (RCT/DiD), pré‑enregistrement, transparence et reproductibilité.
- Politique fondée sur preuves: indicateurs actionnables pour transformer les dispositifs publics.
- Inclusion et équité: accès des populations éloignées, multilinguisme, support hors‑ligne (via Kobo).

## Rechercher (ressources et données)
- API REST: endpoints pour prix, localités, unités et agrégats (documentation technique).
- Exports: jeux de données anonymisés pour analyse externe.
- Outils: guides XLSForm, schemas de données, scripts d’intégration et vérifications.

---

## Évaluation d’impact — références (Esther Duflo)
- Reconnaissance internationale: le Prix Nobel 2019 a été attribué à Abhijit Banerjee, Esther Duflo et Michael Kremer pour « l’approche expérimentale de la lutte contre la pauvreté » (J‑PAL, 2019 — https://www.povertyactionlab.org/updates/j-pal-co-founders-abhijit-banerjee-and-esther-duflo-awarded-nobel-memorial-prize-1).
- Méthode RCT et contrefactuel: les évaluations randomisées mesurent des effets attribuables en construisant un contrefactuel crédible ; Duflo souligne (BM, 2003) leur potentiel pour « révolutionner les politiques sociales » (EVAL — https://www.eval.fr/methodes-et-outils/evaluation-dimpact/randomized-controlled-trial-rct/).
- Protocoles éthiques: J‑PAL formalise des exigences (consentement, sécurité des données, IRB, audit des projets) et propose des guides pratiques sur la conception et l’éthique des essais (J‑PAL — https://www.povertyactionlab.org/resource/introduction-randomized-evaluations).
- Conception et coûts: randomisation équitable (par ex. en cas de sur‑demande), mesures à faible coût via données administratives ou enquêtes distantes ; possibilité de tester non seulement « si » mais « comment » une intervention fonctionne (J‑PAL — https://www.povertyactionlab.org/resource/introduction-randomized-evaluations).
- Diffusion en économie du développement: essor des essais randomisés pour évaluer politiques sociales (éducation, santé, microcrédit) et passage à l’échelle des programmes efficaces (The Conversation — https://theconversation.com/how-randomised-trials-became-big-in-development-economics-128398).
- Débat méthodologique: histoire, usages et limites (validité externe, monisme méthodologique) rappelés par la littérature (OpenEdition — https://journals.openedition.org/philosophiascientiae/1933?lang=en).

### Application à Lokali
- Pré‑enregistrement et transparence: registre AEA, protocole public, plan d’analyse et données anonymisées.
- Design: choix de l’unité de randomisation (marché/localité/contributeur), stratification, calcul de puissance, gestion des effets de débordement.
- Mesures d’issue: adoption (soumissions, régularité), dispersion des prix, revenus/biens‑être (selon disponibilité), décisions commerciales.
- Éthique: consentement des contributeurs, minimisation des risques, sécurité des données, IRB local.
- Passage à l’échelle: utilisation des preuves pour orienter politiques d’information des marchés et dispositifs de soutien.

### Comment visualiser l’impact dès maintenant
- Déployer le front (port `3000`) et le backend (port `5000`), configurer Kobo REST avec webhook sécurisé.
- Alimenter un jeu pilote et activer les tableaux de bord (tendances, dispersion, couverture, adoption).
- Exporter les indicateurs clés et partager un brief d’impact rapide avec partenaires.
- Option: intégrer un module de cartes et de comparaisons multi‑localités pour présentation aux bailleurs.

### Prochaines étapes pratiques
- Formaliser la théorie du changement et les hypothèses testables.
- Sélectionner le design d’évaluation (RCT ou DiD) avec partenaires académiques.
- Mettre en place la collecte d’issues (revenus, décisions) et les protocoles d’éthique.
- Rédiger le dossier FID: innovation, méthodologie, budget, calendrier, passage à l’échelle.

### Contacts
- Équipe Lokali — coordination projet et partenariats.
- Référent méthodologique — protocole d’évaluation et indicateurs.

## Valeurs du FID — alignement de Lokali
### Rendre possible
- Collaboration ouverte: Lokali engage des équipes variées (administrations, ONG, coopératives, universités) et s’adapte aux contextes opérationnels (connectivité limitée, ressources humaines).
- Accès facilité: intégration KoboToolbox, formulaires simples, support multilingue, et accompagnement à l’onboarding des contributeurs pour surmonter les barrières des dispositifs classiques.
- Écoute et adaptation: boucles de feedback avec les équipes financées, paramétrages souples (unités, produits, localités), et accompagnement méthodologique.

### Favoriser l’expérimentation
- Stade pilote: déploiement en conditions réelles avec collecte continue, calibration des indicateurs et itérations rapides.
- Subvention de préparation: mise en place des procédures (XLSForm, webhook, validation), formation et plan de mesure.
- Tests contrôlés: possibilité de RCT/quasi‑expérimentations (DiD) pour quantifier l’effet de transparence des prix sur les décisions et revenus.

### Apprendre ensemble
- Dialogue recherche‑innovation: co‑conception avec équipes académiques, partage de données (anonymisées), et documentation ouverte.
- Production et diffusion: tableaux de bord, notes d’apprentissage, briefs politiques, et API pour réplication.
- Capitalisation: les enseignements alimentent le passage à l’échelle et les politiques publiques fondées sur preuves.

### Respecter une exigence réciproque
- Potentiel d’impact et scale: théorie du changement, indicateurs d’usage et de résultat, plan d’extension institutionnelle.
- Évaluations rigoureuses: protocole d’identification, pré‑enregistrement, monitoring de qualité et d’éthique.
- Cadre de performance: suivi des résultats du portefeuille (adoption, couverture, qualité, impact), rapportage transparent et amélioration continue.