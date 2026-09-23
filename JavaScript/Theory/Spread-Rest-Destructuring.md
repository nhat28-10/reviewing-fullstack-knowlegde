# JavaScript Theory

## Spread - Rest - Destructuring

### 1. Spread ...

- Spread dùng `...` để bung các phần tử/thuộc tính ra.

#### Array

```js
const a = [1, 2];
const b = [...a, 3, 4];

console.log(b);
// [1, 2, 3, 4]
- Ở đây: ... a bung 1,2 ra bên trong array
```

- Rất hay dùng để copy/update state

```js
const users = ["Nhật", "Minh"];

const newUsers = [...users, "Duy"];
```

#### Object

```js
const user = {
  name: "Nhật",
  age: 22,
};

const updatedUser = {
  ...user,
  age: 23,
};
=> Kết quả là:
{
    name: "Nhật",
    age: 23
}
Vì thuộc tính nằm sau sẽ ghi đè thuộc tính trước

=> {
    ...user,
    age: 23
} => nên age -> 23
```

- Lưu ý quan trọng Spread chỉ tạo shallow copy

```js
const user = {
  profile: {
    age: 22,
  },
};

const copy = { ...user };

copy.profile.age = 30;

console.log(user.profile.age);
// 30
```

- Vì object nester `profile` vẫn dùng chung reference

### 2. Rest

- Cùng là `...`, nhưng `Rest` làm ngược lại: Là gom nhiều giá trị thành 1 array/object

```js
function sum(...numbers) {
    console.log(numbers);
}

sum(1, 2, 3);
=> Output là [1, 2, 3]
...numbers gom các arguments thành 1 array
- Có thể dùng:

function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
}
- Và Rest parameter phải nằm cuối :
function test(a, ...others) {
}
```

### 3. Spread vs Rest

- Cùng là kí hiệu `...`, nhưng nhìn vị trí sử dụng
- `Spread` bung ra

```js
const numbers = [1, 2];

const result = [...numbers, 3];
```

- `Rest` thì gom lại

```js
function test(...numbers) {
}
Khi gọi: test(1,2,3) thì output sẽ là 1,2,3 -> rest -> [1,2,3]
```

- Cách nhớ là:
  - `Spread` -> 1 collection -> nhiều giá trị
  - `Rest` -> nhiều giá trị -> 1 collection

### 4. Destructuring

- `Destructuring` dùng để lấy dữ liệu từ array hoặc object ra biến

#### Array Destructuring

- Thay vì:

```js
const colors = ["red", "green", "blue"];

const first = colors[0];
const second = colors[1];
thì chúng ta có thể viết là
const [first, second] = colors;

console.log(first);  // red
console.log(second); // green
- Array Destructuring dựa theo vị trí
```

#### Object Destructuring

```js
const user = {
  name: "Nhật",
  age: 22,
};

const { name, age } = user;

console.log(name);
console.log(age);
- Object destructuring dựa vào thuộc tính "name"
- Có thể đổi tên:
const { name: userName } = user;

console.log(userName);
```

### 5. Kết hợp Rest + Destructuring

- Ví dỵ rất hay gặp trong backend:

```js
const user = {
  id: 1,
  name: "Nhật",
  password: "123456",
  email: "nhat@example.com",
};

const { password, ...safeUser } = user;

console.log(safeUser);
=> Kết quả là
{
    id: 1,
    name: "Nhật",
    email: "nhat@example.com"
}
Ở đây: password được lấy riêng bằng destructuring còn ...safeUser gom những thuộc tính còn lại. Đây là pattern backend rất thực tế khi không mong muốn trả về field password trong API Response
```

### 6. Lỗi bắt gặp nên lưu ý

1. `...` không phải lúc nào cũng là `Spread`

```js
const newArray= [...oldArray] -> Spread.
function test(...args) {} -> Rest
```

2. `Spread` object chỉ là shallow copy
3. `Object Destructuring` phải đúng thuộc tính "name"

```js
const user = { name: "Nhật" };

const { username } = user;

console.log(username);
// undefined
```

4. `Array Destructuring` dựa theo vị trí

```js
const [a,b] = [10,20] => a = 10, b = 20
```

### 7. Những câu hỏi nên lưu ý

1. What is the difference between spread and rest operator?
   - Both use the `...` syntax, but spread expands an array or object into individual values, while rest collects multiple values into one array or object. The behavior depends on where the operator is used.
2. What is destructuring?
   - Destructuring is a JavaScript syntax used to extract values from arrays or properties from objects into variables.

- Cuối cùng tổng kết lại là:
  - Spread -> bung dữ liệu ra
  - Rest -> gom dữ liệu lại
  - Destructuring -> lấy dữ liệu ra biến
