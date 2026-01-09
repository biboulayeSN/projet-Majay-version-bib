# 📋 Configuration des Page Rules Cloudflare

Cloudflare offre **3 Page Rules gratuites**. Voici les 3 règles essentielles pour MAJAY.

---

## 🎯 Page Rule 1 : Cache Agressif pour Assets Statiques

### URL Pattern :
```
*majay.com/css/*
*majay.com/js/*
*majay.com/images/*
*majay.com/fonts/*
```

### Settings :
- **Cache Level** : Cache Everything
- **Edge Cache TTL** : 1 month
- **Browser Cache TTL** : 1 week

### Effet :
✅ CSS, JS, images servis instantanément depuis le cache  
✅ Réduction de 90% de la charge serveur  
✅ Performance maximale  

---

## 🎯 Page Rule 2 : Pas de Cache pour Admin/Vendeur

### URL Pattern :
```
*admin.majay.com/*
*majay.com/vendeur/*
```

### Settings :
- **Cache Level** : Bypass
- **Security Level** : High
- **Disable Apps** : On

### Effet :
✅ Dashboard toujours à jour  
✅ Pas de problème de cache  
✅ Sécurité renforcée pour zones sensibles  

---

## 🎯 Page Rule 3 : Force HTTPS Partout

### URL Pattern :
```
http://*majay.com/*
```

### Settings :
- **Always Use HTTPS** : On
- **Automatic HTTPS Rewrites** : On

### Effet :
✅ Tout le trafic HTTP redirigé vers HTTPS  
✅ Sécurité maximale  
✅ Meilleur SEO Google  

---

## 📝 Comment Configurer

### Via Dashboard Cloudflare :

1. Allez sur https://dash.cloudflare.com/
2. Sélectionnez votre domaine : **majay.com**
3. Menu de gauche : **Rules** → **Page Rules**
4. Cliquez **Create Page Rule**

#### Rule 1 - Assets Statiques :
```
URL: *majay.com/css/*,*majay.com/js/*,*majay.com/images/*

Settings:
✓ Cache Level: Cache Everything
✓ Edge Cache TTL: 1 month
✓ Browser Cache TTL: 1 week
```

#### Rule 2 - Admin/Vendeur :
```
URL: *admin.majay.com/*,*majay.com/vendeur/*

Settings:
✓ Cache Level: Bypass
✓ Security Level: High
```

#### Rule 3 - Force HTTPS :
```
URL: http://*majay.com/*

Settings:
✓ Always Use HTTPS: On
```

5. Cliquez **Save and Deploy**

---

## 📊 Résultats Attendus

### Performance :
```
Avant Page Rules:
- CSS/JS: 200-500ms
- Images: 500ms-2s
- Total: 3-5s

Après Page Rules:
- CSS/JS: 10-50ms (cache)
- Images: 50-200ms (cache)
- Total: 500ms-1s ⚡
```

### Cache Hit Rate :
```
Attendu: 80-90% de requêtes servies depuis le cache
Économie bande passante: 60-80%
```

---

## ✅ Vérification

Après configuration, testez sur :
```
https://tools.keycdn.com/performance
https://www.webpagetest.org/
```

Vous devriez voir :
- ✅ Assets servis depuis "cf-cache-status: HIT"
- ✅ Time to First Byte < 100ms
- ✅ Total Load Time < 1s

---

## 💡 Alternatives avec Transform Rules (illimitées gratuites)

Si vous avez besoin de plus de 3 règles, utilisez **Transform Rules** (gratuites et illimitées) :

Dashboard → Rules → Transform Rules → HTTP Response Header Modification

Exemple pour cache :
```
Expression: (http.request.uri.path contains "/css/" or http.request.uri.path contains "/js/")
Header: Cache-Control
Value: public, max-age=31536000
```
