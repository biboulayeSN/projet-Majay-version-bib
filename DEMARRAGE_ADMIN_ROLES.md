# 🚀 Guide de Démarrage - Système de Rôles Admin

## 📋 Configuration Initiale

### Étape 1 : Exécuter le schéma SQL

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez le fichier `schema-admin-roles.sql`
3. Vérifiez qu'il n'y a pas d'erreurs

Ce script va :
- ✅ Créer le type enum `admin_role`
- ✅ Ajouter les colonnes nécessaires à la table `users`
- ✅ Créer les fonctions RPC (`create_admin`, `check_admin_permission`)
- ✅ Créer la vue `admin_users_view`
- ✅ Configurer les politiques RLS

### Étape 2 : Créer votre Super Admin

Exécutez le script `create-admin.sql` pour créer votre super admin :
- **Numéro** : `780181144`
- **Mot de passe** : `123456`

Ou exécutez directement :

```sql
INSERT INTO users (
  id, phone, email, password_hash, full_name, role_type, 
  is_super_admin, admin_role, admin_permissions, can_create_admins, 
  is_active, created_at
)
VALUES (
  gen_random_uuid(),
  '+221780181144',
  'admin@majay.sn',
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  'Super Administrateur',
  'owner',
  true,
  'super_admin',
  '{"all": true, "create_admins": true}'::jsonb,
  true,
  true,
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET
  admin_role = 'super_admin',
  is_super_admin = true,
  can_create_admins = true,
  admin_permissions = '{"all": true, "create_admins": true}'::jsonb;
```

### Étape 3 : Se connecter

1. Allez sur `http://localhost:8000/admin/connexion.html`
2. Entrez votre numéro : `780181144`
3. Entrez votre mot de passe : `123456`
4. Vous serez redirigé vers le dashboard

## 🎯 Créer d'autres Admins

Une fois connecté en tant que Super Admin :

1. Allez sur `/admin/admins.html`
2. Cliquez sur "Créer un admin"
3. Remplissez le formulaire :
   - **Nom complet** : Ex: "Admin Commercial"
   - **Téléphone** : Ex: "771234567"
   - **Email** : (optionnel)
   - **Rôle** : Sélectionnez le rôle (Commercial, Gestionnaire, Commercial & Gestionnaire, Analytics, Financial)
   - **Mot de passe** : Définissez un mot de passe
4. Cliquez sur "Créer l'admin"

## 📊 Pages selon le Rôle

### Super Admin
- `/admin/dashboard.html` - Dashboard complet
- `/admin/admins.html` - Gestion des admins
- `/admin/vendeur.html` - Gestion des vendeurs
- `/admin/stores.html` - Gestion des boutiques

### Admin Commercial
- `/admin/commercial.html` - Gestion des vendeurs propriétaires
- `/admin/commercial-stores.html` - Vue des boutiques

### Admin Gestionnaire
- `/admin/gestionnaire.html` - Gestion des boutiques (bannissements, restrictions)
- `/admin/gestionnaire-enterprise.html` - Gestion des vendeurs entreprises

### Admin Analytics
- `/admin/analytics.html` - Statistiques de la plateforme
- `/admin/analytics-reports.html` - Rapports détaillés

### Admin Financial
- `/admin/financial.html` - Gestion des paiements
- `/admin/financial-invoices.html` - Gestion des factures
- `/admin/financial-subscriptions.html` - Gestion des abonnements

## 🔒 Permissions

Chaque rôle a des permissions spécifiques définies dans `admin_permissions` (JSONB).

Les permissions sont vérifiées :
- ✅ Côté serveur via RPC `check_admin_permission`
- ✅ Côté client avant d'afficher les pages
- ✅ Avant chaque action sensible

## ✅ Vérification

Après configuration :

1. ✅ Connectez-vous en tant que Super Admin
2. ✅ Créez un Admin Commercial
3. ✅ Connectez-vous avec le compte Commercial
4. ✅ Vérifiez que seules les pages autorisées sont accessibles
5. ✅ Testez les permissions (essayez d'accéder à une page non autorisée)

## 🆘 Dépannage

### Erreur "Fonction create_admin n'existe pas"
→ Exécutez `schema-admin-roles.sql` dans Supabase

### Erreur "Permission refusée"
→ Vérifiez que l'utilisateur a bien un `admin_role` dans la table `users`

### Les pages ne s'affichent pas selon le rôle
→ Vérifiez la console du navigateur (F12) pour les erreurs
→ Vérifiez que `admin_role` est bien dans la session

