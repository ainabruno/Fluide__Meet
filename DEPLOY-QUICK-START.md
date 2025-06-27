# 🚀 Déploiement Rapide Fluide sur Render

## Étapes Essentielles (5 minutes)

### 1. Exporter le Code de Replit
- Dans Replit : Menu ⋯ → "Download as zip"
- Extraire et pousser vers un nouveau repository GitHub

### 2. Créer le Service sur Render
- Aller sur [render.com](https://render.com)
- "New +" → "Web Service" 
- Connecter votre repository GitHub
- **Render détectera automatiquement le fichier `render.yaml` inclus !**

### 3. Variables d'Environnement Obligatoires
Ajouter dans Render (onglet Environment) :
```
REPL_ID=votre-repl-id-depuis-replit
REPLIT_DOMAINS=votre-app.onrender.com
```

### 4. Variables Optionnelles (si fonctionnalités IA/Email activées)
```
ANTHROPIC_API_KEY=votre-cle-anthropic
SENDGRID_API_KEY=votre-cle-sendgrid
```

## ✅ C'est tout !

Le fichier `render.yaml` configure automatiquement :
- ✅ Base de données PostgreSQL gratuite
- ✅ Migrations automatiques  
- ✅ Variables d'environnement de base
- ✅ Commandes de build et démarrage

## 🔧 Récupérer votre REPL_ID
Dans Replit, regardez l'URL de votre projet :
`https://replit.com/@username/PROJECT-NAME`
Le REPL_ID est visible dans les variables d'environnement Replit.

## 🌐 Après Déploiement
Votre app sera disponible sur : `https://votre-app.onrender.com`

**Note** : Premier démarrage peut prendre 2-3 minutes (installation + migrations).