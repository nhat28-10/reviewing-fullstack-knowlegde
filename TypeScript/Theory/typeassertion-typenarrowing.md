# TypeScript Theory

## 10. Type Assertion & Type Narrowing

### 1. Type Assertion là gì?

`Type Assertion` là khi bạn nói với TypeScript rằng: "Hãy coi giá trị này là một type cụ thể hơn type mà compiler đang biết".

Cú pháp phổ biến:

```ts
value as SomeType;
```

Ví dụ:

```ts
const value: unknown = "Hello";

const text = value as string;

console.log(text.toUpperCase());
```

Ở đây `value as string` nói với TypeScript rằng hãy coi `value` là `string`.

Điểm rất quan trọng: Type assertion không chuyển đổi dữ liệu ở runtime.

```ts
const value: unknown = 123;

const text = value as string;
```

TypeScript có thể tin bạn, nhưng `123` vẫn là `number` ở runtime. Nó không giống với:

```ts
const text = String(123);
```

Nhớ nhanh:

```txt
Type Assertion -> nói với TypeScript hãy tin mình
```

### 2. Type Narrowing là gì?

`Type Narrowing` là quá trình kiểm tra dữ liệu để TypeScript tự thu hẹp type từ type rộng về type cụ thể hơn.

Ví dụ:

```ts
function printValue(value: string | number): void {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else {
    console.log(value.toFixed(2));
  }
}
```

Ban đầu `value` có type là `string | number`.

Sau điều kiện:

```ts
typeof value === "string";
```

TypeScript hiểu:

- Trong block `if`, `value` là `string`.
- Trong block `else`, `value` là `number`.

Đây chính là `type narrowing`.

Nhớ nhanh:

```txt
Type Narrowing -> kiểm tra trước, dùng sau
```

### 3. Các cách Narrowing phổ biến

#### 1. typeof

`typeof` thường dùng tốt với primitive type như `string`, `number`, `boolean`, `undefined`, `bigint`, `symbol`.

```ts
function handle(value: string | number): void {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else {
    console.log(value.toFixed(2));
  }
}
```

#### 2. in

`in` dùng để kiểm tra một property có tồn tại trong object hay không.

```ts
type Admin = {
  permissions: string[];
};

type User = {
  email: string;
};

function handle(person: Admin | User): void {
  if ("permissions" in person) {
    console.log(person.permissions);
  } else {
    console.log(person.email);
  }
}
```

#### 3. instanceof

`instanceof` dùng để kiểm tra một giá trị có phải instance của class hay không.

```ts
function printError(error: Error | string): void {
  if (error instanceof Error) {
    console.log(error.message);
  } else {
    console.log(error);
  }
}
```

#### 4. Equality narrowing

Khi so sánh với một literal value, TypeScript cũng có thể tự narrow type.

```ts
type Status = "loading" | "success" | "error";

function getStatusMessage(status: Status): string {
  if (status === "loading") {
    return "Đang tải";
  }

  if (status === "success") {
    return "Thành công";
  }

  return "Có lỗi xảy ra";
}
```

#### 5. Discriminated union

Đây là pattern rất phổ biến: mỗi object trong union có một field chung để phân biệt loại dữ liệu.

```ts
type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  }

  return shape.width * shape.height;
}
```

Ở đây `kind` là field giúp TypeScript biết chính xác `shape` đang là `Circle` hay `Rectangle`.

#### 6. Custom type guard

Khi logic kiểm tra phức tạp hơn, ta có thể viết function riêng để narrow type.

```ts
type Product = {
  id: number;
  name: string;
};

function isProduct(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}
```

`value is Product` nghĩa là nếu function trả về `true`, TypeScript sẽ hiểu `value` là `Product`.

### 4. Type Assertion vs Type Narrowing

Đây là phần rất quan trọng.

#### 1. Assertion

```ts
const value: unknown = "Hello";

const text = value as string;
```

Bạn đang nói cho TypeScript biết type. Không có runtime check.

