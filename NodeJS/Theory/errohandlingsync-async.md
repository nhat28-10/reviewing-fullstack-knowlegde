# Error handling đồng bộ và bất đồng bộ

## 1. Error handling là gì?

Error handling là quá trình phát hiện, phân loại, ghi nhận và phản hồi lỗi có kiểm soát. Mục tiêu là để server trả về HTTP response phù hợp, giữ được thông tin chẩn đoán trên server và không làm lộ dữ liệu nội bộ cho client.

Các lỗi backend thường gặp:

- Input không hợp lệ hoặc thiếu dữ liệu.
- Không tìm thấy resource.
- Database/network/file I/O thất bại.
- Xác thực hoặc phân quyền thất bại.
- Lỗi lập trình hay lỗi hệ thống không mong muốn.

## 2. Lỗi đồng bộ (synchronous)

Lỗi đồng bộ phát sinh ngay trong luồng thực thi hiện tại. `throw` sẽ dừng phần code còn lại trong block đó và tìm `catch` gần nhất.

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }

  return a / b;
}

try {
  console.log(divide(10, 0));
} catch (error) {
  console.error(error.message);
}

console.log("Continue running");
```

Kết quả:

```text
Cannot divide by zero
Continue running
```

`try/catch` chỉ bắt lỗi xảy ra trong phạm vi thực thi của `try`. Nó không tự bắt lỗi được ném ra ở một callback chạy sau khi `try` đã kết thúc.

## 3. Lỗi bất đồng bộ (asynchronous)

Với Promise, lỗi thường được biểu diễn bằng trạng thái **rejected**. Có hai cách phổ biến để xử lý:

### async/await + try/catch

```js
async function getUser() {
  throw new Error("Database connection failed");
}

async function main() {
  try {
    const user = await getUser();
    console.log(user);
  } catch (error) {
    console.error(error.message);
  }
}

main();
```

Khi Promise từ `getUser()` reject, `await` làm lỗi xuất hiện tại vị trí chờ và `catch` xử lý được nó.

### Promise chain + .catch()

```js
getUser()
  .then((user) => {
    console.log(user);
  })
  .catch((error) => {
    console.error(error.message);
  });
```

Nếu tạo Promise mà không `await`, không `return` hoặc không có `.catch()`, rejection có thể trở thành unhandled rejection.

### Callback bất đồng bộ

Với callback API kiểu cũ, lỗi thường là tham số đầu tiên. Phải xử lý nó ngay trong callback:

```js
const fs = require("node:fs");

