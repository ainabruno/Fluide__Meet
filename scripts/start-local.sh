#!/bin/bash

echo "🚀 Démarrage de Fluide en mode local"
echo "====================================="

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚙️ Création du fichier .env..."
    cp .env.local .env
fi

echo "🗄️ Synchronisation de la base de données..."
npm run db:push

echo "🌐 Démarrage des serveurs..."
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo ""

# Forcer l'utilisation d'IPv4 pour éviter les problèmes de connexion
export NODE_OPTIONS="--dns-result-order=ipv4first"

# Démarrer avec concurrently
npm run dev