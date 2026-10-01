# TypeScript Theory

## 5. Optional Property & Readonly

### 1. Optional property là gì?

`optional property` là thuộc tính không bắt buộc phải có trong object.

Trong `type` hoặc `interface`, thêm dấu `?` sau tên property để khai báo property đó là optional.

```ts
interface User {
  id: number;
  name: string;
  phone?: string;
}
```

Với interface trên, cả hai object này đều hợp lệ:

```ts
const user1: User = {
  id: 1,
  name: "Nhat",
};

const user2: User = {
  id: 2,
  name: "Minh",
  phone: "0123456789",
};
```

Vì `phone` là optional nên object có thể không cần truyền `phone`.

### 2. Optional property và undefined

Khi đọc một optional property, TypeScript hiểu rằng giá trị đó có thể là kiểu đã khai báo hoặc `undefined`.

Ví dụ:

```ts
interface User {
  id: number;
  name: string;
  phone?: string;
}
```

Khi truy cập `user.phone`, TypeScript hiểu type là:

```txt
string | undefined
```

Vì vậy không nên gọi method trực tiếp nếu chưa kiểm tra:

```ts
function printPhone(user: User) {
  console.log(user.phone.toUpperCase());
}
```

Đoạn trên sẽ lỗi vì `phone` có thể là `undefined`.

Cách đúng là kiểm tra trước:

```ts
function printPhone(user: User) {
  if (user.phone) {
    console.log(user.phone.toUpperCase());
  }
}
```

Hoặc dùng optional chaining:

```ts
function printPhone(user: User) {
  console.log(user.phone?.toUpperCase());
}
```

Đây là lúc kiến thức `Optional Chaining` trong JavaScript được dùng rất tự nhiên với TypeScript.

### 3. Optional property với default value

Optional property rất hay đi chung với default value.

Ví dụ:

```ts
interface CreateUserInput {
  name: string;
  role?: "USER" | "ADMIN";
}

function createUser(input: CreateUserInput) {
  const role = input.role ?? "USER";

  return {
    name: input.name,
    role,
  };
}
```

Ở đây nếu không truyền `role`, hệ thống sẽ dùng mặc định là `"USER"`.

Toán tử `??` phù hợp hơn `||` khi muốn chỉ fallback với `null` hoặc `undefined`.

### 4. Readonly là gì?

`readonly` dùng khi một property chỉ nên được gán lúc khởi tạo và sau đó không được gán lại thông qua property đó.

```ts
interface User {
  readonly id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: "Nhat",
};

user.name = "Minh"; // OK
user.id = 2; // Error
```

TypeScript sẽ chặn việc gán lại `id`.

Ví dụ thực tế:

```ts
interface Product {
  readonly id: string;
  name: string;
  price: number;
}
```

`id` thường là dữ liệu định danh, nên sau khi object được tạo ra thì không nên bị thay đổi.

### 5. Kết hợp optional property và readonly

Có thể kết hợp cả `readonly` và optional property trên cùng một object type.

```ts
interface User {
  readonly id: number;
  name: string;
  avatarUrl?: string;
}
```

Ý nghĩa:

```txt
id        -> bắt buộc, không được gán lại
name      -> bắt buộc, có thể thay đổi
avatarUrl -> không bắt buộc
```

Ví dụ hợp lệ:

```ts
const user: User = {
  id: 1,
  name: "Nhat",
};
```

Vì `avatarUrl` là optional nên có thể bỏ qua.

### 6. Readonly với array

Ngoài object property, TypeScript còn có `readonly` cho array.

```ts
const numbers: readonly number[] = [1, 2, 3];
```

Khi array là `readonly`, các method làm thay đổi mảng như `push`, `pop`, `splice` sẽ không được phép dùng:

```ts
numbers.push(4); // Error
```

Có thể đọc dữ liệu bình thường:

```ts
console.log(numbers[0]);
```

`readonly number[]` giúp thể hiện rõ ý định: mảng này chỉ dùng để đọc, không dùng để sửa.

### 7. const và readonly khác nhau thế nào?

`const` ngăn việc gán lại biến.

```ts
const user = {
  id: 1,
  name: "Nhat",
};

user.name = "Minh"; // OK
```

Đoạn trên vẫn hợp lệ vì `const` chỉ ngăn:

```ts
user = {
  id: 2,
  name: "Other",
};
```

Nó không tự động làm các property bên trong object trở thành immutable.

Trong khi đó, `readonly` ngăn việc gán lại property:

```ts
interface User {
  readonly id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: "Nhat",
};

user.id = 2; // Error
```

Nhớ nhanh:

```txt
const    -> không gán lại biến
readonly -> không gán lại property
```

### 8. Lưu ý về readonly ở runtime

`readonly` là kiểm tra của TypeScript tại compile/type-check time. Nó không tự động đóng băng object ở runtime.

Nếu muốn object thật sự khó bị sửa ở runtime, JavaScript có `Object.freeze()`:

```ts
const user = Object.freeze({
  id: 1,
  name: "Nhat",
});
```

Tuy nhiên, trong TypeScript hằng ngày, `readonly` thường đủ để thể hiện ý định và bắt lỗi khi code.

### 9. Lỗi thường gặp

#### 1. Gọi method trực tiếp trên optional property

```ts
interface User {
  phone?: string;
}

function printPhone(user: User) {
  return user.phone.toUpperCase();
}
```

Đoạn trên lỗi vì `phone` có thể là `undefined`.

Cách sửa:

```ts
function printPhone(user: User) {
  return user.phone?.toUpperCase() ?? "NO_PHONE";
}
```

#### 2. Nghĩ readonly giống const

`const` bảo vệ biến khỏi bị gán lại. `readonly` bảo vệ property khỏi bị gán lại. Hai thứ này liên quan nhưng không giống nhau.

#### 3. Nghĩ readonly là immutable tuyệt đối

`readonly` chủ yếu là compile-time protection của TypeScript, không phải cơ chế đóng băng object ở runtime như `Object.freeze()`.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/optionalproperty-readonly.ts
```

### 10. Câu hỏi thường gặp

1. Optional property trong TypeScript là gì?
   - Optional property là thuộc tính không bắt buộc phải tồn tại trong object. Nó được khai báo bằng dấu `?` sau tên property.
2. TypeScript hiểu optional property là kiểu gì khi truy cập?
   - TypeScript hiểu property đó có thể là kiểu đã khai báo hoặc `undefined`. Ví dụ `phone?: string` khi đọc sẽ được hiểu là `string | undefined`.
3. Vì sao cần kiểm tra optional property trước khi dùng?
   - Vì property đó có thể không tồn tại. Nếu gọi method trực tiếp như `user.phone.toUpperCase()`, chương trình có thể lỗi khi `phone` là `undefined`.
4. `readonly` trong TypeScript nghĩa là gì?
   - `readonly` nghĩa là property không thể được gán lại sau khi object đã được khởi tạo.
5. Sự khác nhau giữa optional property và required property là gì?
   - Required property bắt buộc phải có trong object, còn optional property có thể được bỏ qua.
6. Sự khác nhau giữa `const` và `readonly` là gì?
   - `const` ngăn gán lại biến, còn `readonly` ngăn gán lại property của object.
7. `readonly` có giống `Object.freeze()` không?
   - Không hoàn toàn giống. `readonly` là kiểm tra ở TypeScript compile/type-check time, còn `Object.freeze()` là cơ chế của JavaScript ở runtime.
