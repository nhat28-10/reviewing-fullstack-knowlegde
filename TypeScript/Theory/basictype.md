# TypeScript Theory

## Basic Types

### 1. Bản chất

TypeScript cho phép chúng ta xác định kiểu dữ liệu mà một biến được phép chứa:

```ts
let username: string = "Nhat";
let age: number = 22;
let isActive: boolean = true;
```

Nếu gán sai kiểu:

```ts
age = "22";
```

TypeScript sẽ báo lỗi trước khi chạy chương trình.

> Lưu ý: TypeScript kiểm tra type chủ yếu ở compile/type-check time. Khi chạy JavaScript thực tế, các type annotation không còn tồn tại.

### 2. string, number, boolean

#### 1. String

Dùng cho chuỗi:

```ts
let email: string = "nhat@gmail.com";
```

#### 2. Number

TypeScript dùng `number` cho cả số nguyên và số thực:

```ts
let age: number = 22;
let price: number = 200;
```

TypeScript không có kiểu số riêng giống Java/C#:

```txt
int
float
double
```

#### 3. Boolean

Boolean chỉ nhận `true` hoặc `false`.

```ts
let isAdmin: boolean = false;
```

### 3. Array

Array chứa nhiều phần tử cùng một kiểu.

Có 2 cách viết tương đương:

```ts
const userIds: number[] = [1, 2, 3, 4];
const usernames: Array<string> = ["Nhat", "Other"];
```

Ví dụ backend:

```ts
const roles: string[] = ["User", "Admin"];
```

Ví dụ sai:

```ts
const roles: string[] = ["User", 123];
```

Vì `123` không phải là `string`. Nếu thật sự muốn nhiều kiểu thì sau này sẽ có Union Type.

### 4. Tuple

Tuple giống array nhưng quy định kiểu của từng vị trí và thứ tự của chúng.

```ts
let user: [number, string, boolean];
user = [1, "Nhat", true];
```

Ý nghĩa là:

```txt
index 0 là number
index 1 là string
index 2 là boolean
```

Nên ví dụ này sẽ lỗi:

```ts
user = ["Nhat", 1, true];
```

Một ví dụ dễ hình dung:

```ts
const coordinate: [number, number] = [10.75, 106.67];
```

Tuple vẫn là JavaScript Array ở runtime. TypeScript chỉ bổ sung constraint về type/order khi kiểm tra code.

### 5. Array vs Tuple

```ts
const scores: number[] = [8, 9, 10];
```

- Array:
  - Thường chứa cùng 1 loại dữ liệu
  - Số lượng phần tử có thể thay đổi
  - Từng vị trí không mang type riêng biệt
- Trong khi:
  ```ts
  const user: [number, string] = [1, "Nhat"];
  ```
- Tuple:
  - Mỗi vị trí có type xác định
  - Thứ tự có ý nghĩa
  - Thường dùng khi cấu trúc ngắn và cố định
  - Ví dụ:

    ```ts
    [number, string];
    ```

    sẽ khác với

    ```ts
    [string, number];
    ```

Trong code thực tế, nếu dữ liệu có nhiều field hoặc cần dễ đọc, nên ưu tiên object:

```ts
const userObject = {
  id: 1,
  name: "Nhat",
};
```

### 6. Cần lưu ý

1. Type Inference: Không phải lúc nào cũng cần viết type.

```ts
let age = 22;
```

TypeScript có thể suy luận `age` là `number`. Sau đó `age = "22"` vẫn lỗi. Đây gọi là type inference.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/basic-types.ts
```

2. Dùng lowercase type.

- Ta nên viết
  ```ts
  string;
  number;
  boolean;
  ```
- Chứ không nên viết
  ```ts
  String;
  Number;
  Boolean;
  ```
- `String`, `Number`, `Boolean` là các wrapper object của JavaScript, không phải cách thông thường để khai báo primitive type trong TypeScript.

### 7. Các câu hỏi thường gặp

1. Basic Type trong TypeScript là gì?
   - Một số basic type thường gặp gồm `string`, `number`, `boolean`, `array` và `tuple`.
   - Chúng giúp TypeScript kiểm tra kiểu dữ liệu trước khi chương trình chạy.
2. TypeScript có `int`, `float` hay `double` không?
   - Không. TypeScript sử dụng `number` cho cả số nguyên và số thực.
3. Có những cách nào để khai báo Array trong TypeScript?
   - Có 2 cách phổ biến

   ```ts
   const ids: number[] = [1, 2, 3];
   const otherIds: Array<number> = [1, 2, 3];
   ```

   - Hai cách này cơ bản có ý nghĩa giống nhau.

4. Tuple là gì?
   - Tuple là 1 dạng array mà type và thứ tự của từng vị trí đã được xác định trước.

   ```ts
   const user: [number, string] = [1, "Nhat"];
   ```

5. Array và Tuple khác nhau như thế nào?
   - Array thường chứa nhiều phần tử cùng 1 kiểu dữ liệu và độ dài có thể thay đổi.
   - Tuple xác định kiểu dữ liệu theo từng vị trí và thường dùng cho một cấu trúc ngắn có thứ tự cố định.
6. Type inference trong TypeScript là gì?
   - Type inference là khả năng TypeScript tự suy luận type dựa trên giá trị được gán. Ví dụ `let age = 22`, TypeScript có thể tự hiểu `age` là `number` mặc dù không viết `number`.
