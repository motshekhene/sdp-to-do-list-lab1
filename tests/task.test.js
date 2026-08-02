// tests/task.test.js
const { testApiHandler } = require("next-test-api-route-handler");
const handler = require("../pages/api/tasks").default;

describe("Task API", () => {
  test("creates and fetches a task", async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const createRes = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Test Task",
            description: "Testing",
            due_date: "2026-08-03",
            topic: "Lab",
          }),
        });
        expect(createRes.status).toBe(200);

        const listRes = await fetch({ method: "GET" });
        const tasks = await listRes.json();
        expect(listRes.status).toBe(200);
        expect(tasks.some(t => t.title === "Test Task")).toBe(true);
      },
    });
  });

  test("archives a task", async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const createRes = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Archive Me",
            description: "Testing archive",
            due_date: "2026-08-03",
            topic: "Lab",
          }),
        });
        const created = await createRes.json();

        const archiveRes = await fetch({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: created.id }),
        });
        expect(archiveRes.status).toBe(200);

        const listRes = await fetch({ method: "GET" });
        const tasks = await listRes.json();
        const archivedTask = tasks.find(t => t.id === created.id);
        expect(archivedTask).toBeUndefined(); // getTasks() filters out archived=1
      },
    });
  });

  test("flags overdue tasks", async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Overdue Task",
            description: "Should be flagged",
            due_date: "2020-01-01",
            topic: "Lab",
          }),
        });

        const listRes = await fetch({ method: "GET" });
        const tasks = await listRes.json();
        const overdueTask = tasks.find(t => t.title === "Overdue Task");
        expect(overdueTask.overdue).toBe(true);
      },
    });
  });

  test("edits a task", async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        const createRes = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Original Title",
            description: "Original description",
            due_date: "2026-08-03",
            topic: "Lab",
          }),
        });
        const created = await createRes.json();

        const updateRes = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: created.id,
            title: "Updated Title",
            status: "COMPLETE",
            topic: "Assignment",
          }),
        });
        expect(updateRes.status).toBe(200);
        const updateBody = await updateRes.json();
        expect(updateBody.updated).toBe(1);

        const listRes = await fetch({ method: "GET" });
        const tasks = await listRes.json();
        const updatedTask = tasks.find(t => t.id === created.id);
        expect(updatedTask.title).toBe("Updated Title");
        expect(updatedTask.status).toBe("COMPLETE");
        expect(updatedTask.topic).toBe("Assignment");
      },
    });
  });

  test("sorts tasks by due date", async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => {
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Later Task",
            description: "Due later",
            due_date: "2026-12-25",
            topic: "Lab",
          }),
        });
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Sooner Task",
            description: "Due sooner",
            due_date: "2026-08-05",
            topic: "Lab",
          }),
        });

        const listRes = await fetch({ method: "GET" });
        const tasks = await listRes.json();
        const laterIndex = tasks.findIndex(t => t.title === "Later Task");
        const soonerIndex = tasks.findIndex(t => t.title === "Sooner Task");
        expect(soonerIndex).toBeLessThan(laterIndex);
      },
    });
  });
});