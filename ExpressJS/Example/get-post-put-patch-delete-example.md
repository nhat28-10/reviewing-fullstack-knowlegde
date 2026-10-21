# Thực hành: Users CRUD API

Bài thực hành này dùng Express để áp dụng năm HTTP method phổ biến: `GET`, `POST`, `PUT`, `PATCH` và `DELETE`.

## 1. Chuẩn bị

```bash
mkdir express-users-crud
cd express-users-crud
npm init -y
npm install express
```

Thêm vào `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch app.js"
  }
}
```

## 2. Tạo `app.js`

```js
import express from "express";

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

  if (!name || !email) {
    return res.status(400).json({ message: "name and email are required" });
  }

  const user = { id: nextId++, name, email };
  users.push(user);

  return res.status(201).json({ data: user });
});

app.put("/api/v1/users/:id", (req, res) => {
  const index = getUserIndex(req.params.id);
  const { name, email } = req.body;

  if (index === -1) return res.sendStatus(404);
  if (!name || !email) {
    return res.status(400).json({ message: "name and email are required" });
  }

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
```

## 3. Chạy và kiểm tra

Khởi động server:

```bash
npm run dev
```

Các lệnh dưới đây dùng `curl.exe` để hoạt động đúng trong Windows PowerShell:

```bash
# GET: lấy danh sách và lấy một user
curl.exe http://localhost:3000/api/v1/users
curl.exe http://localhost:3000/api/v1/users/1

# POST: tạo user mới
curl.exe -X POST http://localhost:3000/api/v1/users -H "Content-Type: application/json" -d '{"name":"Chi","email":"chi@example.com"}'

# PUT: gửi đủ name và email để thay thế user 1
curl.exe -X PUT http://localhost:3000/api/v1/users/1 -H "Content-Type: application/json" -d '{"name":"An Nguyen","email":"an.nguyen@example.com"}'

# PATCH: chỉ đổi name của user 1
curl.exe -X PATCH http://localhost:3000/api/v1/users/1 -H "Content-Type: application/json" -d '{"name":"An Updated"}'

# DELETE: xoá user 2
curl.exe -i -X DELETE http://localhost:3000/api/v1/users/2
```

> Lệnh `curl.exe` dùng cú pháp PowerShell/Windows. Trên macOS/Linux, thay `curl.exe` bằng `curl`.

## 4. Kết quả mong đợi

| Request | Status | Ghi chú |
| --- | --- | --- |
| `GET /api/v1/users` | `200` | Trả danh sách users. |
| `GET /api/v1/users/1` | `200` | Trả user có ID `1`. |
| `POST /api/v1/users` với body hợp lệ | `201` | Tạo user mới. |
| `PUT /api/v1/users/1` thiếu `email` | `400` | PUT trong ví dụ yêu cầu đầy đủ field. |
| `PATCH /api/v1/users/1` chỉ có `name` | `200` | Chỉ cập nhật name. |
| `DELETE /api/v1/users/2` | `204` | Xoá thành công, không có response body. |
| Thao tác với ID không tồn tại | `404` | Không tìm thấy user. |

## 5. Bài tập tự làm

1. Thêm query `?name=an` cho `GET /api/v1/users` để lọc theo tên.
2. Kiểm tra email trùng trước khi tạo user và trả `409 Conflict` nếu trùng.
3. Thêm header `Location: /api/v1/users/:id` khi `POST` tạo user thành công.
4. Tách routes và controllers theo bài [App, Router và Controller](../Theory/expressapp-router-controller.md).
