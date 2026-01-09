# 📧 Configuration Email Routing Cloudflare (GRATUIT)

Créez des emails professionnels gratuits : contact@majay.com, support@majay.com, etc.

---

## 🎯 Emails Recommandés pour MAJAY

| Email | Redirige vers | Usage |
|-------|---------------|-------|
| contact@majay.com | votre-email@gmail.com | Contact général |
| support@majay.com | votre-email@gmail.com | Support clients |
| vendeurs@majay.com | votre-email@gmail.com | Questions vendeurs |
| admin@majay.com | votre-email@gmail.com | Admin technique |
| commercial@majay.com | votre-email@gmail.com | Partenariats |

---

## 📝 Configuration (5 minutes)

### Étape 1 : Activer Email Routing

1. Allez sur https://dash.cloudflare.com/
2. Sélectionnez votre domaine : **majay.com**
3. Menu de gauche : **Email** → **Email Routing**
4. Cliquez **Enable Email Routing**

### Étape 2 : Ajouter un Email de Destination

1. Section **Destination addresses**
2. Cliquez **Add destination address**
3. Entrez votre email personnel (ex: votre-email@gmail.com)
4. Cliquez **Send verification email**
5. Allez dans votre Gmail et cliquez sur le lien de vérification

### Étape 3 : Créer des Adresses de Routage

1. Section **Routing rules**
2. Cliquez **Create address**

#### Pour contact@majay.com :
```
Custom address: contact
Forward to: votre-email@gmail.com
```

#### Pour support@majay.com :
```
Custom address: support
Forward to: votre-email@gmail.com
```

#### Pour vendeurs@majay.com :
```
Custom address: vendeurs
Forward to: votre-email@gmail.com
```

3. Cliquez **Save**

### Étape 4 : Catch-All (Optionnel)

Pour recevoir tous les emails envoyés à @majay.com :

```
Action: Send to an email
Destination: votre-email@gmail.com
```

---

## ✅ Vérification

Envoyez un email de test :

```
De: votre-telephone@gmail.com
À: contact@majay.com
Sujet: Test Email Routing

Si vous recevez cet email, ça fonctionne ! ✅
```

Vous devriez le recevoir sur votre Gmail en quelques secondes.

---

## 📤 Envoyer des Emails depuis contact@majay.com

### Option 1 : Gmail (Gratuit)

1. Ouvrez Gmail
2. Settings (⚙️) → **See all settings**
3. Onglet **Accounts and Import**
4. Section **Send mail as** → **Add another email address**
5. Nom : MAJAY Support
6. Email : contact@majay.com
7. Décochez "Treat as an alias"
8. Next → Vérification via Email Routing
9. Confirmez

Maintenant vous pouvez envoyer des emails depuis contact@majay.com via Gmail !

### Option 2 : SMTP (pour app)

Si vous voulez envoyer des emails automatiques depuis votre app :

Utilisez un service gratuit :
- **SendGrid** : 100 emails/jour gratuit
- **Mailgun** : 5000 emails/mois gratuit
- **AWS SES** : 62 000 emails/mois gratuit

Configurez l'adresse expéditeur : contact@majay.com

---

## 🎨 Signature Email Professionnelle

Ajoutez cette signature dans Gmail :

```
--
Équipe MAJAY 🛍️
La plateforme tout-en-un pour booster vos ventes

📧 contact@majay.com
🌐 https://majay.com
📱 WhatsApp: +221 XX XXX XX XX

Suivez-nous:
Instagram | Facebook | Twitter
```

---

## 📊 Analytics Emails

Dashboard Cloudflare → Email → Email Routing

Vous verrez :
- 📨 Nombre d'emails reçus
- ✅ Emails délivrés
- ❌ Emails rejetés (spam)
- 📈 Graphiques par jour/semaine

---

## 💡 Astuces

### Créer des Alias par Fonction

```
sales@majay.com → commercial
billing@majay.com → comptabilité  
tech@majay.com → développeur
press@majay.com → relations presse
```

### Filtres Gmail

Créez des labels automatiques :

```
De: contact@majay.com
Label: MAJAY - Contact
```

---

## ✅ Avantages

- ✅ **100% Gratuit** (illimité)
- ✅ **Emails professionnels** sans hébergement
- ✅ **Anti-spam** de Cloudflare (très efficace)
- ✅ **Facile à gérer** via dashboard
- ✅ **Pas de limite** de nombre d'adresses

---

## 🚀 C'est Tout !

Vos emails professionnels @majay.com sont prêts ! 📧
