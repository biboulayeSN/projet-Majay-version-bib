# 🖥️ Guide du Serveur - MAJAY

## 🚀 Démarrage du serveur

### Option 1 : Serveur Python personnalisé (Recommandé)

Le serveur personnalisé (`server.py`) gère automatiquement :
- ✅ Le routage des répertoires (`/admin/` → `/admin/index.html`)
- ✅ La protection contre l'affichage de la liste des fichiers
- ✅ Les en-têtes de sécurité

**Lancer le serveur :**
```bash
python server.py
```

**Sur un port spécifique :**
```bash
python server.py 8080
```

### Option 2 : Serveur Python standard

Si vous préférez utiliser le serveur Python standard :
```bash
python -m http.server 8000
```

⚠️ **Note** : Avec le serveur standard, l'accès à `/admin/` affichera la liste des fichiers. Utilisez directement `/admin/index.html` ou `/admin/connexion.html`.

## 🔒 Protection des pages admin

Toutes les pages admin sont protégées :

1. **`admin/index.html`** - Vérifie l'authentification et redirige
2. **`admin/dashboard.html`** - Vérifie l'authentification au chargement
3. **`admin/stores.html`** - Vérifie l'authentification au chargement
4. **`admin/vendeur.html`** - Vérifie l'authentification au chargement
5. **`admin/subscriptions.html`** - Vérifie l'authentification au chargement

Si un utilisateur non authentifié tente d'accéder à une page admin, il sera automatiquement redirigé vers `admin/connexion.html`.

## 🌐 Accès réseau local

Pour accéder depuis un autre appareil sur le même réseau :

```bash
python server.py 8000
```

Puis accédez depuis un autre appareil :
```
http://VOTRE_IP:8000
```

Pour trouver votre IP :
- **Windows** : `ipconfig` (cherchez "IPv4 Address")
- **Mac/Linux** : `ifconfig` ou `ip addr`

## 📝 Exemples d'URLs

### Pages publiques
- `http://localhost:8000/` - Page d'accueil
- `http://localhost:8000/ma-boutique` - Catalogue d'une boutique
- `http://localhost:8000/catalogue.html?shop=ma-boutique` - Ancien format (compatible)

### Pages vendeur
- `http://localhost:8000/vendeur/inscription.html` - Inscription
- `http://localhost:8000/vendeur/connexion.html` - Connexion
- `http://localhost:8000/vendeur/dashboard.html` - Dashboard (protégé)

### Pages admin
- `http://localhost:8000/admin/` - Redirige vers index.html puis connexion ou dashboard
- `http://localhost:8000/admin/connexion.html` - Connexion admin
- `http://localhost:8000/admin/dashboard.html` - Dashboard admin (protégé)

## 🔧 Dépannage

### Le serveur ne démarre pas
- Vérifiez que le port n'est pas déjà utilisé
- Essayez un autre port : `python server.py 8080`

### La liste des fichiers s'affiche
- Utilisez `server.py` au lieu de `python -m http.server`
- Ou accédez directement aux fichiers HTML

### Erreur 403 sur /admin/
- C'est normal, le serveur redirige automatiquement vers `index.html`
- Vérifiez que `admin/index.html` existe

## 🚀 Production

En production, utilisez un serveur web professionnel :
- **Apache** : Configurez avec `.htaccess`
- **Nginx** : Configurez les règles de routage
- **Netlify/Vercel** : Utilisez les fichiers `_redirects` ou `vercel.json`

