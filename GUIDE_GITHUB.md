# 📦 Guide de Connexion à GitHub - MAJAY

## 🚀 Étape 1 : Créer un dépôt sur GitHub

1. Allez sur **https://github.com**
2. Cliquez sur le bouton **"+"** en haut à droite
3. Sélectionnez **"New repository"**
4. Remplissez les informations :
   - **Repository name** : `majay-v2` (ou le nom que vous voulez)
   - **Description** : "Plateforme e-commerce pour WhatsApp et Telegram"
   - **Visibility** : Public ou Private (selon votre choix)
   - **NE PAS** cocher "Initialize with README" (on a déjà des fichiers)
5. Cliquez sur **"Create repository"**

## 🔗 Étape 2 : Connecter votre projet local à GitHub

### Option A : Si vous venez de créer le dépôt (première fois)

```bash
# 1. Ajouter tous les fichiers
git add .

# 2. Faire le premier commit
git commit -m "Initial commit - MAJAY Platform"

# 3. Ajouter le dépôt distant GitHub
git remote add origin https://github.com/VOTRE_USERNAME/majay-v2.git

# 4. Pousser vers GitHub
git branch -M main
git push -u origin main
```

### Option B : Si le dépôt existe déjà

```bash
# 1. Ajouter le dépôt distant
git remote add origin https://github.com/VOTRE_USERNAME/majay-v2.git

# 2. Récupérer les fichiers existants
git pull origin main --allow-unrelated-histories

# 3. Ajouter vos fichiers
git add .

# 4. Faire un commit
git commit -m "Ajout du projet MAJAY"

# 5. Pousser vers GitHub
git push -u origin main
```

## 📝 Commandes Git utiles

### Voir l'état des fichiers
```bash
git status
```

### Ajouter des fichiers
```bash
git add .                    # Ajouter tous les fichiers
git add nom-du-fichier       # Ajouter un fichier spécifique
```

### Faire un commit
```bash
git commit -m "Description des changements"
```

### Pousser vers GitHub
```bash
git push origin main
```

### Récupérer les dernières modifications
```bash
git pull origin main
```

### Voir l'historique
```bash
git log
```

## 🔐 Authentification GitHub

### Méthode 1 : Token d'accès personnel (Recommandé)

1. Allez sur GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Cliquez sur **"Generate new token"**
3. Donnez un nom (ex: "MAJAY Project")
4. Sélectionnez les permissions : **repo** (accès complet aux dépôts)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)

Lors du `git push`, utilisez votre token comme mot de passe.

### Méthode 2 : GitHub CLI

```bash
# Installer GitHub CLI
# Puis :
gh auth login
```

## ⚠️ Important : Fichiers à ne PAS commiter

Le fichier `.gitignore` exclut automatiquement :
- ✅ Fichiers `.env` (clés secrètes)
- ✅ Fichiers système
- ✅ Dossiers temporaires
- ✅ Fichiers de l'éditeur

**Ne jamais commiter** :
- ❌ `.env.local` (contient vos clés Supabase)
- ❌ Mots de passe en clair
- ❌ Clés API

## 🎯 Exemple complet

```bash
# 1. Vérifier qu'on est dans le bon dossier
cd "C:\Users\Dell Razer Pro\OneDrive\MAJAY V2"

# 2. Vérifier l'état
git status

# 3. Ajouter les fichiers
git add .

# 4. Faire un commit
git commit -m "Initial commit - MAJAY Platform avec système de rôles admin"

# 5. Ajouter le dépôt GitHub (remplacez par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/majay-v2.git

# 6. Pousser vers GitHub
git push -u origin main
```

## 🆘 Dépannage

### Erreur "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/VOTRE_USERNAME/majay-v2.git
```

### Erreur "failed to push"
- Vérifiez que vous êtes authentifié
- Vérifiez que le dépôt existe sur GitHub
- Vérifiez l'URL du remote : `git remote -v`

### Erreur d'authentification
- Utilisez un token d'accès personnel au lieu du mot de passe
- Ou configurez SSH : https://docs.github.com/en/authentication/connecting-to-github-with-ssh

## 📚 Ressources

- Documentation GitHub : https://docs.github.com
- Guide Git : https://git-scm.com/doc

