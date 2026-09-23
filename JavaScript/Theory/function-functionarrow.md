# JavaScript Theory

## Function, Function Arrow là gì và cách hoạt động của this

### 1. Function là gì

- Hiểu đơn giản function là một khối code có thể tái sử dụng thực hiện 1 công việc, thay vì

```js
console.log("Hello Nhật");
console.log("Hello Minh");
```

- Thì ta viết

```js
function sayHello(name) {
  console.log(`Hello ${name}`);
}
sayHello("Nhật");
sayHello("Minh");
```

- Function có thể: Nhận `input` -> parameters -> xử lý -> return output
- Ví dụ

```js
function add(a, b) {
  return a + b;
}
const result = add(2, 3);
console.log("result");
// a và b là parameters
// 2,3 là arguments khi gọi functions
```

### 2. Các cách khai báo function cơ bản

- Function Declaration

```js
console.log(add(2, 3));
function add(a, b) {
  return a + b;
}
// Ngoài ra có thể gọi trước declaration
// Vì function declaration được hoist cùng phần định nghĩa function
// Điều này liên quan trực tiếp đến Hoisting
```

- Function Expression: Function được gán vào một biến

```js
const add = function (a, b) {
  return a + b;
};
console.log(add(2, 3));
// Ở đây function (a,b) {return a + b} là function expression
// Còn const add là biến giữ function đó
// Không thể làm
/**
 * add(2,3);
 * const add = function (a,b) {
 * return a +b }
 * Vì add là const và đang nằm trong TDZ
 */
```

### 3. Arrow Function

- ES6 giới thiệu arrow function
- Function thường:

```js
function add(a, b) {
  return a + b;
}
```

- Arrow function

```js
// Đoạn 1
const add = (a, b) => {
  return a + b;
};
// Nếu function chỉ có một expression trả về, có thể viết ngắn
// Đoạn 2
const add = (a, b) => a + b;
// => Đoạn 1 và đoạn 2 tương đương nhau
```

- Một parameter: Có thể bỏ `()`:

```js
const double = (number) => number * 2;
const number = (number) => number * 2;
// Nhưng nhiều project vẫn giữ () vì coding convention
```

### 4. Arrow function trong code thực tế

- Bạn sẽ gặp nó cực kỳ nhiều
- Ví dụ API trả danh sách user

```js
const users = [
  { id: 1, name: "Nhật" },
  { id: 2, name: "Minh" },
];
const names = users.map((user) => user.name);
console.log(names);
// output ["Nhật", "Minh"]
// Ở đây user => user.name chính là 1 arrow function đucowjtruyeenf làm callback cho map()
```

### 5. Điểm quan trọng nhất THIS

- Hiểu đơn giản `this` đại diện cho context mà function đang được gói với. Nhưng cần cực kỳ cẩn thận. Với `Regular function`, `this` thường được xác định dựa trên cách function được gọi, không phải đơn giản dựa vào nơi function được viết

### 6. THIS trong method của project

- Ví dụ:

```js
const user = {
  name: "Nhật",

  sayName: function () {
    console.log(this.name);
  },
};
user.sayName();
// Output sẽ là Nhật. Tại sao?
// Function được gọi như
user.sayName();
//Object đứng trước dấu "." là user nên trong lần gọi này
this === user;
// Vì vậy
this.name === user.name;
```

- Có thể viết method ngắn hơn

```js
   const user = {
    name: "Nhật",
    sayName() {
        console.log(this.name)
    }
   }  => Kết quả vẫn vậy
```

### 7. Một hiểu nhầm rất phổ biến về this

- Nhiều người nghĩ `this` luôn trỏ đến object chứ function => Không chính xác
- Ví dụ

```js
const user = {
  name: "Nhật",
  sayName() {
    console.log(this.name);
  },
};
user.sayName();
// Đúng là this = user nhưng
const speak = user.sayName;
speak();
// Lúc này chúng ta không còn gọi function thông qua user nữa, không còn user.sayName() mà chỉ là speak() -> Vì vậy function mất object context
// Trong strict mode
this === undefined;
// Nên nếu cố truy cập this.name có thể gây ra lỗi
// Đây là lí do nói Regular function's this deponds on how the function is called
```

### 8. Vậy Arrow Function khác ở đâu

- Arrow Function có một đặc điểm cực kỳ quan trọng: `Arrow function không có this của riêng nó`
- Nó lấy `this` từ scope bên ngoài nơi arrow function được tạo ra.
- Tên kỹ thuật: `Lexical this` => Nên nhớ nhé!

### 9. Ví dụ quan trọng về Arrow Function + this

```js
const user = {
  name: "Nhật",
  sayHello() {
    setTimeout(function () {
      console.log(this.name);
    }, 1000);
  },
};
user.sayHello(); // Tưởng chừng sẽ in ra "Nhật" nhưng call back function() {console.log(this.name)} là một regular function riêng. Nó không tự động giữ this của sayHello()
```

