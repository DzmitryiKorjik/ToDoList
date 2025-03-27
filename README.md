# Todo Application - Stack MERN

Cette application Todo utilise la stack MERN (MongoDB, Express.js, React, Node.js) pour créer une application de gestion de tâches complète.

## Technologies Utilisées

-   **Frontend:**
    -   React + Vite
    -   React Router DOM
-   **Backend:**
    -   Node.js avec Express.js
    -   MongoDB avec Mongoose

## Structure du Projet

```
ToDoList/
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public
│   └── todo-list.svg
├── render.yaml
├── server
│   ├── app.js
│   ├── dist
│   │   ├── assets
│   │   │   ├── index-D8QRxjNC.js
│   │   │   └── index-Dtn62Xmo.css
│   │   ├── index.html
│   │   └── vite.svg
│   ├── package-lock.json
│   └── package.json
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── assets
│   │   └── react.svg
│   ├── index.css
│   └── main.jsx
└── vite.config.js
```

## Fonctionnalités

-   Authentification utilisateur (inscription/connexion)
-   CRUD complet pour les todos
-   Filtrage des todos par statut
-   Système de catégories pour les todos
-   Interface responsive

## Fonctionnement

### Installation

1. Clonez ce dépôt :
    ```bash
    git clone https://github.com/DzmitryiKorjik/ToDoList.git
    ```
2. Accédez au répertoire du projet :
    ```bash
    cd ToDoList
    ```
3. Installez les dépendances du frontend :
    ```bash
    npm install
    ```
4. Accédez au répertoire du serveur :
    ```bash
    cd server
    ```
5. Installez les dépendances du backend :
    ```bash
    npm install
    ```
6. Créez un fichier .env dans le dossier server avec les variables suivantes :
    ```
    MONGODB_URI=votre_url_mongodb
    PORT=5000
    JWT_SECRET=votre_secret_jwt
    ```
7. Démarrez le serveur backend :
    ```bash
    npm start
    ```
8. Dans un nouveau terminal, retournez au dossier racine et démarrez le frontend :
    ```bash
    cd ..
    npm run dev
    ```
9. Accédez à l'application dans votre navigateur à l'adresse :
    ```
    http://localhost:5173
    ```

### Variables d'environnement requises

-   `MONGODB_URI` : URL de connexion à votre base de données MongoDB
-   `PORT` : Port sur lequel le serveur backend s'exécutera (par défaut: 5000)
-   `JWT_SECRET` : Clé secrète pour la génération des tokens JWT

## API Endpoints

### Auth

-   POST /api/auth/register - Inscription
-   POST /api/auth/login - Connexion

### Todos

-   GET /api/todos - Récupérer tous les todos
-   POST /api/todos - Créer un todo
-   PUT /api/todos/:id - Modifier un todo
-   DELETE /api/todos/:id - Supprimer un todo

## Configuration Requise

-   Node.js v14+
-   MongoDB v4+
-   npm ou yarn

### Déploiement

-   Le projet sera déployé sur

## Auteur

-   **Nom :** Mardovitch Dzmitryi
-   **Formation :** Développement Web et Web Mobile.
-   **Objectif :** Validation des compétences en création et déploiement d'applications web.
