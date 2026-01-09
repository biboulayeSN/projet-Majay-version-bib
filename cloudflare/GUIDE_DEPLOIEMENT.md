# 🚀 Guide de Déploiement Cloudflare Worker

Ce guide vous accompagne pas à pas pour déployer le Worker de géolocalisation sur Cloudflare (100% GRATUIT).

---

## 📋 Prérequis

- Un compte Cloudflare (gratuit) : https://dash.cloudflare.com/sign-up
- Node.js installé (pour Wrangler CLI)

---

## 🎯 Étape 1 : Créer un compte Cloudflare (si pas déjà fait)

1. Allez sur : https://dash.cloudflare.com/sign-up
2. Inscrivez-vous avec votre email
3. Vérifiez votre email
4. Connectez-vous au dashboard

---

## ⚙️ Étape 2 : Installer Wrangler (CLI Cloudflare)

Ouvrez un terminal et exécutez :

```bash
npm install -g wrangler
```

Ou avec npx (sans installation globale) :

```bash
npx wrangler --version
```

---

## 🔑 Étape 3 : Authentifier Wrangler

```bash
wrangler login
```

Cela ouvrira votre navigateur pour autoriser Wrangler à accéder à votre compte Cloudflare.

---

## 📝 Étape 4 : Configurer wrangler.toml

1. Récupérez votre **Account ID** :
   - Allez sur : https://dash.cloudflare.com/
   - Cliquez sur **Workers & Pages** dans le menu de gauche
   - Votre **Account ID** est affiché en haut à droite

2. Ouvrez le fichier `cloudflare/wrangler.toml`

3. Décommentez et remplacez :
   ```toml
   account_id = "votre-account-id-ici"
   ```
   Par votre vrai Account ID, par exemple :
   ```toml
   account_id = "a1b2c3d4e5f6g7h8i9j0"
   ```

---

## 🚀 Étape 5 : Déployer le Worker

Depuis le dossier `cloudflare/`, exécutez :

```bash
cd cloudflare
wrangler deploy
```

Vous verrez quelque chose comme :

```
✨ Successfully published your worker at:
   https://majay-geolocation.workers.dev
```

**Notez cette URL !** C'est l'URL de votre Worker.

---

## ✅ Étape 6 : Tester le Worker

Ouvrez votre navigateur et allez sur :

```
https://majay-geolocation.workers.dev
```

Vous devriez voir un JSON avec vos informations de géolocalisation :

```json
{
  "country": "SN",
  "countryName": "Sénégal",
  "city": "Dakar",
  "region": "Dakar",
  "latitude": 14.6937,
  "longitude": -17.4441,
  "timezone": "Africa/Dakar",
  "prefix": "+221",
  "flag": "🇸🇳",
  "ip": "41.82.xxx.xxx",
  "timestamp": 1704750000000,
  "source": "cloudflare"
}
```

---

## 🔗 Étape 7 : Configurer l'URL dans votre application

1. Ouvrez le fichier `js/geolocation.js`

2. Trouvez la constante `CLOUDFLARE_WORKER_URL` (ligne ~35)

3. Remplacez-la par votre URL Worker :
   ```javascript
   const CLOUDFLARE_WORKER_URL = 'https://majay-geolocation.workers.dev';
   ```

4. Sauvegardez le fichier

---

## 🎨 Étape 8 (Optionnelle) : Utiliser un sous-domaine personnalisé

Si vous avez votre domaine sur Cloudflare (ex: `majay.com`), vous pouvez configurer une route personnalisée :

### Option A : Via Dashboard Cloudflare

1. Allez sur : https://dash.cloudflare.com/
2. Sélectionnez votre domaine
3. Cliquez sur **Workers Routes**
4. Cliquez **Add Route**
5. Route : `majay.com/api/location*`
6. Worker : `majay-geolocation`
7. Cliquez **Save**

### Option B : Via wrangler.toml

Dans `wrangler.toml`, décommentez et modifiez :

```toml
routes = [
  { pattern = "majay.com/api/location", zone_name = "majay.com" }
]
```

Puis redéployez :

```bash
wrangler deploy
```

Votre Worker sera accessible sur : `https://majay.com/api/location`

---

## 🔒 Étape 9 (Recommandée) : Restreindre CORS

Par défaut, le Worker accepte les requêtes depuis n'importe quel domaine.

En production, modifiez dans `worker.js` :

```javascript
// Remplacer :
'Access-Control-Allow-Origin': '*'

// Par votre domaine :
'Access-Control-Allow-Origin': 'https://majay.com'
```

Puis redéployez :

```bash
wrangler deploy
```

---

## 📊 Étape 10 : Surveiller l'utilisation

1. Allez sur : https://dash.cloudflare.com/
2. Cliquez sur **Workers & Pages**
3. Cliquez sur votre Worker : **majay-geolocation**
4. Onglet **Metrics** : Voir le nombre de requêtes

Vous avez **100 000 requêtes/jour GRATUITES** !

---

## 🔄 Mettre à jour le Worker

Si vous modifiez `worker.js`, redéployez simplement :

```bash
cd cloudflare
wrangler deploy
```

---

## 🐛 Dépannage

### Erreur : "account_id is required"

→ Vous devez ajouter votre Account ID dans `wrangler.toml`

### Erreur : "Not authenticated"

→ Exécutez : `wrangler login`

### Le Worker ne retourne rien

→ Vérifiez les logs : `wrangler tail majay-geolocation`

### CORS error dans le navigateur

→ Vérifiez que les headers CORS sont corrects dans `worker.js`

---

## 📱 Commandes utiles

```bash
# Voir les logs en temps réel
wrangler tail majay-geolocation

# Tester localement
wrangler dev

# Lister vos workers
wrangler deployments list

# Supprimer un worker
wrangler delete majay-geolocation
```

---

## ✅ Vérification finale

Une fois déployé, testez l'intégration complète :

1. Ouvrez : `http://localhost:8000/vendeur/inscription.html`
2. Attendez 2 secondes
3. Vous devriez voir : "✓ Pays détecté: 🇸🇳 Sénégal"
4. Le préfixe téléphonique s'affiche automatiquement

**C'est tout ! Votre Worker Cloudflare est opérationnel !** 🎉

---

## 💡 Astuce

Le Worker utilise automatiquement le cache de Cloudflare. Les requêtes répétées depuis la même IP sont ultra-rapides (< 10ms) !

---

## 📞 Support

Si vous avez des questions :
- Documentation Cloudflare Workers : https://developers.cloudflare.com/workers/
- Discord Cloudflare : https://discord.cloudflare.com/
