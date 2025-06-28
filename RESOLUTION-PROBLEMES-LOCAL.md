# 🔧 Résolution Problèmes - Lancement Local

## ❌ Problème Résolu : Erreur de Connexion Proxy

**Symptôme :**
```
[dev:client] 09:28:29 [vite] http proxy error: /auth/user
[dev:client] Error: connect ECONNREFUSED ::1:5000
```

**Cause :** Vite tentait de se connecter au backend via IPv6 (`::1`) au lieu d'IPv4.

**✅ Solution Appliquée :**
1. Modification du client pour détecter automatiquement l'environnement
2. URL backend configurée automatiquement : `http://localhost:5000` en développement
3. Pas besoin de configuration proxy dans Vite

## 🚀 Nouvelle Méthode de Lancement

### Option 1 : Script Optimisé (Recommandé)
```bash
chmod +x scripts/start-local.sh
./scripts/start-local.sh
```

### Option 2 : Commande Standard
```bash
npm run dev
```

## ✅ Vérifications Post-Démarrage

### 1. Backend (Port 5000)
```bash
curl http://localhost:5000/health
# Doit retourner : {"status":"ok","timestamp":"..."}
```

### 2. Frontend (Port 5173)
Ouvrir : http://localhost:5173
- Page d'accueil doit se charger
- Pas d'erreurs de console

### 3. Connexion API
Dans la console du navigateur (F12) :
```javascript
fetch('http://localhost:5000/api/auth/user', {credentials: 'include'})
```

## 🗄️ Base de Données Neon

### Vérification Connexion
```bash
npm run db:push
```
**Résultat attendu :** Tables créées/mises à jour sans erreur

### Test Direct
```bash
node -e "
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT NOW()').then(r => console.log('✅ Base connectée:', r.rows[0]));
"
```

## 🔐 Configuration OAuth

### Callback URLs à Ajouter dans Replit Auth
```
http://localhost:5000/api/callback
http://localhost:5000/api/logout
```

### Test de Connexion
1. Aller sur : http://localhost:5173
2. Cliquer "Se connecter"
3. Redirection vers Replit → Autoriser → Retour sur localhost

## 📊 Monitoring en Temps Réel

### Logs Backend
Visible directement dans le terminal où vous avez lancé `npm run dev`

### Logs Frontend
Console du navigateur (F12 → Console)

### Base de Données
Les requêtes SQL apparaissent dans les logs backend

## ⚡ Performance et Debug

### Variables d'Environnement Utiles
```bash
DEBUG=* npm run dev              # Debug complet
NODE_OPTIONS="--inspect" npm run dev  # Debug Node.js
```

### Rechargement Automatique
- **Frontend** : Sauvegarde → Rechargement instantané
- **Backend** : Sauvegarde → Redémarrage automatique
- **Base** : `npm run db:push` après modification schema

## 🎯 Fonctionnalités Testables

### Pages Accessibles
- ✅ Landing (http://localhost:5173)
- ✅ Connexion (http://localhost:5173 → bouton connexion)
- ✅ Profils (après connexion)
- ✅ Événements, Messages, Communauté

### APIs Fonctionnelles
- ✅ `/api/auth/user` - Info utilisateur
- ✅ `/api/profiles` - Gestion profils
- ✅ `/api/events` - Événements
- ✅ `/api/messages` - Messagerie
- ✅ `/api/ai/*` - Fonctionnalités IA

## 🔄 Synchronisation avec Replit

### Pousser Modifications
```bash
git add .
git commit -m "Modifications locales"
git push origin main
```

### Récupérer Modifications
```bash
git pull origin main
npm install  # Si nouvelles dépendances
npm run db:push  # Si modifications schema
```

## 🆘 En Cas de Problème

### Nettoyage Complet
```bash
rm -rf node_modules package-lock.json
npm install
npm run db:push
npm run dev
```

### Reset Base Locale
Vos données sont sur Neon, aucun risque de perte.

### Support
1. Vérifier les logs dans le terminal
2. Consulter la console navigateur (F12)
3. Tester les endpoints manuellement avec curl
4. Vérifier les variables d'environnement