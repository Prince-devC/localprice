# Convention de Nommage des Branches Git - Projet Lokali

## Vue d'ensemble
Ce document définit les conventions de nommage des branches Git pour le projet Lokali afin d'assurer une organisation claire et cohérente du code.

## Structure Générale
```
<type>/<description-courte>
```

## Types de Branches

### 1. Branches de Fonctionnalités (`feature/`)
Pour le développement de nouvelles fonctionnalités.
```
feature/<nom-fonctionnalite>
```
**Exemples :**
- `feature/user-authentication`
- `feature/price-comparison`
- `feature/search-filters`

### 2. Branches de Correction (`fix/`)
Pour corriger des bugs ou des problèmes.
```
fix/<description-probleme>
```
**Exemples :**
- `fix/login-error`
- `fix/price-display-bug`
- `fix/homepage-layout`

### 3. Branches d'Amélioration (`enhancement/`)
Pour améliorer des fonctionnalités existantes.
```
enhancement/<description-amelioration>
```
**Exemples :**
- `enhancement/ui-performance`
- `enhancement/search-speed`
- `enhancement/logo-integration`

### 4. Branches de Refactoring (`refactor/`)
Pour restructurer le code sans changer la fonctionnalité.
```
refactor/<composant-ou-module>
```
**Exemples :**
- `refactor/header-component`
- `refactor/api-services`
- `refactor/database-queries`

### 5. Branches de Documentation (`docs/`)
Pour les mises à jour de documentation.
```
docs/<type-documentation>
```
**Exemples :**
- `docs/api-documentation`
- `docs/setup-guide`
- `docs/branch-conventions`

### 6. Branches de Configuration (`config/`)
Pour les changements de configuration.
```
config/<type-config>
```
**Exemples :**
- `config/database-setup`
- `config/deployment`
- `config/environment-variables`

## Règles de Nommage

### ✅ Bonnes Pratiques
- Utiliser des **tirets** (`-`) pour séparer les mots
- Utiliser des **minuscules** uniquement
- Être **descriptif** mais **concis**
- Utiliser l'**anglais** pour la cohérence
- Maximum **50 caractères**

### ❌ À Éviter
- Espaces dans les noms
- Caractères spéciaux (sauf `-` et `/`)
- Majuscules
- Noms trop génériques (`fix`, `update`, `change`)
- Numéros de tickets sans contexte

## Exemples Concrets pour Lokali

### Corrections de l'Interface
```
fix/homepage-logo-display
fix/footer-responsive-layout
fix/header-navigation-mobile
```

### Nouvelles Fonctionnalités
```
feature/price-alerts
feature/store-locator
feature/user-favorites
```

### Améliorations UI/UX
```
enhancement/logo-sizing
enhancement/mobile-navigation
enhancement/search-autocomplete
```

## Workflow Recommandé

1. **Créer la branche** depuis `main` ou `develop`
   ```bash
   git checkout -b fix/homepage-logo-display
   ```

2. **Développer** les modifications

3. **Commit** avec des messages clairs
   ```bash
   git commit -m "fix: correct logo paths and sizing in header/footer"
   ```

4. **Push** la branche
   ```bash
   git push origin fix/homepage-logo-display
   ```

5. **Créer une Pull Request** vers la branche principale

## Notes Importantes
- Les branches doivent être **supprimées** après merge
- Utiliser des **commits atomiques** avec des messages descriptifs
- Préfixer les commits avec le type : `fix:`, `feat:`, `docs:`, etc.
- Maintenir les branches **à jour** avec la branche principale

---
*Document créé pour le projet Lokali - Version 1.0*