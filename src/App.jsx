import { useState, useEffect } from 'react';

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        fetch(`/api/tasks`)
            .then((res) => res.json())
            .then((data) => {
                setTasks(data);
            });
    }, []);

    function handleAddTask() {
        if (!newTask) {
            alert('Please enter a task');
            return;
        }
        fetch(`/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: newTask, completed: false }),
        })
            .then((res) => {
                console.log('Response status:', res.status);
                return res.text(); // <-- Changer en texte pour voir la réponse brute
            })
            .then((text) => {
                console.log('Response body:', text);
                return text ? JSON.parse(text) : {}; // Evite l'erreur JSON.parse sur une réponse vide
            })
            .then((task) => {
                setTasks([...tasks, task]);
                setNewTask('');
            })
            .catch((error) =>
                console.error("Erreur lors de l'ajout d'une tâche:", error)
            );
    }

    async function handleToggleTask(id) {
        try {
            const task = tasks.find((task) => task._id === id);
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...task, completed: !task.completed }),
            });
            // const updatedTask = await res.json();
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

    function handleDeleteTask(id) {
        fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(() => {
            setTasks(tasks.filter((task) => task._id !== id));
        });
    }

    function renderTasks() {
        return tasks.map((task) => (
            <li key={task._id || task.title} className='listTasks-item'>
                <span
                    style={{
                        textDecoration: task.completed
                            ? 'line-through'
                            : 'none',
                    }}
                    onClick={() => handleToggleTask(task._id)}
                    className='listTasks-title'
                >
                    {task.title}
                </span>
                <button
                    onClick={() => handleDeleteTask(task._id)}
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
            <div className='addTask'>
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder='New task'
                    className='addTask-input'
                />
                <button onClick={handleAddTask} className='addTask-button'>
                    Add
                </button>
            </div>

            {tasks.length > 0 ? (
                <ul className='listTasks'>{renderTasks()}</ul>
            ) : (
                <p className='messageTasks'>No tasks yet</p>
            )}
        </main>
    );
}

export default App;
