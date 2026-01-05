# 🚀 GUIDE DE CONFIGURATION SUPABASE - MAJAY

**Objectif** : Configurer Supabase pour un nouveau projet Majay  
**Durée estimée** : 15-20 minutes  
**Prérequis** : Compte Supabase (gratuit)

---

## 📋 TABLE DES MATIÈRES

1. [Créer un projet Supabase](#1-créer-un-projet-supabase)
2. [Exécuter le schema SQL](#2-exécuter-le-schema-sql)
3. [Configurer l'authentification Phone](#3-configurer-lauthentification-phone)
4. [Configurer Twilio (SMS)](#4-configurer-twilio-sms)
5. [Configurer les variables d'environnement](#5-configurer-les-variables-denvironnement)
6. [Vérifier la configuration](#6-vérifier-la-configuration)

---

## 1. CRÉER UN PROJET SUPABASE

### Étape 1.1 : Aller sur Supabase

1. Va sur https://supabase.com
2. Clique sur **"Start your project"** ou **"Sign in"**
3. Connecte-toi avec GitHub, Google, ou email

### Étape 1.2 : Créer un nouveau projet

1. Clique sur **"New Project"**
2. Remplis les informations :
   - **Name** : `majay-prod` (ou autre nom)
   - **Database Password** : ⚠️ **COPIE ET SAUVEGARDE CE MOT DE PASSE !**
   - **Region** : **West EU (Ireland)** (proche de l'Afrique)
   - **Pricing Plan** : **Free** (suffisant pour commencer)

3. Clique sur **"Create new project"**
4. ⏳ Attends 2-3 minutes que le projet soit créé

---

## 2. EXÉCUTER LE SCHEMA SQL

### Étape 2.1 : Ouvrir SQL Editor

1. Dans le Dashboard Supabase, clique sur **"SQL Editor"** (menu de gauche)
2. Clique sur **"New Query"**

### Étape 2.2 : Exécuter le script

1. Ouvre le fichier **`SUPABASE_SCHEMA_COMPLET.sql`**
2. **Copie TOUT le contenu** (Ctrl+A, Ctrl+C)
3. Colle dans l'éditeur SQL de Supabase (Ctrl+V)
4. Clique sur **"Run"** (ou F5)

### Étape 2.3 : Vérifier les erreurs

- ✅ Si tu vois **"Success. No rows returned"** → Tout est bon !
- ❌ Si tu vois des erreurs :
  - Vérifie que tu as bien copié TOUT le fichier
  - Vérifie que les types ENUM n'existent pas déjà (erreur `type already exists`)
  - Si erreur sur types existants, commente les lignes `CREATE TYPE` et réessaye

### Étape 2.4 : Vérifier que les tables sont créées

1. Va dans **"Table Editor"** (menu de gauche)
2. Tu devrais voir toutes ces tables :
   - ✅ `plans`
   - ✅ `users`
   - ✅ `stores`
   - ✅ `products`
   - ✅ `customers`
   - ✅ `orders`
   - ✅ `team_members`
   - ✅ Et d'autres...

---

## 3. CONFIGURER L'AUTHENTIFICATION PHONE

### Étape 3.1 : Activer Phone Provider

1. Va dans **"Authentication"** → **"Providers"** (menu de gauche)
2. Scroll jusqu'à **"Phone"**
3. Clique sur **"Enable Phone provider"**

### Étape 3.2 : Configurer les settings

1. Va dans **"Authentication"** → **"Settings"**
2. Scroll jusqu'à **"User Signups"**
3. **IMPORTANT** : Active ces options :

```
✅ Autoconfirm users
   Users will not need to confirm their phone number.

❌ Enable phone confirmations (DÉSACTIVÉ si Autoconfirm est activé)
```

**Pourquoi ?** Sans "Autoconfirm users", les users ne sont pas complètement créés dans `auth.users` après `verifyOtp()`, ce qui cause des erreurs Foreign Key.

4. Clique sur **"Save"**

---

## 4. CONFIGURER TWILIO (SMS)

### Étape 4.1 : Créer un compte Twilio

1. Va sur https://www.twilio.com/try-twilio
2. Inscris-toi (Trial gratuit = 15$ de crédit)
3. Vérifie ton email et téléphone

### Étape 4.2 : Acheter un numéro de téléphone

1. Dans Twilio Dashboard, va dans **"Phone Numbers"** → **"Buy a number"**
2. Sélectionne **"United States"** (gratuit en Trial)
3. Filtre : **Voice** + **SMS**
4. Clique sur **"Buy"** sur un numéro (ex: `+17176787627`)

### Étape 4.3 : Vérifier des numéros (Trial mode)

En mode Trial, tu ne peux envoyer des SMS qu'à des numéros vérifiés :

1. Va dans **"Phone Numbers"** → **"Verified Caller IDs"**
2. Clique **"Add a new number"**
3. Entre ton numéro Sénégal : `+221780181144`
4. Reçois le code par SMS et vérifie

### Étape 4.4 : Configurer dans Supabase

1. Retourne dans Supabase → **"Authentication"** → **"Providers"** → **"Phone"**
2. Choisis **"Twilio Messaging"** (pas Verify)
3. Remplis :
   - **Twilio Account SID** : `ACxxxxxxxxx` (depuis Twilio Dashboard)
   - **Twilio Auth Token** : `xxxxxxxxx` (clic sur "Show" dans Twilio)
   - **Twilio Phone Number** : `+17176787627` (ton numéro acheté)

4. ✅ Active **"Enable phone confirmations"** (même si Autoconfirm est activé, c'est pour l'envoi SMS)

5. **Test Phone Numbers** (pour économiser des crédits) :
   ```
   221780181144=123456
   ```
   Format : `<phone>=<otp>` (sans + au début)

6. **Test OTPs Valid Until** : Choisis une date future (ex: 1 mois)

7. Clique sur **"Save"**

---

## 5. CONFIGURER LES VARIABLES D'ENVIRONNEMENT

### Étape 5.1 : Récupérer les credentials Supabase

1. Dans Supabase Dashboard, va dans **"Settings"** → **"API"**
2. Copie ces valeurs :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Secret !)

### Étape 5.2 : Créer le fichier .env.local

1. Dans ton projet, copie le fichier **`env.example`** vers **`.env.local`**
   ```bash
   cp env.example .env.local
   ```

2. Ouvre **`.env.local`** et remplis les valeurs :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **⚠️ IMPORTANT** : Ne jamais commiter `.env.local` dans Git !

---

## 6. VÉRIFIER LA CONFIGURATION

### Test 1 : Vérifier les tables

Dans Supabase → **"Table Editor"** :

```sql
SELECT COUNT(*) FROM plans;
-- Résultat attendu : 3 (free, pro, entreprise)
```

### Test 2 : Vérifier les fonctions

Dans Supabase → **"SQL Editor"** :

```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('check_plan_limits', 'create_store_with_limits', 'add_team_member');
-- Résultat attendu : 3 lignes
```

### Test 3 : Vérifier les triggers

```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%' OR trigger_name LIKE '%store%';
-- Résultat attendu : Plusieurs triggers
```

### Test 4 : Vérifier les RLS policies

```sql
SELECT tablename, policyname FROM pg_policies 
WHERE tablename = 'stores';
-- Résultat attendu : Plusieurs policies
```

### Test 5 : Tester l'authentification

1. Lance ton app : `npm run dev`
2. Va sur `http://localhost:3000/auth/signup`
3. Remplis le formulaire avec le numéro test : `221780181144`
4. Entre le code : `123456`
5. ✅ Si la boutique est créée → Configuration OK !

---

## 🔧 TROUBLESHOOTING

### Erreur : "type already exists"

**Cause** : Les types ENUM existent déjà

**Solution** : Dans `SUPABASE_SCHEMA_COMPLET.sql`, commente les lignes `CREATE TYPE` :

```sql
-- CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'entreprise');
-- CREATE TYPE order_status AS ENUM (...);
```

Puis réexécute le script.

---

### Erreur : "Foreign Key Constraint violation"

**Cause** : "Autoconfirm users" n'est pas activé

**Solution** :
1. Va dans Supabase → **"Authentication"** → **"Settings"**
2. Active **"Autoconfirm users"**
3. Sauvegarde
4. Réessaye

---

### Erreur : "Could not find function create_user_and_store"

**Cause** : Le script SQL n'a pas été exécuté complètement

**Solution** :
1. Vérifie que toutes les fonctions existent dans SQL Editor :
```sql
SELECT proname FROM pg_proc WHERE proname LIKE '%user%' OR proname LIKE '%store%';
```
2. Si manquantes, réexécute `SUPABASE_SCHEMA_COMPLET.sql`

---

### SMS ne sont pas envoyés

**Cause** : Configuration Twilio incorrecte

**Solution** :
1. Vérifie que tu utilises **"Twilio Messaging"** (pas Verify)
2. Vérifie que le numéro est dans **"Verified Caller IDs"** (Trial)
3. Vérifie que **"Test Phone Numbers"** est configuré pour tester sans coût

---

## 📋 CHECKLIST FINALE

- [ ] Projet Supabase créé
- [ ] Schema SQL exécuté sans erreurs
- [ ] Toutes les tables visibles dans Table Editor
- [ ] Phone provider activé
- [ ] "Autoconfirm users" activé
- [ ] Twilio configuré (Account SID, Auth Token, Phone Number)
- [ ] Test Phone Numbers configuré
- [ ] `.env.local` créé et rempli
- [ ] Test signup fonctionne
- [ ] Boutique créée avec succès

---

## 🎉 C'EST PRÊT !

Ton projet Supabase est maintenant configuré et prêt à être utilisé !

**Prochaine étape** : Lance `npm run dev` et teste l'application !

---

## 📞 BESOIN D'AIDE ?

Si tu rencontres des problèmes :

1. Vérifie les logs Supabase (Dashboard → Logs)
2. Vérifie la console navigateur (F12)
3. Vérifie que toutes les étapes de ce guide sont complétées
4. Consulte `GUIDE_COMPLET_MAJAY_2025.md` pour plus de détails

---

**Créé le** : Janvier 2025  
**Version** : 1.0

