# TypeScript Theory

## 6. Typing Function & Callback

### 1. Typing cho function là gì?

Trong TypeScript, ta có thể khai báo type cho:

- Parameter
- Return value

Ví dụ:

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

Ý nghĩa:

```txt
a: number -> tham số a phải là number
b: number -> tham số b phải là number
: number  -> function phải trả về number
```

Nếu return sai kiểu, TypeScript sẽ báo lỗi:

```ts
function add(a: number, b: number): number {
  return "hello";
}
```

Đoạn trên lỗi vì function khai báo trả về `number`, nhưng thực tế lại trả về `string`.

### 2. Function không return giá trị

Nếu function chỉ thực hiện hành động và không trả về giá trị hữu ích, ta dùng `void`.

```ts
function printUser(name: string): void {
  console.log(name);
}
```

`void` thường dùng cho các function như:

```txt
console log
gửi request
cập nhật UI
gọi callback
```

Nó thể hiện rằng function hoàn thành công việc nhưng không có giá trị return cần dùng tiếp.

### 3. Type inference với return value

Không phải lúc nào cũng bắt buộc viết return type.

```ts
function multiply(a: number, b: number) {
  return a * b;
}
```

TypeScript có thể tự suy luận function trên trả về `number`.

Tuy nhiên, trong các function quan trọng hoặc public API, viết return type rõ ràng sẽ giúp code dễ đọc và dễ phát hiện lỗi hơn:

```ts
function multiply(a: number, b: number): number {
  return a * b;
}
```

### 4. Optional parameter và default parameter

#### 1. Optional parameter

Optional parameter dùng dấu `?` sau tên parameter.

```ts
function greet(name: string, message?: string): string {
  return `${message ?? "Hello"} ${name}`;
}
```

Lúc này `message` có thể là:

```txt
string | undefined
```

Cả hai cách gọi này đều hợp lệ:

```ts
greet("Nhat");
greet("Nhat", "Hi");
```

Lưu ý: optional parameter nên đặt sau required parameter.

```ts
function greet(message?: string, name: string): string {
  return `${message} ${name}`;
}
```

Đoạn trên không nên viết vì parameter bắt buộc `name` đứng sau parameter optional `message`.

#### 2. Default parameter

Default parameter dùng giá trị mặc định khi caller không truyền argument.

```ts
function greet(name: string, message: string = "Hello"): string {
  return `${message} ${name}`;
}

greet("Nhat");
```

Kết quả:

```txt
Hello Nhat
```

Với default parameter, TypeScript có thể tự hiểu `message` là `string`.

### 5. Callback là gì?

Callback là một function được truyền vào function khác để function kia gọi lại.

Ví dụ JavaScript:

```js
function processUser(callback) {
  callback();
}
```

Trong TypeScript, ta nên khai báo type cho callback:

```ts
function processUser(callback: (name: string) => void): void {
  callback("Nhat");
}
```

Phần này là type của callback:

```ts
(name: string) => void
```

Ý nghĩa:

```txt
callback nhận vào 1 string
callback không trả về giá trị hữu ích
```

Sử dụng:

```ts
processUser((name) => {
  console.log(name);
});
```

TypeScript tự biết `name` là `string`.

### 6. Callback có return value

Callback không nhất thiết phải là `void`. Nó cũng có thể trả về giá trị.

Ví dụ:

```ts
function calculate(
  a: number,
  b: number,
  operation: (x: number, y: number) => number
): number {
  return operation(a, b);
}
```

Sử dụng:

```ts
const result = calculate(10, 20, (x, y) => x + y);

console.log(result);
```

Kết quả:

```txt
30
```

Callback `(x: number, y: number) => number` nghĩa là callback nhận vào 2 `number` và trả về 1 `number`.

### 7. Tách function type ra riêng

Nếu function type dài hoặc được dùng nhiều lần, nên tách ra thành `type`.

```ts
type Operation = (a: number, b: number) => number;
```

Sau đó dùng lại:

```ts
function calculate(a: number, b: number, operation: Operation): number {
  return operation(a, b);
}
```

Cách này giúp code dễ đọc hơn, đặc biệt khi callback xuất hiện ở nhiều nơi.

Ví dụ khác:

```ts
type UserCallback = (id: number, name: string) => void;
```

Có thể dùng `interface` để mô tả function type, nhưng với callback ngắn gọn thì `type` thường dễ đọc hơn:

```ts
interface OperationInterface {
  (a: number, b: number): number;
}
```

### 8. Ví dụ thực tế

#### Backend

Giả sử xử lý user sau khi tìm được:

```ts
type User = {
  id: number;
  name: string;
};

function findUser(id: number, callback: (user: User) => void): void {
  const user: User = {
    id,
    name: "Nhat",
  };

  callback(user);
}
```

Sử dụng:

```ts
findUser(1, (user) => {
  console.log(user.name);
});
```

Trong callback, TypeScript biết `user` có `id` và `name`.

#### Frontend

Trong frontend, callback thường xuất hiện trong props:

```ts
type ButtonProps = {
  onClick: () => void;
};
```

Ý nghĩa:

```txt
onClick là function
không nhận parameter
không trả về giá trị hữu ích
```

Hoặc input change:

```ts
type InputProps = {
  value: string;
  onChange: (value: string) => void;
};
```

Ý nghĩa là component nhận vào một callback `onChange`, callback này nhận `value` kiểu `string`.

### 9. Lỗi thường gặp

#### 1. Sai parameter type

```ts
function add(a: number, b: number): number {
  return a + b;
}

add("10", 20);
```

Đoạn trên lỗi vì `"10"` là `string`, trong khi `a` phải là `number`.

#### 2. Sai return type

```ts
function getAge(): number {
  return "22";
}
```

Đoạn trên lỗi vì function khai báo trả về `number`, nhưng lại return `string`.

#### 3. Sai callback signature

```ts
function run(callback: (value: number) => void): void {
  callback(10);
}

run((value: string) => {
  console.log(value);
});
```

Đoạn trên lỗi vì `run` sẽ truyền `number`, nhưng callback lại khai báo nhận `string`.

#### 4. Nhầm function type với gọi function

```ts
(name: string) => void
```

Đây là function type, không phải function đang được thực thi.

Function thật sẽ có phần thân:

```ts
(name: string) => {
  console.log(name);
};
```

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/typingfunction-callback.ts
```

### 10. Câu hỏi thường gặp

1. Typing function trong TypeScript là gì?
   - Là việc khai báo type cho parameter và return value của function.
2. Làm thế nào để khai báo một function nhận 2 số và trả về 1 số?
   - Có thể viết `function add(a: number, b: number): number { return a + b; }`.
3. `void` trong function nghĩa là gì?
   - `void` nghĩa là function không trả về giá trị hữu ích để dùng tiếp.
4. Callback trong TypeScript là gì?
   - Callback là function được truyền vào một function khác để được gọi lại sau đó.
5. Làm thế nào để định nghĩa type cho callback?
   - Dùng function type, ví dụ `(value: string) => void`.
6. `(value: string) => void` có nghĩa là gì?
   - Nghĩa là một function nhận 1 parameter `value` kiểu `string` và không trả về giá trị hữu ích.
7. Callback có thể trả về giá trị không?
   - Có. Ví dụ `(a: number, b: number) => number` là callback nhận vào 2 số và trả về 1 số.
8. Tại sao nên tạo type alias cho callback?
   - Vì `type alias` giúp callback type dễ tái sử dụng và làm code dễ đọc hơn khi callback type dài hoặc xuất hiện nhiều lần.
