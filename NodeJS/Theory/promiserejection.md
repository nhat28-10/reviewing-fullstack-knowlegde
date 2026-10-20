# Promise rejection và unhandled rejection

## 1. Promise rejection là gì?

Promise có ba trạng thái:

| Trạng thái | Ý nghĩa |
| --- | --- |
| `pending` | Chưa có kết quả. |
| `fulfilled` | Hoàn tất thành công với một giá trị. |
| `rejected` | Hoàn tất thất bại với một lý do (rejection reason). |

Một hàm `async` luôn trả về Promise. Nếu nó `throw`, Promise được trả về sẽ bị reject:

```js
async function getUser() {
  throw new Error("User not found");
}
```

Xử lý rejection bằng Promise chain:

```js
getUser()
  .then((user) => {
    console.log(user);
  })
  .catch((error) => {
    console.error(error.message);
  });
```

Hoặc dùng `async/await`:

```js
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

## 2. Unhandled rejection là gì?

Unhandled rejection xảy ra khi Promise bị reject mà không có rejection handler được gắn trong thời gian Node.js cho phép (một turn của event loop).

```js
async function getUser() {
  throw new Error("Database failed");
}

getUser(); // Promise bị reject nhưng không được await hoặc catch.
console.log("Continue running");
```

`console.log` vẫn có thể chạy trước khi Node.js phát hiện rejection. Với mặc định Node.js hiện đại (`--unhandled-rejections=throw`), một rejection không được xử lý có thể được nâng thành uncaught exception và làm process thoát. Hành vi có thể thay đổi khi dùng cờ runtime hoặc global event listener, nên không được dựa vào unhandled rejection như một luồng xử lý lỗi bình thường.

## 3. Lỗi phổ biến: quên await trong try/catch

Đoạn sau **không** bắt được rejection từ `saveUser()`:

```js
async function saveUser() {
  throw new Error("Database error");
}

