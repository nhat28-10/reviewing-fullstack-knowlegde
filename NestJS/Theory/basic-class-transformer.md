# NestJS: class-transformer cơ bản

## Mục lục

- [class-transformer là gì?](#1-class-transformer-là-gì)
- [Các thành phần cơ bản](#2-những-thành-phần-cơ-bản-của-class-transformer)
- [plainToInstance()](#3-plaintoinstance-hoạt-động-như-thế-nào)
- [@Type()](#4-type--chuyển-đổi-kiểu-dữ-liệu)
- [@Transform()](#5-transform--tùy-chỉnh-giá-trị)
- [Ví dụ Products API](#6-ví-dụ-thực-tế-với-nestjs--prisma)
- [So sánh class-transformer và class-validator](#7-class-transformer-và-class-validator-khác-nhau-như-thế-nào)
- [Các lỗi thường gặp](#8-những-lỗi-và-hiểu-nhầm-thường-gặp)
- [Câu hỏi ôn tập](#9-câu-hỏi-ôn-tập)

## 8. class-transformer cơ bản

### 1. class-transformer là gì?

- class-transformer là một thư viện TypeScript/JavaScript dùng để chuyển đổi dữ liệu giữa plain object (object JavaScript thông thường) và instance của class. Ngoài ra, nó hỗ trợ chuyển đổi kiểu dữ liệu và tùy chỉnh giá trị của các thuộc tính. Ví dụ, Client gửi dữ liệu:

```json
{
  "name": "Laptop",
  "quantity": "10"
}
```

- Bạn để ý quantity đang là string "10" thay vì number 10. Nếu Backend cần sử dụng quantity để tính toán hoặc lưu vào database dưới dạng số, chúng ta có thể sử dụng class-transformer để chuyển đổi giá trị này.
  ![alt text](./Image/whatis-classtransformer.png)
- Điểm quan trọng: Chuyển đổi dữ liệu (transformation) và kiểm tra dữ liệu (validation) là hai việc khác nhau.

### 2. Những thành phần cơ bản của class-transformer

| Thành phần | Công dụng |
| --- | --- |
| `plainToInstance()` | Chuyển plain object thành instance của class. |
| `@Type()` | Khai báo kiểu muốn chuyển đổi cho property. |
| `@Transform()` | Tự định nghĩa cách biến đổi giá trị. |
| `instanceToPlain()` | Chuyển class instance thành plain object. |

### 3. plainToInstance() hoạt động như thế nào?

- Giả sử có một class:

```ts
export class UserDto {
  name: string;
  age: number;
}
```

- Dữ liệu từ Client:

```ts
const data = {
  name: "Nhat",
  age: 22,
};
```

- Bạn có thể sử dụng:

```ts
import { plainToInstance } from "class-transformer";

const user = plainToInstance(UserDto, data);

console.log(user instanceof UserDto); // true
```

- Ở đây, plainToInstance() tạo ra một instance của UserDto từ dữ liệu thông thường. Tuy nhiên, nếu age ban đầu là string "22", nó không nhất thiết tự chuyển thành number chỉ vì class khai báo age: number. Muốn chuyển đổi kiểu rõ ràng, chúng ta có thể dùng @Type().

### 4. @Type() — Chuyển đổi kiểu dữ liệu

- Đây là decorator rất thường gặp trong NestJS.

```ts
import { Type, plainToInstance } from "class-transformer";

export class UserDto {
  name: string;

  @Type(() => Number)
  age: number;
}

const user = plainToInstance(UserDto, {
  name: "Nhat",
  age: "22",
});

console.log(user.age); // 22
console.log(typeof user.age); // number
```

- Nhờ @Type(() => Number), giá trị "22" được chuyển thành 22. Tương tự, class-transformer còn hỗ trợ các kiểu khác như String, Boolean, Date hoặc class lồng nhau.
- Lưu ý: @Type(() => Boolean) sử dụng quy tắc chuyển đổi của JavaScript nên chuỗi "false" có thể thành true. Không nên sử dụng nó một cách máy móc cho query boolean.

### 5. @Transform() — Tùy chỉnh giá trị

- Giả sử Client nhập tên với khoảng trắng ở hai đầu:

```json
{
  "name": "   Nhat   "
}
```

- Bạn muốn loại bỏ khoảng trắng trước khi xử lý.

```ts
import { Transform } from "class-transformer";

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name: string;
}
```

- Khi thực hiện transformation

```ts
const user = plainToInstance(CreateUserDto, {
  name: "   Nhat   ",
});

console.log(user.name); // "Nhat"
```

- Đây là điểm khác nhau giữa hai decorator:
  - @Type() phù hợp khi muốn chuyển đổi theo kiểu dữ liệu đã chỉ định.
  - @Transform() phù hợp khi cần một quy tắc chuyển đổi tùy chỉnh.

### 6. Ví dụ thực tế với NestJS + Prisma

- Giả sử bạn đang xây dựng API tạo sản phẩm cho hệ thống E-commerce.
- Client gửi:

```http
POST /products
Content-Type: application/json
```

- Request body

```json
{
  "name": "   Laptop   ",
  "quantity": "10"
}
```

- BE mong muốn nhận

```json
{
  "name": "Laptop",
  "quantity": 10
}
```

**A. Tạo DTO**

- create-product.dto.ts

```ts
import { Type, Transform } from "class-transformer";
import { IsString, IsInt, Min, IsNotEmpty } from "class-validator";

export class CreateProductDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;
}
```

- Trong DTO này:
  - @Transform() loại bỏ khoảng trắng ở đầu và cuối tên sản phẩm.
  - @Type(() => Number) chuyển quantity từ string sang number.
  - @IsInt() và @Min(0) kiểm tra giá trị sau chuyển đổi phải là số nguyên không âm.

**B. Kích hoạt Transformation trong NestJS**

- main.ts

```ts
import { ValidationPipe } from "@nestjs/common";

app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
);
```

- Với transform: true, NestJS có thể chuyển đổi plain object từ request thành DTO instance và sử dụng các transformation decorator đã định nghĩa. whitelist: true loại bỏ các property không có validation decorator phù hợp trong DTO.

**C. Controller nhận dữ liệu**

```tsx
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

**D. Service xử lý dữ liệu**

```tsx
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        quantity: dto.quantity,
      },
    });
  }
}
```

- Khi Controller gọi Service, quantity đã được chuyển thành number và kiểm tra tính hợp lệ. Nếu Client gửi:

```json
{
  "name": "Laptop",
  "quantity": "abc"
}
```

- @Type(() => Number) sẽ cho ra NaN, và @IsInt() sẽ khiến validation thất bại. Với cấu hình trên, NestJS trả HTTP 400 thay vì thực thi Controller method.

### 7. class-transformer và class-validator khác nhau như thế nào?

| class-transformer | class-validator |
| --- | --- |
| Chuyển đổi dữ liệu | Kiểm tra dữ liệu |
| `"20" → 20` | Kiểm tra có phải số nguyên không |
| `" Nhat " → "Nhat"` | Kiểm tra string có rỗng không |
| `@Type()`, `@Transform()` | `@IsInt()`, `@IsString()`, `@IsEmail()` |

- Một giá trị có thể chuyển đổi thành công nhưng vẫn không hợp lệ theo quy tắc nghiệp vụ.

### 8. Những lỗi và hiểu nhầm thường gặp

1. Nghĩ quantity: number tự chuyển string thành number.
   - Chỉ khai báo kiểu TypeScript không đủ để đảm bảo giá trị HTTP được chuyển đổi tại runtime.
   ```ts
   export class ProductDto {
     quantity: number;
   }
   ```
2. Nghĩ transform: true tự động chuyển mọi property của DTO.
   - Không chính xác. ValidationPipe({ transform: true }) hỗ trợ chuyển DTO thành class instance và có thể tự chuyển các tham số nguyên thủy như @Param('id') id: number.
   - Nhưng với property trong request body DTO, muốn chuyển "10" thành 10 một cách rõ ràng thì nên sử dụng @Type(() => Number) hoặc cấu hình chuyển đổi thích hợp.
3. Nghĩ chuyển đổi thành number là đã hợp lệ.
   - Ví dụ "abc" có thể trở thành NaN. Vì vậy nên kết hợp thêm validator như @IsInt().

   ```ts
    @Type(() => Number)
   quantity: number;
   ```

4. Nghĩ plainToInstance() tự kiểm tra dữ liệu.
   - Không. plainToInstance() thực hiện transformation, không tự động chạy toàn bộ quy tắc class-validator.

### 9. Câu hỏi ôn tập

1. class-transformer là gì trong NestJs?
   - class-transformer là thư viện chuyển plain object thành class instance và có thể chuyển đổi giá trị property.
2. Sự khác nhau giữa class-transformer và class-validator là gì?
   - Class-transformer thì chuyển đổi dữ liệu, trong khi class-validator thì kiểm tra xem dữ liệu có đáp ứng các quy tắc xác thực hay không
3. plainToInstance() làm gì?
   - Nó chuyển đổi 1 đối tượng JavaScript đơn giản thành một thể hiện của một lớp được chỉ định
4. Mục đích của decorator @Type() là gì?
   - `@Type()` chỉ định kiểu mục tiêu trong quá trình chuyển đổi.
5. Mục đích của @Transform() là gì?
   - `@Transform()` cho phép xác định logic chuyển đổi tùy chỉnh cho một property.
6. transform:true làm gì trong ValidationPipe?
   - Nó cho phép NestJS chuyển dữ liệu request thành DTO instance và áp dụng transformation decorator.

## Thực hành

Xem [Basic Class Transformer Example](../Example/basic-class-transformer-example.ts). File này dùng `@Transform()` để trim `name`, `@Type(() => Number)` để chuyển `quantity`, và `ValidationPipe({ transform: true })` để áp dụng các transformation đó cho body của `POST /products`.
