import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Todo API is running");
});

app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query(
  "SELECT * FROM todos ORDER BY id ASC"
);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim() === "") {
  return res.status(400).json({ error: "Title is required" });
}

    const result = await pool.query(
      "INSERT INTO todos (title) VALUES ($1) RETURNING *",
      [title]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.get("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
  return res.status(400).json({ error: "Invalid todo ID" });
}

    const result = await pool.query(
      "SELECT * FROM todos WHERE id = $1",
      [id]
    );
if (result.rows.length === 0) {
  return res.status(404).json({ error: "Todo not found" });
}

res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

app.patch("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    if (!/^\d+$/.test(id)) {
  return res.status(400).json({ error: "Invalid todo ID" });
}
    if (typeof completed !== "boolean") {
  return res.status(400).json({ error: "completed must be a boolean" });
}

    const result = await pool.query(
      "UPDATE todos SET completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
  return res.status(400).json({ error: "Invalid todo ID" });
}

    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