#### 2. Narrowing

```ts
const value: unknown = "Hello";

if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

Bạn đang kiểm tra dữ liệu thật, sau đó TypeScript tự suy luận type.

So sánh nhanh:

```txt
Assertion
-> Developer nói với TypeScript:
  "Tin tôi đi, nó là type này."

Narrowing
-> Code kiểm tra:
  "Hãy xác minh nó là type nào."
```

Thông thường, nếu có thể kiểm tra dữ liệu một cách hợp lý thì type narrowing an toàn hơn type assertion.

### 5. Ví dụ thực tế

Giả sử nhận data chưa biết type:

```ts
function handleResponse(data: unknown): void {
  if (typeof data === "object" && data !== null && "name" in data) {
    console.log(data.name);
  }
}
```

Ở đây ta narrow `unknown` trước khi sử dụng.

Trong một trường hợp khác, bạn biết chắc element là input:

```ts
const element = document.getElementById("email");

const input = element as HTMLInputElement;

console.log(input.value);
```

Đây là assertion vì developer biết element đó được thiết kế là `<input>`. Nhưng nếu assertion sai, runtime vẫn có thể xảy ra lỗi.

An toàn hơn, ta có thể narrow bằng `instanceof`:

```ts
const element = document.getElementById("email");

if (element instanceof HTMLInputElement) {
  console.log(element.value);
}
```

### 6. Lỗi thường gặp

#### 1. Nghĩ `as` convert dữ liệu

Điều này là sai:

```ts
const value = "123" as unknown as number;
```

Đoạn trên không biến `"123"` thành `123`.

Nếu muốn convert thật, phải dùng logic runtime:

```ts
const value = Number("123");
```

#### 2. Assertion quá nhiều

Ví dụ:

```ts
const data = res as User;
```

Nếu dữ liệu thực tế từ API không đúng cấu trúc `User`, TypeScript không tự kiểm tra runtime cho bạn. Vì vậy assertion không nên được xem là validation.

#### 3. Dùng assertion khi narrowing được

Thay vì:

```ts
const value: unknown = "Hello";

console.log((value as string).toUpperCase());
```

Nếu chưa chắc type, nên narrow trước:

```ts
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

#### 4. Quên kiểm tra null khi narrow object

Trong JavaScript:

```ts
typeof null; // "object"
```

Vì vậy khi narrow object từ `unknown`, nên kiểm tra thêm `value !== null`.

```ts
function handle(value: unknown): void {
  if (typeof value === "object" && value !== null) {
    console.log("Đây là object");
  }
}
```

### 7. Các câu hỏi thường gặp

1. Type Assertion trong TypeScript là gì?
   - Type Assertion nói với TypeScript hãy coi một giá trị là một type cụ thể hơn.
2. Type Assertion có thay đổi giá trị lúc runtime không?
   - Không. Type assertion chỉ ảnh hưởng đến type checking, không convert hoặc thay đổi giá trị runtime.
3. Type Narrowing là gì?
   - Type narrowing là quá trình kiểm tra giá trị để TypeScript xác định type cụ thể hơn từ một type rộng.
4. Những cách narrow type phổ biến trong TypeScript là gì?
   - `typeof`, `in`, `instanceof`, equality check, discriminated union và custom type guard.
5. Sự khác nhau giữa type assertion và type narrowing là gì?
   - Type assertion yêu cầu TypeScript tin vào type bạn chỉ định. Type narrowing kiểm tra dữ liệu thật rồi TypeScript tự suy luận type.
6. Cái nào an toàn hơn: type assertion hay type narrowing?
   - Type narrowing thường an toàn hơn vì nó xác minh giá trị trước khi dùng như một type cụ thể.
7. Khi nào nên dùng type assertion?
   - Khi bạn biết nhiều hơn TypeScript về giá trị đó, ví dụ khi làm việc với DOM element hoặc một thư viện có type chưa đủ chính xác.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/typeassertion-typenarrowing.ts
```
