# **Documentation du Projet : API Cocktails**

## **Introduction**
Le projet **API Cocktails** vise à créer une plateforme web intuitive et fonctionnelle permettant aux utilisateurs de rechercher, consulter et interagir avec des recettes de cocktails. Il combine le développement d'une API performante pour gérer les données et une interface utilisateur moderne accessible via le web.

### **Objectifs du projet**
- Fournir une API REST performante et fiable pour gérer les recettes de cocktails.
- Développer une interface utilisateur intuitive et responsive permettant de visualiser et interagir avec ces recettes.
- Optimiser l'expérience utilisateur tout en garantissant la sécurité des données.

---

## **1. Fonctionnalités Principales**
### **API Backend**
1. **Gestion des recettes**
   - Ajouter, modifier, supprimer des recettes de cocktails.
   - Recherche avancée : par ingrédients, catégories, nom, ou type (alcoolisé/non alcoolisé).
2. **Gestion des utilisateurs**
   - Authentification via JWT (JSON Web Token).
   - Inscription, connexion et gestion de profil.
3. **Endpoints principaux**
   - Recherche de recettes.
   - Ajout aux favoris.
   - Notation des cocktails.

### **Interface Utilisateur (Frontend)**
1. **Recherche et visualisation**
   - Barre de recherche avec filtres dynamiques (ingrédients, catégories, etc.).
   - Page de détails pour chaque recette avec instructions et photo.
2. **Gestion utilisateur**
   - Connexion et inscription avec validation des champs.
   - Favoris : consulter et gérer ses cocktails préférés.
3. **Expérience utilisateur optimisée**
   - Interface responsive adaptée aux écrans desktop et mobile.
   - Navigation fluide avec un design intuitif.

---

## **2. Architecture Technique**
### **Technologies Utilisées**
- **Backend** :
  - **Node.js** avec Express.js pour la création de l'API.
  - **Base de données** : MongoDB pour stocker les recettes et les informations utilisateurs.
  - **Authentification** : JWT pour sécuriser les sessions utilisateurs.
- **Frontend** :
  - **React.js** pour développer une interface utilisateur moderne et dynamique.
  - **CSS Framework** : TailwindCSS pour un design rapide et adapté.
- **Versionning** : Git et GitHub pour le suivi du code.
- **Tests** : Jest (backend), Postman/Insomnia pour les tests API.

### **Structure du Projet**
- **Backend** :
  - `server.js` : point d'entrée de l'application.
  - `routes/` : définit les différents endpoints de l'API.
  - `controllers/` : gère la logique d'affaires.
  - `models/` : schémas MongoDB (Cocktail, Utilisateur).
- **Frontend** :
  - `src/components/` : composants React (barre de recherche, liste des recettes, etc.).
  - `src/pages/` : pages principales (Accueil, Détails, Favoris).
  - `src/styles/` : styles CSS personnalisés.

---

## **3. Fonctionnement de l'API**
### **Endpoints Principaux**
#### **Recettes**
1. `GET /api/recipes` : Récupérer toutes les recettes.
2. `GET /api/recipes/:id` : Récupérer une recette par ID.
3. `POST /api/recipes` : Ajouter une nouvelle recette (authentification requise).
4. `PUT /api/recipes/:id` : Modifier une recette existante (authentification requise).
5. `DELETE /api/recipes/:id` : Supprimer une recette (authentification requise).

#### **Utilisateurs**
1. `POST /api/users/register` : Inscription d'un utilisateur.
2. `POST /api/users/login` : Connexion d'un utilisateur.
3. `GET /api/users/profile` : Récupérer les informations du profil utilisateur.

### **Exemple de Requête**
**Recherche de recettes par ingrédients :**
```bash
GET /api/recipes?ingredients=vodka,orange
```
**Réponse :**
```json
[
  {
    "id": "1",
    "name": "Screwdriver",
    "ingredients": ["vodka", "orange juice"],
    "instructions": "Mélangez et servez sur glace.",
    "rating": 4.5
  }
]
```

---

## **4. Interface Utilisateur**
### **Pages Principales**
1. **Page d'Accueil**
   - Barre de recherche visible.
   - Liste des cocktails les plus populaires.
2. **Page Détails**
   - Photo et description du cocktail.
   - Liste des ingrédients et instructions pas à pas.
   - Bouton "Ajouter aux Favoris".
3. **Page Favoris**
   - Liste des recettes ajoutées par l'utilisateur.

### **Exemple de Design (Wireframe)**
- Header : Logo et menu de navigation.
- Section principale :
  - **Recherche** : Champ texte avec filtres.
  - **Cartes de cocktails** : Affichage des recettes sous forme de grilles.

---

## **5. Tests et Validation**
### **Tests Backend**
- **Tests Unitaires :**
  - Valider les réponses des endpoints (succès et erreurs).
  - Test des opérations CRUD sur les recettes et utilisateurs.
- **Outils :** Jest, Postman.

### **Tests Frontend**
- **Tests Fonctionnels :**
  - Vérification des actions utilisateur (recherche, favoris, connexion).
  - Tests de navigation entre les pages.
- **Outils :** Cypress ou Puppeteer.

### **Performances**
- Optimisation des appels API (pagination, cache).
- Minification des fichiers CSS/JS pour réduire les temps de chargement.

---

## **6. Déploiement**
1. **Backend** :
   - Déploiement sur une plateforme cloud (Heroku, Render, ou AWS).
2. **Frontend** :
   - Déploiement via Netlify ou Vercel.
3. **Base de données** :
   - MongoDB Atlas pour un accès cloud scalable.

---

## **7. Conclusion**
Le projet **API Cocktails** combine performance et convivialité pour offrir une expérience utilisateur fluide et attrayante. La structure modulaire garantit une évolutivité future, permettant d'ajouter facilement de nouvelles fonctionnalités comme des suggestions personnalisées ou un système de commentaires.

