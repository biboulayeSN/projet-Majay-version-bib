# 🛡️ Guide des Rôles Administrateurs - MAJAY

## 📋 Types d'Administrateurs

### 1. 🛡️ Super Administrateur
**Rôle** : `super_admin`

**Permissions** :
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Créer et gérer d'autres administrateurs
- ✅ Gérer tous les vendeurs et boutiques
- ✅ Accès à toutes les statistiques
- ✅ Gestion financière complète

**Pages accessibles** :
- `/admin/dashboard.html` - Dashboard principal
- `/admin/admins.html` - Gestion des admins
- `/admin/vendeur.html` - Gestion des vendeurs
- `/admin/stores.html` - Gestion des boutiques

### 2. 💼 Admin Commercial
**Rôle** : `admin_commercial`

**Permissions** :
- ✅ Voir les vendeurs propriétaires
- ✅ Modifier les vendeurs
- ✅ Activer/désactiver les vendeurs
- ✅ Voir les boutiques

**Pages accessibles** :
- `/admin/commercial.html` - Gestion des vendeurs propriétaires
- `/admin/commercial-stores.html` - Vue des boutiques

**Restrictions** :
- ❌ Ne peut pas créer d'autres admins
- ❌ Ne peut pas bannir des boutiques
- ❌ Ne peut pas voir les analytics détaillées

### 3. 📋 Admin Gestionnaire
**Rôle** : `admin_gestionnaire`

**Permissions** :
- ✅ Voir et modifier les boutiques
- ✅ Bannir/débannir des boutiques
- ✅ Restreindre les produits
- ✅ Gérer les vendeurs entreprises
- ✅ Voir les vendeurs entreprises

**Pages accessibles** :
- `/admin/gestionnaire.html` - Gestion des boutiques
- `/admin/gestionnaire-enterprise.html` - Gestion des vendeurs entreprises

**Restrictions** :
- ❌ Ne peut pas créer d'autres admins
- ❌ Ne peut pas gérer les paiements
- ❌ Accès limité aux statistiques

### 3.5. 💼📋 Admin Commercial & Gestionnaire (Combiné)
**Rôle** : `admin_commercial_gestionnaire`

**Permissions** :
- ✅ **Toutes les permissions Commercial** (voir ci-dessus)
- ✅ **Toutes les permissions Gestionnaire** (voir ci-dessus)
- ✅ Gestion complète des vendeurs ET des boutiques

**Pages accessibles** :
- `/admin/commercial.html` - Gestion des vendeurs
- `/admin/gestionnaire.html` - Gestion des boutiques
- `/admin/commercial-gestionnaire.html` - Vue d'ensemble combinée

**Avantages** :
- ✅ Un seul compte pour gérer vendeurs et boutiques
- ✅ Accès à toutes les fonctionnalités des deux rôles
- ✅ Vue d'ensemble unifiée

### 4. 📊 Admin Analytics
**Rôle** : `admin_analytics`

**Permissions** :
- ✅ Voir toutes les statistiques
- ✅ Voir les rapports
- ✅ Exporter les données
- ✅ Accès en lecture seule aux données

**Pages accessibles** :
- `/admin/analytics.html` - Statistiques de la plateforme
- `/admin/analytics-reports.html` - Rapports détaillés

**Restrictions** :
- ❌ Ne peut pas modifier les données
- ❌ Ne peut pas gérer les utilisateurs
- ❌ Ne peut pas gérer les paiements

### 5. 💰 Admin Financial
**Rôle** : `admin_financial`

**Permissions** :
- ✅ Voir les paiements
- ✅ Vérifier les paiements
- ✅ Voir les factures
- ✅ Gérer les abonnements
- ✅ Voir les rapports financiers

**Pages accessibles** :
- `/admin/financial.html` - Gestion des paiements
- `/admin/financial-invoices.html` - Gestion des factures
- `/admin/financial-subscriptions.html` - Gestion des abonnements

