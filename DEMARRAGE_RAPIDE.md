# 🚀 Guide de Démarrage Rapide - MAJAY

## 📋 Prérequis

1. ✅ Fichier `.env.local` créé avec vos credentials Supabase
2. ✅ Schéma SQL exécuté dans Supabase (fichier `SUPABASE_SCHEMA_COMPLET.sql`)
3. ✅ Python installé (pour le serveur HTTP)

## 🎯 Étape 1 : Lancer le serveur

Ouvrez un terminal dans le dossier du projet et exécutez :

### Option 1 : Serveur personnalisé (Recommandé)
```bash
python server.py
```
Le serveur personnalisé gère automatiquement le routage et la protection des répertoires.

### Option 2 : Serveur Python standard
```bash
python -m http.server 8000
```
⚠️ Note : Avec cette option, l'accès à `/admin/` affichera la liste des fichiers. Utilisez directement `/admin/index.html`.

### Option 3 : Node.js (si installé)
```bash
npx http-server -p 8000
```

## 🧪 Étape 2 : Tester la connexion

1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:8000/test-complet.html**
3. Les tests se lancent automatiquement
4. Vérifiez que tous les tests sont verts ✅

## ✅ Ce que les tests vérifient

- ✅ Connexion à Supabase
- ✅ Existence de toutes les tables
- ✅ Présence des plans (free, pro, entreprise)
- ✅ Disponibilité des fonctions RPC
- ✅ Configuration RLS (sécurité)
- ✅ Accessibilité des fichiers JavaScript

## 🎮 Étape 3 : Tester l'application

### Pour les vendeurs :
- **Inscription** : http://localhost:8000/vendeur/inscription.html
- **Connexion** : http://localhost:8000/vendeur/connexion.html
- **Dashboard** : http://localhost:8000/vendeur/dashboard.html

### Pour les admins :
- **Accès admin** : http://localhost:8000/admin/ (redirige automatiquement)
- **Connexion** : http://localhost:8000/admin/connexion.html
- **Dashboard** : http://localhost:8000/admin/dashboard.html

### Pour les clients (catalogue public) :
- **Catalogue** : http://localhost:8000/catalogue.html?shop=VOTRE-SLUG

## 🔧 Configuration Supabase requise

Avant de tester l'inscription/connexion, assurez-vous que :

1. ✅ **Phone Provider activé** dans Supabase → Authentication → Providers
2. ✅ **Autoconfirm users activé** dans Authentication → Settings
3. ✅ **Twilio configuré** (ou numéros de test configurés)

## 📝 Checklist de test

- [ ] Test de connexion réussi
- [ ] Toutes les tables accessibles
- [ ] Plans présents (free, pro, entreprise)
- [ ] Fonctions RPC disponibles
- [ ] Inscription vendeur fonctionne
- [ ] Connexion vendeur fonctionne
- [ ] Création de produits fonctionne
- [ ] Catalogue public accessible

## 🆘 En cas de problème

1. Vérifiez la console du navigateur (F12)
2. Vérifiez que le schéma SQL a été exécuté complètement
3. Vérifiez que RLS est activé sur les tables
4. Vérifiez les credentials dans `js/config.js`

## 🎉 C'est prêt !

Une fois tous les tests verts, votre application est prête à être utilisée !