```js
  const user = {
    name : "Nhật"
    sayHello() {
      setTimeout(() => {
        console.log(this.name)
      },1000)
    }
  }
  user.sayHello() // Output = "Nhật"
  // Vì () => {console.log(this.name)} không có this riêng nên nó sẽ lấy this từ fucntion bên ngoài sayHello()
  // Mà khi gọi user.sayHello() thì
  this === user
  // Do đó arrow callback cũng sử dụng user. Đây chính là một trong những lý do arrow function rất phổ biến trong callback
```

### 10. Đừng dùng arrow function làm object method nếu cần this

- Ví dụ sai phổ biến

```js
  const user = {
    name:"Nhật"
    sayName: () => {
      console.log(this.name)
    }
  };
  user.sayName()
  // Có thể nhiều bạn nghĩ this = user, nhưng thực tế thì không phải. Arrow function không tạo this riêng, nó lấy this từ surrouding scope. Nó không quan tậm việc được gọi bằng user.sayName() theo cách regular function làm
  // Vì thế nếu method truy cập object this.name nên dùng

  const user = {
    name: "Nhật"
    sayName() {
      console.log(this.name)
    }
  };
```

### 11. Regular Fuction vs Arrow Function

- Regular Fuction:
  - Có `this` riêng tùy cách gọi
  - `this` phụ thuộc callsite
  - Có thể dùng làm object method
  - Có thể dùng với `new`
  - Có `arguments` riêng
  - Cú pháp dài hơn
- Arrow Function:
  - Không có `this` riêng
  - Kế thừa `this` từ surrouding scope
  - Thường không nên nếu method cần `this`
  - Không thể dùng với `new`
  - Không có `arguments` riêng
  - Cú pháp thường ngắn hơn
- Hai dòng quan trọng nhất là:
  - Regular fucntion -> this phụ thuộc cách function được gọi
  - Arrow Function -> không có this riêng, lấy this từ scope bên ngoài

### 12. Ví dụ backend thực tế

- Giả sử có Servjce

```js
const userService = {
  serviceName: "UserService",
  getUser() {
    console.log(this.serviceName);
    return ["Nhật", "Minh"].map((user) => {
      return `${this.serviceName}: ${user}`;
    });
  },
};
console.log(userService.getUser());
```

- Arrow Callback

```js
(user) => {
  return `${this.serviceName}:${user}`;
};
```

- Giữ `this` từ `getUser()`. Do đó `this.serviceName` vẫn truy cập được. Concept này cũng có thể xuất hiện khi bạn làm backend bằng class/service

### 13. This với class

- Ví dụ

```js
class UserService {
  constructor() {
    this.name = "User Service"
  }
  getName() {
    return this.name
  }
  const service = new UserService()
  console.log(service.getName()) // Ở đây => this === service sẽ quen thuộc nếu sau này làm NestJS

// Output => User Service
class UserService {
  constructor(private prissma: PrissmaService) {
    findUssers() {
      return this.prisma.user.findMany();
    }
  }
}
// this.prisma chính là thuộc tính trên instance của UserService
}
```

### 14. call,apply,bind

- Regular function's `this` có thể được chỉ định
- Ví dụ

```js
function introduce() {
  console.log(this.name);
}
const user = {
  name: "Nhật",
};
introduce.call(user);
// => Output là Nhật
//call(user) nói với JS là khi chạy function này hãy sử dụng user làm this
```

- Có 3 method thường gặp
  - call()
  - apply()
  - bind()

### 15. Một điểm dễ nhầm về Arrow Function

- Arrow Function không phải đơn giản là viết ngắn hơn
- Ví dụ

```js
const add = (a, b) => a + b; // Đúng là ngắn hơn
```

- Nhưng khác nhau quan trọng về behavior là
  - Regular function: `this` được xác định khi function được gọi
  - Arrow Function: Không có `this` riêng và `lexical capture this` từ scope bên ngoài.

### 16. Lỗi thường gầm

- Lỗi 1 - Nghĩ `this` là nơi function được khai báo -> Sai với regular function

```js
  const user = {
    name: "Nhật"
    sayName() {
      console.log(this.name)
    }
  };
  const fn = user.sayName;
  fn()
  // Không thể nói "Function nằm trong user nên this luôn là user"
```

- Lỗi 2 - Dùng arrow function làm method cần `this`

```js
const user = {
  name:"Nhật"
  getName:() => this.name
}
// Không nên nếu mục tiêu lấy là user.name
```

- Lỗi 3 - Nghĩ arrow function luôn tốt hơn
  - Không, Arrow rất phù hợp với

```js
user.map((user) => this.name);
setTimeout(() => {
  ///....
}, 1000);
buttion.addEventListener("click", (event) => {
  //...
});
```

- Regular chỉ phù hợp khi cần
  - Dynamic this
  - Object method
  - constructor

- Lỗi 4 - Nghĩ `this` là biến chứa function

```js
const fn = user.sayName;
`this` không trở thành `fn`
```
