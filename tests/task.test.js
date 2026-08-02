import request from "supertest";
import { createServer } from "http";
import { parse } from "url";
import handler from "../pages/api/tasks"; // Next.js API route

function runHandler(req, res) {
  return new Promise((resolve) => {
    handler(req, res);
    res.on("finish", resolve);
  });
}

function makeServer() {
  return createServer((req, res) => {
    let data = "";

    req.on("data", chunk => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        req.body = JSON.parse(data || "{}");
      } catch {
        req.body = {};
      }

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (payload) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(payload));
        return res;
      };

      handler(req, res);
    });
  });
}

describe("Tasks API", () => {
  let server;

  beforeAll(() => {
    server = makeServer().listen(4000);
  });

  afterAll(() => {
    server.close();
  });

  test("Create & fetch task", async () => {
    const createRes = await request(server)
      .post("/api/tasks")
      .send({
        title: "Test Task",
        description: "Testing create",
        topic: "Work",
        due_date: "2026-08-01T10:00",
      });
    expect(createRes.status).toBe(200);
    expect(createRes.body.title).toBe("Test Task");

    const getRes = await request(server).get("/api/tasks");
    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBeGreaterThan(0);
  });

  test("Archive task", async () => {
    const createRes = await request(server)
      .post("/api/tasks")
      .send({
        title: "Archive Me",
        description: "Testing archive",
        topic: "School",
        due_date: "2026-08-02T10:00",
      });
    const id = createRes.body.id;

    const archiveRes = await request(server)
      .patch("/api/tasks")
      .send({ id });
    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.archived).toBeTruthy();
  });

  test("Overdue rule", async () => {
    await request(server)
      .post("/api/tasks")
      .send({
        title: "Past Due",
        description: "Testing overdue",
        topic: "Work",
        due_date: "2020-01-01T10:00", // definitely overdue
      });

    const getRes = await request(server).get("/api/tasks");
    const overdueTask = getRes.body.find((t) => t.title === "Past Due");
    expect(overdueTask).toBeDefined();
    // If your API adds an `overdue` flag, assert it here:
    // expect(overdueTask.overdue).toBe(true);
  });

  test("Mark task as complete", async () => {
    const createRes = await request(server)
      .post("/api/tasks")
      .send({
        title: "Finish Me",
        description: "Testing status update",
        topic: "Work",
        due_date: "2026-08-01T10:00",
      });
    const id = createRes.body.id;

    const updateRes = await request(server)
      .put("/api/tasks")
      .send({ id, status: "COMPLETE" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.updated).toBe(1);

    const getRes = await request(server).get("/api/tasks");
    const updatedTask = getRes.body.find((t) => t.id === id);
    expect(updatedTask.status).toBe("COMPLETE");
  });
});