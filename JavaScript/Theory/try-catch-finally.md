# JavaScript Theory

## Try - Catch - Finally

- Example: `../Examples/try-catch-finally.js`

- Nhớ nhanh:
  - `try` -> chạy đoạn code có thể phát sinh lỗi
  - `catch` -> xử lý lỗi nếu trong `try` có lỗi
  - `finally` -> luôn chạy dù thành công hay thất bại

### 1. Try / Catch

- Ví dụ cơ bản:

```js
try {
  const user = JSON.parse("invalid json");

  console.log(user);
} catch (error) {
  console.log("Có lỗi:", error.message);
}
```

- `JSON.parse()` bị lỗi nên JavaScript nhảy sang `catch`.
- Nếu `try` không có lỗi thì `catch` sẽ không chạy.

Output:

```txt
Có lỗi: ...
```

### 2. Finally

- `finally` luôn chạy sau `try/catch`.

```js
try {
  console.log("Try");
} catch (error) {
  console.log("Catch");
} finally {
  console.log("Finally");
}
```

- Nếu không có lỗi:

```txt
Try
Finally
```

- Nếu có lỗi:

```txt
Catch
Finally
```

### 3. Use case thực tế

- `finally` thường dùng để dọn dẹp tài nguyên hoặc reset trạng thái.
- Ví dụ trong frontend, dù gọi API thành công hay thất bại thì vẫn phải tắt loading.

```js
let loading = false;

try {
  loading = true;

  await fetchData();
} catch (error) {
  console.log(error.message);
} finally {
  loading = false;
}
```

- Dù `fetchData()` thành công hay thất bại thì cuối cùng vẫn chạy:

```js
loading = false;
```

### 4. Xử lý lỗi với async/await

- Khi Promise bị reject, `await` sẽ ném lỗi để `catch` xử lý.

```js
async function getUser() {
  throw new Error("User not found");
}

async function main() {
  try {
    const user = await getUser();

    console.log(user);
  } catch (error) {
    console.log(error.message);
  }
}

main();
```

Output:

```txt
User not found
```

- Có thể nhớ nhanh:
  - Promise `resolve` -> `await` trả về value
  - Promise `reject` -> `await` throw error -> `catch` xử lý

### 5. Throw new Error()

- Ta cũng có thể chủ động tạo lỗi bằng `throw new Error()`.

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }

  return a / b;
}

try {
  const result = divide(10, 0);

  console.log(result);
} catch (error) {
  console.log(error.message);
}
```

Output:

```txt
Cannot divide by zero
```

- Trong backend bạn sẽ thường gặp kiểu:

```js
if (!user) {
  throw new Error("User not found");
}
```

### 6. Lỗi thường gặp

1. Quên `await`.

```js
try {
  const user = getUser();

  console.log(user);
} catch (error) {
  console.log(error.message);
}
```

- Nếu `getUser()` trả về Promise bị reject, `try/catch` trên không bắt lỗi theo cách bạn mong đợi vì bạn chưa `await` Promise đó.

Nên viết:

```js
try {
  const user = await getUser();

  console.log(user);
} catch (error) {
  console.log(error.message);
}
```

2. Để `catch` rỗng.

```js
try {
  await getUser();
} catch (error) {
}
```

- Không nên nuốt lỗi như vậy.
- Ít nhất nên log lỗi, transform lỗi hoặc trả response phù hợp.

```js
try {
  await getUser();
} catch (error) {
  console.log(error.message);
}
```

### 7. Câu hỏi thường gặp

1. Sự khác nhau giữa `try`, `catch` và `finally` là gì?
   - `try` chứa đoạn code có thể phát sinh lỗi.
   - `catch` xử lý lỗi nếu lỗi xảy ra trong `try`.
   - `finally` luôn chạy sau cùng, dù thao tác thành công hay thất bại.

2. Làm cách nào để xử lý lỗi với async/await?
   - Thường bọc các thao tác bất đồng bộ trong `try/catch`.
   - Nếu Promise reject, `await` sẽ ném lỗi và `catch` có thể xử lý lỗi đó.

3. Khi nào nên dùng `finally`?
   - Khi cần chạy một việc cuối cùng trong cả hai trường hợp thành công và thất bại.
   - Ví dụ: tắt loading, đóng connection, clear timer, giải phóng tài nguyên.
