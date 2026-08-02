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

// ✅ Single, correct updateTask with partial update support
export function updateTask(id, fields) {
  const updates = [];
  const values = [];

  if (fields.title !== undefined) {
    updates.push("title=?");
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    updates.push("description=?");
    values.push(fields.description);
  }
  if (fields.due_date !== undefined) {
    updates.push("due_date=?");
    values.push(fields.due_date);
  }
  if (fields.topic !== undefined) {
    updates.push("topic=?");
    values.push(fields.topic);
  }
  if (fields.status !== undefined) {
    updates.push("status=?");
    values.push(fields.status);
  }

  if (updates.length === 0) {
    return Promise.resolve(0); // nothing to update
  }

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id=?`,
      [...values, id],
      function (err) {
        if (err) {
          console.error("Error updating task:", err);
          reject(err);
        } else {
          resolve(this.changes); // number of rows updated
        }
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
