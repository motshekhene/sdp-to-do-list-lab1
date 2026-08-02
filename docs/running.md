# Setup

## 1. Install Dependencies

```bash
npm install
```

## 2. Initialize the Database

Create `todo.db` from `schema.sql`:

```bash
sqlite3 todo.db < schema.sql
```

## 3. Start the Server

```bash
npm run dev
```

Open http://localhost:3000.

## 4. API Endpoints

- `GET /api/tasks` → List tasks (with overdue flag)
- `POST /api/tasks` → Create a task
- `PUT /api/tasks` → Update a task
- `PATCH /api/tasks` → Archive a task

Example POST body:

```json
{
  "title": "Finish lab report",
  "due_date": "2026-08-05T23:59:00",
  "topic": "School"
}
```

## 5. Database Schema

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  topic TEXT NOT NULL,
  status TEXT CHECK(status IN ('TODO','IN_PROGRESS','COMPLETE')) NOT NULL DEFAULT 'TODO',
  archived INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Columns

- **id** → unique identifier
- **title / topic / due_date** → required fields
- **description** → optional details
- **status** → `TODO`, `IN_PROGRESS`, `COMPLETE`
- **archived** → hide instead of delete
- **created_at** → timestamp
- **overdue** → derived at query time