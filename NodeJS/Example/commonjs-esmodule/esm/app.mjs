/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ ES Modules:
 *   npm run start:esm
 */

import express from "express";
import { getUsers } from "./user.service.mjs";

const app = express();
const port = 3000;

app.get("/users", (req, res) => {
  res.json({ moduleSystem: "ES Modules", users: getUsers() });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log("ES Modules server is running at http://localhost:" + port);
  console.log("Try GET /users or GET /health. Press Ctrl+C to stop.");
});
