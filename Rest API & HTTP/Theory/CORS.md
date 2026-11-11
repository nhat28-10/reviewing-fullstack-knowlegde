# REST API & HTTP Theory

## 13. CORS ở mức HTTP/API

### 1. CORS là gì?

- CORS (Cross-Origin Resource Sharing) là một cơ chế dựa trên HTTP Headers, cho phép Server thông báo cho Browser biết những Origin nào được phép truy cập Response từ Server trong ngữ cảnh Cross-Origin. Hiểu đơn giản:
- CORS giúp Browser quyết định liệu JavaScript từ một Website có được phép đọc dữ liệu từ API thuộc Origin khác hay không.
- Giả sử bạn đang phát triển hệ thống FullStack:
  - Frontend ReactJS: http://localhost:5173
  - Backend NestJS: http://localhost:3000
- FE gửi:

```tsx
fetch("http://localhost:3000/api/users");
```

- Hai địa chỉ trên khác Port nên chúng được xem là khác Origin.
- Nếu Backend không cho phép Origin của Frontend truy cập qua CORS, Browser có thể chặn JavaScript đọc Response, dù Request đã được gửi đến Server.

### 2. Origin là gì?

- Origin được xác định từ ba thành phần:
  \[
  Origin = Scheme + Host + Port
  \]
- Ví dụ Origin:

```Plain text
http://localhost:5173
```

Thành phần Giá trị
Scheme (giao thức) http
Host localhost
Port 5173

- Hai URL được xem là cùng Origin khi cả ba thành phần trên giống nhau. Ví dụ so với http://localhost:5173:
  URL Cùng Origin?
  http://localhost:5173/users Có
  http://localhost:3000/users Không — khác Port
  https://localhost:5173/users Không — khác Scheme
  http://127.0.0.1:5173/users Không — khác Host
- Điểm thường gặp trong thực tế: Chỉ cần khác Port đã là Cross-Origin, dù Frontend và Backend cùng chạy trên máy tính của bạn.

### 3. CORS hoạt động như thế nào?

- Giả sử ReactJS gọi NestJS API
  ![alt text](./img/HowCORSWork.png)
- Ví dụ Browser gửi Request:

```http
GET /api/users
Origin: http://localhost:5173
```

- Nếu Backend cho phép Origin này, Response có thể chứa:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json
```

- Khi đó Browser có thể cho JavaScript truy cập Response.
- Nếu thiếu Header cho phép thích hợp, Browser sẽ chặn JavaScript đọc Response.
- Điểm quan trọng: CORS chủ yếu được Browser thực thi. Nó không phải một hệ thống Authentication hoặc Authorization của Backend.

### 4. Same-Origin Policy và CORS khác nhau thế nào?

- Hai khái niệm này liên quan chặt chẽ
  Same-Origin Policy CORS
  Chính sách bảo mật của Browser Cơ chế cho phép một số truy cập Cross-Origin
  Hạn chế JavaScript đọc dữ liệu từ Origin khác Cho phép Server khai báo Origin được truy cập
  Mặc định được Browser áp dụng Dựa trên các HTTP Headers
- Bạn có thể hiểu: Same-Origin Policy đặt ra giới hạn, còn CORS cung cấp cách cho phép truy cập Cross-Origin trong những trường hợp phù hợp.

### 5. Preflight Request là gì?

- Preflight Request là Request mà Browser tự động gửi trước một số Cross-Origin Requests để kiểm tra xem Server có cho phép Request thực tế hay không.
- Preflight thường sử dụng HTTP Method OPTIONS.
- Ví dụ ReactJS gửi:

```tsx
await axios.post(
  "http://localhost:3000/api/products",
  {
    name: "Laptop Dell",
    price: 20000000,
  },
  {
    headers: {
      Authorization: "Bearer <access_token>",
      "Content-Type": "application/json",
    },
  },
);
```

- Vì Request này sử dụng Authorization và Content-Type: application/json, Browser thông thường sẽ cần Preflight khi gửi Cross-Origin.
  ![alt text](./img/FlowPreflightRequest.png)
- Ví dụ Preflight:

```http
OPTIONS /api/products
Origin: http://localhost:5173
Access-Control-Request-Method: POST
Access-Control-Request-Headers: authorization,content-type
```

- Server có thể trả:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

- Sau đó Browser có thể tiếp tục với POST nếu các điều kiện được đáp ứng.
- Lưu ý: Không phải mọi Cross-Origin Request đều cần Preflight. Ví dụ một GET đơn giản với các Headers thông thường có thể được gửi trực tiếp.

### 6. Các CORS Headers quan trọng

Header Mục đích
Origin Cho biết Origin của Request
Access-Control-Allow-Origin Origin được Server cho phép
Access-Control-Allow-Methods Các HTTP Methods được cho phép trong Preflight
Access-Control-Allow-Headers Những Request Headers được cho phép trong Preflight
Access-Control-Allow-Credentials Cho biết có cho phép Browser chia sẻ Response với Request có Credentials hay không

### 7. Cấu hình CORS trong NestJS

- Giả sử Frontend ReactJS chạy trên http://localhost:5173, Backend NestJS chạy trên http://localhost:3000.
- Trong main.ts

```tsx
const app = await NestFactory.create(AppModule);

