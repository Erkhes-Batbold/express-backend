import express from "express";
import * as fs from "fs/promises";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import path from "path";
import todoRouter from './todo-router.js'

const PORT = 3001;
const app = express();
app.use(express.json());

app.use(todoRouter);

const usersFilePath = path.resolve("./users.json");

let users = [];


const readUsers = async () => {
  try {
    const data = await fs.readFile(usersFilePath, "utf-8");
    users = JSON.parse(data);
  } catch (err) {
    console.error("Error reading users file:", err);
  }
};

const writeUsers = async () => {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users file:", err);
  }
};

app.get("/users", async (req, res) => {
  try {
    await readUsers();
    res.status(200).json(users); 
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  await readUsers();

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: nanoid(),
    name,
    email,
    password: hashedPassword,
  };

  users.push(newUser);
  await writeUsers();

  res.status(201).json({ message: "New user created", user: newUser });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

