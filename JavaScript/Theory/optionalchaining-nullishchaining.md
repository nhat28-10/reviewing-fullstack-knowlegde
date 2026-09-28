# JavaScript Theory

## Optional Chaining `?.` và Nullish Coalescing `??`

- Example: `../Examples/optionalchaining-nullishcoalescing.js`

- Nhớ nhanh:
  - `?.` -> truy cập an toàn khi giá trị có thể là `null` hoặc `undefined`.
  - `??` -> dùng giá trị mặc định khi bên trái là `null` hoặc `undefined`.

```txt
?. -> tránh lỗi khi truy cập property/method sâu
?? -> fallback chỉ khi null hoặc undefined
```

### 1. Optional Chaining là gì?

- `Optional chaining` dùng khi bạn không chắc object/property có tồn tại hay không.
- Nếu giá trị trước `?.` là `null` hoặc `undefined`, biểu thức dừng lại và trả về `undefined`.

Ví dụ:

```js
const user = {
  profile: {
    name: "Nhat",
  },
};

console.log(user.profile?.name);
```

Output:

```txt
Nhat
```

Nếu `profile` không tồn tại:

```js
const user = {};

console.log(user.profile?.name);
```

Output:

```txt
undefined
```

- Nếu không có `?.`, code có thể bị lỗi:

```js
user.profile.name;
```

Lỗi thường gặp:

```txt
Cannot read properties of undefined
```

### 2. Chain nhiều tầng

- Có thể dùng `?.` nhiều tầng khi data lồng sâu.

```js
const city = user.profile?.address?.city;
```

- Nếu `profile` hoặc `address` là `null`/`undefined`, kết quả là `undefined`.
- Code không bị crash.

Ví dụ:

```js
const user = {
  profile: null,
};

console.log(user.profile?.address?.city);
```

Output:

```txt
undefined
```

### 3. Optional Chaining với function

- Có thể dùng `?.()` khi không chắc method/function có tồn tại hay không.

```js
const logger = {
  info(message) {
    console.log(message);
  },
};

logger.info?.("Hello");
logger.warn?.("Warning");
```

Output:

```txt
Hello
```

- `logger.warn` không tồn tại nên `logger.warn?.()` không chạy và không gây lỗi.

### 4. Optional Chaining với array

- Có thể dùng `?.[]` khi array có thể là `null` hoặc `undefined`.

```js
const users = null;

console.log(users?.[0]);
```

Output:

```txt
undefined
```

Ví dụ với data tồn tại:

```js
const users = ["Nhat", "Minh"];

console.log(users?.[0]);
```

Output:

```txt
Nhat
```

### 5. Nullish Coalescing là gì?

- `??` dùng để đặt giá trị mặc định khi giá trị bên trái là:

```txt
null
undefined
```

Ví dụ:

```js
const name = null;

const result = name ?? "Guest";

console.log(result);
```

Output:

```txt
Guest
```

Tương tự:

```js
const name = undefined;

console.log(name ?? "Guest");
```

Output:

```txt
Guest
```

Nhưng nếu giá trị là empty string:

```js
const name = "";

console.log(name ?? "Guest");
```

Output:

```txt

```

- Empty string không phải `null` hoặc `undefined`, nên `??` giữ nguyên `""`.

### 6. `??` khác `||` như thế nào?

- `||` fallback khi giá trị bên trái là falsy.
- `??` fallback chỉ khi giá trị bên trái là `null` hoặc `undefined`.

Ví dụ với `0`:

```js
const count = 0;

console.log(count || 10);
console.log(count ?? 10);
```

Output:

```txt
10
0
```

Ví dụ với empty string:

```js
const name = "";

console.log(name || "Guest");
console.log(name ?? "Guest");
```

Output:

```txt
Guest
""
```

Ví dụ với `false`:

```js
const isActive = false;

console.log(isActive || true);
console.log(isActive ?? true);
```

Output:

```txt
true
false
```

Nhớ nhanh:

```txt
|| -> fallback khi falsy: false, 0, "", null, undefined, NaN
?? -> fallback chỉ khi null hoặc undefined
```

### 7. Kết hợp `?.` và `??`

- Đây là pattern rất thực tế khi xử lý API response.

```js
const user = {};

const city = user.profile?.address?.city ?? "Unknown";

console.log(city);
```

Output:

```txt
Unknown
```

Luồng chạy:

```txt
user.profile -> undefined
user.profile?.address?.city -> undefined
undefined ?? "Unknown" -> "Unknown"
```

Ví dụ trong frontend:

```js
const avatarUrl = response.user?.profile?.avatar ?? "/default-avatar.png";
```

- Nếu API không trả `user`, `profile` hoặc `avatar`, UI vẫn có avatar mặc định.

### 8. Lưu ý khi dùng `??` với `||` hoặc `&&`

- JavaScript không cho trộn trực tiếp `??` với `||` hoặc `&&` nếu không có ngoặc.

Không nên viết:

```js
const value = a || b ?? "default";
```

Nên viết rõ bằng ngoặc:

```js
const value = (a || b) ?? "default";
```

Hoặc:

```js
const value = a || (b ?? "default");
```

- Dùng ngoặc giúp code rõ ý định hơn.

### 9. Lỗi thường gặp

1. Nghĩ `?.` kiểm tra mọi falsy value.
   - Không đúng.
   - `?.` chỉ dừng khi giá trị trước nó là `null` hoặc `undefined`.

```js
const data = {
  count: 0,
};

console.log(data.count?.toString());
```

Output:

```txt
0
```

- `0` vẫn là giá trị hợp lệ, nên `.toString()` vẫn chạy.

2. Dùng nhầm `||` khi muốn giữ lại `0`, `""`, `false`.
   - Nếu muốn fallback chỉ khi thiếu giá trị thật sự, dùng `??`.

```js
const count = 0;

console.log(count || 10);
console.log(count ?? 10);
```

3. Lạm dụng optional chaining ở chỗ data bắt buộc phải có.
   - Nếu field bắt buộc phải tồn tại, đôi khi để code lỗi sớm sẽ tốt hơn.
   - `?.` phù hợp hơn với data optional hoặc data từ API không chắc chắn.

### 10. Câu hỏi thường gặp

1. Optional chaining là gì?
   - Optional chaining cho phép truy cập an toàn vào property, method hoặc phần tử lồng sâu.
   - Nếu một giá trị trong chain là `null` hoặc `undefined`, biểu thức trả về `undefined` thay vì ném lỗi.

2. Nullish coalescing là gì?
   - `??` là operator dùng để fallback khi giá trị bên trái là `null` hoặc `undefined`.

3. Sự khác nhau giữa `??` và `||` là gì?
   - `||` fallback với mọi falsy value.
   - `??` chỉ fallback với `null` hoặc `undefined`.

4. Khi nào nên kết hợp `?.` và `??`?
   - Khi lấy data optional và muốn có giá trị mặc định.
   - Ví dụ: `user.profile?.address?.city ?? "Unknown"`.
