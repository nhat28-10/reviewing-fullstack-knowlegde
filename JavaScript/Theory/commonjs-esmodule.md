# JavaScript Theory

## CommonJS vs ES Modules

- Cách nhớ nhanh:
  - CommonJS -> `require()` / `module.exports`
  - ES Modules -> `import` / `export`

### 1. Module là gì?

- Module là cách tách code ra nhiều file để dễ quản lý và tái sử dụng.
- Một file có thể export function, object, class hoặc value.
- File khác có thể import phần đã export để sử dụng.

### 2. CommonJS là gì?

- CommonJS là hệ thống module được dùng rất phổ biến trong Node.js trước đây.
- Điểm nhận diện:
  - `require(...)`
  - `module.exports`
  - `exports`

Export:

```js
// math.js
function add(a, b) {
  return a + b;
}

module.exports = {
  add,
};
```

Import:

```js
// app.js
const { add } = require("./math");

console.log(add(2, 3)); // 5
```

### 3. ES Modules là gì?

- ES Modules, hay ESM, là module system chuẩn của JavaScript hiện đại.
- Điểm nhận diện:
  - `import`
  - `export`

Export:

```js
// math.js
export function add(a, b) {
  return a + b;
}
```

Import:

```js
// app.js
import { add } from "./math.js";

console.log(add(2, 3)); // 5
```

### 4. Named export và default export

#### Named export

- Một module có thể có nhiều named export.
- Khi import named export, phải dùng đúng tên trong `{}`.

```js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
```

```js
import { add, subtract } from "./math.js";
```

- Có thể đổi tên khi import:

```js
import { add as sum } from "./math.js";
```

#### Default export

- Một module chỉ có một `default export`.
- Khi import default export, không dùng `{}` và có thể đặt tên tùy ý.

```js
export default function add(a, b) {
  return a + b;
}
```

```js
import add from "./math.js";
import calculate from "./math.js";
```

- Cách nhớ:
  - Named export -> `import { name }`
  - Default export -> `import name`

### 5. CommonJS vs ESM

#### CommonJS

- Dùng `require()`.
- Dùng `module.exports`.
- Phổ biến trong Node.js cũ.
- Thường gặp trong các project hoặc package cũ.

```js
const express = require("express");
```

#### ES Modules

- Dùng `import`.
- Dùng `export`.
- Là cú pháp module chuẩn của JavaScript hiện đại.
- Thường gặp trong frontend, TypeScript, NestJS, hoặc Node.js project hiện đại.

```js
import express from "express";
```

### 6. Node.js biết dùng loại module nào bằng cách nào?

- Nếu `package.json` có:

```json
{
  "type": "module"
}
```

- Thì file `.js` được Node.js xử lý theo ESM.
- Khi đó có thể viết:

```js
import express from "express";
```

- Nếu project không khai báo `"type": "module"`, Node.js thường xử lý `.js` theo CommonJS.
- Khi đó thường thấy:

```js
const express = require("express");
```

- Extension cũng có thể nói rõ module system:
  - `.cjs` -> CommonJS
  - `.mjs` -> ES Modules

### 7. Ví dụ backend thực tế

Express với CommonJS:

```js
const express = require("express");

const app = express();
```

Express với ESM:

```js
import express from "express";

const app = express();
```

NestJS/TypeScript thường dùng ESM-style import:

```ts
import { Module } from "@nestjs/common";
```

### 8. Lỗi thường gặp

1. Trộn hai syntax không đúng config.

```js
import express from "express";

module.exports = something;
```

- Có thể gây vấn đề tùy project/config.
- Nên biết project đang dùng CommonJS hay ESM.

2. Nhầm `default export` với `named export`.

```js
export default User;
```

- Import đúng:

```js
import User from "./User.js";
```

- Không phải:

```js
import { User } from "./User.js";
```

- Trừ khi module cũng có named export tên `User`.

3. Quên `{}` với named export.

```js
export const add = (a, b) => a + b;
```

- Import đúng:

```js
import { add } from "./math.js";
```

### 9. Các câu hỏi thường gặp

1. Sự khác nhau giữa `CommonJS` và `ESM` là gì?
   - CommonJS sử dụng `require()` và `module.exports`, trong khi ESM sử dụng `import` và `export`. CommonJS từng được sử dụng rộng rãi trong Node.js, còn ESM là hệ thống module chuẩn của JavaScript hiện đại.

2. Điểm khác nhau giữa `named export` và `default export` là gì?
   - Named export được import bằng `{}` và phải đúng tên. Default export được import không cần `{}` và có thể đặt tên tùy ý.
