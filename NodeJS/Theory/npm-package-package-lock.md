# npm, package.json và package-lock.json

## 1. npm là gì?

**npm** là package manager đi kèm Node.js, dùng để cài đặt và quản lý package trong dự án JavaScript/Node.js. Các việc thường gặp:

- Cài, cập nhật hoặc gỡ package như Express, Prisma, bcrypt.
- Chạy các script được khai báo trong `package.json`.
- Tạo và cập nhật dependency tree qua lockfile.

```bash
npm init -y
npm install express
```

- `npm init -y` tạo `package.json` với giá trị mặc định.
- `npm install express` thêm Express vào `dependencies`, cài các dependency liên quan và thường tạo/cập nhật `package-lock.json`.

Cấu trúc thư mục thường gặp:

```text
backend/
├── node_modules/
├── app.js
├── package.json
└── package-lock.json
```

## 2. package.json là gì?

`package.json` là **manifest** của dự án: chứa metadata, scripts và dependency mà dự án khai báo cần dùng.

```json
{
  "name": "my-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

| Trường | Công dụng |
| --- | --- |
| `name` | Tên dự án/package. |
| `version` | Phiên bản của dự án/package. |
| `type` | Xác định cách Node.js hiểu file `.js`: CommonJS hoặc ES Modules. |
| `scripts` | Các lệnh tắt chạy bằng `npm run <tên-script>`. |
| `dependencies` | Package cần khi ứng dụng chạy. |
| `devDependencies` | Công cụ phục vụ phát triển, kiểm thử, lint, build, ... |
| `engines` | Có thể khai báo phiên bản Node.js/npm mà dự án hỗ trợ. |

Ví dụ `npm run dev` sẽ tìm script `dev` rồi chạy lệnh tương ứng. Script không phải lệnh npm đặc biệt; đó là lệnh do dự án tự đặt tên.

## 3. Version range và semantic versioning

Phiên bản package thường theo dạng `MAJOR.MINOR.PATCH`:

- **MAJOR**: có thể chứa thay đổi không tương thích ngược.
- **MINOR**: thêm tính năng tương thích ngược.
- **PATCH**: sửa lỗi tương thích ngược.

Một số range phổ biến:

| Khai báo | Ý nghĩa khái quát |
| --- | --- |
| `"5.1.0"` | Chỉ chấp nhận đúng 5.1.0. |
| `"^5.1.0"` | Cho phép cập nhật tương thích theo quy tắc caret, thường trong major 5. |
| `"~5.1.0"` | Cho phép cập nhật patch trong dòng 5.1.x. |
| `"*"` | Chấp nhận bất kỳ phiên bản nào; không nên dùng cho ứng dụng thật. |

Range trong `package.json` là yêu cầu ở mức khai báo, không phải danh sách chính xác toàn bộ phiên bản đã được cài.

## 4. package-lock.json là gì?

`package-lock.json` do npm tạo và quản lý. File này mô tả **dependency tree chính xác** mà npm đã resolve, gồm direct dependencies, transitive dependencies và thông tin cần thiết để tái tạo cùng cây cài đặt.

Ví dụ, `package.json` có thể khai báo:

```json
{
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

Trong khi đó lockfile ghi nhận phiên bản cụ thể mà npm đã chọn cho Express và toàn bộ dependencies con. Nhờ vậy, developer khác và CI có thể cài cùng dependency tree dù registry sau này có bản mới vẫn thoả range `^5.1.0`.

Với dự án ứng dụng, hãy commit cả `package.json` lẫn `package-lock.json`. Không commit `node_modules`.

> Không nên chỉnh sửa lockfile thủ công. Hãy thay đổi dependency bằng npm rồi review diff của lockfile như một phần của thay đổi.

## 5. So sánh package.json và package-lock.json

| | package.json | package-lock.json |
| --- | --- | --- |
| Vai trò | Khai báo dự án và dependency mong muốn | Ghi lại dependency tree đã được resolve |
| Version dependency | Range hoặc phiên bản khai báo | Phiên bản/nguồn cụ thể cho toàn bộ tree |
| Scripts | Có | Không dùng để khai báo scripts |
| Ai thường chỉnh sửa | Developer và npm | Chủ yếu npm |
| Có nên commit | Có | Có, cho ứng dụng |

## 6. npm install và npm ci

### npm install

```bash
npm install
```

- Cài dependency cho môi trường phát triển cục bộ.
- Dùng `package.json` và lockfile nếu có.
- Có thể tạo hoặc cập nhật `package-lock.json` khi bạn thêm, gỡ hoặc thay đổi dependency.

### npm ci

```bash
npm ci
```

- Dành cho clean install, đặc biệt phù hợp với CI/CD.
- Cần có lockfile hợp lệ và yêu cầu nó khớp với `package.json`.
- Xoá `node_modules` hiện có trước khi cài.
- Không ghi vào `package.json` hay lockfile; báo lỗi thay vì tự sửa khi hai file không đồng bộ.

Nếu lockfile được tạo bằng các cờ ảnh hưởng dependency tree (ví dụ `--legacy-peer-deps`), môi trường dùng `npm ci` cần dùng cấu hình tương thích.

## 7. Một số lệnh npm hay dùng

| Lệnh | Công dụng |
| --- | --- |
| `npm init -y` | Khởi tạo `package.json`. |
| `npm install` | Cài dependency của dự án. |
| `npm install express` | Cài Express vào `dependencies`. |
| `npm install -D eslint` | Cài ESLint vào `devDependencies`. |
| `npm uninstall express` | Gỡ Express và cập nhật manifest/lockfile. |
| `npm run dev` | Chạy script `dev`. |
| `npm start` | Chạy script `start`. |
| `npm ci` | Cài sạch theo lockfile. |
| `npm list --depth=0` | Xem package cấp cao nhất đã cài. |

## 8. Hiểu nhầm thường gặp

| Hiểu nhầm | Giải thích đúng |
| --- | --- |
| `package.json` và `package-lock.json` giống nhau | Manifest khai báo ý định; lockfile ghi cây phiên bản đã resolve. |
| Chỉ cần commit `package.json` | Ứng dụng nên commit cả lockfile để cài đặt nhất quán. |
| Phải commit `node_modules` | Thông thường không; dùng manifest và lockfile để tái tạo nó. |
| `npm ci` tự sửa dependency không khớp | Không; nó báo lỗi khi lockfile và manifest không đồng bộ. |
| `npm install` luôn lấy phiên bản mới nhất | npm xét version range và lockfile hiện có. |
| `async` code cần package riêng | `async/await` là cú pháp JavaScript, không phải package npm. |

## 9. Câu hỏi ôn tập

1. Khác biệt cốt lõi giữa `package.json` và `package-lock.json` là gì?
2. Vì sao không nên commit `node_modules`?
3. Khi nào dùng `npm install` và khi nào dùng `npm ci`?
4. `^5.1.0` có phải luôn cài đúng phiên bản 5.1.0 không?
