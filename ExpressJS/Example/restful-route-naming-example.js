// Chạy: npm install && npm run restful-routes
// Thử:
// curl.exe "http://localhost:3000/api/v1/products?category=electronics&sort=price&order=asc"
// curl.exe http://localhost:3000/api/v1/users/1/orders
// curl.exe -X POST http://localhost:3000/api/v1/orders/1/cancel

const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

const products = [
  { id: 1, name: "Laptop", category: "electronics", price: 1500 },
  { id: 2, name: "Mouse", category: "electronics", price: 30 },
  { id: 3, name: "Notebook", category: "stationery", price: 5 },
];

const orders = [
  { id: 1, userId: 1, status: "PENDING" },
  { id: 2, userId: 1, status: "COMPLETED" },
];

// Collection resource + query string dành cho lọc/sắp xếp.
app.get("/api/v1/products", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const sort = req.query.sort === "price" ? "price" : "id";
  const order = req.query.order === "desc" ? "desc" : "asc";

  const result = [...products]
    .filter((product) => !category || product.category === category)
    .toSorted((left, right) => (order === "asc" ? left[sort] - right[sort] : right[sort] - left[sort]));

  return res.json({ data: result });
});

// Một resource cụ thể được xác định bằng ID trên path.
app.get("/api/v1/products/:id", (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) return res.sendStatus(404);
  return res.json({ data: product });
});

// Nested route biểu diễn orders của một user.
app.get("/api/v1/users/:userId/orders", (req, res) => {
  const userId = Number(req.params.userId);
  return res.json({ data: orders.filter((order) => order.userId === userId) });
});

// Action endpoint hợp lý cho business action không chỉ là CRUD đơn thuần.
app.post("/api/v1/orders/:id/cancel", (req, res) => {
  const order = orders.find((item) => item.id === Number(req.params.id));

  if (!order) return res.sendStatus(404);
  if (order.status !== "PENDING") {
    return res.status(409).json({ message: "Only pending orders can be cancelled" });
  }

  order.status = "CANCELLED";
  return res.status(200).json({ data: order });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
