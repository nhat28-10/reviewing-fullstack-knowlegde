// Chạy: npm install && npm run validation
// Thử:
// curl.exe -X POST http://localhost:3000/api/v1/products -H "Content-Type: application/json" -d '{"name":"Laptop","price":1500}'
// curl.exe http://localhost:3000/api/v1/products/abc
// curl.exe -X PATCH http://localhost:3000/api/v1/products/1 -H "Content-Type: application/json" -d '{"price":1400}'

const express = require("express");

const app = express();
const port = 3000;
const products = [{ id: 1, name: "Laptop", price: 1500 }];

app.use(express.json({ limit: "100kb" }));

function validateProductId(req, res, next) {
  const rawId = req.params.id;

  if (!/^\d+$/.test(rawId)) {
    return res.status(400).json({ message: "Product ID must be a positive integer" });
  }

  const productId = Number(rawId);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({ message: "Product ID must be a positive integer" });
  }

  req.productId = productId;
  return next();
}

function validateCreateProduct(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "Body must be a JSON object" });
  }

  const allowedFields = ["name", "price"];
  const hasUnknownField = Object.keys(body).some((key) => !allowedFields.includes(key));

  if (hasUnknownField) {
    return res.status(400).json({ message: "Only name and price are allowed" });
  }

  const { name, price } = body;

  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    return res.status(400).json({ message: "name must be a non-empty string up to 100 characters" });
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: "price must be a positive number" });
  }

  req.productInput = { name: name.trim(), price };
  return next();
}

function validateUpdateProduct(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "Body must be a JSON object" });
  }

  const allowedFields = ["name", "price"];
  const keys = Object.keys(body);

  if (keys.length === 0 || keys.some((key) => !allowedFields.includes(key))) {
    return res.status(400).json({ message: "Provide at least one valid field: name or price" });
  }

  const productInput = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100) {
      return res.status(400).json({ message: "name must be a non-empty string up to 100 characters" });
    }

    productInput.name = body.name.trim();
  }

  if (body.price !== undefined) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price <= 0) {
      return res.status(400).json({ message: "price must be a positive number" });
    }

    productInput.price = body.price;
  }

  req.productInput = productInput;
  return next();
}

app.get("/api/v1/products/:id", validateProductId, (req, res) => {
  const product = products.find((item) => item.id === req.productId);

  if (!product) return res.sendStatus(404);
  return res.json({ data: product });
});

app.post("/api/v1/products", validateCreateProduct, (req, res) => {
  const product = { id: products.length + 1, ...req.productInput };
  products.push(product);
  return res.status(201).json({ data: product });
});

app.patch("/api/v1/products/:id", validateProductId, validateUpdateProduct, (req, res) => {
  const product = products.find((item) => item.id === req.productId);

  if (!product) return res.sendStatus(404);

  Object.assign(product, req.productInput);
  return res.json({ data: product });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
