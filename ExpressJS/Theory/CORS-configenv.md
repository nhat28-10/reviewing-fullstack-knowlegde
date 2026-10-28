# ExpressJS Theory

## 14: CORS và cấu hình môi trường

### 1. CORS là gì?

- CORS (Cross-Origin Resource Sharing) là cơ chế dựa trên HTTP headers, cho phép server thông báo cho trình duyệt những origin nào được phép đọc response khi thực hiện cross-origin request.
- Ví dụ, bạn đang phát triển một dự án Fullstack:
  ![alt text](./Image/whatisCORS.png)

**Origin được xác định bằng ba thành phần:**

- Protocol (scheme) + Host + Port
- Ví dụ
  Frontend Backend Cùng origin?
  http://localhost:3000 http://localhost:3000 ✅ Có
  http://localhost:5173 http://localhost:3000 ❌ Khác port
  http://example.com https://example.com ❌ Khác protocol
  https://app.example.com https://api.example.com ❌ Khác host

**Tại sao có lỗi CORS?**

- Trình duyệt áp dụng chính sách bảo mật Same-Origin Policy. Khi JavaScript từ một origin gọi sang origin khác, trình duyệt kiểm tra CORS response headers để quyết định có cho JavaScript đọc response hay không.
- Nếu Backend không trả những CORS headers phù hợp, trình duyệt sẽ chặn ứng dụng Frontend truy cập response đó
- Một điểm dễ nhầm: CORS chủ yếu được trình duyệt thực thi, không phải một cơ chế Authentication của Backend. Postman hoặc curl không áp dụng Same-Origin Policy giống trình duyệt.

### 2. Cấu hình CORS trong ExpressJS

- Thư viên phổ biến là cors

```bash
npm i cors
```

**Cách 1 — Cho phép mọi origin**

```js
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
```

- Với cấu hình mặc định, middleware tạo response header tương đương:

```http
Access-Control-Allow-Origin: *
```

- Điều này cho phép JavaScript từ mọi origin đọc các response phù hợp với yêu cầu CORS không kèm credentials.
- Cách này tiện khi thử nghiệm một API công khai, nhưng không nên mặc định áp dụng cho mọi API Production

**Cách 2 — Chỉ cho phép một origin cụ thể**

- Giả sử ReactJS chạy tại http://localhost:5173.

```js
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
```

- Khi đó, trình duyệt chạy ứng dụng từ origin này được phép đọc response theo chính sách CORS của server. Nếu Frontend chạy tại http://localhost:5174 thì không khớp với origin đã cấu hình

**Cách 3 — Cho phép nhiều origin**

```js
app.use(
  cors({
    origin: ["http://localhost:5173", "https://app.example.com"],
  }),
);
```

- Cách này hữu ích khi bạn có Frontend Development và Production dùng chung một API hoặc nhiều ứng dụng Frontend được cho phép.
- Lưu ý: CORS không thay thế Authentication và Authorization. Dù origin không nằm trong allowlist, Postman hoặc một Backend khác vẫn có thể gọi API. Vì vậy, những Protected API vẫn phải kiểm tra JWT, session và quyền truy cập như các item trước.

### 3. CORS Preflight Request là gì?

- Khi trình duyệt chuẩn bị thực hiện một số cross-origin request, nó gửi request OPTIONS để hỏi server có cho phép method và headers đó hay không. Ví dụ, ReactJS gửi:

```js
fetch("http://localhost:3000/api/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "Laptop" }),
});
```

- Trình duyệt thường thực hiện:
  ![alt text](./Image/CORS-preflight-request.png)

- Với app.use(cors({...})), thư viện cors thường tự xử lý preflight OPTIONS cho các routes bên dưới, nên bạn không cần tự viết một Controller OPTIONS cho từng route
- Không phải cross-origin request nào cũng cần preflight. Các request đáp ứng điều kiện simple request có thể được gửi trực tiếp.

### 4. CORS và credentials — điểm dễ gặp lỗi

- Giả sử Frontend và Backend sử dụng cookie để duy trì phiên đăng nhập.
- FE:

```js
fetch("https://api.example.com/users/me", {
  credentials: "include",
});
```

