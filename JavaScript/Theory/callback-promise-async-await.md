# JavaScript Theory

## Callback - Promise - Async/Await

- Nhớ nhanh:
  - Callback -> truyền function vào function khác để chạy sau
  - Promise -> đại diện cho kết quả async trong tương lai
  - Async/Await -> cú pháp giúp viết Promise dễ đọc hơn

### 1. Callback

- `Callback` là một function được truyền vào function khác để chạy sau khi một việc nào đó hoàn thành.

```js
function processUser(name, callback) {
  console.log(`Processing ${name}`);

  callback();
}

processUser("Nhật", () => {
  console.log("Done");
});
```

- Output:

```txt
Processing Nhật
Done
```

- Function dưới đây là callback:

```js
() => {
  console.log("Done");
}
```

Ví dụ async:

```js
setTimeout(() => {
  console.log("API finished");
}, 1000);
```

- Function truyền vào `setTimeout` là callback.

### 2. Callback Hell

- Nếu nhiều async task phụ thuộc nhau, callback có thể bị lồng sâu:

```js
login(user, () => {
  getProfile(() => {
    getOrders(() => {
      getPayment(() => {
        console.log("Done");
      });
    });
  });
});
```

- Code bị lồng nhiều tầng và khó đọc.
- Đây thường gọi là `callback hell`.
- Promise và async/await giúp flow async dễ đọc hơn.

### 3. Promise

- `Promise` đại diện cho kết quả của một tác vụ async có thể hoàn thành trong tương lai.
- Promise thường có 3 trạng thái:
  - `pending` -> đang xử lý
  - `fulfilled` -> thành công
  - `rejected` -> thất bại

Ví dụ:

```js
const promise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve("Success");
  } else {
    reject("Failed");
  }
});
```

- `resolve()` -> Promise thành công.
- `reject()` -> Promise thất bại.

#### Dùng .then() và .catch()

```js
promise
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
```

- Nếu `resolve("Success")` thì chạy `.then()`.
- Nếu `reject("Failed")` thì chạy `.catch()`.

Ví dụ API:

```js
fetch("/api/users")
  .then((response) => response.json())
  .then((users) => {
    console.log(users);
  })
  .catch((error) => {
    console.log(error);
  });
```

- Ở đây flow là: `fetch()` -> Promise -> `.then()` -> `.then()` -> `.catch()`.

### 4. Async/Await

- `async/await` giúp viết code dùng Promise nhìn giống code tuần tự hơn.

Thay vì:

```js
fetch("/api/users")
  .then((response) => response.json())
  .then((users) => console.log(users));
```

Ta có thể viết:

```js
async function getUsers() {
  const response = await fetch("/api/users");
  const users = await response.json();

  console.log(users);
}
```

- `await` chờ Promise hoàn thành trong phạm vi `async function`.
- `await` lấy giá trị đã được `resolve` từ Promise.

### 5. async function luôn trả về Promise

```js
async function getName() {
  return "Nhật";
}

getName().then((name) => {
  console.log(name);
});
```

- Dù return `"Nhật"`, kết quả của `getName()` vẫn là Promise.
- Có thể hiểu gần giống:

```js
function getName() {
  return Promise.resolve("Nhật");
}
```

### 6. await

```js
function getUser() {
  return Promise.resolve({
    name: "Nhật",
  });
}

async function main() {
  const user = await getUser();

  console.log(user.name);
}

main();
```

- `await getUser()` lấy object user mà Promise resolve ra.
- Nếu không dùng `await`, giá trị nhận được thường là Promise.

### 7. Ví dụ backend thực tế

```js
async function getUserById(id) {
  const user = await database.findUser(id);

  return user;
}
```

Ví dụ với Prisma:

```js
async function getUsers() {
  const users = await prisma.user.findMany();

  return users;
}
```

- `findMany()` trả về Promise, nên dùng `await` để lấy kết quả.

### 8. Cùng một flow qua 3 cách viết

Callback:

```js
getUser(id, (user) => {
  console.log(user);
});
```

Promise:

```js
getUser(id).then((user) => {
  console.log(user);
});
```

Async/Await:

```js
const user = await getUser(id);
console.log(user);
```

- Trong code hiện đại, `async/await` thường dễ đọc hơn khi có nhiều bước async liên tiếp.

### 9. Lỗi thường gặp

1. Quên `await`.

```js
const user = getUser();
```

- Lúc này `user` có thể là Promise, chưa phải object user.

```js
const user = await getUser();
```

2. Dùng `await` không đúng context.

```js
await getUser();
```

- Trong file script thông thường, `await` cần nằm trong `async function`.

```js
async function main() {
  const user = await getUser();
}
```

3. Nghĩ `await` làm toàn bộ JavaScript dừng lại.

- Không. `await` chỉ làm async function hiện tại tạm chờ Promise hoàn thành.
- Các phần khác của chương trình vẫn có thể tiếp tục chạy.

4. Không xử lý reject/error.

```js
async function main() {
  try {
    const user = await getUser();
    console.log(user);
  } catch (error) {
    console.log(error.message);
  }
}
```

- Nếu Promise reject mà không xử lý, chương trình có thể phát sinh lỗi.

### 10. Câu hỏi nên nhớ

1. Promise là gì?
   - Promise đại diện cho kết quả của một hoạt động không đồng bộ. Nó có thể đang chờ xử lý, thành công hoặc thất bại.

2. Điểm khác nhau giữa Promise và async/await là gì?
   - `async/await` là cú pháp được xây dựng trên Promise. Nó khiến code bất đồng bộ dễ đọc và dễ viết hơn, đặc biệt khi nhiều thao tác async phụ thuộc lẫn nhau.

3. Callback là gì?
   - Callback là function được truyền vào function khác để chạy sau, thường là sau khi một thao tác hoàn tất.
