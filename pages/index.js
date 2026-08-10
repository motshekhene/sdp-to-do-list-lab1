import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const STATUS_LABELS = {
  TODO: "Todo",
  "IN-PROGRESS": "In Progress",
  COMPLETE: "Complete",
};

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState("due_date");

  const refreshTasks = async () => {
    try {
      const res = await fetch(`/api/tasks`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !topic || !description || !dueDate) return;

    const newTask = { title, description, topic, due_date: dueDate };

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    setTitle("");
    setTopic("");
    setDescription("");
    setDueDate("");
    refreshTasks();
  };

  const markInProgress = async (id) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "IN-PROGRESS" }),
    });
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

  const saveEdit = async (e) => {
    e.preventDefault();
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingTask),
    });
    setIsModalOpen(false);
    setEditingTask(null);
    refreshTasks();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortOption === "topic") return (a.topic || "").localeCompare(b.topic || "");
    if (sortOption === "status") return (a.status || "").localeCompare(b.status || "");
    if (sortOption === "due_date") return new Date(a.due_date || 0) - new Date(b.due_date || 0);
    return 0;
  });

  const renderStatusTag = (task) => {
    const statusClass =
      task.status === "COMPLETE"
        ? styles.statusDone
        : task.status === "IN-PROGRESS"
        ? styles.statusInProgress
        : "";

    return (
      <span className={`${styles.statusTag} ${statusClass}`}>
        {STATUS_LABELS[task.status] || task.status}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Tasks</h1>
      <p className={styles.subtitle}>
        {tasks.length} task{tasks.length !== 1 ? "s" : ""} on record
      </p>

      {/* Add Task Form */}
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
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={styles.textarea}
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

      {/* Task List */}
      {tasks.length === 0 ? (
        <p className={styles.empty}>— nothing on the list yet —</p>
      ) : (
        <>
          <div className={styles.sortBar}>
            <label htmlFor="sort">Sort by: </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={styles.select}
            >
              <option value="topic">Topic</option>
              <option value="status">Status</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>

          {/* Active Tasks */}
          <h2>Active Tasks</h2>
          <ul className={styles.list}>
            {sortedTasks.filter(t => !t.archived).map(task => (
              <li
                key={task.id}
                className={`${styles.listItem} ${task.overdue ? styles.overdue : ""} ${
                  task.status === "COMPLETE" ? styles.complete : ""
                }`}
              >
                <div className={styles.taskInfo}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  <div className={styles.taskDescription}>{task.description}</div>
                  <div className={styles.taskMeta}>
                    <span className={styles.topicTag}>{task.topic}</span>
                   <span>
                      {new Date(task.due_date).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    {renderStatusTag(task)}
                    {task.overdue && (
                      <span className={styles.overdueBadge}>⚠ Overdue</span>
                    )}
                  </div>
                </div>
                <div className={styles.taskActions}>
                  {task.status === "TODO" && (
                    <button
                      onClick={() => markInProgress(task.id)}
                      className={styles.taskActionButton}
                    >
                      Start
                    </button>
                  )}
                  {task.status !== "COMPLETE" && (
                    <>
                      <button
                        onClick={() => markDone(task.id)}
                        className={styles.taskActionButton}
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                        }}
                        className={styles.taskActionButton}
                      >
                        Edit
                      </button>
                    </>
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

          {/* Archived Tasks */}
            {/* Archived Tasks */}
          <h2>Archived Tasks</h2>
          <ul className={styles.list}>
            {sortedTasks.filter(t => t.archived).map(task => (
              <li key={task.id} className={`${styles.listItem} ${styles.archived}`}>
                <div className={styles.taskInfo}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  <div className={styles.taskDescription}>{task.description}</div>
                  <div className={styles.taskMeta}>
                    <span className={styles.topicTag}>{task.topic}</span>
                    <span>
                      {new Date(task.due_date).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    <span className={styles.statusTag}>🗄 Archived</span>
                  </div>
                </div>
                <div className={styles.taskActions}>
                  <button
                    onClick={() => {
                      fetch("/api/tasks", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: task.id, unarchive: true }),
                      }).then(refreshTasks);
                    }}
                    className={styles.taskActionButton}
                  >
                    Unarchive
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingTask && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Edit Task</h2>
            <form onSubmit={saveEdit} className={styles.form}>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                className={styles.input}
              />
              <textarea
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, description: e.target.value })
                }
                className={styles.textarea}
              />
              <input
                type="text"
                value={editingTask.topic}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, topic: e.target.value })
                }
                className={styles.input}
              />
              <input
                type="datetime-local"
                value={editingTask.due_date}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, due_date: e.target.value })
                }
                className={styles.input}
              />
              <div className={styles.modalActions}>
                <button type="submit" className={styles.button}>Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className={styles.taskActionButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}