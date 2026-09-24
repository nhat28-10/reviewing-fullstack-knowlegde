/*
  Object - Prototype - Class - Inheritance trong JavaScript

  Chạy file:
  node JavaScript/Examples/object-prototype-class-inheritance.js
*/

console.log("=== 1. Object: dữ liệu + hành vi ===");

const user = {
  name: "Nhat",
  age: 22,

  sayHello() {
    console.log(`Hello ${this.name}`);
  },
};

console.log(user.name);
user.sayHello();

/*
  name, age là property.
  sayHello là method.
  Khi gọi user.sayHello(), this là user.
*/

console.log("\n=== 2. Prototype chain ===");

const numbers = [1, 2, 3];

console.log(numbers.map((number) => number * 2)); // [2, 4, 6]
console.log(numbers.hasOwnProperty("map")); // false
console.log(Array.prototype.hasOwnProperty("map")); // true

/*
  numbers không tự có method map.
  JavaScript tìm map trên Array.prototype.
*/

const simpleUser = {
  name: "Minh",
};

console.log(simpleUser.toString());
console.log(simpleUser.hasOwnProperty("toString")); // false

/*
  toString không nằm trực tiếp trong simpleUser.
  Nó được tìm thấy trên Object.prototype.
*/

console.log("\n=== 3. Class: tạo nhiều object cùng cấu trúc ===");

class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello ${this.name}`);
  }
}

const user1 = new User("Nhat", 22);
const user2 = new User("Duy", 20);

user1.sayHello();
user2.sayHello();

console.log(user1);
console.log(user2);

/*
  constructor chạy khi dùng new User(...).
  Mỗi lần new sẽ tạo ra một instance mới.
*/

console.log("\n=== 4. Method của class nằm trên prototype ===");

console.log(user1.hasOwnProperty("sayHello")); // false
console.log(User.prototype.hasOwnProperty("sayHello")); // true
console.log(user1.sayHello === user2.sayHello); // true

/*
  sayHello không bị copy vào từng object.
  Các instance dùng chung method từ User.prototype.
*/

console.log("\n=== 5. Inheritance với extends ===");

class Admin extends User {
  deleteUser(targetUserName) {
    console.log(`${this.name} deleted ${targetUserName}`);
  }
}

const admin = new Admin("Admin Nhat", 25);

admin.sayHello();
admin.deleteUser("Duy");

/*
  Admin không tự viết sayHello.
  Nhưng Admin extends User nên dùng được method của User.
*/

console.log("\n=== 6. super() trong subclass constructor ===");

class Moderator extends User {
  constructor(name, age, permission) {
    super(name, age);
    this.permission = permission;
  }

  reviewPost() {
    console.log(`${this.name} can ${this.permission}`);
  }
}

const moderator = new Moderator("Minh", 24, "review posts");

moderator.sayHello();
moderator.reviewPost();

/*
  super(name, age) gọi constructor của class cha User.
  Sau super(), subclass mới dùng this để gán property riêng.
*/

console.log("\n=== 7. Backend-style inheritance ===");

class BaseService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

class UserService extends BaseService {
  createUser(name) {
    this.log(`Creating user ${name}`);
    return { id: 1, name };
  }
}

const userService = new UserService();
const createdUser = userService.createUser("Nhat");

console.log(createdUser);

/*
  UserService không tự viết log().
  Nó kế thừa log() từ BaseService.
*/

console.log("\n=== 8. Tổng kết nhanh ===");

/*
  Object:
  - Nhóm dữ liệu và hành vi.

  Prototype:
  - JavaScript tìm property/method theo prototype chain.

  Class:
  - Cú pháp dễ đọc để tạo nhiều object cùng cấu trúc.
  - Method của class thường nằm trên ClassName.prototype.

  Inheritance:
  - Class con dùng extends để kế thừa class cha.
  - Nếu subclass có constructor, gọi super() trước khi dùng this.
*/
