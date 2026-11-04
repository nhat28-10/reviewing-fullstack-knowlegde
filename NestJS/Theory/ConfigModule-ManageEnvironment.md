# NestJS: ConfigModule và quản lý Environment

## Mục lục

- [Environment Variables](#1-environment-variables-là-gì)
- [ConfigModule](#2-configmodule-là-gì)
- [ConfigService](#3-configservice-là-gì)
- [Nhiều Environment](#4-quản-lý-nhiều-environment)
- [Quản lý Secret](#5-quản-lý-secret-an-toàn)
- [Validation cấu hình](#6-nếu-thiếu-biến-môi-trường-quan-trọng-thì-sao)
- [Các hiểu nhầm thường gặp](#7-những-lỗi-và-hiểu-nhầm-thường-gặp)
- [Câu hỏi ôn tập](#8-câu-hỏi-ôn-tập)

## 18. ConfigModule và quản lý Environment

### 1. Environment Variables là gì?

- Environment Variables (biến môi trường) là những giá trị cấu hình được cung cấp cho ứng dụng khi chạy, giúp tách cấu hình ra khỏi source code.
- Giả sử bạn đang xây dựng Backend NestJS kết nối PostgreSQL bằng Prisma. Nếu viết

```ts
const databaseUrl = "postgresql://admin:password123@localhost:5432/mydb";
```

- Bạn đang hard-code thông tin kết nối database.
- Cách này có một số vấn đề:
  - Dễ vô tình làm lộ thông tin đăng nhập khi push lên GitHub.
  - Khó thay đổi cấu hình giữa development và production.
  - Nếu đổi mật khẩu database, bạn có thể phải sửa source code.
- Thay vào đó, có thể sử dụng Environment Variables. Ví dụ về file .env

```dotenv
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://app:localpass@localhost:5432/mydb
JWT_SECRET=local-development-secret
```

- Trong Node.js, bạn đã học cách đọc biến môi trường:

```ts
const port = process.env.PORT;
```

- Và trong NestJS, chúng ta có một giải pháp thuận tiện hơn: ConfigModule và ConfigService.

### 2. ConfigModule là gì?

- ConfigModule là module được NestJS cung cấp thông qua package @nestjs/config, giúp tải và quản lý cấu hình ứng dụng từ environment variables.
- Package này sử dụng dotenv để hỗ trợ đọc các file .env.

#### 1. Cài đặt

```bash
npm install @nestjs/config
```

- Sau đó đăng ký trong AppModule.

#### 2. Cấu hình ở app.modules.ts

```tsx
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

- Giải thích:
  - ConfigModule.forRoot(): Khởi tạo và tải cấu hình môi trường.
  - isGlobal: true: Cho phép sử dụng ConfigService trong các module khác mà không cần import lại ConfigModule ở từng module.
- Theo mặc định, ConfigModule.forRoot() tìm file .env tại thư mục gốc của ứng dụng.

#### 3. Global ConfigModule khác Global Guard như thế nào?

- Hai khái niệm đều có chữ Global nhưng mục đích khác nhau:

| Thành phần | Global có nghĩa là |
| --- | --- |
| Global Guard | Guard áp dụng cho route trên toàn ứng dụng. |
| Global ConfigModule | Module khác có thể dùng provider cấu hình mà không phải import lại ConfigModule. |

### 3. ConfigService là gì?

- Nếu ConfigModule chịu trách nhiệm tải và cung cấp hệ thống cấu hình, thì ConfigService là service giúp chúng ta truy cập các giá trị cấu hình đó.
- Giả sử .env chứa:

```dotenv
JWT_SECRET=my-local-secret
PORT=3000
```

- Bạn có thể inject ConfigService vào một Service.

#### 1. auth.service.ts

```ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  getJwtSecret() {
    return this.configService.get<string>("JWT_SECRET");
  }
}
```

- Ở đây:

```ts
this.configService.get<string>("JWT_SECRET");
```

- sẽ lấy giá trị của JWT_SECRET từ cấu hình. Nếu biến không tồn tại, get() có thể trả về undefined. Bạn cũng có thể sử dụng giá trị mặc định:

```ts
const port = this.configService.get<number>("PORT", 3000);
```

- Nghĩa là nếu không có PORT, lấy giá trị mặc định 3000.

#### 2. Lưu ý quan trọng về TypeScript:

- <number> chỉ là kiểu được khai báo cho TypeScript. Nó không tự động chuyển mọi chuỗi environment thành number.
- Ví dụ trực tiếp

```tsx
const port = Number(this.configService.get<string>("PORT", "3000"));
```

- Cách này chuyển giá trị thành number. Trong production, nên kết hợp kiểm tra giá trị hợp lệ để tránh NaN.

#### 3. ConfigModule vs ConfigService

| ConfigModule | ConfigService |
| --- | --- |
| Tải và tổ chức cấu hình | Đọc giá trị cấu hình |
| Đăng ký trong `imports` | Inject qua constructor |
| `ConfigModule.forRoot()` | `configService.get()` |

### 4. Quản lý nhiều Environment

- Một Backend thường được triển khai trên nhiều môi trường.
  ![alt text](./Image/ManageMoreEnvs.png)
- Trong thực tế, bạn có thể sử dụng ba file khác nhau cho local testing:

```text
.env.development
.env.staging
.env.production
```

- Ví dụ

#### 1. .env.development

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://app:localpass@localhost:5432/mydb_dev
```

#### 2. .env.staging

```dotenv
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://app:stagepass@staging-db:5432/mydb_stage
```

- Để NestJS biết cần tải file nào, có thể dùng:

```ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
});
```

- Lưu ý NODE_ENV trong ví dụ này phải được cung cấp từ môi trường chạy trước khi NestJS khởi tạo ConfigModule. Không thể dựa vào chính file đang định chọn để xác định tên file.
- Trong production, bạn không nhất thiết phải sử dụng file .env.production. Có thể cung cấp cấu hình trực tiếp từ Docker, VPS hoặc hệ thống quản lý secrets.
- Ví dụ khi các biến đã được cung cấp từ môi trường chạy:

```ts
ConfigModule.forRoot({
  isGlobal: true,
  ignoreEnvFile: true,
});
```

- Lúc này, ConfigModule không đọc file .env, nhưng vẫn có thể sử dụng các environment variables mà tiến trình Node.js nhận được.

#### 3. Liên hệ với Docker

- Ví dụ Docker Compose:

```yaml
services:
  api:
    build: .
    environment:
      NODE_ENV: production
      PORT: "3000"
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
```

- ${DATABASE_URL} và ${JWT_SECRET} cần được cung cấp khi triển khai, ví dụ từ môi trường chạy hoặc file cấu hình riêng được bảo vệ.
- Không nên ghi secret thật trực tiếp trong docker-compose.yml rồi commit lên GitHub.

### 5. Quản lý Secret an toàn

- Trong hệ thống NestJS + Prisma + PostgreSQL + JWT, có một số environment variables cần được bảo vệ.
| Biến | Ý nghĩa | Có thể công khai? |
| --- | --- | --- |
| `PORT` | Cổng server | Có |
| `NODE_ENV` | Tên môi trường | Có |
| `DATABASE_URL` | Chuỗi kết nối DB, thường chứa credentials | Không |
| `JWT_SECRET` | Khóa ký JWT | Không |
| `STRIPE_SECRET_KEY` | Khóa bí mật Stripe | Không |
- Nên thêm file chứa secret vào .gitignore:

```gitignore
.env
.env.*
!.env.example
```

- Sau đó tạo .env.example để những người khác biết ứng dụng cần cấu hình gì:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=
JWT_SECRET=
```

- Lưu ý: .gitignore không bảo vệ những secret đã được Git theo dõi hoặc đã push lên remote trước đó. Khi secret bị lộ, bạn cần thay đổi hoặc thu hồi secret tương ứng.

### 6. Nếu thiếu biến môi trường quan trọng thì sao?

- Giả sử ứng dụng cần JWT secret để ký access token.
- Nếu cấu hình thiếu JWT_SECRET, ứng dụng có thể gặp lỗi khi thực hiện chức năng xác thực.
- Một cách tốt hơn là kiểm tra cấu hình ngay lúc ứng dụng khởi động.
- Bạn có thể sử dụng validationSchema kết hợp với Joi.

```bash
npm install joi
```

- Ví dụ:

```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().default("development"),
        PORT: Joi.number().port().default(3000),
        JWT_SECRET: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
  ],
})
export class AppModule {}
```

- Nếu thiếu JWT_SECRET hoặc DATABASE_URL, quá trình validation sẽ báo lỗi khi khởi động ứng dụng.
- Lợi ích: phát hiện cấu hình sai sớm thay vì chỉ phát hiện khi có request đi vào hệ thống.

### 7. Những lỗi và hiểu nhầm thường gặp

| Hiểu nhầm | Giải thích đúng |
| --- | --- |
| ConfigModule và ConfigService giống nhau | Một bên quản lý/cung cấp cấu hình, bên kia truy cập cấu hình. |
| `isGlobal: true` nghĩa là áp dụng middleware cho mọi API | Không, nó làm ConfigModule dùng được toàn ứng dụng. |
| `.env` luôn được NestJS tải tự động | Cần có cơ chế tải như `ConfigModule.forRoot()`. |
| `configService.get<number>()` tự chuyển chuỗi thành number | TypeScript generic không bảo đảm chuyển kiểu runtime. |
| Đặt `.env` trong `.gitignore` là bảo mật tuyệt đối | Vẫn cần bảo vệ secret trong môi trường triển khai. |
| Development và production nên dùng chung Database URL | Nên dùng database và credentials riêng. |
| Environment variable luôn phải nằm trong file `.env` | Có thể được cung cấp bởi OS, Docker, VPS và môi trường triển khai. |

### 8. Câu hỏi ôn tập

1. ConfigModule là gì ?
   - ConfigModule giúp tải và quản lý cấu hình ứng dụng từ biến môi trường.
2. Mục đích của ConfigService
   - ConfigService cho phép truy cập giá trị cấu hình qua DI.
3. isGlobal:true sẽ làm gì trong ConfigModule?
   - Nó làm ConfigModule có sẵn toàn ứng dụng mà không cần import lại vào module tính năng.
4. Tại sao chúng ta phải sử dụng biến môi trường?
   - Nó tách cấu hình khỏi mã nguồn và cho phép cấu hình khác nhau theo môi trường.
5. Làm thế nào để bạn truy cập sử dụng biến môi trường
   - Inject ConfigService và dùng phương thức `get()`.

## Thực hành

Xem [ConfigModule–Manage Environment Example](../Example/configmodule-manageenvironment-example.ts). File này đăng ký `ConfigModule.forRoot({ isGlobal: true })`, validate/chuyển `PORT` sang number lúc khởi động, rồi inject `ConfigService` vào service và dùng nó khi khởi chạy server. Để chạy với `.env`, bỏ `ignoreEnvFile: true` trong ví dụ và tạo `.env` theo comment đầu file.
