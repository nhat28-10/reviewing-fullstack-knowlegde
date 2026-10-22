// Chạy: npm install && npm run middleware
// Gửi request hợp lệ (PowerShell):
// curl.exe -X POST http://localhost:3000/api/v1/products -H "Content-Type: application/json" -H "x-api-key: learning-express" -d '{"name":"Laptop"}'

const express = require("express");

const app = express();
const port = 3000;

function logger(req, res, next) {
  console.log(`[1] ${req.method} ${req.originalUrl}`);
  next();
}

function requireApiKey(req, res, next) {
  console.log("[3] Checking API key");

  if (req.get("x-api-key") !== "learning-express") {
    return res.status(401).json({ message: "Invalid API key" });
  }

  return next();
}

function validateProduct(req, res, next) {
  console.log("[4] Validating product body");

  if (typeof req.body.name !== "string" || !req.body.name.trim()) {
    const error = new Error("Product name is required");
    error.statusCode = 400;
    return next(error);
  }

  return next();
}

app.use(logger); // [1]
app.use(express.json()); // [2] Parse application/json body trước validation.

app.post("/api/v1/products", requireApiKey, validateProduct, (req, res) => {
  console.log("[5] Controller");

  return res.status(201).json({
    message: "Product created",
    data: { id: 1, name: req.body.name.trim() },
  });
});

// Error handler phải luôn được đặt sau route/middleware thông thường.
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);

  return res.status(err.statusCode ?? 500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
