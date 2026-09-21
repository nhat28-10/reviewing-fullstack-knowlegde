/*
  Hoisting & Temporal Dead Zone trong JavaScript

  Cách học:
  1. Đọc từng phần từ trên xuống.
  2. Chạy file: node JavaScript/Examples/hoisting-tdz.js
  3. Các dòng lỗi đang được comment lại.
  4. Muốn thấy lỗi thật thì bỏ comment từng dòng một rồi chạy lại.
*/

console.log("=== 1. Hoisting là gì? ===");

/*
  Hoisting là cách JavaScript xử lý khai báo trước khi chạy code.

  Nói đơn giản:
  - JavaScript biết trước một số biến/function tồn tại trong scope.
  - Nhưng cách hoạt động sẽ khác nhau giữa var, let, const và function.
*/

console.log("\n=== 2. Hoisting với var ===");

console.log("Trước khi khai báo var:", userName);

var userName = "Nhat";

console.log("Sau khi khai báo var:", userName);

/*
  Với var, JavaScript hiểu gần giống như:

  var userName;
  console.log(userName); // undefined
  userName = "Nhat";

  Vì vậy:
  - var được hoist.
  - var được gán giá trị mặc định là undefined.
*/

console.log("\n=== 3. var chỉ hoist phần khai báo, không hoist phần gán giá trị ===");

console.log("score trước khi gán:", score)

var score = 10;

console.log("score sau khi gán:", score)

/*
  Phần được hoist:
  var score;

  Phần không được hoist:
  score = 10;
*/

console.log("\n=== 4. Hoisting với let ===");

// Lỗi: let có hoist nhưng nằm trong TDZ.
// console.log(age);
// ReferenceError: Cannot access 'age' before initialization

let age = 22;
console.log("Sau khi khai báo let:", age);

/*
  let cũng được hoist.
  Nhưng let không được khởi tạo giá trị undefined như var.

  Trước dòng khai báo let, biến nằm trong TDZ.
*/

console.log("\n=== 5. Hoisting với const ===");

// Lỗi: const cũng nằm trong TDZ trước dòng khai báo.
// console.log(country);
// ReferenceError: Cannot access 'country' before initialization

const country = "Viet Nam";
console.log("Sau khi khai báo const:", country);

/*
  const giống let ở điểm:
  - có hoist
  - nằm trong TDZ
  - không truy cập được trước dòng khai báo

  const khác let ở điểm:
  - const bắt buộc phải có giá trị khi khai báo
  - const không được gán lại
*/

console.log("\n=== 6. Temporal Dead Zone là gì? ===");

{
  /*
    TDZ bắt đầu từ đầu block này
    cho đến trước dòng khai báo message.
  */

  // Lỗi: đang nằm trong TDZ.
  // console.log(message);
  // ReferenceError: Cannot access 'message' before initialization

  let message = "Đã ra khỏi TDZ";

  console.log(message);
}

/*
  TDZ là khoảng thời gian từ lúc bắt đầu scope
  đến trước dòng khai báo let/const.

  Trong khoảng này, nếu truy cập biến sẽ bị ReferenceError.
*/

console.log("\n=== 7. TDZ xảy ra theo từng scope ===");

let topic = "Global Topic";

{
  // Lỗi: biến topic bên trong block shadow biến topic bên ngoài.
  // Dù bên ngoài đã có topic, dòng dưới vẫn lỗi vì topic trong block đang ở TDZ.
  // console.log(topic);
  // ReferenceError: Cannot access 'topic' before initialization

  let topic = "Block Topic";

  console.log("Trong block:", topic)
}
console.log("Ngoài block:", topic)

/*
  Đây là case rất hay bị nhầm.

  Vì trong block có let topic,
  nên JavaScript ưu tiên topic của block đó.

  Trước dòng let topic = "Block topic",
  topic trong block đang nằm trong TDZ.
*/

console.log("\n=== 8. Function Declaration được hoist ===");

sayHello();

function sayHello() {
  console.log("Hello từ function declaration")
}

/*
  Function declaration được hoist cả tên hàm và phần thân hàm.
  Vì vậy có thể gọi trước khi khai báo.
*/

console.log("\n=== 9. Function Expression với var ===");

// Lỗi: sayHi lúc này là undefined, không phải function.
// sayHi();
// TypeError: sayHi is not a function

var sayHi = function () {
  console.log("Hi từ function expression với var")
};

sayHi();

/*
  Với var:
  - biến sayHi được hoist.
  - giá trị ban đầu là undefined.
  - function chỉ được gán sau khi chạy tới dòng var sayHi = ...
*/

console.log("\n=== 10. Function Expression với const ===");

// Lỗi: sayGoodbye đang nằm trong TDZ.
// sayGoodbye();
// ReferenceError: Cannot access 'sayGoodbye' before initialization

const sayGoodbye = function () {
  console.log("Goodbye từ function expression với const")
}
sayGoodbye();

/*
  Với const:
  - biến sayGoodbye được hoist.
  - nhưng nằm trong TDZ trước dòng khai báo.
  - chỉ gọi được sau khi khai báo xong.
*/

console.log("\n=== 11. Function Expression với arrow function ===");

// Lỗi: arrow function gán vào const cũng nằm trong TDZ.
// sayWelcome();
// ReferenceError: Cannot access 'sayWelcome' before initialization

const sayWelcome = () => {
  console.log("Welcome từ arrow function")
}
sayWelcome();

/*
  Arrow function thường là function expression.
  Nếu gán vào const/let thì chịu quy tắc TDZ như const/let.
*/

console.log("\n=== 12. Tổng kết ===");

/*
  var:
  - được hoist
  - được khởi tạo là undefined
  - dùng trước khai báo không lỗi, nhưng giá trị là undefined

  let:
  - được hoist
  - nằm trong TDZ
  - dùng trước khai báo sẽ ReferenceError

  const:
  - được hoist
  - nằm trong TDZ
  - phải gán giá trị ngay khi khai báo
  - không được gán lại

  Function Declaration:
  - được hoist cả phần thân hàm
  - có thể gọi trước dòng khai báo

  Function Expression:
  - phụ thuộc vào biến chứa function
  - var: dễ gặp TypeError nếu gọi trước
  - let/const: gặp ReferenceError nếu gọi trước
*/