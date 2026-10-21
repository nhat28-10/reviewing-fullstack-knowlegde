# Thực hành: Users API với Express App, Router và Controller

Ví dụ này áp dụng kiến thức trong [phần lý thuyết](../Theory/expressapp-router-controller.md): tách một Users API thành **app**, **router** và **controller**.

## Mục tiêu

- Biết cách mount router bằng `app.use()`.
- Hiểu URL cuối cùng được tạo từ router prefix và route path.
- Lấy route parameter qua `req.params` và trả response JSON bằng `res.json()`.

## 1. Tạo dự án và cài đặt

```bash
mkdir express-users-api
cd express-users-api
npm init -y
npm install express
```

Trong `package.json`, thêm `"type": "module"` và script chạy server:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/app.js"
  }
}
```

Tạo cấu trúc thư mục:

```text
src/
├── app.js
├── controllers/
│   └── user.controller.js
└── routes/
    └── user.routes.js
```

## 2. Viết code

### `src/app.js`

```js
import express from "express";
import userRouter from "./routes/user.routes.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/v1/users", userRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

### `src/routes/user.routes.js`

```js
import { Router } from "express";
import { getUserById, getUsers } from "../controllers/user.controller.js";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);

export default router;
```

### `src/controllers/user.controller.js`

```js
const users = [
  { id: 1, name: "An", email: "an@example.com" },
  { id: 2, name: "Binh", email: "binh@example.com" },
];

export const getUsers = (req, res) => {
  return res.status(200).json({
    data: users,
  });
};

export const getUserById = (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    return res.status(400).json({
      message: "User ID must be an integer",
    });
  }

  const user = users.find((item) => item.id === userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    data: user,
  });
};
```

## 3. Chạy và kiểm tra API

Khởi động server:

```bash
npm run dev
```

Dùng browser, Postman hoặc `curl` để gọi API:

```bash
curl http://localhost:3000/api/v1/users
curl http://localhost:3000/api/v1/users/1
curl http://localhost:3000/api/v1/users/99
curl http://localhost:3000/api/v1/users/abc
```

Kết quả mong đợi:

| Request | Status | Ý nghĩa |
| --- | --- | --- |
| `GET /api/v1/users` | `200` | Trả về danh sách người dùng. |
| `GET /api/v1/users/1` | `200` | Trả về người dùng có ID `1`. |
| `GET /api/v1/users/99` | `404` | Không tìm thấy người dùng. |
| `GET /api/v1/users/abc` | `400` | ID không phải số nguyên hợp lệ. |

## 4. Theo dõi luồng request

Với request `GET /api/v1/users/1`, Express xử lý theo thứ tự sau:

1. `app.js` nhận request và thấy URL bắt đầu bằng `/api/v1/users`.
2. `app.use("/api/v1/users", userRouter)` chuyển phần URL còn lại (`/1`) cho `userRouter`.
3. `user.routes.js` khớp `/1` với route `/:id`.
4. Router gọi `getUserById` trong controller.
5. Controller đọc `req.params.id`, tìm dữ liệu và dùng `res.json()` trả kết quả.

## 5. Bài tập tự làm

1. Thêm endpoint `GET /api/v1/users?name=an` để lọc theo tên. Gợi ý: đọc `req.query.name`.
2. Thêm route `POST /api/v1/users` và kiểm tra `name`, `email` trong `req.body`.
3. Tách mảng `users` và các thao tác tìm kiếm sang `services/user.service.js`; controller chỉ nên nhận request và trả response.

> Khi làm xong, hãy tự trả lời: router có nên chứa logic tìm user không? Vì sao?
