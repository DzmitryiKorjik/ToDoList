import { useState, useEffect } from 'react';

function App() {
    // État pour stocker la liste des tâches
    const [tasks, setTasks] = useState([]);
    // État pour stocker la valeur de la nouvelle tâche à ajouter
    const [newTask, setNewTask] = useState('');

    // useEffect pour récupérer les tâches au chargement du composant
    useEffect(() => {
        fetch(`/api/tasks`)
            .then((res) => res.json())
            .then((data) => {
                setTasks(data); // Met à jour l'état avec les tâches récupérées
            });
    }, []); // Dépendance vide = exécute uniquement au montage du composant

    // Fonction pour ajouter une nouvelle tâche
    function handleAddTask() {
        if (!newTask) {
            alert('Please enter a task'); // Vérifie si l'entrée est vide
            return;
        }
        fetch(`/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: newTask, completed: false }), // Envoie la nouvelle tâche au serveur
        })
            .then((res) => {
                console.log('Response status:', res.status);
                return res.text(); // Convertit la réponse en texte brut
            })
            .then((text) => {
                console.log('Response body:', text);
                return text ? JSON.parse(text) : {}; // Vérifie que la réponse n'est pas vide avant de parser
            })
            .then((task) => {
                setTasks([...tasks, task]); // Ajoute la nouvelle tâche à la liste
                setNewTask(''); // Réinitialise l'entrée
            })
            .catch((error) =>
                console.error("Erreur lors de l'ajout d'une tâche:", error)
            );
    }

    // Fonction pour basculer l'état d'une tâche (complétée ou non)
    async function handleToggleTask(id) {
        try {
            const task = tasks.find((task) => task._id === id); // Trouve la tâche correspondante
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...task, completed: !task.completed }), // Inverse l'état de la tâche
            });

            // Mise à jour de l'état local pour refléter le changement
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === id
                        ? { ...task, completed: !task.completed }
                        : task
                )
            );
        } catch (error) {
            console.error('Erreur lors du changement de tâche:', error);
        }
    }

    // Fonction pour supprimer une tâche
    function handleDeleteTask(id) {
        fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(() => {
            setTasks(tasks.filter((task) => task._id !== id)); // Supprime la tâche de l'état local
        });
    }

    // Fonction qui génère la liste des tâches
    function renderTasks() {
        return tasks.map((task) => (
            <li key={task._id || task.title} className='listTasks-item'>
                <span
                    style={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                    onClick={() => handleToggleTask(task._id)} // Clic pour basculer l'état
                    className='listTasks-title'
                >
                    {task.title}
                </span>
                <button
                    onClick={() => handleDeleteTask(task._id)} // Clic pour supprimer
                    className='listTasks-delete'
                >
                    Delete
                </button>
            </li>
        ));
    }

    return (
        <main className='main'>
            <h1>Todo List</h1>

            {/* Zone d'ajout d'une nouvelle tâche */}
            <div className='addTask'>
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)} // Met à jour l'état avec l'entrée utilisateur
                    placeholder='Nouvelle tâche'
                    className='addTask-input'
                />
                <button onClick={handleAddTask} className='addTask-button'>
                    Ajouter
                </button>
            </div>

            {/* Affichage de la liste des tâches */}
            {tasks.length > 0 ? (
                <ul className='listTasks'>{renderTasks()}</ul>
            ) : (
                <p className='messageTasks'>Aucune tâche</p> // Message si aucune tâche n'existe
            )}
        </main>
    );
}

export default App;
