/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:error-handling
 */

"use strict";

const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const port = 3000;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

app.get("/sync-error", (req, res) => {
  throw new AppError("This is a synchronous error", 400);
});

app.get("/async-error", async (req, res) => {
  await Promise.resolve();
  throw new AppError("This is an asynchronous error", 503);
});

app.get("/callback-error", (req, res, next) => {
  const missingFile = path.join(process.cwd(), "missing-file.txt");

  fs.readFile(missingFile, "utf8", (error, content) => {
    if (error) {
      return next(error);
    }

    res.type("text/plain").send(content);
  });
});

app.get("/timer-error", (req, res, next) => {
  setTimeout(() => {
    try {
      throw new AppError("This error happened inside a timer", 500);
    } catch (error) {
      next(error);
    }
  }, 100);
});

app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    Number.isInteger(error.statusCode) && error.statusCode >= 400
      ? error.statusCode
      : 500;

  console.error(error);

  const isProduction = process.env.NODE_ENV === "production";
  const message =
    statusCode >= 500 && isProduction ? "Internal server error" : error.message;

  res.status(statusCode).json({ message });
});

app.listen(port, () => {
  console.log("Server is running at http://localhost:" + port);
  console.log("Try GET /sync-error, /async-error, /callback-error, /timer-error");
});
