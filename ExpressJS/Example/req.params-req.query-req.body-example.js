// Chạy: npm install && npm run request-data

const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

const products = [
  { id: 1, name: "Laptop", price: 1500 },
  { id: 2, name: "Mouse", price: 30 },
  { id: 3, name: "Keyboard", price: 80 },
];

const findProductIndex = (id) => products.findIndex((product) => product.id === Number(id));

// req.query: GET /api/v1/products?search=lap&page=1&limit=5
app.get("/api/v1/products", (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ message: "Invalid page or limit" });
  }

  const filtered = products.filter((product) => product.name.toLowerCase().includes(search));
  const startIndex = (page - 1) * limit;

  return res.json({
    page,
    limit,
    total: filtered.length,
    data: filtered.slice(startIndex, startIndex + limit),
  });
});

// req.params: GET /api/v1/products/1
app.get("/api/v1/products/:id", (req, res) => {
  const index = findProductIndex(req.params.id);
  if (index === -1) return res.sendStatus(404);
  return res.json({ data: products[index] });
});

// req.body: POST /api/v1/products với JSON body.
app.post("/api/v1/products", (req, res) => {
  const { name, price } = req.body;

  if (typeof name !== "string" || !name.trim() || typeof price !== "number" || price < 0) {
    return res.status(400).json({ message: "name and a non-negative numeric price are required" });
  }

  const product = { id: products.length + 1, name: name.trim(), price };
  products.push(product);
  return res.status(201).json({ data: product });
});

// Kết hợp req.params và req.body: PATCH /api/v1/products/1.
app.patch("/api/v1/products/:id", (req, res) => {
  const index = findProductIndex(req.params.id);
  const { price } = req.body;

  if (index === -1) return res.sendStatus(404);
  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({ message: "price must be a non-negative number" });
  }

  products[index].price = price;
  return res.json({ data: products[index] });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
