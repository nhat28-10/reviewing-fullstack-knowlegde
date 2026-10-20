# JWT (JSON Web Token)

## 1. JWT dùng để làm gì?

JWT là một định dạng token chứa các claim (thông tin khai báo) dưới dạng JSON. Trong backend, JWT thường được dùng làm **access token**: sau khi đăng nhập thành công, client gửi token ở các request tiếp theo để server xác thực danh tính.

Luồng cơ bản:

1. Client gửi email và mật khẩu qua HTTPS.
2. Server tìm người dùng và kiểm tra mật khẩu bằng `bcrypt.compare()`.
3. Nếu hợp lệ, server ký một access token có thời hạn ngắn.
4. Client gửi token qua header `Authorization: Bearer <token>`.
5. Middleware kiểm tra token trước khi cho phép truy cập tài nguyên.
6. Sau khi xác thực, server vẫn phải kiểm tra **quyền** (role, ownership, ...).

`bcrypt` bảo vệ mật khẩu. JWT chỉ giúp chứng minh request sau đó đang mang một token do server phát hành; JWT không thay thế việc hash mật khẩu.

## 2. Cấu trúc và tính chất bảo mật

JWT được ký phổ biến có ba phần, ngăn cách bởi dấu chấm:

```text
base64url(header).base64url(payload).signature
```

| Phần | Ví dụ | Ý nghĩa |
| --- | --- | --- |
| Header | `{ "alg": "HS256", "typ": "JWT" }` | Loại token và thuật toán ký. |
| Payload | `{ "sub": "user-123", "role": "USER", "exp": 1770000900 }` | Các claim của token. |
| Signature | Chuỗi chữ ký | Giúp phát hiện header/payload bị sửa sau khi ký. |

**JWT được ký không đồng nghĩa với được mã hóa.** Header và payload chỉ được Base64URL-encode nên bất kỳ ai cầm token cũng có thể đọc chúng. Không đặt password, password hash, JWT secret, dữ liệu thanh toán hoặc dữ liệu nhạy cảm vào payload.

JWT ký (JWS) bảo vệ tính toàn vẹn và nguồn phát hành, nhưng không giấu nội dung. JWT mã hóa (JWE) là một cơ chế khác và không phải mặc định của các thư viện JWT thông dụng.

## 3. Claims thường gặp

| Claim | Ý nghĩa thường dùng |
| --- | --- |
| `sub` | Subject; thường là ID người dùng. |
| `iss` | Issuer; hệ thống phát hành token. |
| `aud` | Audience; ứng dụng/dịch vụ được nhận token. |
| `iat` | Issued at; thời điểm phát hành. |
| `exp` | Expiration time; thời điểm hết hạn. |
| `nbf` | Not before; token chưa hợp lệ trước thời điểm này. |
| `jti` | JWT ID; mã định danh token, hữu ích khi cần theo dõi hoặc thu hồi. |

Tên claim chuẩn không tự làm token an toàn. Ứng dụng phải định nghĩa claim nào là cần thiết và xác minh chúng khi nhận token.

## 4. Ký và xác minh trong Node.js

Cài thư viện:

```bash
npm install jsonwebtoken
```

Tạo access token:

```js
const jwt = require("jsonwebtoken");

const accessToken = jwt.sign(
  { sub: String(user.id), role: user.role },
  process.env.JWT_SECRET,
  {
    algorithm: "HS256",
    expiresIn: "15m",
    issuer: "example-api",
    audience: "example-web",
  },
);
```

Xác minh token trong middleware:

```js
const payload = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ["HS256"],
  issuer: "example-api",
  audience: "example-web",
});
```

Luôn giới hạn danh sách thuật toán chấp nhận qua `algorithms`. Đừng tin giá trị `alg` do token tự khai báo. Khi dùng HS256, `JWT_SECRET` phải là secret ngẫu nhiên, dài và được quản lý qua biến môi trường/secret manager — không dùng mật khẩu con người nhớ được. Không tạo secret mới mỗi lần ứng dụng khởi động, vì toàn bộ token cũ sẽ mất hiệu lực.

`jwt.decode()` chỉ đọc payload, **không kiểm tra chữ ký**. Vì vậy không dùng `decode()` để xác thực hay cấp quyền.

## 5. Middleware xác thực và phân quyền

Header đúng có dạng:

