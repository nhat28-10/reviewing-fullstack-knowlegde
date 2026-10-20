/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:bcrypt
 */

"use strict";

const bcrypt = require("bcrypt");
const express = require("express");

const app = express();
const port = 3000;
const saltRounds = 12;
const usersByEmail = new Map();

app.use(express.json());

function validateCredentials(email, password) {
  if (typeof email !== "string" || !email.includes("@")) {
    return "Email is invalid";
  }

  if (typeof password !== "string" || password.length < 12) {
    return "Password must contain at least 12 characters";
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password is too long for bcrypt";
  }

  return null;
}

app.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (usersByEmail.has(normalizedEmail)) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = {
    id: usersByEmail.size + 1,
    email: normalizedEmail,
    passwordHash,
  };

  usersByEmail.set(normalizedEmail, user);

  res.status(201).json({
    user: { id: user.id, email: user.email },
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const user = usersByEmail.get(email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful" });
});

app.get("/users", (req, res) => {
  const users = [...usersByEmail.values()].map(({ id, email }) => ({ id, email }));
  res.json({ users });
});

app.use((error, req, res, next) => {
  console.error(error);
  const statusCode = Number.isInteger(error.status) ? error.status : 500;
  res.status(statusCode).json({
    message: statusCode === 400 ? "Invalid JSON body" : "Internal server error",
  });
});

app.listen(port, () => {
  console.log("Server is running at http://localhost:" + port);
  console.log("Try POST /register, POST /login, or GET /users");
});
