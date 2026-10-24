# ExpressJS: Authentication Middleware

## Mục lục

- [Authentication middleware là gì?](#authentication-middleware-là-gì)
- [Authentication và authorization](#authentication-và-authorization)
- [JWT authentication flow](#jwt-authentication-flow)
- [Viết middleware với JWT](#viết-middleware-với-jwt)
- [Vì sao dùng `req.user`?](#vì-sao-dùng-requser)
- [Lưu ý bảo mật](#lưu-ý-bảo-mật)
- [Các lỗi thường gặp](#các-lỗi-thường-gặp)
- [Câu hỏi ôn tập](#câu-hỏi-ôn-tập)

## Authentication middleware là gì?

Authentication middleware xác minh **danh tính** của client trước khi request được đi tiếp đến controller. Các endpoint công khai như `POST /auth/login` không cần token; endpoint bảo vệ như `GET /users/me` hoặc `GET /families` cần client đã đăng nhập.

![Luồng authentication middleware](./Image/authenticatiomiddleware.png)

Khi endpoint yêu cầu authentication, backend thường:

1. Lấy access token từ `Authorization` header.
2. Xác minh chữ ký và các claims của token.
3. Gắn danh tính đã xác minh vào `req.user`.
4. Gọi `next()` để controller tiếp tục xử lý; hoặc trả lỗi nếu token không hợp lệ.

## Authentication và authorization

| Khái niệm | Câu hỏi trả lời | Ví dụ |
| --- | --- | --- |
| **Authentication** | Bạn là ai? Bạn đã đăng nhập/xác thực chưa? | Token hợp lệ xác định client là user `123`. |
| **Authorization** | Bạn có được phép làm việc này không? | User `123` có quyền xoá user khác không? |

Authentication thành công không đồng nghĩa với có mọi quyền. Một user có thể đã đăng nhập nhưng không được phép truy cập admin dashboard.

| Status | Ý nghĩa thường dùng trong API |
| --- | --- |
| `401 Unauthorized` | Thiếu, sai hoặc hết hạn credential/token. Dù reason phrase là “Unauthorized”, trong thực tế API nó thường biểu thị **chưa được xác thực**. |
| `403 Forbidden` | Client đã được xác thực nhưng không có quyền trên resource/action này. |

## JWT authentication flow

JWT (JSON Web Token) là token chứa claims được **ký**. Ký giúp server phát hiện token bị sửa; JWT thông thường không tự mã hoá payload, vì vậy không đặt password, access token khác hoặc dữ liệu nhạy cảm vào payload.

Ví dụ flow cơ bản:

1. Client gửi credential đến `POST /auth/login`.
2. Server kiểm tra credential và ký access token ngắn hạn, ví dụ với `sub` là user ID.
3. Client gửi token trong header: `Authorization: Bearer <token>`.
4. Authentication middleware dùng secret/public key để verify token.
5. Middleware gắn thông tin đã xác minh vào `req.user`, sau đó controller sử dụng danh tính này.

Ví dụ request:

```http
GET /api/v1/users/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

> Trong production, chỉ truyền bearer token qua HTTPS. Access token nên có thời hạn ngắn; cơ chế logout/revoke và refresh token cần được thiết kế riêng theo yêu cầu hệ thống.

## Viết middleware với JWT

Cài thư viện:

```bash
npm install jsonwebtoken
```

Middleware sau giả định token dùng `HS256`, có `sub`, `issuer` và `audience` đã được quy ước trong hệ thống.

```js
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authorization = req.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: "learning-express-api",
      audience: "learning-express-client",
    });

    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
```

| Code | Ý nghĩa |
| --- | --- |
| `req.get("Authorization")` | Lấy Authorization header. |
| `startsWith("Bearer ")` | Kiểm tra Bearer token scheme. |
| `jwt.verify()` | Xác minh chữ ký và kiểm tra các claims đã cấu hình, bao gồm `exp` nếu token có claim này. |
| `algorithms: ["HS256"]` | Chỉ chấp nhận thuật toán đã được hệ thống chọn. |
| `req.user = ...` | Gắn danh tính đã xác minh để middleware/controller phía sau sử dụng. |
| `next()` | Cho phép request tiếp tục đến handler kế tiếp. |

Gắn middleware vào protected route:

```js
app.get("/api/v1/users/me", authenticate, (req, res) => {
  return res.status(200).json({
    message: "Authenticated successfully",
    userId: req.user.id,
  });
});
```

`jwt.decode()` chỉ đọc payload và **không xác minh chữ ký**. Nó không đủ để xác thực người dùng.

## Vì sao dùng `req.user`?

Sau khi token đã được xác minh, middleware lưu identity vào `req.user` để các handler sau dùng lại mà không phải verify token lần nữa.

```js
async function getProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
}
```

Controller nên dùng danh tính từ token đã xác minh, không tin `userId` do client gửi trong body để đại diện cho “người đang đăng nhập”.

## Lưu ý bảo mật

- Dùng `jwt.verify()`, không dùng `jwt.decode()` cho authentication.
- Giới hạn thuật toán được chấp nhận khi verify; không để header token quyết định thuật toán.
- Secret/key phải lấy từ environment hoặc secret manager, không hard-code vào source code hay commit lên Git.
- Kiểm tra các claims phù hợp với hệ thống, ví dụ `exp`, `iss`, `aud`.
- Dùng HTTPS để token không bị đọc trên đường truyền.
- Không log toàn bộ `Authorization` header hoặc JWT; token có thể bị lộ qua logs.
- Validate dữ liệu trong payload trước khi sử dụng. Payload hợp lệ về chữ ký không tự đảm bảo rằng mọi claim đều có kiểu/giá trị bạn mong đợi.

## Các lỗi thường gặp

| Hiểu nhầm | Cách hiểu đúng |
| --- | --- |
| Chỉ cần `jwt.decode()` để xác thực | Sai. Cần verify chữ ký token. |
| Có JWT thì mọi request hợp lệ | Sai. Token có thể hết hạn, sai issuer/audience hoặc không hợp lệ. |
| Authentication thành công là có mọi quyền | Sai. Authorization vẫn cần kiểm tra quyền. |
| Token hợp lệ thì không cần `next()` | Sai. Cần gọi `next()` để controller được thực thi. |
| Client gửi `userId` nào thì tin user đó | Sai. Dùng identity lấy từ token đã verify. |
| JWT payload luôn bí mật | Sai. JWT ký không đồng nghĩa JWT được mã hoá. |

## Câu hỏi ôn tập

1. **Authentication middleware là gì?**  
   Là middleware xác minh danh tính client trước khi cho phép vào protected route.

2. **JWT middleware hoạt động ra sao?**  
   Nó lấy Bearer token, verify chữ ký/claims, gắn identity vào `req.user` rồi gọi `next()` nếu token hợp lệ.

3. **Token hết hạn hoặc không hợp lệ thì sao?**  
   Middleware trả `401` và controller không chạy.

4. **Vì sao dùng `req.user`?**  
   Để các middleware/controller sau truy cập identity đã được xác minh một cách nhất quán.

5. **Authentication khác authorization thế nào?**  
   Authentication xác minh bạn là ai; authorization quyết định bạn được làm gì.

## Thực hành

Xem file chạy được có endpoint login tạo token và route `/me` được bảo vệ tại [Authentication Middleware Example](../Example/authentication-middleware-example.js).

## Tham khảo

- [jsonwebtoken: sign and verify](https://github.com/auth0/node-jsonwebtoken/blob/master/README.md)
- [RFC 8725: JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
