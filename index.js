import express from "express";
import * as fs from "fs";

const PORT = 3001;

const app = express();

app.use(express.json());

let todos = [];

app.get("/todos", (req, res) => {
  const data = fs.readFileSync("./data.json", "utf-8");
  todos = JSON.parse(data);
  res.send(todos);
});

app.post("/todos", (req, res) => {
  const title = req.body.title;
  if (!title) return res.status(400).send({ message: "title not found" });
  const newTodo = {
    id: todos[todos.length - 1].id + 1,
    title: title,
    checked: false,
  };
  todos.push(newTodo);
  fs.writeFileSync("./data.json", JSON.stringify(todos), "utf-8");
  return res.send(newTodo);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// http://localhost:3333/todos/1

app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send({ message: "Id not found!" });

  const todo = todos.find((item) => item.id === Number(id));
  if (!todo) return res.status(404).send({ message: "Todo not found!" });

  return res.send(todo);
});

app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send({ message: "Id not found!" });

  const todoIndex = todos.findIndex((item) => item.id === Number(id));

  if (todoIndex === -1)
    return res.status(404).send({ message: "Todo not found!" });

  todos.splice(todoIndex, 1);
  return res.status(200).send({ message: "Todo deleted successfully" });
});

app.put("/todos/:id", (req, res) => {
  const id = req.params.id;
  const { title, checked } = req.body;

  if (!id) return res.status(400).send({ message: "Id not found!" });

  const todo = todos.find((item) => item.id === Number(id));
  if (!todo) return res.status(404).send({ message: "Todo not found!" });

  if (title !== undefined) todo.title = title;
  if (checked !== undefined) todo.checked = checked;

  return res.send(todo);
});
