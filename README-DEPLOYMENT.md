# Guide de Déploiement Fluide sur Render

## Méthode 1 : Déploiement automatique avec render.yaml

### Étapes :

1. **Connecter votre repository GitHub**
   - Poussez votre code depuis Replit vers GitHub
   - Allez sur [render.com](https://render.com)
   - Connectez votre compte GitHub

2. **Créer un nouveau service**
   - Cliquez sur "New +" → "Web Service"
   - Sélectionnez votre repository GitHub
   - Render détectera automatiquement le fichier `render.yaml`

3. **Configuration automatique**
   - Le fichier `render.yaml` configure automatiquement :
     - Base de données PostgreSQL gratuite
     - Variables d'environnement
     - Commandes de build et de démarrage

## Méthode 2 : Configuration manuelle

### 1. Créer la base de données PostgreSQL

1. Sur Render Dashboard → "New +" → "PostgreSQL"
2. Nom : `fluide-db`
3. Plan : Free
4. Créer la base de données

### 2. Créer le service web

1. "New +" → "Web Service"
2. Connecter votre repository
3. Configuration :
   - **Name**: `fluide-app`
   - **Environment**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### 3. Variables d'environnement

Ajoutez ces variables dans l'onglet "Environment" :

```
NODE_ENV=production
DATABASE_URL=[URL de votre base PostgreSQL depuis Render]
SESSION_SECRET=[générer une clé secrète]
REPL_ID=[votre ID Replit pour l'auth]
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=[votre domaine Render, ex: fluide-app.onrender.com]
```

### 4. Variables optionnelles (si utilisées)

```
ANTHROPIC_API_KEY=[votre clé Anthropic pour l'IA]
SENDGRID_API_KEY=[votre clé SendGrid pour les emails]
STRIPE_SECRET_KEY=[votre clé Stripe pour les paiements]
VITE_STRIPE_PUBLIC_KEY=[votre clé publique Stripe]
```

## Récupération du code depuis Replit

### Option A : Export direct
1. Dans Replit, cliquez sur les 3 points → "Download as zip"
2. Extrayez et poussez vers GitHub

### Option B : Git (recommandé)
```bash
# Dans le terminal Replit
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git push -u origin main
```

## Configuration post-déploiement

### 1. Migrations de base de données
Une fois déployé, les migrations se lancent automatiquement via `postbuild`.

### 2. Test de l'application
- Visitez votre URL Render (ex: `https://fluide-app.onrender.com`)
- Testez l'endpoint de santé : `/health`

### 3. Configuration OAuth
- Mettez à jour les URLs de callback OAuth dans Replit Auth
- URL de callback : `https://VOTRE-APP.onrender.com/api/callback`

## Dépannage courant

### Erreur de build
- Vérifiez que toutes les dépendances sont dans `package.json`
- Assurez-vous que `npm run build` fonctionne localement

### Erreur de base de données
- Vérifiez que `DATABASE_URL` est correctement configurée
- Consultez les logs Render pour les erreurs de connexion

### Erreur d'authentification
- Vérifiez `REPL_ID` et `REPLIT_DOMAINS`
- Assurez-vous que les URLs de callback sont correctes

## Monitoring

Render fournit :
- Logs en temps réel
- Métriques de performance
- Alertes automatiques
- Redémarrage automatique en cas d'erreur

## Coûts

- Plan gratuit Render : 750h/mois
- Base PostgreSQL gratuite : 1GB
- Passage automatique en veille après 15min d'inactivité

Pour une production intensive, considérez les plans payants Render.