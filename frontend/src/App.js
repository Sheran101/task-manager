import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8080';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: ''
  });

  // Fetch all tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Error fetching tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '' });
    } catch (err) {
      setError('Error creating task: ' + err.message);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (task) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const result = await response.json();
      setTasks(tasks.map(t => t.id === task.id ? result : t));
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Error deleting task: ' + err.message);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="App">
      <div className="header">
        <h1>Task Manager</h1>
        <p>Built with Ballerina backend and React frontend</p>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Task Creation Form */}
      <div className="task-form">
        <h2>Add New Task</h2>
        <form onSubmit={createTask}>
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          />
          <textarea
            placeholder="Task description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            rows="3"
          />
          <button type="submit">Add Task</button>
        </form>
      </div>

      {/* Tasks Display */}
      <div className="tasks-container">
        <h2>Tasks ({tasks.length})</h2>
        
        {loading && <div className="loading">Loading tasks...</div>}
        
        {!loading && tasks.length === 0 && (
          <div className="loading">No tasks yet. Create your first task above!</div>
        )}
        
        {tasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-title">{task.title}</div>
            <div className="task-description">{task.description}</div>
            <div className="task-actions">
              <button
                className="complete-btn"
                onClick={() => toggleTaskCompletion(task)}
              >
                {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;