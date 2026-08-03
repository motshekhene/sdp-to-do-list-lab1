import sqlite3pkg from "sqlite3";

const sqlite3 = sqlite3pkg.verbose();
const dbFile = process.env.NODE_ENV === "test" ? ":memory:" : "todo.db";
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    topic_id INTEGER,
    status TEXT DEFAULT 'TODO',
    archived INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  )`);
});

// --- Helper: find or insert topic, return topic_id ---
function getOrCreateTopicId(topic) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM topics WHERE name = ?", [topic], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row.id);

      db.run("INSERT INTO topics (name) VALUES (?)", [topic], function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  });
}

// --- Create Task ---
export async function createTask(title, description, due_date, topic) {
  const topic_id = await getOrCreateTopicId(topic);

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO tasks (title, description, due_date, topic_id, status, archived) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, due_date, topic_id, "TODO", 0],
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
            archived: 0,
          });
        }
      }
    );
  });
}

// --- Update Task ---
export async function updateTask(id, fields) {
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
    const topic_id = await getOrCreateTopicId(fields.topic);
    updates.push("topic_id=?");
    values.push(topic_id);
  }
  if (fields.status !== undefined) {
    updates.push("status=?");
    values.push(fields.status);
  }

  if (updates.length === 0) return Promise.resolve(0);

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id=?`,
      [...values, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}

// --- Archive Task ---
export function archiveTask(id) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE tasks SET archived=1 WHERE id=?`, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

// --- Get Tasks (includes archived + overdue flag) ---
export function getTasks(orderBy = "due_date") {
  return new Promise((resolve, reject) => {
    const validColumns = ["due_date", "status", "created_at"];
    const column = validColumns.includes(orderBy) ? orderBy : "due_date";

    db.all(
      `SELECT tasks.id, tasks.title, tasks.description, tasks.due_date, tasks.status, tasks.archived,
              topics.name AS topic
       FROM tasks
       JOIN topics ON tasks.topic_id = topics.id
       ORDER BY ${column}`,
      [],
      (err, rows) => {
        if (err) reject(err);
        else {
          const now = new Date();
          const tasksWithOverdue = rows.map(task => ({
            ...task,
            overdue: task.status !== "COMPLETE" && new Date(task.due_date) < now,
          }));
          resolve(tasksWithOverdue);
        }
      }
    );
  });
}

export default db;
