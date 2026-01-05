# 🔒 Sécurité Supabase - Explication Simple

## 📚 Les Deux Types de Clés Supabase

Supabase utilise **deux types de clés** très différents :

### 1. 🔓 Clé "ANON" (Publique) - ✅ SÉCURISÉE dans le frontend

**C'est quoi ?**
- C'est la clé que nous mettons dans `js/config.js`
- Elle commence souvent par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Elle a le rôle `"anon"` dans le token

**Pourquoi c'est sécurisé ?**
- ✅ Cette clé est **faite pour être publique** (dans le frontend)
- ✅ Elle est **protégée par RLS** (Row Level Security)
- ✅ RLS = chaque utilisateur ne voit que SES propres données
- ✅ Même si quelqu'un vole cette clé, il ne peut pas accéder aux données des autres

**Exemple concret :**
```
Utilisateur A avec la clé anon → Voit seulement SES boutiques
Utilisateur B avec la même clé anon → Voit seulement SES boutiques
```

### 2. 🔐 Clé "SERVICE_ROLE" (Secrète) - ❌ JAMAIS dans le frontend

**C'est quoi ?**
- C'est la clé dans votre `.env.local` (SUPABASE_SERVICE_ROLE_KEY)
- Elle a le rôle `"service_role"` dans le token
- Elle **bypass toutes les règles de sécurité**

**Pourquoi c'est DANGEREUX dans le frontend ?**
- ❌ Elle peut accéder à TOUTES les données
- ❌ Elle ignore les règles RLS
- ❌ Si quelqu'un la vole, il peut tout voir/modifier/supprimer

**Où l'utiliser ?**
- ✅ Uniquement dans un **backend** (serveur Node.js, API, etc.)
- ✅ Jamais dans le code JavaScript du navigateur
- ✅ Toujours dans `.env.local` (jamais commité dans Git)

## 🛡️ Comment Supabase Protège Vos Données

### Row Level Security (RLS) - Votre Garde du Corps

Imaginez que votre base de données est un immeuble avec des appartements :

```
🏢 Immeuble (Base de données)
├── 🏠 Appartement 1 (Boutique de Amadou)
├── 🏠 Appartement 2 (Boutique de Fatou)
└── 🏠 Appartement 3 (Boutique de Mamadou)
```

**Sans RLS :**
- N'importe qui avec la clé peut entrer dans tous les appartements ❌

**Avec RLS (activé dans votre schéma SQL) :**
- Amadou avec la clé anon → Peut entrer SEULEMENT dans son appartement ✅
- Fatou avec la même clé anon → Peut entrer SEULEMENT dans son appartement ✅
- Même clé, mais accès différent selon l'utilisateur connecté !

## ✅ Vérification : Votre Projet est Sécurisé

Dans votre code actuel :

1. ✅ **Clé ANON dans `js/config.js`** → C'est normal et sécurisé
2. ✅ **Clé SERVICE_ROLE dans `.env.local`** → Bien protégée (pas dans le code)
3. ✅ **RLS activé** → Votre schéma SQL active RLS sur toutes les tables
4. ✅ **Policies configurées** → Chaque table a des règles de sécurité

## 🔍 Comment Vérifier que RLS Fonctionne

Dans Supabase Dashboard :
1. Allez dans **Authentication** → **Policies**
2. Vérifiez que chaque table a des policies actives
3. Testez : connectez-vous avec un utilisateur et essayez d'accéder aux données d'un autre → Ça ne devrait pas fonctionner

## 📝 Résumé Simple

| Clé | Où l'utiliser | Sécurité |
|-----|---------------|----------|
| **ANON** | Frontend (JavaScript) | ✅ Sécurisée avec RLS |
| **SERVICE_ROLE** | Backend uniquement | ❌ Dangereuse si exposée |

## 🎯 Conclusion

**Votre configuration actuelle est CORRECTE et SÉCURISÉE** ✅

- La clé anon dans `js/config.js` est normale
- La clé service_role reste secrète dans `.env.local`
- RLS protège vos données automatiquement

C'est exactement comme ça que Supabase est conçu pour fonctionner ! 🎉

