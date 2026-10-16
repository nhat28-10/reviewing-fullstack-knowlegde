/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:basics
 */

"use strict";

const express = require("express");

const app = express();
const port = 3000;

const users = [
  { id: 1, name: "Nhat" },
  { id: 2, name: "Minh" },
];

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/users", (req, res) => {
  res.json({ users });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("Try GET /health or GET /users. Press Ctrl+C to stop.");
});