```http
Authorization: Bearer <access_token>
```

Middleware nên:

1. Kiểm tra chính xác định dạng `Bearer`.
2. Gọi `jwt.verify()` với secret/key, thuật toán allow-list, `issuer` và `audience` phù hợp.
3. Lưu payload đã xác minh vào `req.auth`.
4. Trả `401 Unauthorized` khi thiếu, sai hoặc hết hạn token.

Một token hợp lệ chỉ trả lời câu hỏi “ai đang gọi?”. Route vẫn cần kiểm tra người đó có quyền thực hiện hành động hay sở hữu tài nguyên không. Nếu đã xác thực nhưng không có quyền, trả `403 Forbidden`.

Xem ví dụ chạy được tại [`../Example/jwt-authentication.js`](../Example/jwt-authentication.js).

## 6. Lưu trữ, hết hạn và thu hồi token

- Access token là bearer token: ai sở hữu token có thể sử dụng nó, vì vậy luôn dùng HTTPS và không log token.
- Đặt `exp` ngắn, ví dụ 15 phút. Token ngắn hạn giảm thời gian bị lạm dụng nếu lộ.
- Cách lưu token trong trình duyệt có đánh đổi: token cho JavaScript đọc được có rủi ro XSS; cookie `HttpOnly`, `Secure`, `SameSite` giảm rủi ro đọc token nhưng cần biện pháp chống CSRF. Chọn theo kiến trúc ứng dụng.
- Logout không tự làm JWT vô hiệu. Để thu hồi sớm, có thể dùng session/token version, deny-list theo `jti`, hoặc refresh token có rotation và trạng thái ở server. Các cơ chế này cần thiết kế và lưu trữ phía server.

Không trả nguyên lỗi nội bộ của thư viện cho client. Với token không hợp lệ, một thông báo chung như `Invalid or expired access token` thường an toàn hơn.

## 7. Những hiểu nhầm thường gặp

| Hiểu nhầm | Cách hiểu đúng |
| --- | --- |
| JWT tự mã hóa payload. | JWT ký thông thường không mã hóa payload; không đặt bí mật vào đó. |
| `jwt.decode()` đủ để đăng nhập. | Phải dùng `jwt.verify()` hoặc cơ chế xác minh chữ ký tương đương. |
| Token hợp lệ là đủ quyền cho mọi API. | Cần kiểm tra authorization: role, ownership, policy, ... |
| Logout tự thu hồi JWT. | JWT vẫn hợp lệ đến khi hết hạn nếu không có cơ chế thu hồi. |
| Chỉ cần `exp`. | Cần kiểm tra chữ ký, thuật toán, và khi phù hợp là `iss`/`aud`. |

## 8. Câu hỏi ôn tập

### 1. JWT có che giấu nội dung payload không?

Không. JWT ký thông thường chỉ Base64URL-encode header và payload; chữ ký chống sửa đổi chứ không mã hóa nội dung. Không đưa dữ liệu nhạy cảm vào payload.

### 2. `jwt.verify()` khác `jwt.decode()` thế nào?

`jwt.verify()` kiểm tra chữ ký, thời hạn và các điều kiện đã cấu hình; nó có thể ném lỗi khi token không hợp lệ. `jwt.decode()` chỉ đọc nội dung token nên không được dùng cho xác thực hoặc phân quyền.

### 3. Khi nào trả 401, khi nào trả 403?

Trả `401` khi request chưa được xác thực: thiếu token, token sai hoặc hết hạn. Trả `403` khi token hợp lệ nhưng người dùng không có quyền đối với hành động/tài nguyên đó.

### 4. Vì sao access token nên có thời hạn ngắn?

Nếu token bị lộ, kẻ khác có thể dùng nó như người sở hữu. Thời hạn ngắn giới hạn khoảng thời gian lạm dụng; khi cần phiên dài hơn, dùng refresh-token flow được thiết kế cẩn thận.

### 5. Vì sao logout không tự vô hiệu hóa JWT?

Server có thể xác minh JWT chỉ bằng chữ ký và claim, nên không cần hỏi trạng thái đăng nhập. Vì vậy token đã phát hành vẫn hợp lệ đến `exp`. Muốn thu hồi sớm phải bổ sung trạng thái phía server, ví dụ token version, deny-list theo `jti` hoặc refresh-token rotation.
