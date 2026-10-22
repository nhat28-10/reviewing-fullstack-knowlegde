// Chạy: npm install && npm run router
// Kiểm tra: GET http://localhost:3000/api/v1/users

const express = require("express");

const app = express();
const userRouter = express.Router();
const port = 3000;

app.use(express.json());

// Controller: chỉ xử lý request và trả response.
const users = [
  { id: 1, name: "An" },
  { id: 2, name: "Binh" },
];

function getUsers(req, res) {
  return res.status(200).json({ data: users });
}

function getUserById(req, res) {
  const user = users.find((item) => item.id === Number(req.params.id));

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json({ data: user });
}

// Router: định nghĩa endpoint và gắn controller phù hợp.
userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);

// App: mount router với URL prefix và khởi động HTTP server.
app.use("/api/v1/users", userRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
