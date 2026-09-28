# JavaScript Theory

## Call Stack & Event Loop

- Example: `../Examples/callstack-eventloop.js`

- Tổng quan:
  - `Call Stack` -> nơi JavaScript theo dõi function đang chạy
  - `Event Loop` -> cơ chế đưa callback async vào chạy khi Call Stack rảnh
  - JavaScript là `single-threaded`, tại một thời điểm main thread chỉ thực thi một việc

### 1. Call Stack

- `Call Stack` hoạt động theo kiểu `LIFO`.
- `LIFO` = `Last In, First Out`.
- Function được gọi sau sẽ hoàn thành trước.

Ví dụ:

```js
function first() {
  second();
  console.log("First");
}

function second() {
  console.log("Second");
}

first();
```

Output:

```txt
Second
First
```

Luồng chạy đơn giản:

```txt
first()
-> second()
-> console.log("Second")
-> second() xong
-> console.log("First")
-> first() xong
```

- Có thể hình dung Call Stack như một chồng sách:
  - Function nào vào sau thì nằm trên cùng.
  - Function nằm trên cùng phải chạy xong trước rồi mới pop ra khỏi stack.

### 2. Event Loop

- `Event Loop` giúp JavaScript xử lý callback bất đồng bộ sau khi Call Stack rảnh.
- Ví dụ kinh điển:

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

- Nhiều người mới học sẽ nghĩ `0ms` thì `"B"` phải chạy ngay, nhưng không.
- `setTimeout(..., 0)` không có nghĩa là callback chạy ngay lập tức.
- Callback chỉ đủ điều kiện chạy sau khi:
  - thời gian timer đã tới
  - code đồng bộ hiện tại đã chạy xong
  - Call Stack đã rỗng

Luồng chạy:

```txt
console.log("A")
-> setTimeout(...) đăng ký callback chờ
-> console.log("C")
-> Call Stack rỗng
-> Event Loop đưa callback của setTimeout vào Call Stack
-> console.log("B")
```

### 3. Event Loop dùng để làm gì?

- Event Loop giúp JavaScript xử lý các công việc bất đồng bộ mà không block toàn bộ chương trình trong lúc chờ.

Ví dụ các công việc thường gặp:

```txt
timer
network request
user event
file system
database callback
async callback
```

Ví dụ trong backend:

```js
console.log("Start");

setTimeout(() => {
  console.log("Database result");
}, 1000);

console.log("Continue");
```

Output:

```txt
Start
Continue
Database result
```

- JavaScript không đứng yên 1 giây để chờ timer.
- Nó chạy tiếp `console.log("Continue")`, sau đó callback của timer mới được đưa vào xử lý khi đủ điều kiện.

### 4. Microtask và Macrotask

- Khi học Event Loop, nên biết thêm hai nhóm task phổ biến:
  - `Microtask` -> Promise callback, phần còn lại sau `await`
  - `Macrotask` -> `setTimeout`, `setInterval`, event callback

Ví dụ:

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

- Code đồng bộ chạy trước: `"A"` rồi `"D"`.
- Sau đó JavaScript xử lý microtask từ Promise: `"C"`.
- Cuối cùng mới tới callback của `setTimeout`: `"B"`.

### 5. Liên hệ với async/await

- `async/await` cũng liên quan tới Event Loop.
- `await` làm phần còn lại của `async function` chờ xử lý sau, không làm toàn bộ JavaScript dừng lại.

Ví dụ:

```js
async function getData() {
  console.log("A");

  await Promise.resolve();

  console.log("B");
}

console.log("Start");

getData();

console.log("End");
```

Output:

```txt
Start
A
End
B
```

- `getData()` chạy tới `await` thì tạm dừng phần còn lại của function.
- JavaScript tiếp tục chạy `console.log("End")`.
- Sau đó phần sau `await` mới chạy tiếp và in ra `"B"`.

### 6. Lỗi thường gặp

1. Hiểu sai rằng Event Loop chạy code thay cho Call Stack.
   - Không phải.
   - Call Stack mới là nơi JavaScript thực thi function.
   - Event Loop chủ yếu kiểm tra Call Stack đã rảnh chưa để đưa task đang chờ vào xử lý.

2. Hiểu sai `setTimeout(callback, 0)` là chạy ngay lập tức.
   - Không phải.
   - Callback chỉ được đưa vào chạy sau khi code đồng bộ hiện tại chạy xong và Call Stack rỗng.

3. Nghĩ `await` làm toàn bộ chương trình dừng lại.
   - Không phải.
   - `await` chỉ tạm dừng `async function` hiện tại.
   - Các phần code khác vẫn có thể tiếp tục chạy.

### 7. Câu hỏi thường gặp

1. Call Stack là gì?
   - Call Stack theo dõi các function đang được thực thi.
   - Nó tuân theo thứ tự `LIFO`, nên function được gọi gần nhất sẽ kết thúc trước.

2. Event Loop là gì?
   - Event Loop kiểm tra Call Stack có rỗng chưa.
   - Khi Call Stack rỗng, nó đưa các callback bất đồng bộ đang chờ vào xử lý.

3. Vì sao `setTimeout(..., 0)` vẫn chạy sau code đồng bộ?
   - Vì callback của `setTimeout` phải chờ Call Stack rỗng.
   - Code đồng bộ hiện tại luôn chạy xong trước.

4. Promise và setTimeout cái nào chạy trước?
   - Nếu cùng đang chờ sau code đồng bộ, Promise callback thường chạy trước `setTimeout`.
   - Vì Promise callback nằm trong microtask queue, còn `setTimeout` nằm trong macrotask queue.