**Restrictions** :
- ❌ Ne peut pas créer d'autres admins
- ❌ Ne peut pas bannir des boutiques
- ❌ Accès limité aux autres données

## 🚀 Configuration Initiale

### Étape 1 : Exécuter le schéma SQL

Allez dans **Supabase Dashboard** → **SQL Editor** et exécutez :

```sql
-- Exécuter le fichier schema-admin-roles.sql
```

Cela créera :
- Le type enum `admin_role`
- Les colonnes nécessaires dans la table `users`
- Les fonctions RPC pour créer des admins et vérifier les permissions
- Les vues et index nécessaires

### Étape 2 : Créer le Super Admin

Exécutez le script `create-admin.sql` pour créer votre super admin initial.

### Étape 3 : Créer d'autres admins

Connectez-vous en tant que super admin et allez sur `/admin/admins.html` pour créer d'autres administrateurs.

## 🔐 Système de Permissions

Les permissions sont stockées dans la colonne `admin_permissions` (JSONB) de la table `users`.

### Vérification des permissions

```javascript
import { adminRoles } from './js/admin-roles.js';

// Vérifier une permission
const canEdit = await adminRoles.checkPermission('edit_vendors');

// Vérifier l'accès à une page
const hasAccess = await adminRoles.canAccessPage('view_stores');

// Exiger une permission (redirige si pas d'accès)
await adminRoles.requirePermission('ban_stores');
```

## 📝 Permissions disponibles

### Admin Commercial
- `view_vendors` - Voir les vendeurs
- `edit_vendors` - Modifier les vendeurs
- `activate_vendors` - Activer les vendeurs
- `deactivate_vendors` - Désactiver les vendeurs
- `view_stores` - Voir les boutiques

### Admin Gestionnaire
- `view_stores` - Voir les boutiques
- `edit_stores` - Modifier les boutiques
- `ban_stores` - Bannir des boutiques
- `restrict_products` - Restreindre les produits
- `view_enterprise_vendors` - Voir les vendeurs entreprises
- `manage_enterprise_vendors` - Gérer les vendeurs entreprises

### Admin Analytics
- `view_analytics` - Voir les analytics
- `view_stats` - Voir les statistiques
- `export_data` - Exporter les données
- `view_reports` - Voir les rapports

### Admin Financial
- `view_payments` - Voir les paiements
- `verify_payments` - Vérifier les paiements
- `view_invoices` - Voir les factures
- `manage_subscriptions` - Gérer les abonnements
- `view_financial_reports` - Voir les rapports financiers

## 🔄 Workflow de création d'admin

1. **Super Admin** se connecte
2. Va sur `/admin/admins.html`
3. Clique sur "Créer un admin"
4. Remplit le formulaire :
   - Nom complet
   - Numéro de téléphone
   - Email (optionnel)
   - Rôle admin
   - Mot de passe
5. Le système crée l'admin avec les permissions appropriées

## 🛡️ Sécurité

- Les permissions sont vérifiées côté serveur via RPC
- Les pages vérifient les permissions au chargement
- Les actions sensibles nécessitent des permissions spécifiques
- Seul le super admin peut créer d'autres admins
- Les mots de passe sont hashés avec SHA-256

## 📊 Dashboard selon le rôle

Chaque type d'admin voit un dashboard adapté à ses permissions :
- **Super Admin** : Vue complète avec tous les modules
- **Commercial** : Focus sur les vendeurs
- **Gestionnaire** : Focus sur les boutiques
- **Analytics** : Focus sur les statistiques
- **Financial** : Focus sur les paiements

## 🆘 Dépannage

### Un admin ne peut pas accéder à une page
1. Vérifiez que le rôle est correct dans la table `users`
2. Vérifiez que les permissions sont correctes dans `admin_permissions`
3. Vérifiez la console du navigateur pour les erreurs

### Les permissions ne fonctionnent pas
1. Vérifiez que la fonction RPC `check_admin_permission` existe
2. Vérifiez que RLS est correctement configuré
3. Vérifiez que l'utilisateur a bien un `admin_role`

