# TypeScript Theory

## 4. Type Alias & Interface

### 1. Type alias là gì?

`type alias` dùng để đặt tên cho một kiểu dữ liệu.

Ví dụ:

```ts
type User = {
  id: number;
  name: string;
};
```

Sau đó có thể dùng `User` như một kiểu dữ liệu:

```ts
const user: User = {
  id: 1,
  name: "Nhat",
};
```

Điểm mạnh của `type` là nó không chỉ dùng cho object. Nó có thể đặt tên cho nhiều dạng type khác nhau:

```ts
type UserId = string | number;

type Status = "pending" | "success" | "failed";

type Coordinate = [number, number];

type Callback = (message: string) => void;
```

Ý nghĩa:

```txt
UserId     -> union type
Status     -> literal union
Coordinate -> tuple
Callback   -> function type
```

### 2. Interface là gì?

`interface` thường dùng để mô tả hình dạng của object hoặc class.

Ví dụ:

```ts
interface User {
  id: number;
  name: string;
}
```

Sử dụng:

```ts
const user: User = {
  id: 1,
  name: "Nhat",
};
```

Khi chỉ mô tả object đơn giản, `type` và `interface` nhìn khá giống nhau:

```ts
type UserByType = {
  name: string;
};

interface UserByInterface {
  name: string;
}
```

Cả hai đều giúp TypeScript kiểm tra object có đúng các field cần thiết hay không.

### 3. Điểm giống nhau

#### 1. Đều mô tả được object shape

```ts
type ProductType = {
  id: number;
  name: string;
  price: number;
};

interface ProductInterface {
  id: number;
  name: string;
  price: number;
}
```

Cả hai cách trên đều yêu cầu object có đủ `id`, `name` và `price`.

#### 2. Đều hỗ trợ optional property

```ts
type UserProfile = {
  id: number;
  avatarUrl?: string;
};

interface CustomerProfile {
  id: number;
  phone?: string;
}
```

Dấu `?` nghĩa là property đó có thể có hoặc không.

#### 3. Đều hỗ trợ readonly property

```ts
type Config = {
  readonly appName: string;
};

interface Setting {
  readonly version: string;
}
```

`readonly` giúp hạn chế việc gán lại giá trị sau khi object đã được tạo.

### 4. Điểm khác nhau quan trọng

#### 1. Type alias linh hoạt hơn về loại dữ liệu

`type` có thể dùng cho union:

```ts
type Id = string | number;
```

Tuple:

```ts
type Point = [number, number];
```

Literal union:

```ts
type Role = "ADMIN" | "USER";
```

Function type:

```ts
type Logger = (message: string) => void;
```

Trong khi đó, `interface` chủ yếu phù hợp để mô tả object/class shape.

#### 2. Interface mở rộng bằng extends

```ts
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}
```

`Admin` sẽ có đủ:

```txt
id
name
permissions
```

#### 3. Type alias mở rộng bằng intersection

```ts
type User = {
  id: number;
  name: string;
};

type Admin = User & {
  permissions: string[];
};
```

`Admin` cũng sẽ có đủ `id`, `name` và `permissions`.

Nhớ nhanh:

```txt
interface -> extends
type      -> &
```

#### 4. Interface có declaration merging

Với `interface`, có thể khai báo cùng tên nhiều lần:

```ts
interface User {
  name: string;
}

interface User {
  age: number;
}
```

TypeScript sẽ tự gộp chúng lại thành:

```ts
interface User {
  name: string;
  age: number;
}
```

Nên object này hợp lệ:

```ts
const user: User = {
  name: "Nhat",
  age: 22,
};
```

Nhưng với `type`, không thể khai báo trùng tên trong cùng scope:

```ts
type User = {
  name: string;
};

type User = {
  age: number;
};
```

Đoạn trên sẽ lỗi vì `User` bị khai báo trùng.

### 5. Interface với class

`interface` rất hay dùng khi muốn ép một class phải có một cấu trúc nhất định.

```ts
interface Repository {
  findById(id: number): string;
}

class UserRepository implements Repository {
  findById(id: number): string {
    return `User ${id}`;
  }
}
```

Ở đây `UserRepository` bắt buộc phải có method `findById`.

`type` cũng có thể dùng với `implements` nếu nó mô tả object shape:

```ts
type Service = {
  execute(): void;
};

class EmailService implements Service {
  execute(): void {
    console.log("Send email");
  }
}
```

Tuy nhiên, khi làm việc với class hoặc public API, `interface` thường dễ đọc và dễ mở rộng hơn.

### 6. Nên dùng type hay interface?

Có thể nhớ theo hướng thực tế:

```txt
Dùng interface khi:
- Mô tả object shape
- Mô tả contract cho class
- Muốn mở rộng bằng extends
- Muốn tận dụng declaration merging

Dùng type khi:
- Cần union type
- Cần tuple
- Cần literal union
- Cần function type
- Cần kết hợp type bằng intersection
```

Ví dụ nên dùng `interface`:

```ts
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}
```

Ví dụ nên dùng `type`:

```ts
type UserId = string | number;

type Role = "ADMIN" | "USER";

type Position = [number, number];

type ApiResponse<T> = {
  data: T;
  message: string;
};
```

Trong dự án thực tế, team convention cũng ảnh hưởng đến việc chọn `type` hay `interface`. Điều quan trọng là dùng nhất quán và dễ đọc.

### 7. Lỗi thường gặp

#### 1. Nghĩ interface luôn tốt hơn type

Không đúng. `interface` tốt cho object/class shape, nhưng không thay thế được union, tuple hoặc literal union.

```ts
type Status = "pending" | "success" | "failed";
```

Trường hợp này nên dùng `type`.

#### 2. Nghĩ type và interface khác nhau hoàn toàn

Không đúng. Khi mô tả object shape đơn giản, chúng rất giống nhau:

```ts
type A = {
  name: string;
};

interface B {
  name: string;
}
```

#### 3. Khai báo trùng type alias

```ts
type User = {
  name: string;
};

type User = {
  age: number;
};
```

Đoạn trên sẽ lỗi. Nếu cần mở rộng `type`, hãy tạo type mới bằng `&`.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/typealias-interface.ts
```

### 8. Câu hỏi thường gặp

1. `type alias` là gì trong TypeScript?
   - `type alias` là cách đặt tên cho một kiểu dữ liệu. Nó có thể đại diện cho object, union, tuple, literal union, function type hoặc các kiểu kết hợp khác.
2. `interface` là gì trong TypeScript?
   - `interface` thường dùng để mô tả hình dạng của object hoặc contract mà class cần tuân theo.
3. `type` và `interface` giống nhau ở điểm nào?
   - Cả hai đều có thể mô tả object shape, optional property, readonly property và giúp TypeScript kiểm tra object có đúng cấu trúc hay không.
4. Điểm khác nhau quan trọng giữa `type` và `interface` là gì?
   - `type` linh hoạt hơn vì dùng được cho union, tuple, literal union và function type. `interface` hỗ trợ declaration merging và thường phù hợp hơn khi mô tả object/class shape.
5. Declaration merging là gì?
   - Declaration merging là khả năng TypeScript tự gộp nhiều `interface` cùng tên thành một interface duy nhất.
6. Khi nào nên dùng `interface`?
   - Nên dùng `interface` khi cần mô tả object, contract cho class hoặc muốn mở rộng bằng `extends`.
7. Khi nào nên dùng `type`?
   - Nên dùng `type` khi cần union type, tuple, literal union, function type hoặc muốn kết hợp nhiều type bằng toán tử `&`.
