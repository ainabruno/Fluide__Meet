# 🏠 Guide Lancement Local - Fluide avec Base Neon

## 📋 Configuration après téléchargement ZIP

### Étape 1 : Installation
```bash
# Naviguer dans le dossier extrait
cd fluide-project

# Installer les dépendances
npm install
```

### Étape 2 : Configuration variables d'environnement
```bash
# Copier le fichier de configuration locale
cp .env.local .env

# Ou créer manuellement un fichier .env avec :
```

```
NODE_ENV=development
PORT=5000

# Base de données Neon (vos variables)
DATABASE_URL=postgresql://neondb_owner:npg_aozjA60xveYO@ep-restless-leaf-a6b8ei9m.us-west-2.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-restless-leaf-a6b8ei9m.us-west-2.aws.neon.tech
PGUSER=neondb_owner
PGPASSWORD=npg_aozjA60xveYO
PGDATABASE=neondb
PGPORT=5432

# Configuration OAuth
REPL_ID=e294c174-77ca-4f4d-8c4d-9f64219dae0e
REPL_OWNER=jeanfrancoisfer
REPLIT_DOMAINS=localhost:5000
ISSUER_URL=https://replit.com/oidc
SESSION_SECRET=mOF8CFAPRBE8J42mgsypqM5wnflw+dvPYytn1OORVxjxVafdp87zx9icp8KLTv60/m1K9twO5F3ytIkSQDMALw==

FRONTEND_URL=http://localhost:5173
```

### Étape 3 : Préparer la base de données
```bash
# Synchroniser le schéma avec votre base Neon
npm run db:push
```

### Étape 4 : Lancer l'application
```bash
# Démarrage en mode développement
npm run dev
```

## 🌐 Accès à l'application

**URLs disponibles :**
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000
- **Santé du service** : http://localhost:5000/health

## ⚙️ Configuration OAuth Replit (Important)

Pour que la connexion fonctionne en local, ajoutez dans votre **Replit Auth Settings** :

**Callback URLs autorisées :**
```
http://localhost:5000/api/callback
https://localhost:5000/api/callback
```

**Logout URLs autorisées :**
```
http://localhost:5000
https://localhost:5000
```

## 🔧 Commandes utiles

```bash
# Développement avec rechargement automatique
npm run dev

# Construction pour production
npm run build

# Lancement en mode production
npm run start

# Mise à jour du schéma base de données
npm run db:push

# Génération des types TypeScript
npm run db:generate
```

## ✅ Avantages de cette configuration

- **✅ Base Neon partagée** : Même données qu'en développement Replit
- **✅ Développement local** : Modification de code en temps réel
- **✅ Debug facile** : Logs et outils de développement accessibles
- **✅ Performance** : Pas de latence réseau pour le serveur
- **✅ Hors ligne** : Travail possible sans connexion internet (sauf base)

## ⚠️ Points d'attention

1. **Base partagée** : Modifications visibles dans Replit aussi
2. **OAuth limité** : Connexions fonctionnent uniquement avec callback localhost configuré
3. **HTTPS** : Certaines fonctionnalités peuvent nécessiter HTTPS en production

## 🔄 Synchronisation avec Replit

Pour garder votre code synchronisé :
```bash
# Pousser vers GitHub
git add .
git commit -m "Modifications locales"
git push

# Puis importer dans Replit depuis GitHub
```

## 🚀 Prêt pour développement !

Votre environnement local utilise :
- **Base de données** : Neon PostgreSQL (production)
- **Frontend** : React + Vite avec HMR
- **Backend** : Express + TypeScript
- **Authentification** : Replit OAuth
- **Tous les modules** : Profils, événements, messages, IA, communauté