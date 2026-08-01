import { createTask, updateTask, archiveTask, getTasks } from '../../db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Fetch tasks, optionally sorted
      const { orderBy } = req.query;
      const tasks = await getTasks(orderBy);
      res.status(200).json(tasks);

    } else if (req.method === 'POST') {
      // Create a new task
      const { title, description, due_date, topic } = req.body;
      if (!title || !due_date || !topic) {
        return res.status(400).json({ error: 'title, due_date, and topic are required' });
      }
      const id = await createTask(title, description, due_date, topic);
      res.status(201).json({ id });

    } else if (req.method === 'PUT') {
      // Update an existing task
      const { id, title, description, due_date, topic, status } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Task id is required' });
      }
      const changes = await updateTask(id, { title, description, dueDate: due_date, topic, status });
      res.status(200).json({ updated: changes });

    } else if (req.method === 'PATCH') {
      // Archive a task
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Task id is required' });
      }
      const changes = await archiveTask(id);
      res.status(200).json({ archived: changes });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
