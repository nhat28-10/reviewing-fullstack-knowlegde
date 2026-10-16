"use strict";

const http = require("node:http");
const { URL } = require("node:url");

const users = [
  { id: 1, name: "Nhat" },
  { id: 2, name: "Minh" },
];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/users") {
    sendJson(response, 200, { users });
    return;
  }

  sendJson(response, 404, { message: "Route not found" });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("Try GET /health or GET /users. Press Ctrl+C to stop.");
});