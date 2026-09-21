# JavaScript Theory

## Hoisting và Temperal Dead Zone

### Hoisting là gì

- `Hoisting` là cách JS xử lý các khai báo trước khi thực thi code
- Có thể hiểu rằng JS biết trước một số biến và function tồn tại trong scope trước khi chạy từng code một
- JS không thật sự di chuyển code lên trên, mà engine xử lý phần khai báo trong gia đoạn tạo execution context

### Hoisting với var

- Biến khai báo bằng `var` được hoist
- `var` được khởi tạo giá trị mặc định là `undefined`

```js
console.log(name); // undefined
var name = "Nhat";
```

### let và const có được hoist không ?

- Có, `let` và `const` cũng được hoist nhưng chúng chưa được initialize để bạn truy cập ngay
- Nếu truy cập trước dòng khai báo sẽ bị `ReferenceError`

```js
console.log(age); // RefenrenceError
let age = 22;
```

### Temporal Dead Zone là gì ?

- TDZ là khoảng thời gian từ lúc bắt đầu scope cho đến khi khai báo `let` hoặc `const` được thực thi.
- Trong TDZ, biến đã tồn tại trong scope nhưng chưa thể truy cập

```js
{
  // TDZ bắt đầu
  console.log(score); // ReferenceError
  let score = 10;
  // TDZ kết thúc
}
```

### const có thêm 1 yêu cầu ?

- `const` phải được gắn giá trị khi được khai báo
- Sau khi khai báo , `const` không được gán lại

```js
const appName = "Review App";
// Lỗi
const emptyValue;
```

### Hoisting với function

#### Function Declaration

- `Function Declaration` được hoist cả tên hàm và phần thân hàm
- Vì vậy có thể gọi function trước khi dòng khai báo của nó

```js
sayHello();
function sayHello() {
  console.log("Hello");
}
```

#### Function Expression

- `Function Expression` phụ thuộc vào biến đang chứa function
- Nếu biến đó khai báo bằng `var` biến được hoist với giá trị `undefined`
- Nếu biến đó khai báo bằng `let` hoặc `const`, biến nằm trong TDZ

```js
sayHi(); // TypeError: sayHi is not a function
var sayHi = function () {
  console.log("Hi");
};

sayHello(); //ReferenceError
const sayHello = function () {
  console.log("Hello");
};
```

### Tại sao JavaScript lại có TDZ

- TDZ giúp JavaScript phát hiện việc sử dụng biến trước khi biến được khai báo hợp lệ.
- Nó làm code rõ ràng hơn và tránh mốt số lỗi khó đoán như khi dùng `var`

### Lỗi thường gặp

- `let` và `const` không được hoist
- Đúng hơn `let` và `const` được hoist, nhưng không truy cập được trước khai báo vì nằm trong TDZ
- Gọi `function expression` trước khi biến chứa function được gán giá trị
