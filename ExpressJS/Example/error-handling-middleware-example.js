// Chạy: npm install && npm run error-handling
// Thử các request sau:
// curl.exe http://localhost:3000/api/v1/products/1
// curl.exe http://localhost:3000/api/v1/products/99
// curl.exe http://localhost:3000/api/v1/products?fail=true
// curl.exe http://localhost:3000/not-found

const express = require("express");

const app = express();
const port = 3000;
const products = [{ id: 1, name: "Laptop" }];

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.get("/api/v1/products/:id", (req, res, next) => {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  return res.json({ data: product });
});

// Express 5 tự chuyển Promise reject/throw trong async handler đến error handler.
app.get("/api/v1/products", async (req, res) => {
  if (req.query.fail === "true") {
    throw new Error("Database connection failed");
  }

  return res.json({ data: products });
});

// 404 không tự được Express coi là error; middleware này phải đặt sau routes.
app.use((req, res) => {
  return res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler phải đặt cuối cùng và có đủ 4 tham số.
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const safeStatusCode = statusCode >= 400 && statusCode < 600 ? statusCode : 500;

  return res.status(safeStatusCode).json({
    message: safeStatusCode >= 500 ? "Internal Server Error" : err.message,
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
