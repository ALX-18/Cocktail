# **Documentation du Projet : Cocktail Manager**

## **Introduction**
Le projet **Cocktail Manager** est une application web moderne permettant de rechercher, créer, noter et modérer des recettes de cocktails. Il s'appuie sur une API Node.js sécurisée (JWT), une base PostgreSQL (hébergée sur Supabase), et une interface utilisateur responsive en HTML/CSS/JS (Tailwind, Remixicon).

---

## **1. Fonctionnalités Principales**
### **API Backend**
1. **Gestion des recettes**
   - Ajouter, modifier, supprimer des cocktails (CRUD).
   - Recherche avancée (nom, ingrédients, etc.).
2. **Gestion des utilisateurs**
   - Inscription, connexion, gestion de profil (JWT).
   - Rôles : utilisateur, admin (modération).
3. **Favoris & Notation**
   - Ajout/suppression de favoris (API sécurisée, ou localStorage fallback).
   - Notation des cocktails (étoiles, API ou localStorage).
4. **Modération**
   - Interface dédiée pour les admins (modération des contenus).
5. **Sécurité**
   - Authentification JWT, rate limiting sur le login, validation des entrées.

### **Interface Utilisateur (Frontend)**
1. **Recherche & Visualisation**
   - Recherche dynamique, filtres, affichage grille/liste.
   - Détail cocktail : ingrédients, instructions, image aléatoire.
2. **Gestion utilisateur**
   - Connexion, inscription, profil, avatar, déconnexion.
   - Affichage des favoris, notes et cocktails créés dans le profil.
3. **Expérience utilisateur**
   - Responsive (mobile/desktop), dark mode, notifications animées.
   - UI moderne (Tailwind, Remixicon, glassmorphism).
4. **Modération**
   - Accès rapide à la page de modération pour les admins.

---

## **2. Architecture Technique**
### **Technologies Utilisées**
- **Backend** : Node.js, Express, PostgreSQL (Supabase), JWT, bcrypt, express-validator, rate-limit
- **Frontend** : HTML5, CSS3 (Tailwind), JavaScript (ES6+), Remixicon, Google Fonts
- **Déploiement** : Docker, Fly.io

### **Structure des dossiers**
- `/public` : Frontend (app.js, style.css, pages, composants)
- `/server.js` : Backend Express/API
- `/ingredients_cocktail.txt`, `/liquid_ingredients.txt` : Données d'ingrédients
- `/login`, `/register`, `/moderation` : Pages dédiées
- `/Jira` : Images de documentation

---

## **3. Démarrage & Déploiement**
### **Installation locale**
1. Cloner le repo
2. Installer les dépendances : `npm install`
3. Configurer le fichier `.env` avec la variable `SUPABASE_DB_URL`
4. Lancer le serveur : `npm start` (ou via Docker)
5. Accéder à l'app sur `http://localhost:3000`

### **Déploiement Fly.io**
- Dockerfile et fly.toml fournis pour déploiement cloud
- Variables d'environnement à configurer sur Fly.io

---

## **4. Endpoints API principaux**
- `/api/cocktails` : CRUD cocktails
- `/api/ingredients`, `/api/solid_ingredients`, `/api/liquid_ingredients` : Ingrédients
- `/api/users/register`, `/api/users/login` : Authentification
- `/api/favorites` : Favoris (GET/POST/DELETE, JWT)
- `/api/ratings` : Notation (GET/POST, JWT)

---

## **5. Sécurité & Bonnes pratiques**
- Authentification JWT sur toutes les routes sensibles
- Rate limiting sur le login
- Validation des entrées (express-validator)
- Séparation claire frontend/backend
- Données utilisateurs sécurisées (aucun mot de passe stocké en clair)

---

## **6. Fonctionnalités avancées**
- Mode sombre, notifications animées, glassmorphism
- Gestion des favoris/notes en localStorage si API indisponible
- Page de modération accessible uniquement aux admins

---

## **7. Crédits & Auteurs**
- Réalisé par Alexis,Ryan,Paul
- Icônes : Remixicon
- UI : Tailwind CSS, Google Fonts

---


