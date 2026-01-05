# 🔧 Guide de Configuration - MAJAY

## 📋 Étape 1 : Créer le fichier .env.local

Créez manuellement un fichier `.env.local` à la racine du projet avec ce contenu :

```env
# ============================================================================
# MAJAY - VARIABLES D'ENVIRONNEMENT
# ============================================================================

# ============================================================================
# SUPABASE (OBLIGATOIRE)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://ptscvapqhsctosjpdbkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0c2N2YXBxaHNjdG9zanBkYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTk5MDEsImV4cCI6MjA4Mjc3NTkwMX0.EESazxd1Q0KfZtRzWndrV28jzybn6-UcUBpX3SfimGM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0c2N2YXBxaHNjdG9zanBkYmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5OTkwMSwiZXhwIjoyMDgyNzc1OTAxfQ.IlEDbv6EhF-dmpjrGG9i6NLDcSzYtb-1A2tJG63L8VE

# ============================================================================
# APPLICATION
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:8000
```

**⚠️ Important :** Remplacez `SUPABASE_SERVICE_ROLE_KEY` par votre vraie clé service_role depuis Supabase Dashboard → Settings → API

## 🧪 Étape 2 : Tester la connexion

1. Ouvrez `test-connection.html` dans votre navigateur
2. Les tests se lancent automatiquement
3. Vérifiez que tous les tests sont verts ✅

## 🚀 Étape 3 : Lancer l'application

Le serveur HTTP est déjà lancé sur le port 8000.

Ouvrez votre navigateur et allez sur :
- **Page d'accueil** : http://localhost:8000/index.html
- **Test de connexion** : http://localhost:8000/test-connection.html
- **Catalogue** : http://localhost:8000/catalogue.html?shop=demo-shop

## 📝 Configuration actuelle

Les credentials Supabase sont configurés dans `js/config.js` :
- **URL** : https://ptscvapqhsctosjpdbkr.supabase.co
- **Anon Key** : Configurée ✅
- **Service Role Key** : Configurée dans .env.local ✅

## ✅ Checklist de vérification

- [ ] Fichier `.env.local` créé (optionnel pour frontend)
- [ ] Test de connexion réussi
- [ ] Toutes les tables accessibles
- [ ] Plans (free, pro, entreprise) présents
- [ ] Fonctions RPC disponibles

## 🔍 Prochaines étapes

1. Tester l'inscription d'un nouveau vendeur
2. Tester la connexion
3. Créer des produits
4. Tester le catalogue public
5. Tester les commandes

