# TypeScript Theory

## 2. any, unknown, never, void

### 1. any - bỏ qua type checking

`any` nghĩa là TypeScript gần như không kiểm tra type của giá trị này nữa.

```ts
let data: any = "Nhat";

data = 123;
data = true;

data.toUpperCase();
```

TypeScript vẫn cho phép gọi `data.toUpperCase()` ngay cả khi runtime `data` có thể đang là `number`. Đây chính là vấn đề của `any`: nó làm mất lợi ích của TypeScript.

Ví dụ xử lý API:

```ts
function handleResponse(data: any) {
  console.log(data.user.name);
}
```

TypeScript không biết `user` hay `name` có thật sự tồn tại hay không.

> Nhớ nhanh: `any` = "Tôi không muốn TypeScript kiểm tra biến này".

Không phải lúc nào `any` cũng cấm dùng, nhưng nên tiết chế.

### 2. unknown - không biết type, nhưng vẫn an toàn

`unknown` cũng dùng khi chưa biết type của dữ liệu.

```ts
let value: unknown;

value = "Hello";
value = 123;
value = true;
```

Khác biệt quan trọng là TypeScript sẽ không cho phép gọi trực tiếp `value.toUpperCase()`. Bạn phải kiểm tra type trước.

```ts
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

Lúc này TypeScript biết bên trong `if`, `value` là `string`.

Ví dụ thực tế:

```ts
function processData(data: unknown) {
  if (typeof data === "string") {
    console.log(data.toUpperCase());
  }
}
```

`any` vs `unknown`:

```ts
let a: any = "Hello";
let b: unknown = "Hello";

a.toUpperCase(); // OK
b.toUpperCase(); // Error
```

`unknown` an toàn hơn vì buộc lập trình viên kiểm tra type trước khi sử dụng.

### 3. void - function không trả về giá trị cần sử dụng

`void` thường được dùng làm return type của function không trả về giá trị hữu ích.

```ts
function logMessage(message: string): void {
  console.log(message);
}
```

Function này chỉ thực hiện hành động `console.log()` chứ không `return something`.

Ví dụ trong backend:

```ts
function logRequest(path: string): void {
  console.log(`Request: ${path}`);
}
```

Một hiểu nhầm phổ biến:

```txt
void không có nghĩa function "không làm gì".

void nghĩa là caller không nhận một giá trị trả về hữu ích.
```

### 4. never - function không bao giờ kết thúc bình thường

`never` nghĩa là function không bao giờ tạo ra một kết quả bình thường cho caller.

Ví dụ function luôn throw error:

```ts
function throwError(message: string): never {
  throw new Error(message);
}
```

Đoạn `throw new Error(message)` làm function kết thúc bằng exception nên không có giá trị nào được return.

Một trường hợp khác:

```ts
function infiniteLoop(): never {
  while (true) {
    console.log("Running...");
  }
}
```

Function chạy mãi nên cũng không bao giờ return.

`void` vs `never`:

```ts
function log(): void {
  console.log("Hello");
}
```

Function kết thúc bình thường, chỉ là không trả về giá trị hữu ích. Trong khi đó:

```ts
function fail(): never {
  throw new Error("Failed");
}
```

Function không bao giờ kết thúc bình thường.

Nhớ nhanh:

```txt
void -> function chạy xong nhưng không return giá trị hữu ích
never -> function không bao giờ return được
```

### 5. Khi nào nên dùng cái nào?

| Type      | Ý nghĩa ngắn                                 |
| --------- | -------------------------------------------- |
| `any`     | Bỏ qua type checking                         |
| `unknown` | Chưa biết type, phải kiểm tra trước khi dùng |
| `void`    | Function không trả về giá trị hữu ích        |
| `never`   | Function không bao giờ kết thúc bình thường  |

Trong code thực tế:

```ts
function log(message: string): void {
  console.log(message);
}
```

Đây là `void`.

```ts
function crash(): never {
  throw new Error("Server error");
}
```

Đây là `never`.

```ts
function parseInput(input: unknown) {
  if (typeof input === "string") {
    return input.trim();
  }
}
```

Đây là `unknown`.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/any-unknown-never-void.ts
```

Còn `any` thường chỉ nên dùng khi thật sự cần thoát khỏi type system hoặc đang xử lý code/library cũ.

### 6. Các câu hỏi thường gặp

1. `any` trong TypeScript là gì?
   - `any` là kiểu dữ liệu vô hiệu hóa kiểm tra type. Một biến có kiểu `any` có thể giữ mọi giá trị, và TypeScript cho phép truy cập thuộc tính hoặc gọi phương thức mà không cần kiểm tra kiểu.
2. Sự khác biệt giữa `any` và `unknown` là gì?
   - Cả 2 đều có thể nhận mọi kiểu dữ liệu, nhưng `any` cho phép sử dụng giá trị trực tiếp, trong khi `unknown` yêu cầu kiểm tra kiểu trước khi dùng.
3. Tại sao `unknown` an toàn hơn `any`?
   - `unknown` an toàn hơn bởi vì TypeScript buộc chúng ta phải xác nhận kiểu trước khi truy cập thuộc tính, gọi phương thức hoặc thực hiện thao tác trên giá trị.
4. `void` trong TypeScript là gì?
   - `void` được dùng làm return type của function không trả về giá trị hữu ích.
5. `never` trong TypeScript là gì?
   - `never` biểu diễn một giá trị sẽ không bao giờ xuất hiện. Nó thường dùng cho function luôn throw error hoặc không bao giờ hoàn thành thực thi.
6. Điểm khác nhau giữa `void` và `never` là gì?
   - Một `void` function có thể hoàn thành nhưng không trả về giá trị hữu ích. Trong khi đó, function có return type `never` sẽ không bao giờ hoàn thành bình thường vì nó luôn throw error hoặc chạy mãi mãi.
