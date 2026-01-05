# 🔐 Guide d'Authentification Admin par Mot de Passe

## 📋 Informations de connexion

- **Numéro de téléphone** : `780181144`
- **Mot de passe** : `123456`

## 🚀 Configuration

### Étape 1 : Créer l'utilisateur admin dans Supabase

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez le fichier `create-admin.sql` ou copiez-collez ce SQL :

```sql
INSERT INTO users (
  id,
  phone,
  email,
  password_hash,
  full_name,
  role_type,
  is_super_admin,
  is_active,
  created_at
)
VALUES (
  gen_random_uuid(),
  '+221780181144',
  'admin@majay.sn',
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  'Super Administrateur',
  'owner',
  true,
  true,
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET
  password_hash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  is_super_admin = true,
  is_active = true,
  updated_at = NOW();
```

### Étape 2 : Vérifier la création

Exécutez cette requête pour vérifier :

```sql
SELECT id, phone, full_name, is_super_admin, created_at 
FROM users 
WHERE phone = '+221780181144';
```

Vous devriez voir votre utilisateur admin avec `is_super_admin = true`.

## 🔑 Connexion

1. Allez sur `http://localhost:8000/admin/connexion.html`
2. Entrez votre numéro : `780181144`
3. Entrez votre mot de passe : `123456`
4. Cliquez sur "Se connecter"

## 🔒 Sécurité

- Le mot de passe est hashé avec SHA-256 avant d'être comparé
- Le hash est stocké dans la colonne `password_hash` de la table `users`
- Aucun SMS n'est envoyé (économie de tokens Twilio)

## 🔄 Changer le mot de passe

Pour changer le mot de passe, vous devez :

1. Hasher le nouveau mot de passe avec SHA-256
2. Mettre à jour la base de données

**Hasher un mot de passe en ligne :**
- Allez sur https://emn178.github.io/online-tools/sha256.html
- Entrez votre nouveau mot de passe
- Copiez le hash généré

**Mettre à jour dans Supabase :**

```sql
UPDATE users 
SET password_hash = 'NOUVEAU_HASH_ICI',
    updated_at = NOW()
WHERE phone = '+221780181144';
```

## 📝 Notes

- Le numéro peut être entré avec ou sans le préfixe `+221`
- Le système ajoute automatiquement `+221` si le numéro commence par `7`
- Le mot de passe est sensible à la casse
- La session expire après 7 jours d'inactivité

## 🆘 Dépannage

### Erreur "Numéro de téléphone ou mot de passe incorrect"
- Vérifiez que l'utilisateur existe dans la table `users`
- Vérifiez que `is_super_admin = true`
- Vérifiez que le hash du mot de passe est correct

### L'utilisateur n'existe pas
- Exécutez le script `create-admin.sql`
- Vérifiez qu'il n'y a pas d'erreur dans la console Supabase

### Le mot de passe ne fonctionne pas
- Vérifiez que le hash est correct (SHA-256 de "123456")
- Réessayez avec le script SQL pour mettre à jour le hash

