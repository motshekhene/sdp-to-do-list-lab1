import { useEffect, useState } from 'react';

export default function Home() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchTasks() {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    }
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Tasks</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ 
            marginBottom: '1rem',
            color: task.overdue ? 'red' : 'black'
          }}>
            <strong>{task.title}</strong> — {task.topic}<br />
            Due: {new Date(task.due_date).toLocaleString()}<br />
            Status: {task.status}
            {task.overdue && <span> ⚠️ Overdue</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
