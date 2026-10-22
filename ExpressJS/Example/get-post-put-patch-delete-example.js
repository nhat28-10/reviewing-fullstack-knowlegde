// Chạy: npm install && npm run crud

const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

const users = [
  { id: 1, name: "An", email: "an@example.com" },
  { id: 2, name: "Binh", email: "binh@example.com" },
];
let nextId = 3;

const getUserIndex = (id) => users.findIndex((user) => user.id === Number(id));

app.get("/api/v1/users", (req, res) => {
  return res.json({ data: users });
});

app.get("/api/v1/users/:id", (req, res) => {
  const index = getUserIndex(req.params.id);
  if (index === -1) return res.sendStatus(404);
  return res.json({ data: users[index] });
});

app.post("/api/v1/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "name and email are required" });

  const user = { id: nextId++, name, email };
  users.push(user);
  return res.status(201).json({ data: user });
});

app.put("/api/v1/users/:id", (req, res) => {
  const index = getUserIndex(req.params.id);
  const { name, email } = req.body;

  if (index === -1) return res.sendStatus(404);
  if (!name || !email) return res.status(400).json({ message: "name and email are required" });

  users[index] = { id: users[index].id, name, email };
  return res.json({ data: users[index] });
});

app.patch("/api/v1/users/:id", (req, res) => {
  const index = getUserIndex(req.params.id);
  const { name, email } = req.body;

  if (index === -1) return res.sendStatus(404);
  if (name === undefined && email === undefined) {
    return res.status(400).json({ message: "At least one field is required" });
  }

  if (name !== undefined) users[index].name = name;
  if (email !== undefined) users[index].email = email;
  return res.json({ data: users[index] });
});

app.delete("/api/v1/users/:id", (req, res) => {
  const index = getUserIndex(req.params.id);
  if (index === -1) return res.sendStatus(404);

  users.splice(index, 1);
  return res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
