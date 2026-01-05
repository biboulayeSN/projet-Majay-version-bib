# 🔧 Guide de Résolution - Erreur Admin "Cannot coerce the result to a single JSON object"

## 🐛 Problème

L'erreur "Cannot coerce the result to a single JSON object" se produit lors de la connexion admin.

## 🔍 Causes possibles

1. **Utilisateur non créé dans la table `users`**
   - L'utilisateur existe dans Supabase Auth mais pas dans la table `users`
   - La table `users` n'a pas été créée automatiquement

2. **Colonne `is_super_admin` manquante**
   - La colonne n'existe pas dans la table `users`
   - Le schéma SQL n'a pas été exécuté complètement

3. **Utilisateur inexistant**
   - L'ID utilisateur retourné par Auth n'existe pas dans `users`

## ✅ Solutions

### Solution 1 : Vérifier que l'utilisateur existe

1. Allez dans Supabase Dashboard → Table Editor → `users`
2. Vérifiez que votre utilisateur existe avec `is_super_admin = true`
3. Si l'utilisateur n'existe pas, créez-le manuellement :

```sql
INSERT INTO users (id, phone, email, full_name, is_super_admin, created_at)
VALUES (
  'VOTRE_USER_ID_FROM_AUTH',
  '+221771234567',
  'admin@example.com',
  'Super Admin',
  true,
  NOW()
);
```

### Solution 2 : Créer un utilisateur admin via SQL

Exécutez ce SQL dans Supabase SQL Editor :

```sql
-- Remplacer par votre numéro de téléphone
INSERT INTO users (id, phone, email, full_name, is_super_admin, role_type, created_at)
SELECT 
  id,
  phone,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  true as is_super_admin,
  'owner'::role_type,
  created_at
FROM auth.users
WHERE phone = '+221771234567' -- Votre numéro
ON CONFLICT (id) DO UPDATE SET
  is_super_admin = true,
  role_type = 'owner'::role_type;
```

### Solution 3 : Vérifier le schéma SQL

Assurez-vous que le schéma SQL complet a été exécuté :

1. Allez dans Supabase Dashboard → SQL Editor
2. Vérifiez que la table `users` existe avec la colonne `is_super_admin`
3. Si la colonne n'existe pas, exécutez :

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
```

### Solution 4 : Créer un trigger automatique

Pour que les utilisateurs soient créés automatiquement dans `users` lors de l'inscription :

```sql
-- Fonction pour créer automatiquement un utilisateur dans la table users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer l'utilisateur automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Test

Après avoir appliqué une solution :

1. Déconnectez-vous complètement (vider le localStorage)
2. Reconnectez-vous avec votre numéro admin
3. Vérifiez que la connexion fonctionne

## 📝 Notes

- Le code a été corrigé pour utiliser `.maybeSingle()` au lieu de `.single()` pour mieux gérer les cas où l'utilisateur n'existe pas
- Les messages d'erreur sont maintenant plus clairs
- Les notifications sont utilisées au lieu des alertes

## 🆘 Si le problème persiste

1. Vérifiez la console du navigateur (F12) pour voir l'erreur exacte
2. Vérifiez les logs Supabase Dashboard → Logs
3. Vérifiez que RLS (Row Level Security) est correctement configuré
4. Vérifiez que votre utilisateur a bien `is_super_admin = true` dans la table `users`

