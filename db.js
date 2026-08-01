const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./todo.db');

// Create a new task
function createTask(title, description, dueDate, topic) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO tasks (title, description, due_date, topic) VALUES (?, ?, ?, ?)`,
      [title, description, dueDate, topic],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID); // return the new task ID
      }
    );
  });
}

// Update an existing task
function updateTask(id, fields) {
  const { title, description, dueDate, topic, status } = fields;
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tasks SET title=?, description=?, due_date=?, topic=?, status=? WHERE id=?`,
      [title, description, dueDate, topic, status, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes); // number of rows updated
      }
    );
  });
}

// Archive a task
function archiveTask(id) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE tasks SET archived=1 WHERE id=?`, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

// Get tasks with optional sorting
function getTasks(orderBy = 'due_date') {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM tasks WHERE archived=0 ORDER BY ${orderBy}`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { createTask, updateTask, archiveTask, getTasks };
