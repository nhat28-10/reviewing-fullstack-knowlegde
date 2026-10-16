/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:v8
 */

"use strict";

const express = require("express");
const v8 = require("node:v8");

const app = express();
const port = 3000;

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getHeapInfo() {
  const heap = v8.getHeapStatistics();

  return {
    usedHeap: formatBytes(heap.used_heap_size),
    heapLimit: formatBytes(heap.heap_size_limit),
  };
}

app.get("/v8-info", (req, res) => {
  res.json({
    nodeVersion: process.version,
    v8Version: process.versions.v8,
    heap: getHeapInfo(),
  });
});

app.get("/sum", (req, res) => {
  const first = 10;
  const second = 20;

  // V8 thực thi biểu thức JavaScript này.
  res.json({ result: first + second });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("Try GET /v8-info or GET /sum. Press Ctrl+C to stop.");
});
