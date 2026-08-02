
import { createTask, getTasks, updateTask, archiveTask } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, description, topic, due_date } = req.body;
    try {
      const task = await createTask(title, description, due_date, topic);
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

else if (req.method === "GET") {
  try {
    const tasks = await getTasks();
    res.status(200).json(Array.isArray(tasks) ? tasks : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


  else if (req.method === "PUT") {
    const { id, ...fields } = req.body;
    try {
      const changes = await updateTask(id, fields);
      res.status(200).json({ updated: changes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  else if (req.method === "PATCH") {
    const { id } = req.body;
    try {
      const changes = await archiveTask(id);
      res.status(200).json({ archived: changes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "PATCH"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


