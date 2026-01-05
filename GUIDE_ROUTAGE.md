# 🗺️ Guide de Configuration du Routage - MAJAY

Ce guide explique comment configurer le système de routage pour que les boutiques soient accessibles via des URLs propres.

## 📋 Format des URLs

### Boutiques
- **Ancien format** : `www.site.com/catalogue.html?shop=ma-boutique`
- **Nouveau format** : `www.site.com/ma-boutique` ✅

### Administration
- **Format** : `admin.site.com` ou `admin.site.sn`

## 🔧 Configuration selon votre hébergement

### Option 1 : Apache (hébergement classique)

Le fichier `.htaccess` est déjà créé. Assurez-vous que :
1. Le module `mod_rewrite` est activé sur votre serveur Apache
2. Le fichier `.htaccess` est à la racine de votre projet
3. Les permissions sont correctes

**Test** : Accédez à `www.votresite.com/ma-boutique` - cela devrait rediriger vers le catalogue.

### Option 2 : Netlify

Le fichier `_redirects` est déjà créé. Netlify le détectera automatiquement.

**Déploiement** :
```bash
# Le fichier _redirects sera automatiquement utilisé
netlify deploy
```

### Option 3 : Vercel

Le fichier `vercel.json` est déjà créé. Vercel l'utilisera automatiquement.

**Déploiement** :
```bash
vercel deploy
```

### Option 4 : Serveur Python (développement local)

Pour le développement local avec `python -m http.server`, le routage ne fonctionnera pas automatiquement. Vous avez deux options :

#### Option A : Utiliser le format ancien (temporaire)
```
http://localhost:8000/catalogue.html?shop=ma-boutique
```

#### Option B : Utiliser un serveur avec support de routage
Installez `http-server` avec support SPA :
```bash
npm install -g http-server
http-server -P http://localhost:8080? --proxy http://localhost:8080?
```

## 🌐 Configuration du sous-domaine Admin

Pour que `admin.site.com` fonctionne, vous devez configurer un DNS :

### 1. Ajouter un enregistrement DNS

Dans votre panneau DNS, ajoutez :
- **Type** : CNAME ou A
- **Nom** : `admin`
- **Valeur** : L'IP de votre serveur ou le domaine principal

### 2. Configuration serveur

#### Apache (.htaccess)
Le fichier `.htaccess` gère déjà cela automatiquement.

#### Nginx
Ajoutez dans votre configuration Nginx :
```nginx
server {
    server_name admin.votresite.com;
    root /chemin/vers/votre/projet;
    index index.html;

    location / {
        try_files $uri $uri/ /admin/index.html;
    }

    location /admin {
        alias /chemin/vers/votre/projet/admin;
        try_files $uri $uri/ /admin/index.html;
    }
}
```

#### Netlify/Vercel
Configurez un sous-domaine dans votre panneau :
- Netlify : Domain settings → Add custom domain → `admin.votresite.com`
- Vercel : Settings → Domains → Add domain → `admin.votresite.com`

## ✅ Vérification

### Test des boutiques
1. Créez une boutique avec le slug `test-boutique`
2. Accédez à `www.votresite.com/test-boutique`
3. Vous devriez voir le catalogue de la boutique

### Test de l'admin
1. Accédez à `admin.votresite.com`
2. Vous devriez être redirigé vers `/admin/dashboard.html`

## 🔄 Migration depuis l'ancien format

Les anciens liens (`catalogue.html?shop=...`) continuent de fonctionner pour la compatibilité. Les nouveaux liens générés utilisent le format propre.

## 📝 Notes importantes

1. **Slugs uniques** : Chaque boutique doit avoir un slug unique
2. **Caractères autorisés** : Les slugs ne peuvent contenir que des lettres minuscules, chiffres et tirets
3. **Pages système** : Les pages comme `/admin`, `/vendeur`, `/catalogue.html` ne sont pas considérées comme des boutiques
4. **SEO** : Les URLs propres sont meilleures pour le référencement

## 🐛 Dépannage

### Le routage ne fonctionne pas
1. Vérifiez que le fichier de configuration (`.htaccess`, `_redirects`, `vercel.json`) est présent
2. Vérifiez les permissions du fichier
3. Vérifiez les logs du serveur

### Erreur 404 sur les boutiques
1. Vérifiez que le slug de la boutique existe dans la base de données
2. Vérifiez que la boutique est active (`is_active = true`)
3. Vérifiez que le fichier `store-router.html` existe

### Le sous-domaine admin ne fonctionne pas
1. Vérifiez la configuration DNS (peut prendre jusqu'à 48h)
2. Vérifiez la configuration du serveur web
3. Testez avec `curl -H "Host: admin.votresite.com" http://votre-ip/`

