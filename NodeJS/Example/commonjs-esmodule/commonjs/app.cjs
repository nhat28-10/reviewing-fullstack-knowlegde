/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ CommonJS:
 *   npm run start:commonjs
 */

"use strict";

const express = require("express");
const { getUsers } = require("./user.service.cjs");

const app = express();
const port = 3000;

app.get("/users", (req, res) => {
  res.json({ moduleSystem: "CommonJS", users: getUsers() });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log("CommonJS server is running at http://localhost:" + port);
  console.log("Try GET /users or GET /health. Press Ctrl+C to stop.");
});
