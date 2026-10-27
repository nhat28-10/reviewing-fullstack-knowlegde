// Chạy: npm install && npm run status-codes
// Thử:
// curl.exe http://localhost:3000/api/v1/products/1        # 200
// curl.exe http://localhost:3000/api/v1/products/abc      # 400
// curl.exe http://localhost:3000/api/v1/products/99       # 404
// curl.exe -X POST http://localhost:3000/api/v1/products -H "Content-Type: application/json" -d '{"name":"Mouse","price":30}' # 201
// curl.exe -i -X DELETE http://localhost:3000/api/v1/products/1 # 204

const express = require("express");

const app = express();
const port = 3000;
const products = [{ id: 1, name: "Laptop", price: 1500 }];

app.use(express.json());

app.get("/api/v1/products/:id", (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = products.find((item) => item.id === productId);

  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.status(200).json({ data: product });
});

app.post("/api/v1/products", (req, res) => {
  const { name, price } = req.body;

  if (typeof name !== "string" || !name.trim() || typeof price !== "number" || price <= 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  if (products.some((item) => item.name.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(409).json({ message: "A product with this name already exists" });
  }

  const product = { id: products.length + 1, name: name.trim(), price };
  products.push(product);

  return res
    .status(201)
    .location(`/api/v1/products/${product.id}`)
    .json({ data: product });
});

app.delete("/api/v1/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const index = products.findIndex((item) => item.id === productId);

  if (index === -1) return res.status(404).json({ message: "Product not found" });

  products.splice(index, 1);
  return res.status(204).end();
});

// Chỉ minh hoạ khác biệt 401/403, không phải authentication production.
app.get("/api/v1/admin", (req, res) => {
  const authorization = req.get("Authorization");

  if (!authorization) {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({ message: "Authentication required" });
  }

  if (authorization === "Bearer demo-user-token") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (authorization !== "Bearer demo-admin-token") {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json({ message: "Admin data" });
});

app.get("/api/v1/maintenance", (req, res) => {
  res.set("Retry-After", "120");
  return res.status(503).json({ message: "Service temporarily unavailable" });
});

app.get("/api/v1/unexpected-error", (req, res, next) => {
  return next(new Error("Demo unexpected error"));
});

app.use((err, req, res, next) => {
  console.error(err.message);
  return res.status(500).json({ message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
