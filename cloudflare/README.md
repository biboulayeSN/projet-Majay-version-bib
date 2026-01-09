# 🌐 Cloudflare Worker - Géolocalisation IP

Ce dossier contient le Worker Cloudflare pour détecter automatiquement le pays, la ville et les coordonnées GPS des utilisateurs.

---

## 📁 Contenu

| Fichier | Description |
|---------|-------------|
| `worker.js` | Code du Worker Cloudflare (détection géo) |
| `wrangler.toml` | Configuration Wrangler CLI |
| `DEMARRAGE_RAPIDE.md` | Guide en 5 étapes (⚡ Commencez ici !) |
| `GUIDE_DEPLOIEMENT.md` | Guide complet avec troubleshooting |

---

## ⚡ Démarrage en 2 minutes

```bash
# 1. Installer Wrangler
npm install -g wrangler

# 2. Se connecter
wrangler login

# 3. Déployer
cd cloudflare
wrangler deploy
```

Consultez `DEMARRAGE_RAPIDE.md` pour plus de détails.

---

## 💰 Coût

**100% GRATUIT** jusqu'à 100 000 requêtes/jour (largement suffisant).

---

## 🎯 Ce que ça fait

Le Worker lit automatiquement les informations de géolocalisation fournies par Cloudflare :

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
  "ip": "41.82.xxx.xxx"
}
```

Ces données sont utilisées pour :
- ✅ Pré-remplir le préfixe téléphonique
- ✅ Enregistrer la localisation dans le CRM
- ✅ Analytics géographiques
- ✅ Segmentation des clients

---

## 🔗 URL du Worker

Après déploiement, vous obtiendrez une URL comme :

```
https://majay-geolocation.workers.dev
```

Configurez-la dans `js/geolocation.js` (ligne 36).

---

## 📊 Surveillance

Dashboard Cloudflare : https://dash.cloudflare.com/

Vous pouvez voir en temps réel :
- Nombre de requêtes
- Pays d'origine
- Temps de réponse
- Erreurs éventuelles

---

## 🆘 Support

- **Guide rapide** : `DEMARRAGE_RAPIDE.md`
- **Guide complet** : `GUIDE_DEPLOIEMENT.md`
- **Doc Cloudflare** : https://developers.cloudflare.com/workers/
