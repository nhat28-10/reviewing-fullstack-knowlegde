# NestJS: @Controller và Route Decorators

## Mục lục

- [@Controller là gì?](#1-controller-là-gì-trong-nestjs)
- [Route decorators](#2-route-decorators-là-gì)
- [Kết hợp prefix và method path](#3-cách-nestjs-kết-hợp-controller-prefix-và-method)
- [Ví dụ Products API](#4-ví-dụ-thực-tế-với-nestjs--typescript)
- [So sánh với ExpressJS](#5-so-sánh-controller-trong-expressjs-và-nestjs)
- [Các lỗi thường gặp](#6-những-lỗi-và-hiểu-nhầm-thường-gặp)
- [Câu hỏi ôn tập](#7-câu-hỏi-ôn-tập)

## 3. @Controller và các Route Decorators

### 1. @Controller là gì trong NestJS?

- Trong NestJS, @Controller() là một decorator dùng để xác định một class chịu trách nhiệm xử lý các HTTP request từ client. Nhiệm vụ chính của Controller là:
  - Tiếp nhận HTTP request.
  - Xác định endpoint tương ứng.
  - Gọi Service để thực hiện nghiệp vụ.
  - Trả kết quả về client.
- Ví dụ ta có

```ts
import { Controller, Get } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return [
      { id: 1, name: "Nhat" },
      { id: 2, name: "Minh" },
    ];
  }
}
```

- Khi client gửi:

```http
GET /users
```

- NestJS sẽ gọi method findAll() và trả về danh sách user. Bạn cần hiểu hai decorator:
  - @Controller('users'): Xác định route prefix của Controller là /users.
  - @Get(): Đánh dấu method `findAll()` để xử lý HTTP `GET` với đường dẫn tương đối rỗng.
- Điểm quan trọng: Bản thân tên method findAll không quyết định HTTP endpoint. NestJS sử dụng metadata từ các decorator để xác định request nào sẽ gọi method nào

### 2. Route Decorators là gì?

- Route Decorators là các decorator dùng để ánh xạ HTTP method và đường dẫn đến một method trong Controller. Các decorator phổ biến:

| Decorator | HTTP method | Mục đích thường dùng |
| --- | --- | --- |
| `@Get()` | GET | Lấy dữ liệu |
| `@Post()` | POST | Tạo dữ liệu |
| `@Put()` | PUT | Thay thế hoặc cập nhật toàn bộ resource |
| `@Patch()` | PATCH | Cập nhật một phần resource |
| `@Delete()` | DELETE | Xóa dữ liệu |
- Ví dụ trong E-commerce

```ts
@Controller("products")
export class ProductsController {
  @Get()
  findAll() {}

  @Post()
  create() {}

  @Get(":id")
  findOne() {}

  @Put(":id")
  replace() {}

  @Patch(":id")
  update() {}

  @Delete(":id")
  remove() {}
}
```

- NestJS sẽ ánh xạ các endpoint như sau:

| HTTP request | Method được gọi |
| --- | --- |
| `GET /products` | `findAll()` |
| `POST /products` | `create()` |
| `GET /products/123` | `findOne()` |
| `PUT /products/123` | `replace()` |
| `PATCH /products/123` | `update()` |
| `DELETE /products/123` | `remove()` |
- Các method trên chỉ là skeleton để minh họa routing, chưa có logic xử lý thực. Ngoài ra NestJS còn hỗ trợ những HTTP method khác, ví dụ @Head() và @Options()

### 3. Cách NestJS kết hợp Controller prefix và Method

- Đây là phần cực kỳ quan trọng khi làm việc với routing.
  ![alt text](./Image/combine-controllerprefix-methodpath.png)
- Xét qua ví dụ:

```ts
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return 'Get all users';
  }

  @Get('active')
  findActive() {
    return 'Get active users';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `Get user ${id}`;
  }
}
```

- Kết quả:
  - `GET /users` -> Get all users
  - `GET /users/active` -> Get active users
  - `GET /users/123` -> `Get user 123`
- Ở đây:
  - 'active' là một route tĩnh (static route)
  - ':id' là một route động (dynamic route)
- @Param('id') giúp lấy giá trị id trong URL.
- Một lưu ý thực tế: nên khai báo các route tĩnh như `@Get('active')` trước route động như `@Get(':id')` để tránh xung đột route trong những tình huống thứ tự matching có ảnh hưởng.

### 4. Ví dụ thực tế với NestJS + TypeScript

- Giả sử bạn xây dựng một ứng dụng quản lý sản phẩm với ba chức năng và chúng ta có hai file chính:
  1. Lấy danh sách sản phẩm
  2. Lấy sản phẩm theo ID
  3. Tạo một sản phẩm mới.

**A. products.controller.ts**

```ts
import { Controller, Get, Post, Param, Body } from "@nestjs/common";

import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() data: { name: string }) {
    return this.productsService.create(data);
  }
}
```

**B. product.service.ts**

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductsService {
  private products = [
    { id: "1", name: "Laptop" },
    { id: "2", name: "Mouse" },
  ];

  findAll() {
    return this.products;
  }

  findOne(id: string) {
    return this.products.find((p) => p.id === id) ?? null;
  }

  create(data: { name: string }) {
    const product = {
      id: String(this.products.length + 1),
      name: data.name,
    };

    this.products.push(product);
    return product;
  }
}
```

- Để chạy ví dụ, ProductsController và ProductsService cần được đăng ký vào ProductsModule. Đây là ví dụ sử dụng dữ liệu trong bộ nhớ để tập trung vào routing, chưa có database hoặc validation.

**Hãy xem cách req được xử lý**

- GET /products: NestJS gọi findAll() trong Controller, rồi gọi productsService.findAll(), lúc này Response là:

```JSON
[
  {"id": "1", "name": "Laptop"},
  {"id": "2", "name": "Mouse"}
]
```

- GET /products/2: NestJS gọi findOne() với id = "2", và Response trả về là:

```JSON
{"id": "2", "name": "Mouse"}
```

- POST /products: Với Request body là:

```json
{ "name": "Keyboard" }
```

- NestJS gọi create() và trả về sản phẩm vừa tạo:

```json
{ "id": "3", "name": "Keyboard" }
```

- Nếu sử dụng Prisma + PostgreSQL, logic trong Service có thể chuyển thành:

```ts
findAll() {
  return this.prisma.product.findMany();
}
```

- Như vậy Controller vẫn xử lý HTTP routing, còn Service chịu trách nhiệm điều phối nghiệp vụ và truy vấn dữ liệu thông qua Prisma hoặc Repository.

### 5. So sánh Controller trong ExpressJS và NestJS

**ExpressJS**

```ts
router.get("/products", productsController.findAll);
// Đăng ký HTTP method và path thông qua Router.
```

**NestJS**

```ts
@Controller("products")
export class ProductsController {
  @Get()
  findAll() {}
}
// Định nghĩa routing bằng decorator trên class và method.
```

- Cả hai đều có thể xử lý REST API, nhưng NestJS cung cấp cấu trúc Controller, Module và Dependency Injection được tích hợp sẵn.

### 6. Những lỗi và hiểu nhầm thường gặp

1. Nhầm giữa COntroller prefix và Method Path

```ts
@Controller("users")
export class UsersController {
  @Get("users")
  findAll() {}
}
```

- Endpoint thực tế sẽ là GET /users/users, không phải GET /users. Nếu muốn GET /users, chỉ cần @Get().

2. Nghĩ tên method tự quyết định HTTP method

```ts
@Controller("users")
export class UsersController {
  findAll() {
    return [];
  }
}
```

- Method findAll() không trở thành HTTP endpoint nếu thiếu route decorator phù hợp.

3. Nghĩ @Get và @Post có thể thay thế nhau

- Cùng một URL nhưng khác HTTP method sẽ tương ứng với các endpoint khác nhau. Ví dụ GET /users và POST /users không giống nhau.

4. Dồn business logic và Prisma vào Controller

- Controller có thể gọi Prisma trực tiếp về mặt kỹ thuật, nhưng thông thường không nên làm vậy vì sẽ khiến HTTP handling và logic nghiệp vụ bị trộn lẫn.

5. Nghĩ @Get(':id') tự chuyển ID sang number

- Mặc định, tham số đường dẫn như id được lấy dưới dạng string. Nếu cần số, ứng dụng phải chuyển đổi/kiểm tra phù hợp. Chúng ta sẽ học vấn đề này trong các Item về Param và Pipe.

### 7. Câu hỏi ôn tập

1. Controller trong NestJS là gì?

- Controller chịu trách nhiệm xử lý các yêu cầu HTTP và trả về phản hồi cho client. Nó thường gọi các Service để thực thi logic nghiệp vụ

2. Mục đích của @Controller() decorator là gì?

- @Controller decorator xác định 1 Controller và có thể chỉ định tiền tố tuyến được chia sẻ bởi các trình xử lý tuyến của nó

3. Route decorators trong NestJS là gì?

- Route decorators ánh xạ các phương thức HTTP và đường dẫn đến các phương thức của Controller.

4. Sự khác nhau giữa @Controller('users') và @Get(':id') là gì?

- `@Controller('users')` xác định route tiền tố, trong khi `@Get(':id')` xác định endpoint GET với tham số đường dẫn động. Cùng nhau chúng tạo ra `GET /users/:id`.

5. SẼ ra sao nếu phương thức controller không có route decorator?

- NestJS không đăng ký phương thức như một trình xử lý tuyến HTTP; nó vẫn có thể được gọi như một phương thức lớp thông thường.

## Thực hành

File [Controller Route Decorators Example](../Example/controller-routedecorators-example.ts) cung cấp Products API chạy được với `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Param` và `@Body`. Nó đặt route tĩnh `featured` trước route động `:id` để dễ thấy cách ghép đường dẫn.
