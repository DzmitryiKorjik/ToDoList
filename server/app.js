import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement depuis un fichier .env
dotenv.config();

// URL de connexion à MongoDB (récupérée depuis les variables d'environnement)
const MONGO_URL = process.env.MONGO_URL;

// Fonction pour établir la connexion à la base de données MongoDB
async function connectToMongo() {
    try {
        const client = new MongoClient(MONGO_URL, {
            tls: true, // Active la connexion sécurisée TLS
            tlsInsecure: false, // Garantit un chiffrement sécurisé
            serverSelectionTimeoutMS: 5000, // Timeout si la connexion échoue après 5 secondes
        });
        await client.connect();
        console.log('✅ Connexion réussie à MongoDB');
        return client.db('tasks'); // Retourne la base de données "tasks"
    } catch (err) {
        console.error('❌ Erreur lors de la connexion à MongoDB:', err);
        process.exit(1); // Quitte l'application en cas d'erreur critique
    }
}

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques du frontend React (build)
app.use(express.static('dist'));

// Middleware pour analyser les requêtes au format JSON
app.use(express.json());

let tasksCollection; // Collection MongoDB pour stocker les tâches

// Middleware de logging pour afficher les requêtes et leurs réponses
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`); // Log de la méthode et de l'URL de la requête
    console.log('↖️  Corps de la requête:', req.body);

    // Intercepte la réponse pour logguer le statut et la réponse envoyée
    const oldSend = res.send;
    res.send = function (data) {
        console.log('↘️ Réponse envoyée', `Statut: ${res.statusCode}`);
        if (data) console.log(JSON.parse(data)); // Affiche la réponse sous forme JSON
        oldSend.call(this, data);
    };
    next(); // Passe à la suite du middleware
});

// ➤ ROUTES CRUD POUR GÉRER LES TÂCHES

// Récupérer toutes les tâches (GET)
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await tasksCollection.find().toArray(); // Récupère toutes les tâches de la collection
        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: '⚠️ Erreur lors de la récupération des tâches.',
        });
    }
});

// Ajouter une nouvelle tâche (POST)
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, completed } = req.body;
        if (!title) {
            return res.status(400).json({ message: '⚠️ Le titre est requis.' });
        }
        const result = await tasksCollection.insertOne({
            title,
            completed: completed || false, // Par défaut, la tâche n'est pas complétée
            createdAt: new Date(), // Ajout de la date de création
        });

        const newTask = {
            _id: result.insertedId, // Récupère l'ID généré par MongoDB
            title,
            completed: completed || false,
        };
        console.log('✅ Tâche créée:', newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('❌ Erreur lors de la création de la tâche:', error);
        res.status(500).json({
            message: '⚠️ Échec de la création de la tâche.',
        });
    }
});

// Modifier une tâche (PUT)
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        // Mise à jour de la tâche avec l'ID donné
        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, completed } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: '⚠️ Tâche non trouvée.' });
        }

        res.json({ message: '✅ Tâche mise à jour avec succès.' });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        res.status(400).json({ message: error.message });
    }
});

// Supprimer une tâche (DELETE)
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Suppression de la tâche avec l'ID donné
        const result = await tasksCollection.deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '⚠️ Tâche non trouvée.' });
        }

        res.json({ message: '🗑️ Tâche supprimée avec succès.' });
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rediriger toutes les autres requêtes vers `index.html` pour le routage du frontend React
app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'));
});

// Fonction pour démarrer le serveur après connexion à MongoDB
async function startServer() {
    const db = await connectToMongo();
    tasksCollection = db.collection('tasks'); // Initialisation de la collection
    app.locals.db = db;

    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
}

// Lancement du serveur
startServer();
