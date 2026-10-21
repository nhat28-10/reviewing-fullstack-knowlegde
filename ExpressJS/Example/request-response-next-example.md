# Thực hành: `req`, `res`, `next()` và Error Handler

Bài này xây dựng một API nhỏ để thực hành các kiến thức trong [phần lý thuyết](../Theory/request-response-next().md): đọc dữ liệu từ request, trả response, viết middleware và chuyển lỗi bằng `next(error)`.

## Mục tiêu

- Đọc route parameter, query string, header và JSON body.
- Tạo middleware logger và middleware kiểm tra API key.
- Dùng `next(error)` để chuyển lỗi về error handler tập trung.

## 1. Chuẩn bị

```bash
mkdir express-request-response
cd express-request-response
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
const API_KEY = "learning-express";

app.use(express.json());

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};

const requireApiKey = (req, res, next) => {
  const apiKey = req.get("x-api-key");

  if (apiKey !== API_KEY) {
    const error = new Error("Invalid API key");
    error.statusCode = 401;
    return next(error);
  }

  return next();
};

app.get("/api/v1/users/:id", logger, requireApiKey, (req, res, next) => {
  const userId = Number(req.params.id);
  const includePosts = req.query.includePosts === "true";

  if (!Number.isInteger(userId)) {
    const error = new Error("User ID must be an integer");
    error.statusCode = 400;
    return next(error);
  }

  return res.status(200).json({
    data: {
      id: userId,
      name: "An",
      includePosts,
    },
  });
});

app.post("/api/v1/users", logger, requireApiKey, (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    const error = new Error("name and email are required");
    error.statusCode = 400;
    return next(error);
  }

  return res.status(201).json({
    message: "User created",
    data: { id: 3, name, email },
  });
});

// Đặt error handler sau tất cả middleware và routes thông thường.
app.use((err, req, res, next) => {
  console.error(err.message);

  return res.status(err.statusCode ?? 500).json({
    message: err.message || "Internal server error",
  });
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

Gọi endpoint hợp lệ:

```bash
curl -H "x-api-key: learning-express" "http://localhost:3000/api/v1/users/1?includePosts=true"
```

Tạo user bằng JSON body:

```bash
curl.exe -X POST http://localhost:3000/api/v1/users -H "Content-Type: application/json" -H "x-api-key: learning-express" -d '{"name":"Binh","email":"binh@example.com"}'
```

> Trên Windows PowerShell, dùng `curl.exe` để gọi cURL thật thay vì alias `curl` của PowerShell. Trên macOS/Linux, dùng `curl` với cùng các tham số.

## 4. Kết quả mong đợi

| Request | Status | Kết quả |
| --- | --- | --- |
| `GET /api/v1/users/1` với API key đúng | `200` | Trả thông tin user. |
| `GET /api/v1/users/abc` với API key đúng | `400` | `next(error)` chuyển lỗi ID không hợp lệ sang error handler. |
| Request không có `x-api-key` | `401` | Middleware `requireApiKey` chặn request. |
| `POST /api/v1/users` thiếu `name` hoặc `email` | `400` | Error handler trả về lỗi validate. |
| `POST /api/v1/users` hợp lệ | `201` | Trả user vừa tạo giả lập. |

## 5. Theo dõi luồng xử lý

Với `GET /api/v1/users/1?includePosts=true` và API key đúng:

1. `express.json()` sẵn sàng parse JSON body (nếu request có body JSON).
2. `logger` log method và URL, rồi gọi `next()`.
3. `requireApiKey` đọc `req.get("x-api-key")`, xác thực xong rồi gọi `next()`.
4. Route handler đọc `req.params.id` và `req.query.includePosts`.
5. Handler dùng `res.status(200).json()` để trả response và kết thúc luồng.

Nếu API key sai, `requireApiKey` gọi `next(error)`. Express bỏ qua route handler thường và gọi error handler ở cuối file.

## 6. Bài tập tự làm

1. Thêm middleware đo thời gian xử lý request bằng `Date.now()`; in thời gian sau khi response hoàn tất.
2. Thêm route `DELETE /api/v1/users/:id`; trả `204 No Content` khi xoá thành công.
3. Thêm middleware 404 đặt **trước** error handler để trả JSON khi route không tồn tại.
4. Tách `logger`, `requireApiKey` và `errorHandler` thành các file middleware riêng.
