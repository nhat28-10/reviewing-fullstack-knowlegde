# NestJS: Request Lifecycle

## Mục lục

- [Request Lifecycle là gì?](#1-request-lifecycle-trong-nestjs-là-gì)
- [Thứ tự Request Lifecycle](#2-thứ-tự-request-lifecycle)
- [Ví dụ GET /users/:id](#3-ví-dụ-nestjs-thực-tế--get-usersid)
- [Khi có lỗi](#4-nếu-xảy-ra-lỗi-thì-sao)
- [Thứ tự Global → Controller → Route](#5-thứ-tự-global--controller--route)
- [Các hiểu nhầm thường gặp](#6-những-hiểu-nhầm-thường-gặp)
- [Câu hỏi ôn tập](#7-kiến-thức-ôn-tập)

## 16. Request Lifecycle của NestJS

### 1. Request Lifecycle trong NestJS là gì?

- Request Lifecycle là trình tự các bước mà NestJS thực hiện để xử lý một HTTP request và tạo ra response cho client.
- Giả sử client gửi request:

```http
GET /users/10
Authorization: Bearer <access_token>
```

- Hệ thống cần thực hiện logging, xác thực JWT, kiểm tra dữ liệu đầu vào, truy vấn PostgreSQL thông qua Prisma và trả response.
- NestJS có một thứ tự xử lý cụ thể để thực hiện các công việc này.

### 2. Thứ tự Request Lifecycle

![alt text](./Image/HttpRequestFlow2.png)

- Bạn chỉ cần nhớ công thức: Request → Middleware → Guard → Interceptor (Before) → Pipe → Controller → Service → Interceptor (After) → Response.
- Đây cũng là thứ tự được mô tả trong tài liệu chính thức của NestJS.
- Vai trò của từng thành phần:

| Thành phần | Vai trò |
| --- | --- |
| Middleware | Xử lý request chung, logging |
| Guard | Kiểm tra request có được phép truy cập |
| Interceptor (Before) | Thực hiện logic trước handler |
| Pipe | Validate hoặc transform dữ liệu |
| Controller | Nhận request và gọi nghiệp vụ |
| Service | Xử lý nghiệp vụ, có thể truy vấn DB |
| Interceptor (After) | Biến đổi response hoặc logging |
| Response | Trả kết quả về client |
- Lưu ý: Service không phải là một bước bắt buộc do framework tự chèn vào. Nó được gọi khi Controller hoặc một thành phần khác sử dụng Service.

### 3. Ví dụ NestJS thực tế — GET /users/:id

- Giả sử chúng ta có API:

```http
GET /users/10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

- Chúng ta sử dụng bốn thành phần đã học.

**Middleware - Logging Request**

```ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log("1. Middleware");

    next();
  }
}
```

- Middleware này đã được giả định là đăng ký cho route /users/:id.

**Guard - Xác thực request**

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    console.log("2. Guard");

    return true;
  }
}
```

- Ở đây, Guard trả về true chỉ nhằm minh họa thứ tự chạy. Trong thực tế, bạn sẽ xác minh JWT chứ không cho phép toàn bộ request như vậy.

**Interceptor - Logging trước và sau**

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    console.log("3. Interceptor Before");

    return next.handle().pipe(tap(() => console.log("6. Interceptor After")));
  }
}
```

**Controller - Pipe và Service**

```ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(LoggingInterceptor)
  findOne(@Param("id", ParseIntPipe) id: number) {
    console.log("4. Controller");

    return this.usersService.findOne(id);
  }
}
```

**Service**

```tsx
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    console.log("5. Service");

    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
```

- ParseIntPipe chạy trước Controller, nhưng chúng ta không thêm log vào nó.

**Kết quả console**

- Giả sử request hợp lệ, Middleware đã được đăng ký và Prisma truy vấn thành công:

```text
1. Middleware
2. Guard
3. Interceptor Before
4. Controller
5. Service
6. Interceptor After
```

- Điểm đáng chú ý là Interceptor Before chạy trước Controller, còn Interceptor After chạy sau khi handler đã trả về kết quả.

### 4. Nếu xảy ra lỗi thì sao?

- Giả sử client gửi:

```http
GET /users/abc
```

- Trong Controller có:

```ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);
}
```

- ParseIntPipe cố chuyển "abc" thành number nhưng thất bại.
- Kết quả:
  - Middleware đã chạy
  - Guard đã cho phép request
  - Interceptor Before đã chạy, nếu có
  - ParseIntPipe ném BadRequestException
  - Controller và Service không được thực thi
  - Exception Filter phù hợp xử lý exception và trả HTTP 400
- Quan trọng: Exception Filter không phải một bước luôn chạy sau Controller. Nó xử lý những exception chưa được bắt khi xảy ra lỗi.
  ![alt text](./Image/FlowWhenExceptionInPipe.png)
- Lưu ý: Nếu dùng tap(() => console.log('After')), callback này không chạy khi Observable kết thúc bằng lỗi trước khi phát ra giá trị thành công. Muốn log khi luồng kết thúc kể cả có lỗi, có thể dùng finalize().

### 5. Thứ tự Global → Controller → Route

- Đây là phần mở rộng nhỏ nhưng rất hữu ích khi debug API.
- Giả sử bạn khai báo Guard ở ba cấp:
  - Global Guard
  - Controller Guard
  - Route Guard
- Thứ tự chạy thông thường sẽ là:

```text
Global Guard
    ↓
