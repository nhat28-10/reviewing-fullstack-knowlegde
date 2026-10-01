# TypeScript Theory

## 7. Generic & Generic Constraints

### 1. Generic là gì ?

- `Generic` cho phép chúng ta viết code có thể làm việc với nhiều type khác nhau nhưng vẫn giữ được type safety
- Ví dụ không dùng Genetic

```ts
function getString(value: string): string {
  return value;
}

function getNumber(value: number): number {
  return value;
}
```

- Bạn có thể thấy 2 function này đều gần giống hệt nhau đúng không. Vậy khi ta dùng với Generic sẽ như thế nào

```ts
function getValue<T>(value: T): T {
  return value;
}
```

- `T` ở đây đại diện cho một type chưa xác định trước. Dùng

```ts
const a = getValue<string>("Nhat");
const b = getValue<number>(100);
```

- Lúc này TScript sẽ biết rằng là à `a -> string, b -> number`

### 2. TypeScript có thể tự infer Generic

- Không nhất thiết lúc nào cũng phải viết

```ts
getValue<string>("Nhat");
```

- Mà ta có thể viết là

```ts
const name = getValue("Nhat");
const age = getValue(22);
```

- Lúc này TScript sẽ tự suy luận là à ` T = string, T = number`. Đây chính là `type inference` mà trước đó đã có đề cập.

### 3. Genetic với Array

- Ví dụ muốn lấy phần tử đầu tiên

```ts
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}
```

- Ta sẽ dùng

```ts
const number = getFirst([10, 20, 30]);
const name = getFirst(["Nhat", "Minh"]);
```

- Thì lúc này TScript sẽ tự suy luận rằng là à

```txt
number -> number | undefined
name -> string | undefined
```

- Tại sao lại có `undefined`? Vì Array có thể rỗng: `getFirst([])`

### 4. Generic với nhiều type

- Generic không chỉ có một `T`

```ts
function createPair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
- Sử dụng
const result = createPair("Nhat", 22);
- Lúc này TScript tự suy luận rằng
T = string
U = number
- Vậy nên `result` có type: là
[string,number]
```

### 5. Generic Constraint là gì?

- Generic bình thường có thể nhận gần như bất kì type nào

```ts
function printValue<T>(value: T) {
  // ...
}
```

- Nhưng đôi khi chúng ta muốn Generic, nhưng type truyền vào phải đáp ứng 1 điều kiện nào đó. Vậy nên ta dùng `extends`. Thông qua ví dụ sau đây

```ts
function printLength<T extends { length: number }>(value: T): number {
  return value.length;
}
```

- Điều này nghĩa là `T` có thể là nhiều type khác nhau, nhưng bắt buộc phải có property `length: number`. Ví dụ hợp lệ là

```ts
printLength("Hello");
printLength([1, 2, 3]);
```

- Vì `string & array` đều có `length`
- Còn ví dụ không hợp lệ là

```ts
printLength(100);
```

- Vì `number` không có `length`

### 6. Generic Constraints thực tế hơn

- Ví dụ ở backend

```ts
interface HasId {
  id: number;
}

function printId<T extends HasId>(item: T): void {
  console.log(item.id);
}
```

- Object này hợp lệ ` printId({id:1, name:"Nhat"})`. Vì object có `id`. Thế nhưng `print({name:"Nhat"})` sẽ không hợp lệ vì thiếu `id`. Điểm hay là `T` vẫn có thể chưa thêm property khác.

### 7. Tại sao không dùng any luôn?

- Ví dụ

```ts
function identity(value: any): any {
  return value;
}
-Sau;
const result = identity("Nhat");
```

- TypeScript sẽ gần như mất thông tin type của `result`. Trong khi

```ts
function identity<T>(value: T): T {
  return value;
}
-Thì;
const result = idendity("Nhat");
```

- TScript vẫn biết `result = string`. Đây là điểm quan trọng.

```txt
any -> bỏ type safety
Generic -> linh hoạt nhưng vẫn giữ type information
```

### 8. Ví dụ rất phổ biến - API Respionse

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

- Response User

```ts
interface User {
  id: number;
  name: string;
}

const response: ApiResponse<User> = {
  success: true,
  data: {
    id: 1,
    name: "Nhat",
  },
};
```

- Hoặc product

```ts
interface Product {
  id: number;
  price: number;
}

const response: ApiResponse<Product> = {
  success: true,
  data: {
    id: 10,
    price: 500,
  },
};
```

- Không cần tạo. Vì generic giúp tái sử dụng cấu trúc

```txt
UserApiResponse
ProductApiResponse
OrderApiResponse
```

### 9. Lỗi thường mắc phải

1. Nghĩ `T` là keyword cố định thì điều này không phải. Chúng ta có thể viết

```ts
function identity<Type>(value: Type): Type {
  return value;
}
```

- Chỉ là `T` là từ phổ biến. Ngoài ra bạn sẽ thường thấy rằng là

```txt
T → Type
K → Key
V → Value
E → Element
```

2. Nghĩ `extends` ở Generic là Inheritance thông thường
   - Trong `T extends HasId`. Có thể hiểu đơn giản là `T` phải thỏa mãn cấu trúc của `HasId`. Nó đang đặt constraint cho `T`

### 10. Câu hỏi thường gặp

1. Generics trong TScript là gì?
   - Generic cho phép chúng ta viết code tái sử dụng thứ mà có thể làm việc với nhiều `type` khác nhau trong khi bảo vệ `type` an toàn
2. `<T>` có nghĩa là gì ở trong TScipr
   - `T` là 1 tham số của generic type cái mà trình diễn 1 `type` thứ sẽ được xác định khi hàm,class hoặc interface đều dùng
3. Tại sao bạn sử dụng generics như 1 phần của `any`
   - Generics bảo mật thông tin, trong khi `any` thì vô hiệu hóa việc kiểm tra `type` và làm mất đi tính `type safety`
4. Generic constraints là gì ?
   - 1 Generic constraint ngăn chăn những types có thể sử dụng với generic
5. Làm thế nào bạn có thể tạo 1 generic constraints
   - Bạn có thể sử dụng keyword là `extends`
   ```ts
   function getLength<T extends { length: number }>(value: T): number {
     return value.length;
   }
   ```
6. `T extends HasId` có nghĩa là gì?

- Nó nghĩa là `T` có thể là mọi loại `type` miễn là nó an toàn với cấu trúc được định nghĩa bởi `HasId`
