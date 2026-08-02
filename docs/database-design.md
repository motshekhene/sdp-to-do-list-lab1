# Database Design

## Overview
The application uses **SQLite** as a local‑first database. All task data is persisted in `todo.db` so that information survives application restarts. The schema is designed to support the required features: tasks with four fields (Title, Description, Due Date, Topic), fixed statuses, archiving, and overdue detection.

---

## Tables

### 1. `topics`
| Column | Type    | Constraints | Notes |
|--------|---------|-------------|-------|
| `id`   | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for each topic |
| `name` | TEXT    | NOT NULL, UNIQUE | Topic name (e.g. “Work”, “School”) |

- Topics are normalized into their own table to avoid duplication and allow reuse across tasks.
- The `UNIQUE` constraint ensures no duplicate topic names.

---

### 2. `tasks`
| Column       | Type     | Constraints | Notes |
|--------------|----------|-------------|-------|
| `id`         | INTEGER  | PRIMARY KEY AUTOINCREMENT | Unique identifier for each task |
| `title`      | TEXT     | NOT NULL | Short description of the task |
| `description`| TEXT     | NOT NULL | Detailed notes about the task |
| `due_date`   | TEXT     | NOT NULL | Stored as ISO string (`YYYY-MM-DDTHH:mm`) |
| `status`     | TEXT     | DEFAULT 'TODO' | One of: `TODO`, `IN-PROGRESS`, `COMPLETE` |
| `archived`   | INTEGER  | DEFAULT 0 | Flag (0 = active, 1 = archived) |
| `created_at` | TIMESTAMP| DEFAULT CURRENT_TIMESTAMP | When the task was created |
| `topic_id`   | INTEGER  | FOREIGN KEY → `topics(id)` | Links each task to a topic |

---

## Relationships
- **One‑to‑Many**: A single topic can have many tasks.  
  - `tasks.topic_id` references `topics.id`.  
- **Tasks** always belong to exactly one topic.  
- **Archived tasks** remain in the same table with `archived=1`. They are excluded from the active list but still retrievable.  
- **Overdue** is **not stored** as a column. It is derived at read time:  
  - `overdue = (status != 'COMPLETE' && due_date < now)`  

---

## Design Decisions
- **Normalization**: Topics are separated into their own table to prevent duplication and allow consistent sorting/filtering.  
- **Archiving**: Implemented as a flag (`archived=1`) instead of moving or deleting rows, ensuring persistence.  
- **Statuses**: Fixed values (`TODO`, `IN-PROGRESS`, `COMPLETE`) enforced by application logic, not customizable.  
- **Overdue**: Derived dynamically to avoid stale data and keep schema clean.  
- **Persistence**: SQLite ensures all tasks remain after restart, fulfilling the local‑first requirement.
