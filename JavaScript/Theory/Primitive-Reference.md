# JavaScript Theory

## Primitive & Reference; null vs undefined

- Đây là phần cực kì quan trọng vì nó liên quan trực tiếp đến object,array,function và sau này là shallow/deep copy

### 1. Primitive là gì ?

- Primitive là giá trị cơ bản
- Các Primitive phổ biên bao gồm

```js
string;
number;
undefined;
null;
symbol;
bigint;
```

- Ví dụ

```js
const name = "Nhat";
let age = 22;
const isActive = true;
const value = null;
```

- Điểm rất quan trọng: Primitive thường được xử lý theo giá trị

```js
let a = 10;
let b = a;
b = 20;
console.log(a); // 10
console.log(b); // 20
```

- Tại sao `a` không đổi. Vì `b` nhận một giá trị độc lập từ `a`
- Có thể hình dung:

```js
    a -> 10
    b -> 10
```

- Sau đó:

```js
b = 20;
```

- thì:

```js
   a -> 10
   b -> 20
```

### 2. Reference là gì ?

- Các kiểu thường được xem là reference type bao gồm:
- Object
- Array
- Function
- Ví dụ:

```js
const user = { name: "Nhat" };
const numbers = [];
```

- Khi gắn object sang biến khác

```js
const user1 = {
  name: "Nhat",
};
const user2 = user1;
user2.name = "John";
console.log(user1.name); // Output sẽ là John

// Vì sao chỉ sửa user2 mà user1 lại bị thay đổi
// Bởi vì user1 và user2 đang cùng tham chiếu tới 1 object {name: "Nhat"}
// Khi user2.name = "John"
// Thì bạn sửa chính Object chung đó => user1.name và user2.name sẽ output là John
```

### 3. Primitive vs Reference dễ gặp nhất ở đâu ?

- So sánh

```js
let a = 10;
let b = a;
b = 20;
// a vẫn là 10
```

- Nhưng

```js
const a = {
  value: 10,
};
const b = a;
b.value = 20;
// Thì clg(a.value) là 20 => Đây là điều khác biệt nên nhớ
```

### 4. So sánh Object

- Một câu interview rất hay

```js
const a = {
  name: "Nhat",
};
const b = {
  name: "Nhat",
};
console.log(a === b);
// Theo bạn thấy dữ liệu từ biến object a và b là như nhau nhưng output sẽ là FALSE
// Vì chúng là 2 object khác nhau
// a -> object #1 {name:"Nhat"}
// b -> object #2 {name:"Nhat"}
// Reference khác nhau
```

- Trong khi

```js
const a = {
  name: "Nhat",
};
const b = a;
console.log(a === b); // True vì cùng tham chiếu đến 1 object
```

### 5. undefined là gì ?

- `undefined` thường có nghĩa: Giá trị chưa được gán/không tồn tại ở ví trí truy cập
- Ví dụ

```js
let age;
console.log(age); // output là undefined
// Hoặc

const user = {
  name: "Nhat",
};
console.log(user.age); // output sẽ là undefined vì không có thuộc tính age
// Ngoài ra function không trả gì về cũng sẽ là undefined
function test() {}
console.log(test()); // trả về undefined
```

### 6. null là gì

- `null` thường được các lập trình viên chủ động để nói là hiện tại không có giá trị
- Ví dụ

```js
const user = {
  avatar: null,
  // Ý nghĩa có thể là: User hiện tại chưa có avatar
  // Hoặc là
};
let selectUser = null;
// Nghĩa là: Hiện chưa có user nào được chọn
```

- Điểm quan trọng:
- `undefined` -> Thường là chưa có / chưa được gán
- `null` -> chủ động biểu diễn "không có giá trị"

### 7. null vs undefined

- Ví dụ backend trả data

```js
  const user = {
    name:"Nhat"
    avatar:null
  }
  // avatar: null nói khá rõ field có tồn tại nhưng không có giá trị
  // Trong khi
  console.log(user.phone) // undefined vì phone không tồn tại trong object
```

- Trong API/database thực tế, phân biệt hai khái niệm này rất quan trọng

### 8. Một số điểm JavaScript hơi kì

```js
typeof undefined;
// -> undefined. Nhưng
typeof null;
// -> object
```

- Đây là một quirk lịch sử của JavaScript
- Đừng hiểu `null` là object mà hãy hiểu `null` là primitive value

### 9. Sai lầm phổ biến

- Sai phổ biến: Object copy sang biến khác thì tạo object mới, điều đó là không đúng

```js
const b = a; // Chỉ copy reference
// Muốn object mới có thể dùng
const b = { ...a }; // destructing, nhưng cái này lại liên quan tới Shadow Copy
```

- Sai tiếp theo là `null` và `undefined` giống nhau hoàn toàn
- Không. Chúng đều có thể biểu diễn sự thiếu vắng giá trị, nhưng ý nghĩa và cách xuất hiện khác nhau.
