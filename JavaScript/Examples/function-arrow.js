"use strict";

/*
  Function & Arrow Function trong JavaScript

  Chạy file:
  node JavaScript/Examples/function-arrow.js
*/

console.log("=== 1. Function declaration ===");

console.log(add(2, 3)); // 5

function add(a, b) {
  return a + b;
}

/*
  Function declaration có thể gọi trước dòng khai báo
  vì được hoist cả phần định nghĩa function.
*/

console.log("\n=== 2. Function expression ===");

const multiply = function (a, b) {
  return a * b;
};

console.log(multiply(2, 3)); // 6

// Lỗi nếu gọi trước khi khai báo với const.
// console.log(subtract(5, 2));
// const subtract = function (a, b) {
//   return a - b;
// };

console.log("\n=== 3. Arrow function ===");

const double = (number) => number * 2;
const sum = (a, b) => a + b;

console.log(double(5)); // 10
console.log(sum(4, 6)); // 10

/*
  Arrow function phù hợp cho function ngắn,
  đặc biệt khi truyền callback cho map/filter/reduce.
*/

console.log("\n=== 4. Arrow function trong map ===");

const users = [
  { id: 1, name: "Nhat" },
  { id: 2, name: "Minh" },
];

const names = users.map((user) => user.name);

console.log(names); // [ 'Nhat', 'Minh' ]

console.log("\n=== 5. this trong object method ===");

const user = {
  name: "Nhat",
  sayName() {
    console.log(this.name);
  },
};

user.sayName(); // Nhat

/*
  Khi gọi user.sayName(),
  object đứng trước dấu . là user,
  nên this trong sayName là user.
*/

console.log("\n=== 6. Mất this khi tách method ra biến ===");

const speak = user.sayName;

try {
  speak();
} catch (error) {
  console.log(error.name); // TypeError
}

/*
  Lúc này không còn gọi theo dạng user.sayName().
  Function được gọi là speak(), nên mất object context.
*/

console.log("\n=== 7. Không nên dùng arrow làm method cần this ===");

const wrongUser = {
  name: "John",
  sayName: () => {
    console.log(this.name);
  },
};

wrongUser.sayName(); // undefined

/*
  Arrow function không có this riêng.
  Nó không lấy this theo object đứng trước dấu .
*/

console.log("\n=== 8. Arrow callback giữ this bên ngoài ===");

const userService = {
  serviceName: "UserService",
  getUsers() {
    return ["Nhat", "Minh"].map((name) => {
      return `${this.serviceName}: ${name}`;
    });
  },
};

console.log(userService.getUsers());

/*
  Arrow callback trong map không có this riêng,
  nên nó dùng this của getUsers().
  Khi gọi userService.getUsers(), this là userService.
*/

console.log("\n=== 9. call, apply, bind với regular function ===");

function introduce(prefix) {
  return `${prefix} ${this.name}`;
}

const student = {
  name: "Nhat",
};

console.log(introduce.call(student, "Hello")); // Hello Nhat
console.log(introduce.apply(student, ["Hi"])); // Hi Nhat

const introduceStudent = introduce.bind(student);
console.log(introduceStudent("Welcome")); // Welcome Nhat

/*
  call/apply/bind dùng để chỉ định this cho regular function.
*/

console.log("\n=== 10. Tổng kết nhanh ===");

/*
  Function declaration:
  - Có thể gọi trước dòng khai báo.

  Function expression:
  - Function được gán vào biến.
  - Không nên gọi trước dòng khai báo.

  Arrow function:
  - Cú pháp ngắn.
  - Không có this riêng.
  - Hợp với callback như map/filter/setTimeout.

  Regular function:
  - Có this phụ thuộc cách function được gọi.
  - Phù hợp làm object method nếu cần this.
*/
