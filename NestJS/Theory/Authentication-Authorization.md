# NestJS: Guard — Authentication và Authorization

## Mục lục

- [Guard là gì?](#1-guard-trong-nestjs-là-gì)
- [Guard hoạt động thế nào?](#2-guard-hoạt-động-như-thế-nào)
- [Authentication và Authorization](#3-authentication-vs-authorization)
- [JWT Authentication Guard](#4-ví-dụ-thực-tế-jwt-authentication-guard)
- [Role-based Authorization Guard](#5-ví-dụ-thực-tế-role-based-authorization-guard)
- [Các hiểu nhầm thường gặp](#6-những-lỗi-và-hiểu-nhầm-thường-gặp)
- [Câu hỏi ôn tập](#7-câu-hỏi-ôn-tập)

## 11. Guard: Authentication và Authorization

### 1. Guard trong NestJS là gì?

- Guard là cơ chế NestJS dùng để quyết định request có được phép tiếp tục đến route handler hay không. Ví dụ, hệ thống có ba API:

```http
POST /auth/login
GET  /users/profile
DELETE /users/:id
```

    - /auth/login: Có thể truy cập mà không cần đăng nhập.
    - /users/profile: Phải đăng nhập mới được truy cập.
    - DELETE /users/:id: Chỉ ADMIN mới được thực hiện.

- Guard kiểm tra các điều kiện đó trước khi Controller xử lý request. Thực tế request lifecycle còn có Middleware, Interceptor và Pipe.

### 2. Guard hoạt động như thế nào?

- Trong NestJS, một Guard thường:
  - Được khai báo với @Injectable().
  - Implement interface CanActivate.
  - Chứa phương thức canActivate(context: ExecutionContext).
  - Trả về boolean, Promise<boolean> hoặc Observable<boolean>.
- Ví dụ

```ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class SimpleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
```

| Giá trị | Ý nghĩa |
| --- | --- |
| `true` | Cho phép request tiếp tục. |
| `false` | Từ chối request, mặc định HTTP 403. |
| `throw new UnauthorizedException()` | Trả về HTTP 401. |
| `throw new ForbiddenException()` | Trả về HTTP 403. |

- ExecutionContext giúp Guard truy cập thông tin request và handler hiện tại. Với HTTP API, ta thường sử dụng:

```tsx
const request = context.switchToHttp().getRequest();
```

- Từ đó có thể lấy request.headers, request.user hoặc các thông tin khác để kiểm tra.

### 3. Authentication vs Authorization

![alt text](./Image/Authentication-Authorization.png)

- Giả sử hệ thống có hai role:

```tsx
enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}
```

- Một USER đã đăng nhập hợp lệ nhưng muốn truy cập API dành riêng cho ADMIN. Khi đó authentication thành công, nhưng authorization thất bại vì không có quyền ADMIN; kết quả thường là HTTP 403 Forbidden.
- Điểm cần nhớ: Đăng nhập thành công không đồng nghĩa với có quyền truy cập tất cả API.

### 4. Ví dụ thực tế: JWT Authentication Guard

- Giả sử bạn đang xây dựng hệ thống quản lý gia đình với NestJS, Prisma và PostgreSQL. Bạn muốn API /users/profile chỉ cho phép người dùng đã đăng nhập truy cập.
- Ta sẽ xây dựng một Guard xác thực JWT.

**jwt-auth.guard.ts**

```tsx
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing token");
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
```

- Đây là ví dụ rút gọn, giả định JwtService và JWT secret đã được cấu hình đúng trong NestJS module.
- Giải thích luồng hoạt động:
  1. Guard lấy JWT từ header Authorization: Bearer <token>.
  2. JwtService.verifyAsync() xác minh chữ ký và các điều kiện của token, ví dụ thời hạn hết hạn.
  3. Nếu hợp lệ, payload được gắn vào request.user.
  4. Guard trả về true, request được đi tiếp.
  5. Nếu thiếu hoặc token không hợp lệ, trả về 401.
- Tiếp theo, áp dụng Guard trong Controller.

**users.controller.ts**

```tsx
import { Controller, Get, Req, UseGuards } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
}
```

- Khi client gửi:

```http
GET /users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

- Nếu JWT hợp lệ thì Controller có thể truy cập req.user.
- Lưu ý thực tế: Payload JWT không nhất thiết phản ánh trạng thái tài khoản mới nhất. Với hệ thống thực tế, bạn có thể cần kiểm tra thêm tài khoản có bị khóa, bị xóa hoặc token có bị thu hồi hay không. Cũng không nên trả nguyên payload có dữ liệu nhạy cảm ra client.

### 5. Ví dụ thực tế: Role-based Authorization Guard

- Bây giờ ta muốn API xóa người dùng chỉ cho ADMIN sử dụng. Giả sử JwtAuthGuard đã xác thực và gắn thông tin user vào request.

**roles.guard.ts**

```tsx
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    return request.user?.role === "ADMIN";
  }
}
```

- Áp dụng vào Controller:

```tsx
@Controller("users")
export class UsersController {
  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUser(id);
  }
}
```

- Ở đây:
  - JwtAuthGuard kiểm tra JWT.
  - RolesGuard kiểm tra role có phải ADMIN.
  - Nếu một Guard từ chối thì request không được đi tiếp đến handler.
- Ví dụ kết quả:

| Tình huống | Kết quả |
| --- | --- |
| Không có token | 401 Unauthorized |
| Token không hợp lệ | 401 Unauthorized |
| JWT hợp lệ, role USER | 403 Forbidden |
| JWT hợp lệ, role ADMIN | Cho phép gọi Service |
- Điểm quan trọng: RolesGuard trong ví dụ này chỉ phục vụ một route yêu cầu ADMIN. Nếu muốn tái sử dụng cho nhiều role khác nhau, có thể dùng custom decorator @Roles() kết hợp Reflector.

### 6. Những lỗi và hiểu nhầm thường gặp

| Hiểu nhầm | Giải thích đúng |
| --- | --- |
| Guard chỉ dùng để kiểm tra JWT | Guard cũng có thể kiểm tra role, permission và điều kiện truy cập. |
| Authentication và Authorization giống nhau | Một bên xác thực danh tính, bên kia kiểm tra quyền. |
| Guard trả `false` sẽ có lỗi 401 | Mặc định NestJS trả HTTP 403 khi Guard trả `false`. |
| Có JWT hợp lệ thì luôn được truy cập | Cần kiểm tra quyền và điều kiện nghiệp vụ. |
| Chỉ cần ẩn nút ADMIN ở frontend | Backend vẫn phải tự kiểm tra quyền. |
| Có thể tin role do client tự gửi lên | Phải dựa trên thông tin backend đã xác thực và chính sách phân quyền. |

### 7. Câu hỏi ôn tập

1. Guard là gì trong NestJS?
   - Guard xác định request có được phép truy cập route handler hay không.
2. Sự khác nhau giữa Authentication và Authorization là gì?
   - Authentication xác thực người dùng là ai, còn Authorization kiểm tra người đó được làm gì.
3. Mục đích của `canActivate()` là gì?
   - Nó kiểm tra request có được phép hay không; trả `true` để cho phép, `false` để từ chối.
4. Làm thế nào để bạn áp dụng Guard vào route cụ thể?
   - Sử dụng `@UseGuards()` decorator trên controller hoặc xử lý route
5. Làm thế nào 1 guard truy cập HTTP request?
   - Nó dùng `ExecutionContext` và `switchToHttp().getRequest()` để truy cập request.

## Thực hành

Xem [Authentication–Authorization Example](../Example/authentication-authorization-example.ts). File này có endpoint login ký JWT, `JwtAuthGuard` cho route profile và `RolesGuard` + `@Roles('ADMIN')` cho route xóa user. Ví dụ chỉ dùng secret và user trong bộ nhớ để học luồng; dự án thật phải dùng secret từ biến môi trường, password hash và kiểm tra trạng thái tài khoản.
