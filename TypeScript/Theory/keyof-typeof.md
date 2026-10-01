# TypeScript Theory

## 8. keyof & typeof

### 1. keyof là gì?

`keyof` lấy tên các property của một type và biến chúng thành một union type.

Ví dụ:

```ts
type User = {
  id: number;
  name: string;
  age: number;
};

type UserKey = keyof User;
```

Lúc này `UserKey` tương đương với:

```ts
"id" | "name" | "age";
```

Nhớ nhanh:

```txt
keyof -> lấy key của type
```

### 2. Dùng keyof để giới hạn key hợp lệ

Ví dụ:

```ts
type User = {
  id: number;
  name: string;
};

function printKey(key: keyof User): void {
  console.log(key);
}

printKey("id"); // OK
printKey("name"); // OK
printKey("email"); // Error
```

`"email"` không hợp lệ vì nó không phải là key của `User`.

Nếu không dùng `keyof`, ta có thể phải viết thủ công:

```ts
function printKey(key: "id" | "name"): void {
  console.log(key);
}
```

Cách này dễ bị lặp lại và khó bảo trì khi type `User` có thêm property mới.

### 3. keyof kết hợp với generic

Đây là pattern rất phổ biến khi muốn lấy value từ object theo key một cách type-safe.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

Sử dụng:

```ts
const user = {
  id: 1,
  name: "Nhat",
};

const id = getProperty(user, "id");
const name = getProperty(user, "name");
```

Nếu gọi sai key, TypeScript sẽ báo lỗi:

```ts
getProperty(user, "email");
```

Ý nghĩa:

```txt
T                 -> type của object
keyof T           -> union các key của object đó
K extends keyof T -> K bắt buộc là một key tồn tại trong T
T[K]              -> type của value tại key K
```

Đây cũng là một dạng generic constraint.

### 4. typeof trong TypeScript

`typeof` trong TypeScript có thể dùng để lấy type từ một biến hoặc giá trị đã tồn tại.

Ví dụ:

```ts
const user = {
  id: 1,
  name: "Nhat",
};
```

Thay vì viết lại type thủ công:

```ts
type User = {
  id: number;
  name: string;
};
```

Ta có thể viết:

```ts
type User = typeof user;
```

TypeScript sẽ suy ra `User` tương đương:

```ts
type User = {
  id: number;
  name: string;
};
```

Nhớ nhanh:

```txt
typeof -> lấy type từ biến/giá trị
```

### 5. typeof ở JavaScript và TypeScript

Chỗ này rất dễ nhầm vì cùng là từ khóa `typeof`, nhưng có thể xuất hiện ở hai context khác nhau.

#### 1. JavaScript runtime

```js
const userName = "Nhat";

console.log(typeof userName);
```

Output:

```txt
string
```

Ở đây `typeof` chạy lúc runtime và trả về một chuỗi mô tả kiểu dữ liệu JavaScript.

#### 2. TypeScript type level

```ts
const user = {
  id: 1,
  name: "Nhat",
};

type User = typeof user;
```

Ở đây `typeof` được dùng ở type level để tạo type từ biến `user`. Nó không tạo ra type là `"object"`.

So sánh nhanh:

```txt
JavaScript runtime typeof -> trả về "string", "number", "object", ...
TypeScript type typeof   -> lấy type từ biến hoặc giá trị
```

### 6. Kết hợp keyof và typeof

Khi đã có sẵn một object value, ta có thể dùng `keyof typeof` để lấy union các key từ object đó.

```ts
const user = {
  id: 1,
  name: "Nhat",
  age: 22,
};

type UserKey = keyof typeof user;
```

Đi theo từng bước:

```txt
typeof user       -> lấy type của biến user
keyof typeof user -> lấy key của type đó
```

Kết quả:

```ts
"id" | "name" | "age";
```

### 7. Ví dụ thực tế với config

Giả sử frontend có object config:

```ts
const config = {
  apiUrl: "http://localhost:3000",
  timeout: 5000,
  debug: true,
};
```

Ta có thể tạo type từ config:

```ts
type Config = typeof config;
```

Và lấy các key hợp lệ:

```ts
type ConfigKey = keyof Config;
```

`ConfigKey` tương đương:

```ts
"apiUrl" | "timeout" | "debug";
```

Hoặc viết ngắn hơn:

```ts
type ConfigKey = keyof typeof config;
```

Ví dụ function lấy config value:

```ts
function getConfigValue(key: keyof typeof config) {
  return config[key];
}
```

Lúc này chỉ được truyền key hợp lệ:

