# 🚀 Guide Complet - Déploiement Fluide sur Render.com

## 📋 Étape 1 : Exporter de Replit vers GitHub

### A. Télécharger le projet
1. Dans Replit : Cliquer sur les **trois points** `⋯` en haut à droite
2. Sélectionner **"Download as zip"**
3. Extraire le fichier ZIP sur votre ordinateur

### B. Créer un repository GitHub
1. Aller sur [github.com](https://github.com) et se connecter
2. Cliquer **"New repository"**
3. Nom : `fluide-dating-platform`
4. Description : `Plateforme de rencontres alternatives et polyamorie`
5. Choisir **Public** (gratuit)
6. Cliquer **"Create repository"**

### C. Pousser le code
```bash
cd dossier-extrait-fluide
git init
git add .
git commit -m "Initial commit - Fluide platform ready for deployment"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/fluide-dating-platform.git
git push -u origin main
```

## 🌐 Étape 2 : Créer le Service sur Render

### A. Connexion à Render
1. Aller sur [render.com](https://render.com)
2. Cliquer **"Get Started for Free"**
3. Se connecter avec GitHub

### B. Créer le Web Service
1. Cliquer **"New +"** → **"Web Service"**
2. Connecter votre repository GitHub `fluide-dating-platform`
3. **Render détectera automatiquement le fichier `render.yaml`** ✨
4. Cliquer **"Connect"**

### C. Configuration automatique
✅ Render configurera automatiquement :
- Plan gratuit (750h/mois)
- Base de données PostgreSQL gratuite (1GB)
- Variables d'environnement de base
- Commandes de build et démarrage

## ⚙️ Étape 3 : Configurer les Variables d'Environnement

### A. Variables OBLIGATOIRES à ajouter manuellement
Dans l'onglet **"Environment"** de votre service Render, ajouter :

```
REPL_ID=e294c174-77ca-4f4d-8c4d-9f64219dae0e
REPL_OWNER=jeanfrancoisfer
REPLIT_DOMAINS=fluide-app.onrender.com
```

⚠️ **Important** : Remplacer `fluide-app` par le vrai nom de votre service Render

### B. Variables OPTIONNELLES (fonctionnalités avancées)
Si vous voulez activer toutes les fonctionnalités :

```
ANTHROPIC_API_KEY=votre-cle-anthropic
SENDGRID_API_KEY=votre-cle-sendgrid
STRIPE_SECRET_KEY=votre-cle-stripe
VITE_STRIPE_PUBLIC_KEY=votre-cle-publique-stripe
```

## 🎯 Étape 4 : Déploiement et Configuration OAuth

### A. Lancer le déploiement
1. Cliquer **"Create Web Service"**
2. **Premier déploiement** : 5-10 minutes
3. Render va :
   - Installer les dépendances
   - Construire l'application
   - Créer la base PostgreSQL
   - Lancer les migrations
   - Démarrer le serveur

### B. Récupérer l'URL de déploiement
Une fois déployé, vous aurez une URL comme :
```
https://fluide-app.onrender.com
```

### C. Configurer l'authentification Replit
1. Aller dans votre **Replit Account Settings** → **Authentication**
2. Ajouter les URLs de callback :
   ```
   Callback URL: https://fluide-app.onrender.com/api/callback
   Logout URL: https://fluide-app.onrender.com
   ```
3. Mettre à jour la variable `REPLIT_DOMAINS` avec votre vraie URL

## ✅ Étape 5 : Vérification du Déploiement

### URLs à tester
- **Page d'accueil** : `https://votre-app.onrender.com`
- **Santé du service** : `https://votre-app.onrender.com/health`
- **Connexion** : `https://votre-app.onrender.com/api/login`

### Fonctionnalités à vérifier
- ✅ Page d'accueil se charge
- ✅ Connexion via Replit fonctionne
- ✅ Navigation entre les pages
- ✅ Base de données accessible

## 🔧 Dépannage Courant

### Problème : Service ne démarre pas
**Solution** : Vérifier les logs dans Render → onglet "Logs"

### Problème : Erreur de base de données
**Solution** : Les migrations se lancent automatiquement, attendre 2-3 minutes

### Problème : Authentification échoue
**Solution** : Vérifier que `REPLIT_DOMAINS` correspond exactement à votre URL Render

### Problème : Variables manquantes
**Solution** : Ajouter les variables obligatoires dans l'onglet Environment

## 🎉 Succès !

Votre plateforme Fluide sera accessible publiquement sur :
```
https://votre-app.onrender.com
```

**Plan gratuit Render inclut** :
- 750 heures/mois (suffisant pour un projet personnel)
- Base PostgreSQL 1GB
- SSL automatique
- Redémarrages automatiques

## 📞 Support

En cas de problème :
1. Vérifier les logs Render
2. Consulter la documentation Render
3. Vérifier que toutes les variables sont correctement configurées