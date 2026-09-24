# JavaScript Theory

## Object - Prototype - Class - Inheritance

- Nhớ nhanh:
  - Object -> chứa dữ liệu + hành vi
  - Prototype -> cơ chế kế thừa gốc của JavaScript
  - Class -> cú pháp dễ đọc hơn để tạo object
  - Inheritance -> class con kế thừa class cha

### 1. Object

- `Object` dùng để nhóm nhiều dữ liệu liên quan lại với nhau.

```js
const user = {
  name: "Nhật",
  age: 22,

  sayHello() {
    console.log(`Hello ${this.name}`);
  },
};

user.sayHello();
```

- `name` và `age` là thuộc tính.
- `sayHello()` là method.
- Khi gọi `user.sayHello()` thì `this` bên trong method là `user`.

### 2. Prototype

- JavaScript dùng `prototype-based inheritance`.
- Hiểu đơn giản: nếu object không có `property/method` cần tìm, JavaScript sẽ tìm tiếp trên prototype của object đó.

```js
const numbers = [1, 2, 3];

numbers.map((n) => n * 2);
```

- Bạn không tự viết method `map()` bên trong `numbers`.
- Nhưng array vẫn dùng được vì `map()` nằm trên `Array.prototype`.
- Có thể hình dung prototype chain như sau:

```txt
numbers -> Array.prototype -> Object.prototype -> null
```

- JavaScript sẽ tìm property/method lần lượt theo chain đó.

Ví dụ đơn giản hơn:

```js
const user = {
  name: "Nhật",
};

console.log(user.toString());
```

- `user` không tự có `toString()`.
- Nhưng JavaScript tìm thấy `toString()` ở `Object.prototype`.

### 3. Class

- `Class` là cách viết thuận tiện hơn để tạo nhiều object có cùng cấu trúc và behavior.

```js
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello ${this.name}`);
  }
}

const user1 = new User("Nhật", 22);
const user2 = new User("Minh", 23);

user1.sayHello();
user2.sayHello();
```

- `constructor()` chạy khi dùng `new User(...)`.
- `this.name = name` nghĩa là gán property `name` vào object mới được tạo.

#### Class thực chất vẫn dựa trên prototype

- JavaScript class có phải cơ chế OOP hoàn toàn khác prototype không? Câu trả lời là không.

```js
class User {
  sayHello() {
    console.log("Hello");
  }
}

console.log(User.prototype.sayHello);
```

- Method `sayHello()` được đặt trên `User.prototype`, không tạo một function riêng cho từng instance.
- Vì vậy `class` trong JavaScript chủ yếu là cú pháp dễ dùng hơn trên cơ chế prototype.
- Thường gọi là `syntactic sugar over prototype`.

### 4. Inheritance

- `Inheritance` nghĩa là class con có thể kế thừa thuộc tính/phương thức từ class cha.

```js
class User {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello ${this.name}`);
  }
}

class Admin extends User {
  deleteUser() {
    console.log("User deleted");
  }
}

const admin = new Admin("Nhật");

admin.sayHello();
admin.deleteUser();
```

- Mặc dù `Admin` không định nghĩa `sayHello()`, nó vẫn dùng được vì `Admin extends User`.

#### super

- Nếu class con có constructor riêng, cần dùng `super()` để gọi constructor của class cha.

```js
class Admin extends User {
  constructor(name, role) {
    super(name);

    this.role = role;
  }
}
```

- `super(name)` gọi constructor của class cha là `User`.
- Nếu subclass có constructor, phải gọi `super()` trước khi dùng `this`.

Ví dụ sai:

```js
class Admin extends User {
  constructor(name) {
    this.role = "ADMIN";
    super(name);
  }
}
```

- Sai vì dùng `this` trước `super()`.

### 5. Ví dụ trong backend

- Ví dụ về một service cơ bản:

```js
class BaseService {
  log(message) {
    console.log(`[LOG]: ${message}`);
  }
}

class UserService extends BaseService {
  createUser() {
    this.log("Creating user");

    console.log("User created");
  }
}

const service = new UserService();

service.createUser();
```

- `UserService` không tự viết `log()` nhưng vẫn sử dụng được nhờ inheritance.

- Trong project thực tế, inheritance có thể dùng cho:
  - Base Service
  - Base Controller
  - Custom Error
  - Shared model behavior

- Nhưng không phải chỗ nào cũng nên dùng inheritance; phần design sâu hơn chưa cần cho level hiện tại.

### 6. Lỗi thường gặp

1. Nghĩ class thay thế prototype hoàn toàn.
   - Không. Class vẫn hoạt động dựa trên prototype.

2. Nghĩ method của class được copy vào từng object.

```js
class User {
  sayHello() {}
}
```

- Method thường nằm ở `User.prototype` và các instance dùng chung.

3. Quên `new`.

```js
const user = User("Nhật");
```

- Nhưng với class phải là:

```js
const user = new User("Nhật");
```

4. Quên `super()` trong subclass constructor.

```js
class Admin extends User {
  constructor(name) {
    super(name);
  }
}
```

### 7. Các câu hỏi thường gặp

1. `Prototype` trong JavaScript là gì?
   - Prototype là object mà object khác có thể kế thừa thuộc tính và phương thức từ đó. JavaScript sử dụng prototype chain để tra cứu thuộc tính khi nó không được tìm thấy trực tiếp bên trong object.

2. Mối quan hệ giữa `Class` và `Prototype` là gì?
   - Class JavaScript được xây dựng trên hệ thống prototype. Cú pháp `class` cung cấp một cách rõ ràng hơn để tạo object và triển khai kế thừa.

3. `Inheritance` là gì?
   - Kế thừa cho phép class con tái sử dụng thuộc tính/phương thức từ class cha bằng cách sử dụng `extends`.
