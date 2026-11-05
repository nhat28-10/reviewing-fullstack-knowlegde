# REST API & HTTP: GET, POST, PUT, PATCH, DELETE

## Mục lục

- [HTTP method là gì?](#http-method-là-gì)
- [GET - Lấy dữ liệu](#get---lấy-dữ-liệu)
- [POST - Gửi dữ liệu, thường dùng để tạo mới](#post---gửi-dữ-liệu-thường-dùng-để-tạo-mới)
- [PUT - Thay thế resource](#put---thay-thế-resource)
- [PATCH - Cập nhật một phần resource](#patch---cập-nhật-một-phần-resource)
- [DELETE - Xóa resource](#delete---xóa-resource)
- [Ví dụ với NestJS](#ví-dụ-với-nestjs)
- [Status code thường gặp](#status-code-thường-gặp)
- [Safe và idempotent](#safe-và-idempotent)
- [Những lỗi thường gặp](#những-lỗi-thường-gặp)
- [Thực hành](#thực-hành)
- [Câu hỏi ôn tập](#câu-hỏi-ôn-tập)

## HTTP method là gì?

HTTP method là thành phần của HTTP request, dùng để thể hiện ý định mà client muốn thực hiện đối với resource trên server.

| Method | Mục đích thường dùng | Ví dụ |
| --- | --- | --- |
| `GET` | Lấy dữ liệu | Lấy danh sách users |
| `POST` | Gửi dữ liệu để xử lý, thường là tạo mới | Tạo user |
| `PUT` | Thay thế trạng thái resource | Thay thế thông tin user |
| `PATCH` | Cập nhật một phần resource | Đổi tên user |
| `DELETE` | Xóa resource | Xóa user |

![Minh họa các HTTP method](./img/HTTPMethod.png)

Đây không phải toàn bộ HTTP methods. HTTP còn có `HEAD`, `OPTIONS`, `CONNECT` và `TRACE`; bài này tập trung vào năm method thường gặp trong REST API.

## GET - Lấy dữ liệu

`GET` yêu cầu server trả về representation của một resource:

```http
GET /api/v1/users
```

Request trên lấy danh sách users. Để lấy user có ID `10`:

```http
GET /api/v1/users/10
```

Ví dụ response:

```json
{
  "id": 10,
  "name": "Nhat",
  "email": "nhat@example.com"
}
```

Đặc điểm quan trọng:

- `GET` dùng để đọc dữ liệu và là một **safe method**: ý định của client không làm thay đổi trạng thái resource.
- Không dùng `GET` để tạo, sửa hoặc xóa dữ liệu.
- Request `GET` không nên dựa vào body vì body của `GET` không có ngữ nghĩa được định nghĩa chung và một số client/proxy có thể không hỗ trợ.
- Dữ liệu lọc, tìm kiếm, sắp xếp và phân trang thường được truyền qua query string, ví dụ `GET /users?page=2&limit=10`.
- `GET` có thể phát sinh logging hoặc thống kê nội bộ, nhưng hành động mà client yêu cầu vẫn phải mang tính chỉ đọc.

## POST - Gửi dữ liệu, thường dùng để tạo mới

`POST` thường được dùng để tạo resource mới trong một collection:

```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "Nhat",
  "email": "nhat@example.com"
}
```

Khi tạo thành công, server thường trả `201 Created` cùng resource mới:

```http
HTTP/1.1 201 Created
Location: /api/v1/users/11
Content-Type: application/json

{
  "id": 11,
  "name": "Nhat",
  "email": "nhat@example.com"
}
```

`POST` không chỉ dùng để tạo resource. Nó còn phù hợp với thao tác xử lý hoặc business action, ví dụ:

```http
POST /api/v1/auth/login
POST /api/v1/orders/15/cancel
```

`POST` không được HTTP đảm bảo là idempotent. Gửi lặp lại cùng một request tạo user có thể tạo nhiều users nếu API không có cơ chế chống trùng.

## PUT - Thay thế resource

`PUT` yêu cầu thay thế trạng thái của resource tại URI đích. Giả sử user hiện tại là:

```json
{
  "id": 10,
  "name": "Nhat",
  "email": "old@example.com"
}
```

Client gửi đầy đủ các trường có thể cập nhật:

```http
PUT /api/v1/users/10
Content-Type: application/json

{
  "name": "Minh Nhat",
  "email": "new@example.com"
}
```

Server thay thế trạng thái được quản lý bằng representation mới. Client không nhất thiết gửi các trường do server quản lý như `id`, `createdAt` hoặc `updatedAt`.

> Cách xử lý trường bị thiếu phải được API contract quy định rõ. API có thể từ chối request bằng `400 Bad Request`; không nên âm thầm coi `PUT` có body thiếu trường giống hệt `PATCH`.

`PUT` là idempotent: gửi lặp lại cùng một request phải hướng đến cùng trạng thái cuối của resource.

## PATCH - Cập nhật một phần resource

`PATCH` được dùng khi client chỉ muốn thay đổi một phần resource. Với user ở ví dụ trên, client có thể chỉ đổi tên:

```http
PATCH /api/v1/users/10
Content-Type: application/json

{
  "name": "Minh Nhat"
}
```

Kết quả:

```json
{
  "id": 10,
  "name": "Minh Nhat",
  "email": "old@example.com"
}
```

Trường `email` không bị thay đổi. API cần quy định định dạng patch đang dùng. Body object đơn giản trong bài là cách cập nhật một phần do API tự định nghĩa; các định dạng chuẩn thường gặp gồm JSON Merge Patch (`application/merge-patch+json`) và JSON Patch (`application/json-patch+json`).

Khác với `PUT`, `PATCH` không được HTTP đảm bảo là idempotent. Một patch “đặt tên thành Minh Nhat” có thể idempotent, còn patch “tăng điểm thêm 1” thì không.

### So sánh PUT và PATCH

| Tiêu chí | `PUT` | `PATCH` |
| --- | --- | --- |
| Ý nghĩa | Thay thế trạng thái resource | Áp dụng thay đổi một phần |
| Body thường dùng | Đầy đủ các trường client được phép thay thế | Chỉ các thay đổi cần áp dụng |
| Trường không gửi | Xử lý theo contract; không mặc định được giữ nguyên | Thường được giữ nguyên |
| Idempotent | Có | Không được đảm bảo |

## DELETE - Xóa resource

`DELETE` yêu cầu server xóa resource được nhận diện bởi URI:

```http
DELETE /api/v1/users/10
```

Server thực hiện xóa theo quy tắc nghiệp vụ. `DELETE` không bắt buộc phải xóa vật lý bản ghi trong database; backend có thể soft delete bằng cách cập nhật `deletedAt`, miễn resource được xem là đã xóa theo API contract.

`DELETE` là idempotent về hiệu ứng mong muốn: gọi nhiều lần vẫn hướng tới trạng thái user `10` không còn tồn tại. Response có thể khác nhau, chẳng hạn lần đầu trả `204 No Content`, lần tiếp theo trả `404 Not Found`.

Trong NestJS:

```ts
@Delete(":id")
remove(@Param("id") id: string) {
  return this.usersService.remove(id);
}
```

## Ví dụ với NestJS

Đoạn code sau minh họa controller và giả định các DTO cùng `UsersService` đã được khai báo:

```ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(":id")
  replace(@Param("id") id: string, @Body() dto: ReplaceUserDto) {
    return this.usersService.replace(id, dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
```

Service có thể dùng Prisma để thao tác với PostgreSQL. Cùng một resource URI như `/users/10` hỗ trợ nhiều HTTP methods; server chọn handler dựa trên cả method và đường dẫn.

## Status code thường gặp

| Status code | Khi dùng |
| --- | --- |
| `200 OK` | Đọc/cập nhật thành công và có response body |
| `201 Created` | Tạo resource thành công |
| `204 No Content` | Thành công và không có response body, thường dùng cho `DELETE` |
| `400 Bad Request` | Body hoặc tham số không đúng API contract |
| `404 Not Found` | Không tìm thấy resource |
| `405 Method Not Allowed` | URI tồn tại nhưng không hỗ trợ method được gửi |
| `409 Conflict` | Request xung đột với trạng thái hiện tại, ví dụ email bị trùng |

Response `204 No Content` không được chứa body. Khi tạo resource bằng `POST`, server nên cân nhắc gửi header `Location` trỏ tới URI của resource mới.

## Safe và idempotent

| Method | Safe | Idempotent | Giải thích ngắn |
| --- | --- | --- | --- |
| `GET` | Có | Có | Chỉ đọc; gọi lặp lại không yêu cầu thay đổi state |
| `POST` | Không | Không được đảm bảo | Mỗi request có thể tạo resource hoặc hiệu ứng mới |
| `PUT` | Không | Có | Cùng representation hướng đến cùng trạng thái cuối |
| `PATCH` | Không | Không được đảm bảo | Phụ thuộc nội dung patch và cách triển khai |
| `DELETE` | Không | Có | Gọi lặp lại vẫn hướng đến trạng thái resource đã bị xóa |

**Safe** nói về ý định không làm thay đổi trạng thái resource. **Idempotent** nghĩa là gửi nhiều lần cùng một request có hiệu ứng mong muốn trên server giống gửi một lần. Idempotent không có nghĩa response của mọi lần gọi phải giống nhau.

## Những lỗi thường gặp

| Lỗi hoặc hiểu nhầm | Vì sao không phù hợp? |
| --- | --- |
| `GET /deleteUser/10` | `GET` không nên xóa resource |
| `POST /getUsers` | Thao tác chỉ đọc collection thông thường nên dùng `GET` |
| Dùng `PUT` nhưng chỉ gửi một trường và mặc nhiên giữ các trường khác | Làm mờ ngữ nghĩa thay thế; nên dùng `PATCH` hoặc quy định contract thật rõ |
| Dùng `GET` để tạo user | `GET` là safe method và có thể bị cache/prefetch |
| `POST` luôn chỉ để tạo mới | `POST` còn dùng để gửi dữ liệu cho một action hoặc quá trình xử lý |
| `DELETE` bắt buộc xóa vật lý | Soft delete vẫn phù hợp nếu đúng API contract |
| `PATCH` luôn idempotent | HTTP không đảm bảo tính idempotent cho mọi patch |
| Trả JSON kèm `204` | `204 No Content` không được có response body |

## Thực hành

Chạy [ví dụ GET, POST, PUT, PATCH và DELETE](../Example/http-methods-example.js). Ví dụ dùng Node.js có sẵn và dữ liệu trong bộ nhớ, minh họa đủ năm methods, validation cơ bản, status code, header `Location` và sự khác nhau giữa `PUT` với `PATCH`.

## Câu hỏi ôn tập

1. **Những HTTP methods nào thường gặp trong REST API?**
   `GET`, `POST`, `PUT`, `PATCH` và `DELETE` thường tương ứng với đọc, tạo/gửi xử lý, thay thế, cập nhật một phần và xóa resource.

2. **Mục đích của GET là gì?**
   `GET` yêu cầu representation của resource và không nên yêu cầu thay đổi trạng thái resource.

3. **Khi nào nên sử dụng POST?**
   Khi tạo resource trong collection hoặc gửi dữ liệu để server thực hiện một action/quá trình xử lý.

4. **PUT và PATCH khác nhau thế nào?**
   `PUT` thay thế trạng thái resource và có tính idempotent; `PATCH` áp dụng thay đổi một phần và không được đảm bảo idempotent.

5. **DELETE có bắt buộc xóa bản ghi khỏi database không?**
   Không. Server có thể soft delete miễn resource được xem là đã xóa theo API contract.

6. **Idempotent có nghĩa mọi response phải giống nhau không?**
   Không. Nó nói về hiệu ứng mong muốn trên trạng thái server, không bắt buộc status code hoặc response body của mỗi lần gọi giống nhau.
