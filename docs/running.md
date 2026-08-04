## Prerequisites
- **Node.js v20.x** (tested with Node v20.11.0)
- **npm** (bundled with Node)

## Steps from a Clean Clone

1. **Clone the repository**
   ```bash
   git clone https://github.com/motshekhene/sdp-to-do-list-lab1.git
   cd sdp-to-do-list-lab1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   - On first run, the application will automatically create `todo.db` and set up the required tables.
   - If you want to reset, delete `todo.db` and restart.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start Next.js on http://localhost:3000.

5. **Open the application**
   In your browser, go to:
   ```
   http://localhost:3000
   ```
   You should see the todo app interface.

6. **Run the tests**
   ```bash
   npm test
   ```
   This runs the Jest test suite against an in-memory SQLite database. Tests cover:
   - Creating and fetching tasks
   - Archiving tasks
   - Overdue rule enforcement
   - Marking tasks as complete

   A.I Declaration: The preceding document was reviewed and edited with:Microsoft-Copilot[Smart mode — model not disclosed by tool].