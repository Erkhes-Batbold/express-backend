import express from "express";
import * as fs from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";

const router = express.Router();

const todosFilePath = path.resolve("./todos.json");

let todos = [];
const data = fs.readFileSync("./data.json", "utf-8");
todos = JSON.parse(data);

const readTodos = async () => {
  try {
    const data = await fs.readFile(todosFilePath, "utf-8");
    todos = JSON.parse(data);
  } catch (err) {
    console.error("Error reading todos file:", err);
  }
};

const writeTodos = async () => {
  try {
    await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing todos file:", err);
  }
};

router.get("/todos", async (req, res) => {
  try {
    await readTodos();
    res.send(todos);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch todos" });
  }
});

router.post("/todos", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).send({ message: "Title is required" });

  const newTodo = {
    id: nanoid(),
    title,
    checked: false,
  };

  todos.push(newTodo);
  await writeTodos();
  return res.send(newTodo);
});

router.get("/todos/:id", async (req, res) => {
  try {
    await readTodos();
    const id = req.params.id;

    const todo = todos.find((item) => item.id === id);
    if (!todo) return res.status(404).send({ message: "Todo not found!" });

    return res.send(todo);
  } catch (err) {
    res.status(500).send({ message: "Error fetching todo" });
  }
});

router.delete("/todos/:id", async (req, res) => {
  try {
    await readTodos();
    const id = req.params.id;

    const todoIndex = todos.findIndex((item) => item.id === id);
    if (todoIndex === -1)
      return res.status(404).send({ message: "Todo not found!" });

    todos.splice(todoIndex, 1);
    await writeTodos();
    return res.status(200).send({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting todo" });
  }
});

router.put("/todos/:id", async (req, res) => {
  try {
    await readTodos();
    const id = req.params.id;
    const { title, checked } = req.body;

    const todo = todos.find((item) => item.id === id);
    if (!todo) return res.status(404).send({ message: "Todo not found!" });

    if (title !== undefined) todo.title = title;
    if (checked !== undefined) todo.checked = checked;

    await writeTodos();
    return res.send(todo);
  } catch (err) {
    res.status(500).send({ message: "Error updating todo" });
  }
});

export default router;
