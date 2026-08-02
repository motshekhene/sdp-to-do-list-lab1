import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [dueDate, setDueDate] = useState("");

  const refreshTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !topic || !dueDate) return;

    const newTask = { title, topic, due_date: dueDate };

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    setTitle("");
    setTopic("");
    setDueDate("");
    refreshTasks();
  };

  const markDone = async (id) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "COMPLETE" }),
    });
    refreshTasks();
  };

  const archiveTask = async (id) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refreshTasks();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Tasks</h1>
      <p className={styles.subtitle}>
        {tasks.length} task{tasks.length !== 1 ? "s" : ""} on record
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <p className={styles.empty}>— nothing on the list yet —</p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`${styles.listItem} ${task.overdue ? styles.overdue : ""} ${
                task.status === "COMPLETE" ? styles.complete : ""
              }`}
            >
              <div className={styles.taskInfo}>
                <div className={styles.taskTitle}>{task.title}</div>
                <div className={styles.taskMeta}>
                  <span className={styles.topicTag}>{task.topic}</span>
                  <span>{task.due_date}</span>
                  <span
                    className={`${styles.statusTag} ${
                      task.status === "COMPLETE"
                        ? styles.statusDone
                        : task.overdue
                        ? styles.statusOverdue
                        : ""
                    }`}
                  >
                    {task.status === "COMPLETE" ? "✔ Done" : task.overdue ? "⚠ Overdue" : task.status}
                  </span>
                </div>
              </div>
              <div className={styles.taskActions}>
                {task.status !== "COMPLETE" && (
                  <button
                    onClick={() => markDone(task.id)}
                    className={styles.taskActionButton}
                  >
                    Done
                  </button>
                )}
                <button
                  onClick={() => archiveTask(task.id)}
                  className={styles.taskActionButton}
                >
                  Archive
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
