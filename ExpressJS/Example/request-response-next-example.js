// Chạy: npm install && npm run request-flow
// Kiểm tra: curl.exe -H "x-api-key: learning-express" http://localhost:3000/api/v1/users/1

const express = require("express");

const app = express();
const port = 3000;
const API_KEY = "learning-express";

app.use(express.json());

function logger(req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}

function requireApiKey(req, res, next) {
  if (req.get("x-api-key") !== API_KEY) {
    const error = new Error("Invalid API key");
    error.statusCode = 401;
    return next(error);
  }

  return next();
}

app.get("/api/v1/users/:id", logger, requireApiKey, (req, res, next) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    const error = new Error("User ID must be an integer");
    error.statusCode = 400;
    return next(error);
  }

  return res.json({ data: { id: userId, name: "An" } });
});

// Error handler phải có đủ 4 tham số và đặt sau routes.
app.use((err, req, res, next) => {
  console.error(err.message);
  return res.status(err.statusCode ?? 500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