Controller Guard
    ↓
Route Guard
    ↓
Interceptor
```

- Đối với Interceptor, chiều request chạy theo thứ tự Global → Controller → Route, nhưng chiều response đi ngược lại: Route → Controller → Global.
- Còn Exception Filter sẽ ưu tiên Filter tại Route, rồi Controller, rồi Global nếu chưa có Filter phù hợp xử lý lỗi. Exception đã được một Filter xử lý sẽ không tự động chuyển tiếp qua các Filter khác.

### 6. Những hiểu nhầm thường gặp

| Hiểu nhầm | Kiến thức đúng |
| --- | --- |
| Guard chạy trước Middleware | Middleware chạy trước Guard |
| Pipe chạy trước Guard | Guard chạy trước Pipe |
| Controller luôn được thực thi | Guard hoặc Pipe có thể chặn request |
| Interceptor chỉ chạy trước Controller | Có thể xử lý trước và sau |
| Exception Filter luôn chạy | Chỉ xử lý exception chưa được bắt |
| Service là bước bắt buộc của NestJS | Controller gọi Service khi cần |

- Ghi nhớ cốt lõi: Hiểu Request Lifecycle sẽ giúp bạn biết phải đặt logic ở đâu và xác định tại sao một API bị từ chối hoặc gặp lỗi trước khi vào Controller.

### 7. Kiến thức ôn tập

1. Request lifecycle là gì trong NestJS?
   - Là trình tự các bước NestJS thực hiện để xử lý request và trả response.
2. Thứ tự thực thi của Middleware, Guard, Interceptor và Pipe là gì?
   - Middleware → Guard → Interceptor (before) → Pipe → Controller → Service → Interceptor (after).
3. Liệu Guard có chạy trước Pipe không?
   - Có. Guard chạy trước Pipe và có thể chặn request trước Controller.
4. Điều gì sẽ xảy ra khi Pipe ném 1 exception?
   - Controller không được thực thi; exception chưa được bắt sẽ được chuyển tới Exception Filter phù hợp.
5. Interceptors hoạt động như thế nào trong request lifecycle?
   - Có thể thực thi logic trước/sau route handler và thay đổi response.

## Thực hành

Xem [Request Lifecycle Example](../Example/request-lifecycle-example.ts). Ví dụ ghi rõ từng bước khi gọi `GET /users/1`: Middleware → Guard → Interceptor before → Pipe → Controller → Service → Interceptor after. Khi gọi `GET /users/abc`, Pipe ném lỗi và Exception Filter trả response lỗi trước khi Controller/Service chạy.
