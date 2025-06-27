# 📋 Variables d'Environnement - Projet Fluide

## 🔐 Variables Actuelles (Replit)

### Identifiant Projet
```
REPL_ID=e294c174-77ca-4f4d-8c4d-9f64219dae0e
REPL_OWNER=jeanfrancoisfer
REPL_SLUG=workspace
```

### Base de Données PostgreSQL (Neon)
```
DATABASE_URL=postgresql://neondb_owner:npg_aozjA60xveYO@ep-restless-leaf-a6b8ei9m.us-west-2.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-restless-leaf-a6b8ei9m.us-west-2.aws.neon.tech
PGUSER=neondb_owner
PGPASSWORD=npg_aozjA60xveYO
PGDATABASE=neondb
PGPORT=5432
```

### Configuration Authentification
```
SESSION_SECRET=mOF8CFAPRBE8J42mgsypqM5wnflw+dvPYytn1OORVxjxVafdp87zx9icp8KLTv60/m1K9twO5F3ytIkSQDMALw==
ISSUER_URL=https://replit.com/oidc
```

### Domaines Replit
```
REPLIT_DEV_DOMAIN=e294c174-77ca-4f4d-8c4d-9f64219dae0e-00-3u8oqvryvnd4w.worf.replit.dev
REPLIT_DOMAINS=e294c174-77ca-4f4d-8c4d-9f64219dae0e-00-3u8oqvryvnd4w.worf.replit.dev
```

## 🚀 Variables pour Déploiement Render

### Variables Obligatoires à Copier
```
NODE_ENV=production
REPL_ID=e294c174-77ca-4f4d-8c4d-9f64219dae0e
REPL_OWNER=jeanfrancoisfer
REPLIT_DOMAINS=fluidemeet.onrender.com
ISSUER_URL=https://replit.com/oidc
SESSION_SECRET=mOF8CFAPRBE8J42mgsypqM5wnflw+dvPYytn1OORVxjxVafdp87zx9icp8KLTv60/m1K9twO5F3ytIkSQDMALw==
```

### Variables Optionnelles (Fonctionnalités Avancées)
```
ANTHROPIC_API_KEY=votre-cle-anthropic-pour-ia
SENDGRID_API_KEY=votre-cle-sendgrid-pour-emails
STRIPE_SECRET_KEY=votre-cle-stripe-pour-paiements
VITE_STRIPE_PUBLIC_KEY=votre-cle-publique-stripe
```

### Variables Automatiques (Render les créera)
```
DATABASE_URL (nouvelle base PostgreSQL Render)
PORT (assigné automatiquement par Render)
```

## 📝 Comment Accéder aux Variables sur Replit

### 1. Via Terminal
```bash
env | grep REPL
env | grep DATABASE
env | grep SESSION
```

### 2. Via le Panneau Secrets
- Cliquer sur l'icône 🔒 dans la barre latérale
- Voir les secrets configurés manuellement

### 3. Via ce Script
```bash
./scripts/get-env-vars.sh
```

## ⚠️ Notes Importantes

1. **Sécurité** : Ne jamais partager les variables contenant des mots de passe
2. **Migration** : Sur Render, vous aurez une nouvelle base de données propre
3. **Domaine** : Mettre à jour `REPLIT_DOMAINS` pour votre nouveau domaine Render
4. **OAuth** : Configurer les callbacks dans Replit Auth après déploiement