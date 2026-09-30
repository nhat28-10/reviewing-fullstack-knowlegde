# TypeScript Theory

## Union Type & Intersection Type

### 1. Union Type - "Hoặc"

Union Type cho phép một biến có thể thuộc một trong nhiều type.

```ts
let id: string | number;

id = 123;
id = "abc";
```

Ở đây `string | number` nghĩa là `string OR number`.

Ví dụ thực tế:

```ts
function printId(id: string | number) {
  console.log(id);
}
```

Có thể gọi:

```ts
printId(123);
printId("USER_123");
```

### 2. Khi dùng Union phải chú ý type narrowing

Ví dụ:

```ts
function formatId(id: string | number) {
  return id.toUpperCase();
}
```

Đoạn trên sẽ lỗi vì `number` không có `.toUpperCase()`, nên phải kiểm tra type trước:

```ts
function formatId(id: string | number) {
  if (typeof id === "string") {
    return id.toUpperCase();
  }

  return id.toString();
}
```

Đây chính là `type narrowing`: sau khi kiểm tra, TypeScript biết chính xác type đang xử lý.

### 3. Intersection Type - "Và"

Intersection kết hợp nhiều type thành một type mới phải có đầy đủ tất cả các thuộc tính.

Ví dụ:

```ts
type User = {
  name: string;
};

type Admin = {
  permissions: string[];
};

type AdminUser = User & Admin;
```

`AdminUser` phải có cả `name` và `permissions`:

```ts
const admin: AdminUser = {
  name: "Nhat",
  permissions: ["CREATE", "DELETE"],
};
```

> Nhớ nhanh: `Union | -> OR` và `Intersection & -> AND`.

### 4. Ví dụ thực tế

#### Union

API có thể trả ID là số hoặc chuỗi:

```ts
type UserId = string | number;
```

Hoặc status:

```ts
type Status = "pending" | "success" | "failed";
```

Đây cũng là union nhưng là `literal union`.

#### Intersection

Muốn 1 object vừa có dữ liệu user vừa có thông tin xác thực thì ta viết:

```ts
type User = {
  id: number;
  name: string;
};

type AuthInfo = {
  accessToken: string;
};

type AuthenticatedUser = User & AuthInfo;
```

Object hợp lệ:

```ts
const user: AuthenticatedUser = {
  id: 1,
  name: "Nhat",
  accessToken: "abc123",
};
```

### 5. Lỗi thường gặp

1. Sai lầm lớn nhất là nghĩ `A | B` nghĩa là object phải có cả A và B.

Không đúng. Cần nhớ:

```txt
A | B -> Chỉ cần phù hợp A HOẶC B
A & B -> phải phù hợp A VÀ B
```

- Ví dụ

```ts
type A = {
  name: string;
};

type B = {
  age: number;
};
```

Union:

```ts
type Result = A | B;

const x: Result = {
  name: "Nhat",
};
```

Đoạn trên hợp lệ vì `Result` chỉ cần phù hợp `A` hoặc `B`.

Intersection:

```ts
type Result = A & B;

const x: Result = {
  name: "Nhat",
};
```

Đoạn trên sai vì thiếu `age`.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/union-type-intersection-type.ts
```

### 6. Câu hỏi thường gặp

1. Union type là gì trong TypeScript?
   - `Union Type` cho phép 1 giá trị có thể thuộc một trong nhiều kiểu khác nhau. Nó được tạo bằng toán tử `|`.
2. Intersection type trong TypeScript là gì?
   - `Intersection Type` kết hợp nhiều kiểu thành 1 kiểu mới phải phù hợp với tất cả các kiểu đó. Nó được tạo bằng toán tử `&`.
3. Sự khác nhau giữa `union type` và `intersection type` là gì?
   - `Union type` biểu diễn mối quan hệ `OR`, trong khi `intersection type` biểu diễn mối quan hệ `AND`.
4. Tại sao chúng ta cần sử dụng `type narrowing` với union types?
   - Bởi vì TypeScript chỉ cho phép thao tác an toàn với tất cả các kiểu có trong union. Type narrowing giúp xác định kiểu thực sự trước khi dùng thuộc tính hoặc phương thức riêng của từng type.
5. `literal values` có thể được sử dụng trong union type không?
   - Có. Ví dụ `"pending" | "success" | "failed"` giới hạn giá trị chỉ nằm trong những chuỗi đó.
