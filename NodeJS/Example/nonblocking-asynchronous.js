/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:nonblocking
 */

"use strict";

const express = require("express");

const app = express();
const port = 3000;

const users = [
  { id: 1, name: "Nhat" },
  { id: 2, name: "Minh" },
];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function blockMainThread(milliseconds) {
  const endTime = Date.now() + milliseconds;

  while (Date.now() < endTime) {
    // Cố tình giữ main thread bận để minh hoạ CPU-bound work.
  }
}

app.get("/users", async (req, res) => {
  await delay(2000); // Mô phỏng thời gian chờ database/network I/O.

  res.json({
    message: "Users loaded after asynchronous I/O",
    users,
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/heavy", (req, res) => {
  const requestedMs = Number(req.query.ms ?? 3000);
  const milliseconds = Number.isFinite(requestedMs)
    ? Math.min(Math.max(requestedMs, 0), 5000)
    : 3000;

  blockMainThread(milliseconds);
  res.json({ message: `Main thread was blocked for ${milliseconds}ms` });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("Try GET /users, /health, or /heavy?ms=3000");
});