- BE không nên cấu hình:

```js
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
```

- Vì trình duyệt không cho phép sử dụng Access-Control-Allow-Origin: \* đối với credentialed CORS requests.
- Cách phù hợp hơn là

```js
app.use(
  cors({
    origin: "https://app.example.com",
    credentials: true,
  }),
);
```

- Khi dùng cookie cross-origin, ngoài CORS còn phải cấu hình cookie attributes và bảo vệ CSRF phù hợp.

### 5. Cấu hình môi trường (.env) là gì?

- Ví dụ, trong một dự án ExpressJS có thể có:
  - PORT: Port Backend.
  - DATABASE_URL: Chuỗi kết nối PostgreSQL.
  - JWT_ACCESS_SECRET: Secret ký Access Token.
  - CLIENT_ORIGIN: Origin Frontend được phép gọi API qua trình duyệt.
  - NODE_ENV: Tên môi trường chạy.
- Ví dụ file .env cho môi trường Development

```dotenv
NODE_ENV=development
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://localhost:5432/example_db
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
```

- Node.js cung cấp process.env để đọc biến môi trường. Có thể sử dụng dotenv hoặc chức năng nạp .env của Node.js để đưa các giá trị trong file vào môi trường ứng dụng.

**Ví dụ ExpressJS đọc cấu hình từ .env**

- Cài dotenv nếu dự án sử dụng thư viện này:

```bash
npm install dotenv
```

- File app.js

```js
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

const PORT = Number(process.env.PORT || 3000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

if (!CLIENT_ORIGIN) {
  throw new Error("Missing CLIENT_ORIGIN");
}

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
);

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "OK",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- Ở đây:
  - process.env.PORT đọc port từ môi trường.
  - process.env.CLIENT_ORIGIN đọc origin được cho phép.
  - cors({ origin: CLIENT_ORIGIN }) cấu hình CORS mà không hard-code URL Frontend.
  - app.listen(PORT) sử dụng port đã cấu hình.
- Trong ví dụ này, nếu thiếu CLIENT_ORIGIN, ứng dụng báo lỗi cấu hình ngay khi khởi động thay vì vô tình dùng một cấu hình CORS quá rộng.

### 6. Development vs Production

- Bạn có thể đã gặp trường hợp API chạy tốt ở Local nhưng Frontend triển khai lên domain thật lại gặp CORS error.
  Ví dụ:
  Cấu hình Development Production
  NODE_ENV development production
  PORT 3000 Tùy hạ tầng
  CLIENT_ORIGIN http://localhost:5173 https://app.example.com
  DATABASE_URL Database Local Database Production
- Trong Production, bạn có thể cấp những biến này thông qua môi trường deploy, Docker Compose secrets hoặc hệ thống quản lý secrets, tùy độ nhạy cảm và hạ tầng.
- Các lưu ý quan trọng:
  - Không commit file .env có secrets thật lên Github
  - Có thể commit .env.example nhưng phải chưa tên biến và placeholder an toàn
  - Không hard-code JWT secrets hoặc database passwords trong source code
  - process.env thường cung cấp giá trị dạng string, nên cần chuyển đổi các biến kiểu số hoặc boolean
  - Khi đổi .env, ứng dụng Node.js đang chạy thường cần được khởi động lại để nạp cấu hình mới

### 7. Các lỗi và hiểu nhầm thường gặp

Hiểu nhầm Kiến thức đúng
CORS là Authentication Không, CORS là cơ chế chia sẻ response giữa các origin
Postman gọi API được thì Browser chắc chắn gọi được Không, trình duyệt còn áp dụng CORS
CORS có thể ngăn tất cả client khác truy cập API Không, vẫn cần Authentication / Authorization
localhost:3000 và localhost:5173 cùng origin Không, vì khác port
.env luôn tự được ExpressJS đọc Không, cần cơ chế nạp cấu hình phù hợp
Có thể đưa JWT secret vào GitHub vì để trong .env Không, .env chứa secrets thật vẫn phải được bảo vệ
origin: "\*" luôn dùng được với credentials Không, credentialed CORS requests không được dùng wildcard origin