async function main() {
  try {
    saveUser(); // Thiếu await.
    console.log("User saved");
  } catch (error) {
    console.error("Caught:", error.message);
  }
}
```

`try/catch` kết thúc trước khi Promise reject. Cách đúng:

```js
async function main() {
  try {
    await saveUser();
    console.log("User saved");
  } catch (error) {
    console.error("Caught:", error.message);
  }
}
```

Nếu không cần `await` ngay lúc gọi (fire-and-forget), vẫn phải chủ động gắn handler:

```js
void saveUser().catch((error) => {
  console.error("Background task failed:", error);
});
```

`void` ở đây thể hiện rằng caller cố ý không chờ kết quả; `.catch()` vẫn bắt buộc để quan sát và xử lý failure.

## 4. Promise chain: phải return hoặc catch

Khi tạo Promise chain trong một hàm, return Promise đó để caller/Express có thể theo dõi lỗi:

```js
function loadUser() {
  return fetchUserFromDatabase()
    .then((user) => transformUser(user));
}
```

Nếu không return:

```js
function loadUser() {
  fetchUserFromDatabase().then(transformUser);
  // Caller nhận undefined, không thể await/catch chain này.
}
```

Lỗi trong chain có thể trở thành unhandled rejection. Quy tắc: mọi Promise tạo ra cần được `await`, `return` hoặc có `.catch()` phù hợp.

## 5. Promise rejection trong Express 5

Express 5 tự chuyển rejected Promise từ route handler/middleware sang error middleware, miễn là Promise được **return**. Hàm `async` luôn return Promise nên code sau hoạt động:

```js
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ users });
});
```

Nếu `findMany()` reject, Express 5 xử lý giống `next(error)`. Không cần `try/catch` chỉ để forward lỗi, dù `try/catch` vẫn hữu ích khi cần chuyển đổi lỗi database thành lỗi nghiệp vụ.

Với Promise chain, cần return chain:

```js
app.get("/users", (req, res) => {
  return getUsers().then((users) => {
    res.json({ users });
  });
});
```

Đừng viết:

```js
app.get("/users", (req, res) => {
  getUsers().then((users) => {
    res.json({ users });
  });

  // Express không biết Promise này để tự forward rejection.
});
```

Để xử lý callback API hoặc timer, vẫn dùng `next(error)` vì lỗi đó không nằm trong Promise do handler return.

## 6. process.on("unhandledRejection")

Node.js phát ra event `unhandledRejection` khi Promise bị reject mà chưa có handler trong một turn của event loop:

```js
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection detected:", reason);
  // Gửi log/alert tới monitoring ở đây.
});
```

Nếu sau đó Promise mới được gắn `.catch()`, Node.js phát event `rejectionHandled`. Các event này hữu ích cho logging và monitoring, nhưng không thay thế xử lý lỗi tại nơi Promise được tạo/gọi.

Không coi global handler là cách để server tiếp tục chạy an toàn sau mọi lỗi. Một unhandled rejection thường cho thấy luồng xử lý đã bỏ sót lỗi; cần sửa code, thực hiện graceful shutdown khi phù hợp và để process manager/orchestrator khởi động lại process.

## 7. Hiểu nhầm thường gặp

| Hiểu nhầm | Giải thích đúng |
| --- | --- |
| Hàm `async` tự xử lý lỗi | Nó chỉ biến lỗi `throw` thành rejected Promise. |
| Có `try/catch` là bắt được mọi Promise rejection | Chỉ khi Promise được `await` trong `try` hoặc chain được return/handle đúng cách. |
| Quên `await` chỉ làm code chạy nhanh hơn | Có thể trả response trước khi I/O xong và bỏ sót lỗi. |
| Fire-and-forget không cần xử lý lỗi | Vẫn cần `.catch()`, logging và chiến lược retry/queue phù hợp. |
| Express 5 tự bắt mọi lỗi async | Chỉ với Promise được return từ handler; callback/timer cần `next(error)`. |
| Global `unhandledRejection` handler là đủ | Nó chỉ là lớp quan sát/phòng vệ cuối; lỗi phải được xử lý gần nguồn. |

## 8. Ví dụ thực hành

Ví dụ Express tại [NodeJS/Example/promise-rejection.js](../Example/promise-rejection.js) có các endpoint:

- `GET /handled-await`: `await + try/catch`.
- `GET /express5-auto`: async rejection được Express 5 tự forward.
- `GET /promise-chain`: return Promise chain để Express theo dõi.
- `POST /background-task`: fire-and-forget có `.catch()` để không tạo unhandled rejection.

```bash
cd NodeJS
npm install
npm run start:promise-rejection
```

## 9. Câu hỏi ôn tập

### 1. Promise rejection là gì?

Đó là trạng thái thất bại của Promise, kèm một rejection reason (thường là `Error`). `throw` trong hàm `async` tạo ra rejected Promise.

### 2. Unhandled rejection là gì?

Đó là rejected Promise chưa được gắn error handler kịp thời. Node.js phát event `unhandledRejection`; với cấu hình mặc định hiện đại, rejection không được xử lý có thể trở thành uncaught exception và làm process thoát.

### 3. Làm sao ngăn unhandled rejection?

Luôn `await` Promise trong `try/catch`, return Promise chain để caller handle, hoặc gắn `.catch()`. Với background task, gắn `.catch()` để log/retry/đưa vào queue thay vì bỏ qua lỗi.

### 4. try/catch có bắt rejected Promise mà không await không?

Không. Nếu gọi async function mà không `await` hoặc return Promise của nó, `try/catch` bên ngoài thường kết thúc trước khi Promise reject.

### 5. Trong Express 5, khi nào rejected Promise tự đến error middleware?

Khi route handler/middleware return Promise bị reject. Async handler tự đáp ứng điều này; Promise chain phải được return. Lỗi callback/timer vẫn cần `next(error)`.
