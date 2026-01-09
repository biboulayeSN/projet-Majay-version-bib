# ⚡ Démarrage Rapide - Cloudflare Worker (5 minutes)

Version ultra-simplifiée pour déployer votre Worker de géolocalisation.

---

## 🚀 En 5 étapes simples

### 1️⃣ Installer Wrangler

```bash
npm install -g wrangler
```

### 2️⃣ Se connecter à Cloudflare

```bash
wrangler login
```
→ Suivez les instructions dans le navigateur

### 3️⃣ Déployer

```bash
cd cloudflare
wrangler deploy
```

### 4️⃣ Copier l'URL

Vous verrez quelque chose comme :
```
✨ https://majay-geolocation.workers.dev
```

### 5️⃣ Configurer dans l'app

Ouvrez `js/geolocation.js` (ligne ~36) :

```javascript
// Remplacez null par votre URL
const CLOUDFLARE_WORKER_URL = 'https://majay-geolocation.workers.dev';
```

---

## ✅ C'EST TOUT !

Testez sur : `http://localhost:8000/vendeur/inscription.html`

Le pays sera détecté via Cloudflare (gratuit et illimité) ! 🎉

---

## 🆘 Problème ?

Consultez le guide complet : `GUIDE_DEPLOIEMENT.md`