```ts
getConfigValue("apiUrl"); // OK
getConfigValue("baseUrl"); // Error
```

### 8. typeof với as const

Khi dùng `typeof` với object thông thường, TypeScript thường suy luận value theo kiểu rộng hơn.

```ts
const routes = {
  home: "/",
  profile: "/profile",
};
```

TypeScript thường hiểu:

```ts
type Routes = {
  home: string;
  profile: string;
};
```

Nếu muốn giữ literal value chính xác, dùng `as const`:

```ts
const routes = {
  home: "/",
  profile: "/profile",
} as const;
```

Khi đó:

```ts
type RoutePath = (typeof routes)[keyof typeof routes];
```

`RoutePath` sẽ tương đương:

```ts
"/" | "/profile";
```

Pattern này rất hữu ích khi muốn tạo union type từ object constant.

### 9. Lỗi thường gặp

#### 1. Nhầm keyof lấy value

`keyof` lấy key, không lấy value.

```ts
type User = {
  id: number;
  name: string;
};

type UserKey = keyof User;
```

`UserKey` là:

```ts
"id" | "name";
```

Không phải:

```ts
number | string;
```

#### 2. Nhầm typeof user với "object"

```ts
const user = {
  id: 1,
  name: "Nhat",
};

type User = typeof user;
```

Trong TypeScript type level, `typeof user` lấy cấu trúc type của biến `user`. Nó không tạo ra:

```ts
type User = "object";
```

#### 3. Viết sai thứ tự keyof typeof

Khi muốn lấy key từ một biến/object value, thường viết:

```ts
type UserKey = keyof typeof user;
```

Hiểu theo thứ tự:

```txt
1. typeof user -> lấy type của biến user
2. keyof ...   -> lấy key của type đó
```

#### 4. Dùng string thay vì keyof

```ts
function getUserValue(user: User, key: string) {
  return user[key];
}
```

Cách này không an toàn vì `key` có thể là bất kỳ string nào.

Nên viết:

```ts
function getUserValue<K extends keyof User>(user: User, key: K): User[K] {
  return user[key];
}
```

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/keyof-typeof.ts
```

### 10. Câu hỏi thường gặp

1. `keyof` trong TypeScript là gì?
   - `keyof` lấy các key của một type và tạo thành union type.
2. `keyof User` trả về key hay value?
   - Trả về key. Ví dụ `keyof User` có thể là `"id" | "name"`, không phải `number | string`.
3. `typeof` trong TypeScript dùng để làm gì?
   - `typeof` ở type level dùng để lấy type từ một biến hoặc giá trị đã tồn tại.
4. `typeof` trong JavaScript và TypeScript khác nhau thế nào?
   - Ở JavaScript runtime, `typeof` trả về chuỗi như `"string"` hoặc `"object"`. Ở TypeScript type level, `typeof` lấy type từ biến/giá trị.
5. `keyof typeof user` nghĩa là gì?
   - Đầu tiên `typeof user` lấy type của biến `user`, sau đó `keyof` lấy union các key của type đó.
6. Khi nào nên dùng `keyof` với generic?
   - Khi muốn giới hạn parameter chỉ được là key hợp lệ của object, ví dụ `K extends keyof T`.
7. `T[K]` nghĩa là gì?
   - `T[K]` là indexed access type, dùng để lấy type của value tại key `K` trong type `T`.
8. `as const` liên quan gì đến `typeof`?
   - `as const` giúp giữ literal type chính xác của object/array, từ đó `typeof` có thể lấy được type cụ thể hơn.

### 9. Câu hỏi hay gặp

1. `keyof` làm gì trong TScript?
   - `keyof` tạo 1 union type chứa tên thuộc tính của các loại type
2. `typeof` làm gì trong TScript
   - `typeof` được sử dụng ở type context để lấy type của 1 giá trị/biến
3. `keyof typeof` có nghĩa là gì?
   - `typeof` đầu tiến sẽ lấy kiểu của giá trị và `keyof` sẽ tạo 1 union type của kiểu tên thuộc tính đó
4. `K extends keyof T` nghĩa là gì?
   - Nó có nghĩa `K` phải có 1 thuộc tính đã tồn tại trong `T`
5. Tại sao `keyof` lại hữu dụng
   - Nó giúp hạn chế đối với các tên thuộc tính hợp lệ trong objet và khiến hàm làm việc với object key type safe
6. `typeof` trong JScript khác gì với `typeof` trong TypeScript?
   - JScript `typeof` trả về một chuỗi mô tả giá trị runtime, trong khi `typeof` của TScript có thể xuất ra kiểu đã tồn tại biến cho việc sử dụng type system
