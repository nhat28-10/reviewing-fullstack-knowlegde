/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:event-loop
 */

"use strict";

const express = require("express");

const app = express();
const port = 3000;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function blockMainThread(milliseconds) {
  const endTime = Date.now() + milliseconds;

  while (Date.now() < endTime) {
    // Cố tình giữ main thread bận để minh hoạ event loop bị block.
  }
}

app.get("/order", (req, res) => {
  const steps = ["1. route handler (synchronous)"];

  process.nextTick(() => {
    steps.push("3. process.nextTick");
  });

  Promise.resolve().then(() => {
    steps.push("4. Promise microtask");
  });

  setTimeout(() => {
    steps.push("timer: setTimeout(0)");
  }, 0);

  setImmediate(() => {
    steps.push("immediate: setImmediate()");
  });

  steps.push("2. route handler ends (synchronous)");

  // Chờ đủ lâu để callback timer và immediate đã có cơ hội chạy trước khi trả kết quả.
  setTimeout(() => {
    res.json({
      steps,
      note: "nextTick và Promise chạy trước. Thứ tự giữa timer và setImmediate có thể thay đổi theo ngữ cảnh.",
    });
  }, 50);
});

app.get("/delayed", async (req, res) => {
  await delay(2000); // Mô phỏng thời gian chờ I/O, không giữ main thread bận.
  res.json({ message: "Delayed response after 2 seconds" });
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
  console.log("Try GET /order, /delayed, /health, or /heavy?ms=3000");
});
