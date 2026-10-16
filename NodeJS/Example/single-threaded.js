/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:single-threaded
 */

"use strict";

const express = require("express");

const app = express();
const port = 3000;

function blockMainThread(milliseconds) {
  const endTime = Date.now() + milliseconds;

  while (Date.now() < endTime) {
    // Cố tình giữ main thread bận để minh hoạ CPU-bound work.
  }
}

app.get("/slow", (req, res) => {
  setTimeout(() => {
    res.json({ message: "Slow response (sau 3 giây)" });
  }, 3000);
});

app.get("/fast", (req, res) => {
  res.json({ message: "Fast response" });
});

app.get("/block", (req, res) => {
  const requestedMs = Number(req.query.ms ?? 3000);
  const milliseconds = Number.isFinite(requestedMs)
    ? Math.min(Math.max(requestedMs, 0), 5000)
    : 3000;

  blockMainThread(milliseconds);
  res.json({ message: `Blocked main thread for ${milliseconds}ms` });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("Try GET /slow, GET /fast, or GET /block?ms=3000");
});
