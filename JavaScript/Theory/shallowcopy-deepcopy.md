# JavaScript Theory

## Shallow Copy vs Deep Copy

- Example: `../Examples/shallowcopy-deepcopy.js`

- Nhớ nhanh:
  - `Shallow copy` -> chỉ copy tầng ngoài.
  - `Deep copy` -> copy cả object/array lồng bên trong.

```txt
Shallow copy -> object ngoài mới, nested object có thể vẫn dùng chung reference
Deep copy    -> object ngoài mới, nested object cũng mới
```

### 1. Shallow Copy là gì?

- `Shallow copy` tạo object/array mới ở tầng đầu tiên.
- Nếu bên trong có nested object/array, phần nested đó vẫn có thể dùng chung reference với object gốc.

Ví dụ:

```js
const user = {
  name: "Nhat",
  address: {
    city: "HCM",
  },
};

const copy = { ...user };
```

- `copy` là object mới:

```js
console.log(user === copy);
// false
```

- Nhưng `address` bên trong vẫn dùng chung reference:

```js
console.log(user.address === copy.address);
// true
```

- Vì vậy khi sửa nested object trong `copy`, object gốc cũng bị ảnh hưởng:

```js
copy.address.city = "Ha Noi";

console.log(user.address.city);
// "Ha Noi"
```

Có thể hình dung:

```txt
user -----> address object
              ^
copy ---------|
```

- Hai object ngoài khác nhau.
- Nhưng nested object `address` vẫn là cùng một object trong bộ nhớ.

### 2. Cách tạo Shallow Copy phổ biến

Với object:

```js
const copy = { ...user };
```

Hoặc:

```js
const copy = Object.assign({}, user);
```

Với array:

```js
const copy = [...numbers];
```

Hoặc:

```js
const copy = numbers.slice();
```

- Những cách trên chỉ copy tầng đầu.
- Chúng không tự động deep copy nested object/array.

### 3. Deep Copy là gì?

- `Deep copy` tạo bản sao độc lập cho cả object/array bên ngoài và nested object/array bên trong.
- Khi sửa bản copy, object gốc không bị ảnh hưởng.

Ví dụ:

```js
const user = {
  name: "Nhat",
  address: {
    city: "HCM",
  },
};

const copy = structuredClone(user);
```

Lúc này:

```js
console.log(user === copy);
// false

console.log(user.address === copy.address);
// false
```

Nếu sửa nested object trong `copy`:

```js
copy.address.city = "Ha Noi";

console.log(copy.address.city);
// "Ha Noi"

console.log(user.address.city);
// "HCM"
```

- Object gốc không bị thay đổi.
- Cách hiện đại nên biết:

```js
structuredClone(value);
```

### 4. Vì sao quan trọng trong Frontend/Backend?

- Lỗi thường gặp là nghĩ mình đã copy object, nhưng thực ra nested object vẫn bị mutate.

Ví dụ:

```js
const updatedUser = { ...user };

updatedUser.profile.age = 23;
```

- Nếu `profile` là nested object, đoạn code trên có thể sửa luôn `user.profile.age`.
- Đây là lỗi rất dễ gặp khi làm React state hoặc xử lý object data trong backend.

Nếu muốn update nested object mà không mutate object cũ:

```js
const updatedUser = {
  ...user,
  profile: {
    ...user.profile,
    age: 23,
  },
};
```

- Ở đây ta copy cả:

```txt
user
-> profile
```

### 5. JSON.parse(JSON.stringify()) thì sao?

- Bạn có thể từng thấy cách này:

```js
const copy = JSON.parse(JSON.stringify(user));
```

- Nó có thể tạo deep copy cho dữ liệu JSON đơn giản.
- Nhưng đây không phải giải pháp tổng quát tốt vì một số kiểu dữ liệu đặc biệt sẽ bị mất hoặc đổi kiểu.

Ví dụ:

```js
const data = {
  name: "Nhat",
  createdAt: new Date("2026-01-01"),
  sayHi() {
    console.log("Hi");
  },
  value: undefined,
};

const copy = JSON.parse(JSON.stringify(data));
```

- `Date` có thể thành string.
- Function bị bỏ.
- Property có giá trị `undefined` có thể bị bỏ.

Nhớ nhanh:

```txt
Object/Array JSON đơn giản -> JSON trick có thể dùng được
Modern JavaScript          -> ưu tiên structuredClone khi phù hợp
```

### 6. structuredClone() có giới hạn không?

- Có.
- `structuredClone()` clone được nhiều kiểu dữ liệu hơn JSON trick, nhưng không clone được mọi thứ.
- Ví dụ function không clone được.

```js
structuredClone({
  run() {
    console.log("Run");
  },
});
```

- Đoạn trên sẽ gây lỗi vì function không clone được bằng `structuredClone()`.
- Vì vậy khi clone data, cần hiểu dữ liệu của mình gồm những kiểu nào.

### 7. Phân biệt nhanh

| Tiêu chí | Shallow Copy | Deep Copy |
| --- | --- | --- |
| Object ngoài mới | Có | Có |
| Nested object mới | Thường không | Có |
| Nested reference dùng chung | Có thể | Không |
| Sửa nested copy ảnh hưởng object gốc | Có thể | Không |
| Ví dụ | `{ ...obj }` | `structuredClone(obj)` |

### 8. Lỗi thường gặp

1. Nghĩ spread object luôn tạo bản copy độc lập hoàn toàn.
   - Không đúng.
   - Spread chỉ shallow copy tầng đầu.

2. Nghĩ `const b = a` là copy object mới.
   - Không đúng.
   - Với object/array, `const b = a` chỉ copy reference.

3. Dùng JSON trick cho mọi trường hợp.
   - Không nên.
   - JSON trick phù hợp hơn với dữ liệu JSON đơn giản.
   - Với JavaScript hiện đại, nên cân nhắc `structuredClone()` khi dữ liệu phù hợp.

### 9. Câu hỏi thường gặp

1. Khác biệt giữa shallow copy và deep copy là gì?
   - Shallow copy tạo object/array mới ở tầng ngoài, nhưng nested object có thể vẫn dùng chung reference.
   - Deep copy tạo bản sao độc lập cả bên ngoài lẫn nested object bên trong.

2. Spread operator có phải deep copy không?
   - Không.
   - Với object/array, spread chỉ shallow copy.

3. Khi nào cần deep copy?
   - Khi muốn sửa bản copy mà chắc chắn không ảnh hưởng object gốc, đặc biệt với dữ liệu có nested object/array.

4. Trong React update nested state nên làm gì?
   - Nên copy từng tầng cần update.
   - Ví dụ: `{ ...user, profile: { ...user.profile, age: 23 } }`.
