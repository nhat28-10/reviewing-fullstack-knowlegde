# CORS, Rate Limiting và Input Validation

Ba cơ chế này giải quyết ba câu hỏi khác nhau:

| Cơ chế | Câu hỏi nó trả lời | Không thay thế cho |
| --- | --- | --- |
| CORS | JavaScript từ origin nào được trình duyệt cho đọc response? | Authentication, authorization |
| Rate limiting | Một client được gọi bao nhiêu request trong một khoảng thời gian? | WAF, chống DDoS toàn diện |
| Input validation | Dữ liệu gửi lên có đúng cấu trúc/ràng buộc API yêu cầu? | Authorization, logic nghiệp vụ |

## 1. CORS (Cross-Origin Resource Sharing)

Origin là tổ hợp **scheme (protocol), host và port**. Ví dụ `http://localhost:5173` và `http://localhost:3000` là hai origin khác nhau vì khác port.

Trình duyệt áp dụng Same-Origin Policy với các request do JavaScript tạo ra (`fetch`, `XMLHttpRequest`). CORS là cơ chế HTTP header để server nói origin nào được trình duyệt cho phép đọc response.

```js
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  }),
);
```

Điểm quan trọng:

- CORS được **trình duyệt** thực thi. Nó không ngăn `curl`, Postman hay một server khác gọi API.
- Vì vậy CORS không phải authentication hoặc authorization; API nhạy cảm vẫn phải xác thực và phân quyền ở server.
- Với một số request (ví dụ có `Content-Type: application/json`, header tùy biến hoặc method không đơn giản), trình duyệt gửi request `OPTIONS` preflight trước. Server cần phản hồi các CORS header phù hợp.
- Không dùng `origin: "*"` cho API có credentials (cookie/HTTP authentication). Khi gửi credentials, server phải chỉ định origin cụ thể; cấu hình client và cookie còn cần phù hợp với CSRF protection.

Trong production, nên lưu danh sách origin theo environment và allow-list chính xác, thay vì phản chiếu mọi giá trị `Origin` gửi lên.

## 2. Rate limiting

Rate limiting giới hạn số request trong một cửa sổ thời gian. Nó đặc biệt hữu ích với endpoint có nguy cơ bị thử nhiều lần như đăng nhập, quên mật khẩu, gửi OTP hoặc tạo tài khoản.

```js
const { rateLimit } = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

app.post("/login", loginLimiter, loginHandler);
```

Với ví dụ trên, sau khi vượt giới hạn, middleware trả `429 Too Many Requests`. Scope limiter nên phù hợp rủi ro: limiter chặt cho `/login`, còn API công khai có thể dùng mức rộng hơn.

Lưu ý production:

- Lưu trữ mặc định trong memory chỉ phù hợp một process. Khi chạy nhiều instance, dùng shared store (ví dụ Redis) để giới hạn nhất quán.
- Sau reverse proxy/load balancer, cấu hình `trust proxy` một cách có chủ đích để nhận diện client IP đúng; không bật bừa bãi.
- Rate limit là một lớp giảm lạm dụng, không phải biện pháp chống DDoS hoàn chỉnh. Vẫn cần hạ tầng, WAF/CDN, giám sát và giới hạn tài nguyên phù hợp.
- Không đặt mọi endpoint cùng một limit nếu sẽ làm người dùng hợp lệ bị chặn chỉ vì một endpoint nhạy cảm bị tấn công.

## 3. Input validation

Input validation kiểm tra dữ liệu từ client **trước** khi dùng nó trong business logic, database hoặc dịch vụ khác. Validation cần chạy ở backend; validation frontend chỉ giúp trải nghiệm người dùng vì client có thể bị bỏ qua hoàn toàn.

Ví dụ với Zod:

```js
const { z } = require("zod");

const registerSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(128),
  })
  .strict();

app.post("/register", (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // Chỉ dùng result.data, không dùng trực tiếp req.body từ đây trở đi.
  res.status(201).json({ email: result.data.email });
});
```

`safeParse()` trả về kết quả thành công/thất bại thay vì ném exception. Chỉ tiếp tục xử lý bằng `result.data` sau khi validation thành công. Có thể dùng `.strict()` khi API cần từ chối field không được khai báo; với API cần tương thích ngược, cần cân nhắc chính sách field dư một cách rõ ràng.

Validation không thay thế các kiểm tra sau:

- Authentication: request đến từ ai?
- Authorization: người đó có được làm việc này không?
- Business validation: email đã tồn tại chưa, số dư có đủ không, trạng thái đơn hàng có cho phép chuyển đổi không?

Xem ví dụ Express kết hợp cả ba tại [`../Example/cors-rate-limit-validation.js`](../Example/cors-rate-limit-validation.js).

## 4. Thứ tự middleware gợi ý

```text
CORS -> body parser có giới hạn kích thước -> rate limiter -> validation -> handler
```

Thứ tự cụ thể tùy endpoint. Ví dụ, limiter cho `/login` nên đặt trước handler để request bị chặn không chạy đến bước kiểm tra mật khẩu. Nếu dùng middleware xác thực, route protected thường cần authentication trước authorization.

## 5. Câu hỏi ôn tập

### 1. CORS có chặn Postman hoặc curl gọi API không?

Không. CORS là cơ chế do trình duyệt áp dụng khi JavaScript gọi khác origin. Postman, curl và server-to-server request vẫn gọi API được, nên API vẫn cần authentication và authorization.

### 2. Vì sao request có thể bị preflight?

Với một số method, header hoặc `Content-Type` không thuộc nhóm đơn giản, trình duyệt gửi `OPTIONS` trước để hỏi server liệu request thật có được phép không. Đây là một phần của cơ chế CORS, không phải request nghiệp vụ của client.

### 3. Khi nào API trả 429?

Khi client vượt rate limit được cấu hình. Response nên cho client biết thử lại sau, và server nên dùng giới hạn khác nhau cho các endpoint có mức rủi ro khác nhau.

### 4. Tại sao không chỉ validation ở frontend?

Người dùng có thể bỏ qua frontend và gửi HTTP request trực tiếp. Backend là ranh giới tin cậy nên phải xác minh kiểu dữ liệu, field bắt buộc, giới hạn và định dạng trước khi xử lý.

### 5. `strict()` trong schema có tác dụng gì?

`strict()` làm schema từ chối các field không được khai báo. Điều này hữu ích khi muốn API chỉ chấp nhận hợp đồng dữ liệu rõ ràng; tuy nhiên cần cân nhắc nếu client cũ có thể gửi field dư.
