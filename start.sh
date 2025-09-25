#!/bin/bash

# 🚀 Script de démarrage automatique pour LocalPrice
# Ce script configure et démarre l'application LocalPrice

echo "🛒 LocalPrice - Démarrage automatique"
echo "======================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

print_success "Node.js détecté: $(node --version)"

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé."
    exit 1
fi

print_success "npm détecté: $(npm --version)"

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    print_warning "Fichier .env non trouvé. Création à partir de env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_success "Fichier .env créé. Veuillez le configurer avec vos paramètres."
    else
        print_error "Fichier env.example non trouvé."
        exit 1
    fi
fi

# Vérifier si les dépendances du backend sont installées
if [ ! -d "node_modules" ]; then
    print_status "Installation des dépendances backend..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dépendances backend installées"
    else
        print_error "Erreur lors de l'installation des dépendances backend"
        exit 1
    fi
else
    print_success "Dépendances backend déjà installées"
fi

# Vérifier si les dépendances du frontend sont installées
if [ ! -d "client/node_modules" ]; then
    print_status "Installation des dépendances frontend..."
    cd client
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dépendances frontend installées"
    else
        print_error "Erreur lors de l'installation des dépendances frontend"
        exit 1
    fi
    cd ..
else
    print_success "Dépendances frontend déjà installées"
fi

# Vérifier si la base de données est configurée
print_status "Vérification de la configuration de la base de données..."

# Lire les variables d'environnement
source .env 2>/dev/null || true

# Vérifier si les variables de base de données sont définies
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    print_warning "Variables de base de données non configurées dans .env"
    print_status "Veuillez configurer les variables suivantes dans .env:"
    echo "  DB_HOST=localhost"
    echo "  DB_USER=root"
    echo "  DB_PASSWORD=votre_mot_de_passe"
    echo "  DB_NAME=localprice"
    echo "  MAMP_PORT=3306"
    echo ""
    print_status "Puis relancez ce script."
    exit 1
fi

print_success "Configuration de la base de données détectée"

# Vérifier si le schéma de base de données existe
if [ ! -f "database/schema-simple.sql" ]; then
    print_error "Fichier de schéma database/schema-simple.sql non trouvé"
    exit 1
fi

print_success "Schéma de base de données trouvé"

# Proposer de créer un utilisateur admin
if [ ! -f "admin-created.flag" ]; then
    print_status "Création de l'utilisateur administrateur..."
    if [ -f "create-admin-user.js" ]; then
        node create-admin-user.js
        if [ $? -eq 0 ]; then
            print_success "Utilisateur administrateur créé"
            touch admin-created.flag
        else
            print_warning "Erreur lors de la création de l'utilisateur admin"
        fi
    else
        print_warning "Script create-admin-user.js non trouvé"
    fi
else
    print_success "Utilisateur administrateur déjà créé"
fi

# Afficher les informations de connexion
echo ""
print_success "Configuration terminée !"
echo ""
echo "🌐 Accès à l'application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5001"
echo ""
echo "👤 Comptes de test:"
echo "  Admin: admin@localprice.com / admin123"
echo "  User:  user@localprice.com / user123"
echo ""

# Demander si l'utilisateur veut démarrer l'application
read -p "Voulez-vous démarrer l'application maintenant ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Démarrage de l'application..."
    echo ""
    print_status "Démarrage du backend sur le port 5001..."
    print_status "Démarrage du frontend sur le port 3000..."
    echo ""
    print_success "Application démarrée ! Ouvrez http://localhost:3000 dans votre navigateur"
    echo ""
    print_warning "Pour arrêter l'application, appuyez sur Ctrl+C"
    echo ""
    
    # Démarrer l'application avec concurrently
    npm run start:all
else
    print_status "Pour démarrer l'application manuellement:"
    echo "  npm run start:all"
    echo ""
    print_status "Ou séparément:"
    echo "  Terminal 1: npm run dev"
    echo "  Terminal 2: npm run client"
fi

echo ""
print_success "Script terminé ! Bon développement avec LocalPrice ! 🛒✨"