fs.readFile("missing.txt", "utf8", (error, content) => {
  if (error) {
    console.error(error.message);
    return;
  }

  console.log(content);
});
```

## 4. Error handling trong Express 5

Express có error-handling middleware với đủ bốn tham số:

```js
app.use((error, req, res, next) => {
  // Xử lý lỗi ở đây.
});
```

Middleware này nên đặt **sau routes và middleware thông thường**. Khi gọi `next(error)`, Express bỏ qua middleware thông thường còn lại và tìm error middleware.

### Lỗi đồng bộ trong route

Express tự bắt lỗi đồng bộ được `throw` trong route handler:

```js
app.get("/sync-error", (req, res) => {
  throw new Error("Something broke");
});
```

### Lỗi async trong Express 5

Trong Express 5, nếu route handler/middleware **return Promise** (bao gồm hàm `async`), Promise reject hoặc lỗi `throw` sẽ tự được chuyển tới error middleware.

```js
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ users });
});
```

Không cần `try/catch + next(error)` chỉ để chuyển lỗi Promise tới middleware trong Express 5. Tuy nhiên, `try/catch` vẫn hữu ích khi cần xử lý/re-map lỗi cục bộ.

> Với Express 4, Promise rejection trong async handler không được tự forward như Express 5; cần `try/catch` rồi `next(error)` hoặc một async wrapper.

### Callback và timer vẫn cần forward thủ công

Express không tự biết lỗi xuất hiện trong callback API kiểu cũ hoặc `setTimeout`. Hãy truyền lỗi bằng `next(error)`:

```js
app.get("/file", (req, res, next) => {
  fs.readFile("missing.txt", "utf8", (error, content) => {
    if (error) {
      return next(error);
    }

    res.send(content);
  });
});
```

## 5. HTTP status và response an toàn

Phân biệt lỗi do client với lỗi nội bộ:

| Tình huống | Status thường dùng | Ví dụ response |
| --- | --- | --- |
| Dữ liệu không hợp lệ | 400 | `{ "message": "Invalid input" }` |
| Chưa xác thực | 401 | `{ "message": "Unauthorized" }` |
| Không có quyền | 403 | `{ "message": "Forbidden" }` |
| Không tìm thấy | 404 | `{ "message": "User not found" }` |
| Lỗi không mong muốn | 500 | `{ "message": "Internal server error" }` |

Với lỗi 5xx, log chi tiết ở server nhưng trả client một message tổng quát. Không gửi stack trace, query database, secret hay chi tiết hạ tầng vào response production.

Error middleware cũng cần kiểm tra `res.headersSent`. Nếu response đã bắt đầu gửi, hãy gọi `next(error)` để Express default handler xử lý kết nối thay vì cố gửi response thứ hai.

## 6. Mẫu error middleware

```js
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode ?? 500;
  console.error(error);

  res.status(statusCode).json({
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
});
```

Ứng dụng thật thường tạo error class riêng, ví dụ `AppError` chứa `statusCode` và `isOperational`, để phân biệt lỗi nghiệp vụ có thể trả cho client với lỗi bug/hệ thống.

## 7. Liên hệ NestJS

NestJS có exception layer tích hợp sẵn:

```ts
throw new NotFoundException("User not found");
```

NestJS chuyển exception thành HTTP response phù hợp. Khi cần format response/log đặc biệt, có thể dùng exception filter; nguyên tắc vẫn giống Express: phân loại lỗi, trả message an toàn và log đủ thông tin ở server.

## 8. Hiểu nhầm thường gặp

| Hiểu nhầm | Giải thích đúng |
| --- | --- |
| `try/catch` tự bắt mọi lỗi async | Chỉ bắt rejection được `await` trong phạm vi `try`; callback/timer cần cơ chế phù hợp. |
| Chỉ cần thêm `async` là lỗi tự được handle | Vẫn cần `await/.catch`, hoặc để Express 5 nhận Promise return từ route. |
| Mọi lỗi đều nên trả 500 | Lỗi client như validation, auth hoặc not found cần status 4xx phù hợp. |
| `next(error)` tự gửi response | Nó chỉ chuyển luồng xử lý tới error middleware. |
| Nên trả lỗi database đầy đủ cho client | Không; log nội bộ ở server và trả message an toàn. |
| Express 4 và 5 xử lý rejected Promise giống nhau | Express 5 tự forward Promise rejection từ handler; Express 4 không làm điều này mặc định. |

## 9. Ví dụ thực hành

Ví dụ Express ở [NodeJS/Example/error-handling.js](../Example/error-handling.js) minh hoạ:

- `GET /sync-error`: lỗi đồng bộ.
- `GET /async-error`: lỗi trong async route, Express 5 tự forward.
- `GET /callback-error`: lỗi callback cần `next(error)`.
- `GET /timer-error`: lỗi timer cần `try/catch` trong callback rồi `next(error)`.
- Một URL không tồn tại: lỗi 404.

```bash
cd NodeJS
npm install
npm run start:error-handling
```

## 10. Câu hỏi ôn tập

### 1. Error handling là gì trong Node.js?

Đó là việc phát hiện, phân loại và xử lý lỗi để app không phản hồi một cách mất kiểm soát. Backend nên log lỗi đủ để chẩn đoán và trả HTTP status/message an toàn cho client.

### 2. Làm sao xử lý lỗi đồng bộ?

Dùng `try/catch` ở JavaScript thông thường. Trong Express, lỗi đồng bộ `throw` ngay trong route handler được Express bắt và chuyển tới error middleware.

### 3. Làm sao xử lý lỗi Promise với async/await?

Trong JavaScript thông thường, đặt `await` trong `try/catch`. Trong Express 5, async route handler trả Promise và rejected Promise/`throw` tự được chuyển tới error middleware; dùng `try/catch` khi cần xử lý cục bộ.

### 4. Khi nào cần gọi next(error) trong Express 5?

Cần gọi khi lỗi đến từ callback API hoặc timer mà Express không quản lý Promise đó, hoặc khi bạn muốn forward lỗi sau khi đã xử lý một phần. Với Promise được return từ async route, Express 5 tự forward rejection.

### 5. Vì sao không nên trả chi tiết lỗi nội bộ cho client?

Stack trace, SQL, cấu trúc server hoặc secret có thể hỗ trợ tấn công và làm lộ dữ liệu nhạy cảm. Hãy log chi tiết an toàn ở server; với lỗi 5xx, trả message tổng quát cho client.
