# JavaScript Theory

## Microtask vs Macrotask

- Example: `../Examples/microtask-macrotask.js`

- Nhớ nhanh:
  - Code đồng bộ chạy trước.
  - `Microtask` chạy sau code đồng bộ, trước macrotask.
  - `Macrotask` chạy sau khi microtask queue đã được xử lý xong.

```txt
Sync code
-> Microtask Queue
-> Macrotask Queue
```

### 1. Microtask là gì?

- `Microtask` là những task có độ ưu tiên cao hơn macrotask.
- Sau khi code đồng bộ hiện tại chạy xong và Call Stack rỗng, Event Loop sẽ xử lý hết microtask queue trước.

Một số nguồn tạo microtask phổ biến:

```txt
Promise.then()
Promise.catch()
Promise.finally()
queueMicrotask()
phần còn lại sau await
```

Ví dụ:

```js
console.log("A");

Promise.resolve().then(() => {
  console.log("B");
});

console.log("C");
```

Output:

```txt
A
C
B
```

- `"A"` và `"C"` là code đồng bộ nên chạy trước.
- Callback trong `.then()` là microtask nên chạy sau code đồng bộ.

### 2. Macrotask là gì?

- `Macrotask` là những task bất đồng bộ thường gặp như timer hoặc event callback.
- Macrotask chỉ được xử lý sau khi code đồng bộ chạy xong và microtask queue đã rỗng.

Một số nguồn tạo macrotask phổ biến:

```txt
setTimeout()
setInterval()
event callback
I/O callback
```

Ví dụ:

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");
```

Output:

```txt
A
C
B
```

- Dù delay là `0`, callback của `setTimeout` vẫn phải chờ code đồng bộ hiện tại chạy xong.

### 3. Promise vs setTimeout

- Đây là ví dụ kinh điển để thấy microtask được ưu tiên trước macrotask.

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

Output:

```txt
A
D
C
B
```

Thứ tự suy luận:

```txt
A -> sync code
setTimeout(...) -> đăng ký macrotask
Promise.then(...) -> đăng ký microtask
D -> sync code
C -> microtask
B -> macrotask
```

- Dù `setTimeout(..., 0)` được viết trước `.then()`, Promise callback vẫn chạy trước.
- Lý do là khi Call Stack rỗng, Event Loop xử lý microtask queue trước, rồi mới tới macrotask queue.

```txt
Call Stack rỗng
-> Microtask Queue còn việc?
-> chạy hết microtask
-> lấy macrotask tiếp theo
```

### 4. Async/Await liên quan thế nào?

- `await` làm phần còn lại của `async function` được xử lý sau.
- Phần sau `await` thường được đưa vào microtask queue.
- Vì vậy `await` không block toàn bộ JavaScript.

Ví dụ:

```js
async function test() {
  console.log("A");

  await Promise.resolve();

  console.log("B");
}

console.log("Start");

test();

console.log("End");
```

Output:

```txt
Start
A
End
B
```

- `test()` chạy tới `await` thì tạm dừng phần còn lại của function.
- JavaScript tiếp tục chạy `console.log("End")`.
- Sau đó phần sau `await` mới chạy tiếp và in ra `"B"`.

### 5. queueMicrotask()

- `queueMicrotask()` dùng để chủ động đưa một callback vào microtask queue.

```js
console.log("A");

queueMicrotask(() => {
  console.log("B");
});

console.log("C");
```

Output:

```txt
A
C
B
```

- Callback trong `queueMicrotask()` chạy sau code đồng bộ, tương tự callback trong `Promise.then()`.

### 6. Một ví dụ kết hợp

```js
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

queueMicrotask(() => {
  console.log("4");
});

console.log("5");
```

Output:

```txt
1
5
3
4
2
```

Thứ tự suy luận:

```txt
1 -> sync code
setTimeout -> macrotask
Promise.then -> microtask
queueMicrotask -> microtask
5 -> sync code
3 -> microtask đăng ký trước
4 -> microtask đăng ký sau
2 -> macrotask
```

### 7. Lỗi thường gặp

1. Nhớ máy móc rằng Promise luôn chạy trước `setTimeout`.
   - Nói chính xác hơn: callback của Promise như `.then()`, `.catch()`, `.finally()` thường được đưa vào microtask queue.
   - Microtask queue được xử lý trước macrotask queue sau khi code đồng bộ hiện tại kết thúc.

2. Nghĩ bản thân `Promise.resolve("A")` sẽ tự in ra kết quả.
   - Không phải.
   - Promise chỉ tạo ra giá trị async.
   - Callback như `.then()` mới là thứ được schedule làm microtask.

3. Nghĩ `setTimeout(..., 0)` chạy ngay lập tức.
   - Không phải.
   - Nó chỉ đăng ký callback vào macrotask queue.
   - Callback vẫn phải chờ Call Stack rỗng và microtask queue xử lý xong.

### 8. Câu hỏi thường gặp

1. Sự khác nhau giữa microtask và macrotask là gì?
   - Microtask có độ ưu tiên cao hơn macrotask.
   - Sau khi code đồng bộ chạy xong, Event Loop sẽ xử lý hết microtask queue trước khi lấy macrotask tiếp theo.

2. Tại sao `Promise.then()` chạy trước `setTimeout(..., 0)`?
   - Vì callback của `Promise.then()` là microtask.
   - Callback của `setTimeout()` là macrotask.
   - Sau sync code, Event Loop ưu tiên xử lý microtask trước.

3. `await` có liên quan gì tới microtask?
   - Phần code sau `await` được tiếp tục xử lý sau, gần giống một microtask.
   - Vì vậy `await` chỉ tạm dừng `async function` hiện tại, không dừng toàn bộ chương trình.
