# CommonJS và ES Modules trong Node.js

## 1. Module là gì?

Module giúp chia chương trình thành các file có trách nhiệm rõ ràng. Một module có thể **export** function, object hoặc class; module khác **import** chúng để dùng lại.

Node.js hỗ trợ hai hệ thống module chính:

| Tiêu chí | CommonJS (CJS) | ES Modules (ESM) |
| --- | --- | --- |
| Cú pháp import | `require()` | `import` |
| Cú pháp export | `module.exports` / `exports` | `export` / `export default` |
| Extension rõ ràng | `.cjs` | `.mjs` |
| File `.js` | Theo `"type"` trong package.json; mặc định là CJS | Theo `"type": "module"` trong package.json |
| Top-level `await` | Không hỗ trợ | Hỗ trợ |

## 2. CommonJS

CommonJS là hệ thống module truyền thống của Node.js. Dùng `require()` để nhập module và `module.exports` để xuất giá trị.

**user.service.cjs**

```js
function getUsers() {
  return ["Nhat", "Minh", "An"];
}

module.exports = { getUsers };
```

**app.cjs**

```js
const express = require("express");
const { getUsers } = require("./user.service.cjs");

app.get("/users", (req, res) => {
  res.json({ users: getUsers() });
});
```

## 3. ES Modules

ESM là chuẩn module của JavaScript. Dùng `export` để xuất và `import` để nhập module.

**user.service.mjs**

```js
export function getUsers() {
  return ["Nhat", "Minh", "An"];
}
```

**app.mjs**

```js
import express from "express";
import { getUsers } from "./user.service.mjs";

app.get("/users", (req, res) => {
  res.json({ users: getUsers() });
});
```

Trong ESM của Node.js, relative import nên ghi rõ extension:

```js
import { getUsers } from "./user.service.mjs";
```

Node.js không tự suy ra extension cho relative ESM import như nhiều bundler ở frontend.

## 4. Vai trò của `type` trong package.json

Với file `.cjs` và `.mjs`, loại module đã rõ ràng. Với file `.js`, Node.js dựa vào trường `"type"` của package.json gần nhất:

| Cấu hình | Cách hiểu file `.js` |
| --- | --- |
| Không khai báo `type` hoặc `"type": "commonjs"` | CommonJS |
| `"type": "module"` | ES Modules |
| `.cjs` | Luôn là CommonJS |
| `.mjs` | Luôn là ES Modules |

Ví dụ dự án ESM:

```json
{
  "type": "module",
  "scripts": {
    "start": "node app.js"
  }
}
```

Trong dự án thật, nên chọn một quy ước chính và nhất quán; chỉ dùng lẫn CJS/ESM khi có lý do rõ ràng.

## 5. Named export và default export

```js
// math.mjs
export function add(a, b) {
  return a + b;
}

export default function multiply(a, b) {
  return a * b;
}

// app.mjs
import multiply, { add } from "./math.mjs";
```

- **Named export**: import bằng đúng tên trong `{}`.
- **Default export**: import không dùng `{}`; mỗi module chỉ có tối đa một default export.

## 6. Dùng lẫn CJS và ESM

Node.js có khả năng tương thích nhất định, nhưng cách export/import và hành vi package bên thứ ba có thể khác nhau. Khi chuyển đổi dần:

- Từ CommonJS, có thể dùng `import()` để tải ESM bất đồng bộ.
- Từ ESM, có thể dùng `createRequire()` từ `node:module` khi thật sự cần tải CJS bằng `require()`.

Hãy kiểm tra tài liệu của package và chạy thử trong phiên bản Node.js đang dùng, thay vì đoán cách import.

## 7. Lỗi thường gặp

| Lỗi | Nguyên nhân và cách xử lý |
| --- | --- |
| `require is not defined in ES module scope` | Đang dùng `require()` trong ESM; đổi sang `import` hoặc dùng `createRequire()`. |
| `module is not defined in ES module scope` | Đang dùng `module.exports` trong ESM; đổi sang `export`. |
| `ERR_MODULE_NOT_FOUND` | Kiểm tra đường dẫn và extension trong ESM relative import. |
| `does not provide an export named ...` | Tên named import không khớp named export, hoặc bạn nhầm default export với named export. |
| `Cannot use import statement outside a module` | File `.js` chưa ở ngữ cảnh ESM; dùng `.mjs` hoặc đặt `"type": "module"`. |

## 8. Câu hỏi ôn tập

1. `require()` khác `import` ở điểm nào dễ nhận thấy nhất?
2. Khi nào file `.js` được Node.js hiểu là ESM?
3. Vì sao ESM relative import nên viết đủ extension?
4. Default export khác named export như thế nào?

## 9. Ví dụ thực hành

Hai ví dụ Express độc lập:

- [CommonJS app.cjs](../Example/commonjs-esmodule/commonjs/app.cjs)
- [ESM app.mjs](../Example/commonjs-esmodule/esm/app.mjs)

Cài dependency một lần (hoặc sau khi xoá `node_modules`):

```bash
cd NodeJS
npm install
```

Chạy CommonJS hoặc ESM:

```bash
npm run start:commonjs
npm run start:esm
```

Cả hai server có endpoint `GET /users` và `GET /health`; chỉ chạy một server trên port 3000 tại một thời điểm.
