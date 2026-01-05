# 🚀 Commandes pour Connecter à GitHub

## 📋 Étapes à suivre

### 1. Créer un dépôt sur GitHub

1. Allez sur **https://github.com** et connectez-vous
2. Cliquez sur **"+"** → **"New repository"**
3. Nommez-le : `majay-v2` (ou autre nom)
4. **Ne cochez PAS** "Initialize with README"
5. Cliquez sur **"Create repository"**

### 2. Connecter votre projet local

**Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub**

```powershell
# Ajouter le dépôt GitHub comme "origin"
git remote add origin https://github.com/VOTRE_USERNAME/majay-v2.git

# Vérifier que c'est bien ajouté
git remote -v

# Pousser vers GitHub (première fois)
git branch -M main
git push -u origin main
```

### 3. Si vous avez déjà un dépôt GitHub

Si le dépôt existe déjà avec des fichiers :

```powershell
# Récupérer les fichiers existants
git pull origin main --allow-unrelated-histories

# Résoudre les conflits si nécessaire, puis :
git add .
git commit -m "Merge avec dépôt GitHub existant"
git push -u origin main
```

## 🔐 Authentification

Lors du `git push`, GitHub vous demandera :
- **Username** : Votre nom d'utilisateur GitHub
- **Password** : Utilisez un **Personal Access Token** (PAS votre mot de passe)

### Créer un token GitHub :

1. GitHub → **Settings** (votre profil)
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. Nom : "MAJAY Project"
5. Permissions : Cochez **repo** (accès complet)
6. **Generate token**
7. **Copiez le token** (vous ne le reverrez plus !)

## ✅ Commandes complètes (copier-coller)

```powershell
# 1. Aller dans le dossier du projet
cd "C:\Users\Dell Razer Pro\OneDrive\MAJAY V2"

# 2. Vérifier l'état
git status

# 3. Ajouter le dépôt GitHub (remplacez VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/majay-v2.git

# 4. Vérifier
git remote -v

# 5. Pousser vers GitHub
git push -u origin main
```

## 🆘 Problèmes courants

### "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/VOTRE_USERNAME/majay-v2.git
```

### "authentication failed"
- Utilisez un **Personal Access Token** au lieu du mot de passe
- Vérifiez que le token a la permission **repo**

### "repository not found"
- Vérifiez que le dépôt existe sur GitHub
- Vérifiez l'URL : `git remote -v`
- Vérifiez que vous avez les droits d'accès

