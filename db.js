// db.js
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./todo.db");

export function createTask(title, description, due_date, topic) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO tasks (title, description, due_date, topic, status) VALUES (?, ?, ?, ?, ?)",
      [title, description, due_date, topic, "TODO"],
      function (err) {
        if (err) reject(err);
        else {
          resolve({
            id: this.lastID,
            title,
            description,
            due_date,
            topic,
            status: "TODO",
          });
        }
      }
    );
  });
}

export function updateTask(id, fields) {
  const { title, description, dueDate, topic, status } = fields;
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tasks SET title=?, description=?, due_date=?, topic=?, status=? WHERE id=?`,
      [title, description, dueDate, topic, status, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}

export function archiveTask(id) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE tasks SET archived=1 WHERE id=?`, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

export function getTasks(orderBy = "due_date") {
  return new Promise((resolve, reject) => {
    const validColumns = ["due_date", "topic", "status", "created_at"];
    const column = validColumns.includes(orderBy) ? orderBy : "due_date";

    db.all(`SELECT * FROM tasks WHERE archived=0 ORDER BY ${column}`, [], (err, rows) => {
      if (err) reject(err);
      else {
        const tasksWithOverdue = rows.map(task => ({
          ...task,
          overdue: task.status !== "COMPLETE" && new Date(task.due_date) < new Date(),
        }));
        resolve(tasksWithOverdue);
      }
    });
  });
}
