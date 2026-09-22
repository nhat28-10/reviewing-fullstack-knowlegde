# JavaScript Theory

### 1. Truthy và Falsy là gì?

- Trong JavaScript, một giá trị không nhất quyết phải là `true` hoặc `false` mới dùng được trong điều kiện
- Ví dụ

```js
const name = "Nhat";
if (name) {
  console.log("Có tên");
}

// name là string, không phải là boolean
```

- Nhưng JavaScript sẽ chuyển nó thành boolean khi kiểm tra điều kiện `"Nhat"` được xem là `Truthy`
- Có thể hiểu đơn giản
- `Truthy` = giá trị được coi như là `true` khi nằm trong boolean context
- `Falsy` = giá trị coi như là `false`

### 2. Những giá trị Falsy quan trọng

- Ở mức hiện tại nên nhớ các giá trị phổ biến

```js
false;
0;
-0;
0n;
("");
null;
undefined;
NaN;
```

- Ví dụ

```js
if (0) {
  console.log("Hello");
} // Sẽ không chạy

if ("") {
  console.log("Hello");
} // Cũng không chạy

if (null) {
  console.log("Hello");
} // Cũng không chạy nốt
```

### 3. Những thứ dễ nhầm nhưng lại Truthy

```js
   "0" // Truthy -> Vì đây là string có nội dung, dù nội dung là "0"
   "false" // Truthy -> Vì vẫn là non-empty string
   [] // Truthy -> Đây là điểm rất nhiều người nhầm
   // Ví dụ
   if ([]) {
    console.log("Run")
   } // Output sẽ là Run
   // Object cũng vậy
   if({}) {
    console.log("Run")
   } // Output cũng sẽ là Run
```

### 4. Ví dụ thực tiễn

- Backend:

```js
   const user = req.user
   if(!user) {
    return res.status(401).json({
        mes: "Unauthorized"
    })
   }

   // Nếu
   user = null
   // Hoặc
   user = undefined
   // Thì
   !user sẽ là true
```

- Frontend

```js
if (errMsg) {
  // Hiển thị lỗi
}
// Nếu
errMsg = ""; // Thì điều kiện không chạy
```

### 5. == và ===

- Đây là JavaScript interview gần như cổ điển tôn trọng
- `===` Gọi là `Strict equality`, nó so sánh `giá trị` và `type`
- Ví dụ

```js
   5 === 5 // -> True
   // Nhưng
   5 === "5" // -> False
   // Vì
   5 -> number
   "5" -> string
```

- `==` gọi là `Loose equality`. JavaScript có thể thực hiện `type coercion` trước khi so sánh
- Ví dụ

```js
   5 == '5' // True

   // Vì lúc này JS sẽ chuyển kiểu dữ liệu để so sánh
   // Hình dung đơn giản
   '5' -> coercion -> 5
   5 == 5 // => True
```

### 6. Một vài ví dụ

```js
    0 == false // True

    // Nhưng
    0 === false // False
    // Vì
    0 -> number còn false -> boolean khác kiểu dữ liệu

    "" == false // True
    // Trong khi
    "" === false /// false
```

- Đây là lí do trong thực tế thường ưu tiên xài `===` để tránh conversion ngầm gây khó đoán

### 7. null == undefined

- Một trường hợp hơi đặc biệt xíu

```js
null == undefined; // Là true
// Nhưng
null === undefined; // false
// Vì chúng là 2 kiểu dữ liệu khác nhau
```

### 8. Lỗi thường gặp

- Một lỗi "false" là `Falsy` vì nội dung của nó là false => Sai nhé

```js
Boolean("false"); // True
// Vì đây là string không rỗng
```

- Một lỗi khác `[]` và `{}` là `Falshy` vì chúng rỗng. Sai, cả hai đều là `Truthy`
- Lỗi phổ biến `==` chỉ so sánh value mà chúng còn ép kiểu trước khi so sánh còn với `===` so sánh value + type
- Lưu ý: `==` cho phép type coercion trước khi so sánh, còn `===` không thực hiện coercion kiểu đó
