import express from "express";
import * as fs from "fs/promises";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import path from "path";

const router = express.Router();

const usersFilePath = path.resolve("./users.json");

let users = [];

const readUsers = async () => {
  try {
    const data = await fs.readFile(usersFilePath, "utf-8");
    users = JSON.parse(data);
  } catch (err) {
    console.error("Error reading users file:", err);
    throw new Error("Failed to read users data.");
  }
};

const writeUsers = async () => {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users file:", err);
    throw new Error("Failed to save users data.");
  }
};

router.get("/users", async (req, res) => {
  try {
    await readUsers();
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required.",
    });
  }

  await readUsers();

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already in use.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: nanoid(),
      name,
      email,
      password: hashedPassword,
    };

    users.push(newUser);
    await writeUsers();

    res.status(201).json({
      success: true,
      message: "New user created successfully.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating user.",
    });
  }
});

export default router;