app.enableCors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

await app.listen(3000);
```

- Giải thích:
  - origin: Cho phép Frontend từ http://localhost:5173.
  - methods: Danh sách HTTP Methods được cho phép trong cấu hình CORS.
  - allowedHeaders: Những Request Headers được chấp nhận trong Preflight.
- Khi ReactJS gọi API từ Origin đã được cho phép, Browser có thể tiếp tục xử lý Response theo các quy tắc CORS.
- NestJS cũng hỗ trợ cấu hình credentials: true khi cần gửi các Credentials như Cookie giữa những Origin khác nhau.

### 8. Cấu hình CORS trong ExpressJS

- Với Express, bạn có thể sử dụng Middleware cors

```tsx
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/api/users", (req, res) => {
  res.json([{ id: 1, name: "Nhat" }]);
});

app.listen(3000);
```

- Ở đây Middleware cors giúp Server thiết lập những HTTP Response Headers cần thiết.

### 9. CORS có áp dụng cho React Native và Postman không?

- Đây là câu hỏi khá thực tế rằng CORS chủ yếu được thực thi bởi Browers
- Ví dụ:
  - ReactJS chạy trong Chrome: Bị chi phối bởi CORS.
  - React Native sử dụng Native Networking thông thường: Không bị Browser CORS Policy chi phối như Website.
  - Postman: Không bị Browser CORS Policy hạn chế theo cách thông thường.
  - Backend Node.js gọi API khác: Không bị Browser CORS Policy chi phối.
- Vì vậy, trường hợp Postman gọi API thành công nhưng ReactJS trên Browser báo CORS Error là hoàn toàn có thể xảy ra. Điều này không nhất thiết có nghĩa Backend API đã bị lỗi nghiệp vụ.

### 10. Những lỗi thường gặp

1. Nghĩ CORS là cơ chế Authentication.
   - Sai. CORS không thay thế JWT, Guard hoặc RBAC.
2. Cho rằng Backend không nhận được Request khi Browser báo CORS Error.
   - Không phải lúc nào cũng đúng. Với một số Request, Server vẫn có thể nhận và xử lý nhưng Browser chặn JavaScript đọc Response. Với Preflight thất bại, Browser có thể không gửi Request chính.
3. Cấu hình Access-Control-Allow-Origin: \* cùng Credentials.
   - Với Cross-Origin Request sử dụng Credentials như Cookie, Browser không cho phép sử dụng wildcard \* làm giá trị Access-Control-Allow-Origin. Cần khai báo Origin cụ thể và cấu hình Credentials phù hợp.
4. Nghĩ tất cả Cross-Origin Requests đều phải gửi OPTIONS trước.
   - Sai. Chỉ những Request đáp ứng điều kiện cần Preflight mới phải thực hiện bước này.
5. Cho phép mọi Origin mà không cân nhắc yêu cầu bảo mật.
   - Trong Production, nên xác định những Origin được phép theo nhu cầu ứng dụng, đặc biệt khi có Cookies hoặc dữ liệu nhạy cảm.

### 11. Câu hỏi ôn tập

1. CORS là gì?
   - CORS được hiểu là Cross-Origin Resources Sharing. Nó là 1 cơ chế HTTP cho phép servers cụ thể origins nào được phếp truy cập vào tài nguyên thông qua browers
2. Origin là gì?
   - Origin được định nghĩa bởi scheme,host và port của 1 URL
3. Preflight request là gì?
   - Preflight request là 1 OPTIONS yêu cầu gửi bởi trình duyệt để kiểm tra yêu cầu cross-origin được cho phép
4. Làm thế nào để mở CORS trong NestJS?
   - Sử dụng app.enableCors() trong main.ts và cấu hình các origins được cho phép, các phương thức và các header
5. Liệu CORS có áp dụng được cho Postman?
   - Không, CORS chỉ dành cho trình duyệt, API clients như Postman không bị ngăn chặn bởi pháp lý CORS từ trình duyệt
