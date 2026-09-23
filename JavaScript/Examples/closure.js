/*
  Closure trong JavaScript

  Chạy file:
  node JavaScript/Examples/closure.js
*/

console.log("=== 1. Closure cơ bản ===");

function outer() {
  const name = "Nhat";

  function inner() {
    console.log(name);
  }

  return inner;
}

const fn = outer();
fn(); // Nhat

/*
  outer() đã chạy xong.
  Nhưng inner vẫn nhớ được biến name ở scope bên ngoài.
  Đây chính là closure.
*/

console.log("\n=== 2. Counter với closure ===");

function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

/*
  count không bị reset về 0 sau mỗi lần gọi counter().
  Vì counter đang giữ quyền truy cập tới biến count.
*/

console.log("\n=== 3. Mỗi closure có state riêng ===");

const counterA = createCounter();
const counterB = createCounter();

console.log("counterA:", counterA()); // 1
console.log("counterA:", counterA()); // 2
console.log("counterB:", counterB()); // 1

/*
  createCounter() được gọi 2 lần.
  Vì vậy counterA và counterB có 2 biến count riêng.
*/

console.log("\n=== 4. Private state ===");

function createUser() {
  let password = "123456";

  return {
    checkPassword(input) {
      return input === password;
    },
    changePassword(newPassword) {
      password = newPassword;
    },
  };
}

const user = createUser();

console.log(user.password); // undefined
console.log(user.checkPassword("123456")); // true

user.changePassword("abcdef");

console.log(user.checkPassword("123456")); // false
console.log(user.checkPassword("abcdef")); // true

/*
  password không được expose trực tiếp ra ngoài.
  Nhưng các method bên trong vẫn truy cập được password nhờ closure.
*/

console.log("\n=== 5. Function factory ===");

function createLogger(serviceName) {
  return function (message) {
    console.log(`[${serviceName}] ${message}`);
  };
}

const userLogger = createLogger("UserService");
const authLogger = createLogger("AuthService");

userLogger("User created");
authLogger("Login successful");

/*
  userLogger nhớ serviceName = "UserService".
  authLogger nhớ serviceName = "AuthService".
*/

console.log("\n=== 6. Closure giữ biến, không copy giá trị lúc tạo ===");

function createPrinter() {
  let value = 1;

  const printValue = function () {
    console.log(value);
  };

  value = 10;

  return printValue;
}

const print = createPrinter();
print(); // 10

/*
  Closure giữ quyền truy cập tới biến value.
  Nó không chỉ chụp lại giá trị value = 1 tại thời điểm function được tạo.
*/

console.log("\n=== 7. Gọi outer function lại sẽ tạo closure mới ===");

console.log(createCounter()()); // 1
console.log(createCounter()()); // 1

/*
  Mỗi lần createCounter() chạy,
  JavaScript tạo một lexical environment mới.
  Vì vậy mỗi closure mới có count riêng bắt đầu từ 0.
*/

console.log("\n=== 8. Tổng kết nhanh ===");

/*
  Closure là khi function nhớ được biến ở scope bên ngoài,
  kể cả sau khi outer function đã chạy xong.

  Thường gặp trong:
  - counter/state riêng
  - private state
  - function factory
  - callback/event handler
  - middleware factory
*/
