# process.env, .env và NODE_ENV

## 1. Environment variables là gì?

Environment variables (biến môi trường) là các giá trị cấu hình được cung cấp cho process khi ứng dụng chạy. Chúng giúp thay đổi cấu hình theo môi trường mà không phải sửa source code.

Trong backend, các biến phổ biến gồm:

| Biến | Ví dụ mục đích |
| --- | --- |
| `PORT` | Port HTTP server lắng nghe. |
| `DATABASE_URL` | Chuỗi kết nối database. |
| `JWT_SECRET` | Secret ký/xác thực JWT. |
| `NODE_ENV` | Nhãn môi trường như `development`, `production`, `test`. |

Thay vì hard-code:

```js
const port = 3000;
```

Dùng cấu hình từ môi trường:

```js
const port = Number(process.env.PORT ?? 3000);
```

## 2. process.env trong Node.js

`process.env` là object do Node.js cung cấp để đọc environment variables của process hiện tại.

```js
console.log(process.env.PORT);
console.log(process.env.NODE_ENV);
```

Hai điểm cần nhớ:

1. Giá trị lấy từ environment thường là **string** hoặc `undefined`. Đừng giả định `PORT` là number hay `FEATURE_ENABLED` là boolean.
2. Thay đổi `process.env` chỉ tác động process hiện tại; nó không thay đổi environment của terminal, hệ điều hành hay process cha.

Ví dụ parse và validate port:

```js
const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}
```

Truy cập biến không tồn tại trả về `undefined`:

```js
console.log(process.env.UNKNOWN_KEY); // undefined
```

> Khi gán giá trị vào `process.env`, hãy dùng string. Việc Node tự ép giá trị khác sang string đã bị đánh dấu deprecated.

## 3. File .env là gì?

`.env` là text file chứa các cặp `KEY=VALUE`. Nó tiện cho local development, nhưng **không phải** bản thân environment variables.

**.env**

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/mydb
JWT_SECRET=local-development-secret
```

Node.js không tự nạp file `.env` chỉ vì file tồn tại. Cần dùng cơ chế nạp rõ ràng.

### Cách 1: Node.js CLI

Node.js hiện đại hỗ trợ:

```bash
node --env-file=.env app.js
```

Nếu một biến đã tồn tại trong environment của process, giá trị environment có ưu tiên cao hơn file. Có thể truyền nhiều `--env-file`; file sau ghi đè giá trị từ file trước.

### Cách 2: dotenv

Trong dự án dùng `dotenv`:

```js
require("dotenv").config();

console.log(process.env.PORT);
```

Hãy nạp dotenv trước khi import/khởi tạo module cần đọc config. Với ESM, có thể dùng:

```js
import "dotenv/config";
```

## 4. NODE_ENV là gì?

`NODE_ENV` là biến môi trường **theo quy ước**, thường nhận một trong ba giá trị:

| Giá trị | Mục đích thường gặp |
| --- | --- |
| `development` | Phát triển local, log/debug nhiều hơn. |
| `test` | Chạy test với cấu hình/dataset riêng. |
| `production` | Runtime thực tế; thường tắt debug không cần thiết. |

`NODE_ENV` không phải công tắc kỳ diệu của Node.js. Node.js không tự cấu hình toàn bộ app thành production khi biến này có giá trị `production`. Chính ứng dụng, framework hoặc package quyết định cách sử dụng nó.

```js
const environment = process.env.NODE_ENV ?? "development";

if (environment === "production") {
  console.log("Running in production");
}
```

Hãy chọn giá trị hợp lệ, nhất quán và validate nếu ứng dụng phụ thuộc vào nó.

## 5. Configuration an toàn và dễ bảo trì

Tập trung việc đọc/parse/validate config ở một nơi, ngay lúc app khởi động. Không rải `process.env.*` khắp codebase.

```js
function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error("Missing required environment variable: " + name);
  }

  return value;
}

const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
};
```

Với ứng dụng lớn, có thể dùng schema validation (ví dụ Zod, Joi) hoặc `@nestjs/config` để phát hiện cấu hình thiếu/sai ngay lúc startup.

## 6. Secrets và Git

Không commit file `.env` chứa password, access token, API key, JWT secret hoặc connection string thật.

Thay vào đó:

- Thêm `.env` vào `.gitignore`.
- Commit `.env.example` chỉ chứa tên biến và giá trị mẫu không nhạy cảm.
- Lưu secret production trong secret manager hoặc cơ chế quản lý secrets của nền tảng deploy.
- Không log toàn bộ `process.env` hoặc trả secret qua API/error response.
- Rotate secret nếu nó đã lộ trong Git, log hay ảnh chụp màn hình.

**.env.example**

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
```

## 7. Liên hệ NestJS

NestJS thường dùng `@nestjs/config` để nạp config và truy cập qua dependency injection:

```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
```

```ts
constructor(private readonly configService: ConfigService) {}

getDatabaseUrl() {
  return this.configService.getOrThrow<string>("DATABASE_URL");
}
```

`ConfigModule` tiện cho tổ chức code, nhưng không thay thế việc validate giá trị và bảo vệ secret.

## 8. Hiểu nhầm thường gặp

| Hiểu nhầm | Giải thích đúng |
| --- | --- |
| `process.env` chính là file `.env` | `process.env` là object runtime; `.env` chỉ là file có thể được nạp vào process. |
| File `.env` luôn tự được load | Cần `--env-file`, dotenv hoặc cơ chế tương đương. |
| `process.env.PORT` là number | Giá trị thường là string; cần parse/validate khi dùng như number. |
| `NODE_ENV` tự cấu hình Node.js | Đây là convention; app/framework/package mới quyết định hành vi. |
| Có thể commit `.env` chứa secret | Không nên; commit `.env.example` thay thế. |
| `process.env` có thể lưu object/array trực tiếp | Environment variables là text; hãy dùng string/JSON và parse có kiểm soát khi cần. |

## 9. Câu hỏi ôn tập

### 1. `process.env` trong Node.js là gì?

Đó là object cung cấp environment variables cho process Node.js hiện tại. Khi đọc một biến, giá trị thường là string hoặc `undefined` nếu biến không tồn tại.

### 2. Mục đích của file `.env` là gì?

`.env` là file tiện để khai báo cặp `KEY=VALUE`, nhất là trong local development. Nó cần được nạp bằng `node --env-file`, dotenv hoặc cơ chế tương đương trước khi giá trị xuất hiện trong `process.env`.

### 3. NODE_ENV dùng để làm gì?

Nó là nhãn quy ước cho môi trường chạy như `development`, `test` hoặc `production`. App/framework/package có thể dùng nhãn này để chọn hành vi, nhưng Node.js không tự biến đổi toàn bộ app chỉ vì biến này được đặt.

### 4. Vì sao nên dùng environment variables thay vì hard-code cấu hình?

Chúng tách cấu hình khỏi source code, cho phép cùng artifact chạy ở nhiều môi trường và giảm nguy cơ đưa secret vào repository. Giá trị vẫn cần được parse, validate và bảo vệ đúng cách.

### 5. Vì sao không nên commit .env thật?

Nó có thể chứa secret. Khi secret xuất hiện trong Git history, người có quyền đọc repository có thể truy cập nó. Hãy dùng `.env.example` để mô tả biến cần có và secret manager cho production.
