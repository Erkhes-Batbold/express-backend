import express, { json } from "express";
import * as fs from "fs";
import { nanoid } from "nanoid";

const PORT = 3001;

const app = express();

app.use(express.json());

const readUsers = (req, res) => {
  const data = fs.readFileSync("./users.json", "utf-8");
  const users = JSON.parse(data);
  return res.send(users);
};

const writeUsers = () => {
  fs.writeFileSync("./users.json", JSON.stringify(users), "utf-8");
};

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  readUsers();

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({ message: "Email already in use." });
  }

  const newUser = {
    id: nanoid(),
    name: name,
    email: email,
    password: password,
  };

  users.push(newUser);
  writeUsers();

  res.status(201).json({ message: "New user created", user: newUser });
});

let todos = [];

const readTodos = () => {
  const data = fs.readFileSync("./data.json", "utf-8");
  todos = JSON.parse(data);
};

const writeTodos = () => {
  fs.writeFileSync("./todos.json", JSON.stringify(todos), "utf-8");
};

app.get("/todos", (req, res) => {
  readTodos();
  res.send(todos);
});

app.post("/todos", (req, res) => {
  const title = req.body.title;
  if (!title) return res.status(400).send({ message: "title not found" });

  const newTodo = {
    id: todos[todos.length - 1]?.id + 1 || 1,
    title: title,
    checked: false,
  };
  todos.push(newTodo);
  writeTodos();
  return res.send(newTodo);
});

app.get("/todos/:id", (req, res) => {
  readTodos();
  const id = req.params.id;
  if (!id) return res.status(400).send({ message: "Id not found!" });

  const todo = todos.find((item) => item.id === Number(id));
  if (!todo) return res.status(404).send({ message: "Todo not found!" });

  return res.send(todo);
});

app.delete("/todos/:id", (req, res) => {
  readTodos();
  const id = req.params.id;
  if (!id) return res.status(400).send({ message: "Id not found!" });

  const todoIndex = todos.findIndex((item) => item.id === Number(id));

  if (todoIndex === -1)
    return res.status(404).send({ message: "Todo not found!" });

  todos.splice(todoIndex, 1);
  return res.status(200).send({ message: "Todo deleted successfully" });
});

app.put("/todos/:id", (req, res) => {
  readTodos();
  const id = req.params.id;
  const { title, checked } = req.body;

  if (!id) return res.status(400).send({ message: "Id not found!" });

  const todo = todos.find((item) => item.id === Number(id));
  if (!todo) return res.status(404).send({ message: "Todo not found!" });

  if (title !== undefined) todo.title = title;
  if (checked !== undefined) todo.checked = checked;

  writeTodos();
  return res.send(todo);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
