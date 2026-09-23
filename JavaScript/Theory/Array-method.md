# JavaScript Theory

## Array Methods

- Cách nhớ nhanh:
  - map -> biến đổi từng phần tử
  - filter -> lọc nhiều phần tử
  - find -> tìm 1 phần tử
  - reduce -> gom array thành 1 kết quả
  - some -> có ít nhất 1 phần tử đúng?
  - every -> tất cả phần tử đều đúng

### 1. map()

- Dùng khi muốn biến đổi phần tử và tạo array mới

```js
const numbers = [1, 2, 3];

const doubled = numbers.map((number) => number * 2);

console.log(doubled);
// [2, 4, 6]
```

- Ví dụ Frontend / API:

```js
const users = [
  { id: 1, name: "Nhật" },
  { id: 2, name: "Minh" },
];

const names = users.map((user) => user.name);
=> Kết quả là :["Nhật", "Minh"]
```

- `map()` thường trả về array có cùng số lượng phần tử với array ban đầu

### 2. filter()

- Dùng để lọc các phần tử thỏa điều kiện

```js
const numbers = [1, 2, 3, 4];

const evenNumbers = numbers.filter((number) => number % 2 === 0);

console.log(evenNumbers);
// [2, 4]
```

- Ví dụ cụ thể:

```js
const users = [
  { name: "Nhật", active: true },
  { name: "Minh", active: false },
  { name: "Duy", active: true },
];

const activeUsers = users.filter((user) => user.active);
-> filter() luôn trả về array. Có thể là mảng rỗng nếu không tìm thấy gì
```

### 3. find()

- Dùng khi chỉ muốn tìm phần tử đầu tiên thỏa điều kiện

```js
const users = [
  { id: 1, name: "Nhật" },
  { id: 2, name: "Minh" },
];

const user = users.find((user) => user.id === 2);

console.log(user);
=> Kết quả sẽ ra với userId là 2. Nếu không tìm thấy sẽ hiện undefined
```

- Điểm cần phân biệt:
  - filter -> trả array
  - find -> trả 1 phần tử hoặc undefined

### 4. reduce()

- Đây là thứ rối nhất. Về lý thuyết `reduce()` dùng để gom nhiều phần tử thành 1 kết quả
- Ví dụ tính tổng:

```js
const numbers = [1, 2, 3, 4];

const total = numbers.reduce((sum, number) => {
  return sum + number;
}, 0);

console.log(total);
// 10
- Trong đó: sum là accumulator - giá trị được tích lũy
- 0 là initial value.
- Luòng sẽ là:
    - 0 + 1 = 1
    - 1 + 2 = 3
    - 3 + 3 = 6
    - 6 + 4 = 10
```

- Ví dụ khi sử dụng trong backend

```js
const orders = [{ total: 100 }, { total: 200 }, { total: 50 }];

const revenue = orders.reduce((sum, order) => sum + order.total, 0);
=> kết quả là 350
```

### 5. some()

- Kiểm tra: Có ít nhất 1 phần tử thỏa điều kiện không?

```js
const numbers = [1, 3, 4];

const hasEven = numbers.some((number) => number % 2 === 0);

console.log(hasEven);
// true
- Trả về: true / false
```

- Ví dụ:

```js
const users = [{ role: "USER" }, { role: "ADMIN" }];

const hasAdmin = users.some((user) => user.role === "ADMIN");
```

### 6. every()

- Kiểm tra: Tất cả phần tử có thỏa điều kiện không ?

```js
const numbers = [2, 4, 6];

const allEven = numbers.every((number) => number % 2 === 0);

console.log(allEven);
// true
- Nhưng nếu chỉ cần 1 phần tử sai: [2,4,5] thì every() trả về false
```

### 7. Cách phân biệt nhanh

- `map`: Dùng để biến đổi và return array mới
- `filter`: Dùng để lọc nhiều phần tử và return array
- `find`: tìm phần tử đầu tiên và return về element / undefined
- `reduce`: gom thành kết quả và tùy logic trả về
- `some`: kiểm tra có ít nhất 1 phần tử thỏa mãn điều kiện không? và trả về true hoặc false
- `every`: kiểm tra tất cả phần tử có thỏa mãn điều kiện không? và cũng trả về true hoặc false

- Lỗi thường gặp

```js
const user = users.filter(user => user.id === 1);
- Nếu bạn muốn một user, nên dùng
const user = users.find(user => user.id === 1);
- Vì filter() trả array còn find() trả object trực tiếp
```

### 8. Các câu hỏi thường gặp

- Khác nhau giữa `map` và `filter` là gì?
  - `map` thay đổi mỗi phần tử và trả về một mảng mới, trong khi đó `filter` trả về chỉ trả về các phần tử thích hợp với điều kiện
- Khác nhau giữa `find` và `filter` là gì?
  - `find` trả về phần tử đầu tiên hoặc `undefined`, trong khi `filter` trả về 1 mảng chứa tất cả các phần tử phù hợp
- `reduce` làm được gì?
  - `reduce` xử lý một mảng và tích lũy giá trị của chúng thành 1 kết quả duy nhất
