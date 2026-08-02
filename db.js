const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./todo.db');

// Create a new task
function createTask(title, description, dueDate, topic) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO tasks (title, description, due_date, topic) VALUES (?, ?, ?, ?)`,
      [title, description, dueDate, topic],
      function (err) {
        if (err) {
          console.error('Error creating task:', err);
          reject(err);
        } else {
          resolve(this.lastID); // return the new task ID
        }
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
        if (err) {
          console.error('Error updating task:', err);
          reject(err);
        } else {
          resolve(this.changes); // number of rows updated
        }
      }
    );
  });
}

// Archive a task
function archiveTask(id) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE tasks SET archived=1 WHERE id=?`, [id], function (err) {
      if (err) {
        console.error('Error archiving task:', err);
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Get tasks with safe sorting and overdue flag
function getTasks(orderBy = 'due_date') {
  return new Promise((resolve, reject) => {
    const validColumns = ['due_date', 'topic', 'status', 'created_at'];
    const column = validColumns.includes(orderBy) ? orderBy : 'due_date';

    db.all(`SELECT * FROM tasks WHERE archived=0 ORDER BY ${column}`, [], (err, rows) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        reject(err);
      } else {
        // Add overdue flag to each task
        const tasksWithOverdue = rows.map(task => ({
          ...task,
          overdue: task.status !== 'COMPLETE' && new Date(task.due_date) < new Date()
        }));
        resolve(tasksWithOverdue);
      }
    });
  });
}

module.exports = { createTask, updateTask, archiveTask, getTasks };
