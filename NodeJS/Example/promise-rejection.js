/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:promise-rejection
 */

"use strict";

const express = require("express");

const app = express();
const port = 3000;

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

function rejectAfterDelay(message, milliseconds = 100) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new AppError(message, 503)), milliseconds);
  });
}

app.get("/handled-await", async (req, res) => {
  try {
    await rejectAfterDelay("Simulated database error");
    res.json({ message: "This response is never reached" });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({
      message: "The route handled this rejection locally",
      detail: error.message,
    });
  }
});

app.get("/express5-auto", async (req, res) => {
  await rejectAfterDelay("Express 5 forwards this rejected Promise");
  res.json({ message: "This response is never reached" });
});

app.get("/promise-chain", (req, res) => {
  return rejectAfterDelay("Returned Promise chain was rejected").then(() => {
    res.json({ message: "This response is never reached" });
  });
});

app.post("/background-task", (req, res) => {
  void rejectAfterDelay("Background task failed").catch((error) => {
    // Trong dự án thật: log, alert, retry hoặc đẩy job vào queue phù hợp.
    console.error("Background task error:", error.message);
  });

  res.status(202).json({ message: "Background task was started safely" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  res.status(error.statusCode ?? 500).json({
    message: error.message ?? "Internal server error",
  });
});

app.listen(port, () => {
  console.log("Server is running at http://localhost:" + port);
  console.log("Try GET /handled-await, /express5-auto, /promise-chain");
  console.log("Try POST /background-task");
});
