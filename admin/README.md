# 🔐 Espace Administrateur - MAJAY

**Accès réservé aux super-administrateurs uniquement.**

## ⚠️ Protection

Toutes les pages de cet espace sont protégées par authentification. 
Si vous n'êtes pas connecté, vous serez automatiquement redirigé vers la page de connexion.

## 📋 Pages disponibles

- **index.html** - Point d'entrée (redirige vers connexion ou dashboard)
- **connexion.html** - Page de connexion admin
- **dashboard.html** - Tableau de bord principal
- **stores.html** - Gestion des boutiques
- **vendeur.html** - Gestion des vendeurs
- **subscriptions.html** - Gestion des abonnements

## 🔒 Sécurité

- Authentification OTP par SMS requise
- Vérification du statut `is_super_admin` dans la base de données
- Session avec expiration automatique (7 jours)
- Redirection automatique si non authentifié

