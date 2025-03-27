import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

// Connection à MongoDB
// const MONGO_USER = encodeURIComponent(process.env.MONGO_USER);
// const MONGO_PASSWORD = encodeURIComponent(process.env.MONGO_PASSWORD);
// const MONGO_HOST = process.env.MONGO_HOST;
// const MONGO_PORT = process.env.MONGO_PORT;
// const MONGO_DB = process.env.MONGO_DB;

const MONGO_URL = process.env.MONGO_URL;

// const url = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

async function connectToMongo() {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        console.log('Connected successfully to MongoDB');
        return client.db('tasks');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Quitte l'application si la connexion échoue
    }
}

const app = express();
const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques de l'application REACT build
app.use(express.static('dist'));

// Middleware pour parser le JSON
app.use(express.json());

let tasksCollection;

// Logger middleware pour logger chaque requête
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('↖️  req.body: ');
    console.log(req.body);
    const oldSend = res.send;
    res.send = function (data) {
        console.log('↘️ ', `Status: ${res.statusCode}`);
        if (data) console.log(JSON.parse(data));
        oldSend.call(this, data);
    };
    next();
});

// Opérations CRUD
// GET : Récupérer toutes les tâches
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await tasksCollection.find().toArray(); // Récupérer tous les documents
        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: 'Échec de la récupération des tâches.',
        });
    }
});

// POST : Créer une nouvelle tâche
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, completed } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Le titre est requis' });
        }
        const result = await tasksCollection.insertOne({
            title,
            completed: completed || false,
            createdAt: new Date(),
        });
        const newTask = {
            _id: result.insertedId,
            title,
            completed: completed || false,
        };
        console.log('Tâche créée:', newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Erreur lors de la création d'une tâche:", error);
        res.status(500).json({ message: 'Échec de la création de la tâche.' });
    }
});

// PUT : Mettre à jour une tâche par ID
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, completed } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json({ message: 'Tâche mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE : Supprimer une tâche par ID
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await tasksCollection.deleteOne({
            _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rediriger toutes les autres requêtes vers index.html pour la gestion du routage côté client
app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'));
});

async function startServer() {
    const db = await connectToMongo();
    tasksCollection = db.collection('tasks'); // Initialize tasksCollection
    app.locals.db = db;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
