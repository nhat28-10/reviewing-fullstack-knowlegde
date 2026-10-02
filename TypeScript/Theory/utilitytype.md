# TypeScript Theory

## 9. Utility Type

`Utility Types` là các type có sẵn của TypeScript. Chúng giúp biến đổi một type đã có thành một type mới mà không cần viết lại từ đầu.

Ví dụ ta có type gốc:

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  password: string;
}
```

Từ `User`, ta có thể dùng utility type để tạo ra các type phục vụ từng mục đích khác nhau như update user, hiển thị danh sách user, public user, config theo role, ...

### 1. Partial<T>

`Partial<T>` biến tất cả property trong `T` thành optional.

```ts
type UpdateUser = Partial<User>;
```

`UpdateUser` tương đương với:

```ts
type UpdateUser = {
  id?: number;
  name?: string;
  email?: string;
  age?: number;
  password?: string;
};
```

Ví dụ:

```ts
const data: UpdateUser = {
  name: "Nhat",
};
```

`Partial` rất thực tế khi update dữ liệu, vì khi update user ta thường không cần gửi toàn bộ field.

```ts
function updateUser(id: number, data: Partial<User>): void {
  console.log(id, data);
}

updateUser(1, { name: "Nhat" });
```

Nhớ nhanh:

```txt
Partial<T> -> tất cả property thành optional
```

### 2. Required<T>

`Required<T>` ngược lại với `Partial<T>`. Nó biến tất cả property trong `T` thành bắt buộc.

```ts
interface Profile {
  name: string;
  avatar?: string;
  phone?: string;
}

type CompleteProfile = Required<Profile>;
```

`CompleteProfile` tương đương với:

```ts
type CompleteProfile = {
  name: string;
  avatar: string;
  phone: string;
};
```

Ví dụ:

```ts
const profile: CompleteProfile = {
  name: "Nhat",
  avatar: "avatar.png",
  phone: "0123456789",
};
```

Nếu thiếu `avatar` hoặc `phone`, TypeScript sẽ báo lỗi.

Nhớ nhanh:

```txt
Required<T> -> tất cả property thành required
```

### 3. Pick<T, K>

`Pick<T, K>` dùng để chọn một số property từ type ban đầu.

```ts
type UserPreview = Pick<User, "id" | "name">;
```

`UserPreview` tương đương với:

```ts
type UserPreview = {
  id: number;
  name: string;
};
```

Ví dụ:

```ts
const user: UserPreview = {
  id: 1,
  name: "Nhat",
};
```

`Pick` hữu ích khi API chỉ cần trả về một phần dữ liệu, ví dụ danh sách user không cần trả hết thông tin chi tiết.

```ts
type UserListItem = Pick<User, "id" | "name" | "email">;
```

Nhớ nhanh:

```txt
Pick<T, K> -> chọn những field muốn giữ lại
```

### 4. Omit<T, K>

`Omit<T, K>` gần như ngược với `Pick<T, K>`. Nó loại bỏ một số property khỏi type ban đầu.

```ts
type UserWithoutEmail = Omit<User, "email">;
```

`UserWithoutEmail` tương đương với:

```ts
type UserWithoutEmail = {
  id: number;
  name: string;
  age: number;
  password: string;
};
```

Có thể bỏ nhiều field cùng lúc:

```ts
type PublicUser = Omit<User, "email" | "password">;
```

`PublicUser` tương đương với:

```ts
type PublicUser = {
  id: number;
  name: string;
  age: number;
};
```

Nhớ nhanh:

```txt
Pick<T, K> -> lấy field
Omit<T, K> -> bỏ field
```

### 5. Record<K, T>

`Record<K, T>` dùng để tạo object type với:

- `K` là type của key.
- `T` là type của value.

Ví dụ:

```ts
type Role = "ADMIN" | "USER" | "GUEST";
type RoleLabel = Record<Role, string>;
```

`RoleLabel` yêu cầu object phải có đủ key trong `Role`:

```ts
const labels: RoleLabel = {
  ADMIN: "Administrator",
  USER: "Normal User",
  GUEST: "Guest User",
};
```

Nếu thiếu một key, TypeScript sẽ báo lỗi.

```ts
const invalidLabels: RoleLabel = {
  ADMIN: "Administrator",
  USER: "Normal User",
  // Error: thiếu GUEST
};
```

Nhớ nhanh:

```txt
Record<K, T> -> tạo object map từ key K sang value T
```

### 6. Ví dụ Record thực tế hơn

Giả sử ta có danh sách status:

```ts
type Status = "pending" | "success" | "failed";
```

Ta muốn mỗi status có một config riêng:

```ts
type StatusConfig = Record<
  Status,
  {
    label: string;
    code: number;
  }
>;

const config: StatusConfig = {
  pending: {
    label: "Pending",
    code: 1,
  },
  success: {
    label: "Success",
    code: 2,
  },
  failed: {
    label: "Failed",
    code: 3,
  },
};
```

Đây là kiểu dùng `Record` khá phổ biến khi muốn đảm bảo mỗi key đều có config tương ứng.

### 7. Có thể kết hợp Utility Types

Utility Types có thể kết hợp với nhau.

```ts
type EditableUser = Partial<Pick<User, "name" | "email">>;
```

Đi từng bước:

```ts
type SelectedUserFields = Pick<User, "name" | "email">;
```

`SelectedUserFields` tương đương:

```ts
type SelectedUserFields = {
  name: string;
  email: string;
};
```

Sau đó bọc thêm `Partial`:

```ts
type EditableUser = {
  name?: string;
  email?: string;
};
```

Ví dụ thực tế:

```ts
function updateContactInfo(id: number, data: EditableUser): void {
  console.log(id, data);
}

updateContactInfo(1, { email: "new-email@gmail.com" });
```

### 8. So sánh nhanh

```txt
Partial<T>
-> tất cả property thành optional

Required<T>
-> tất cả property thành required

Pick<T, K>
-> chỉ giữ lại property K

Omit<T, K>
-> loại bỏ property K

Record<K, T>
-> tạo object với key K và value T
```

Mẹo nhớ:

```txt
Partial  -> thiếu cũng được
Required -> phải đủ

Pick -> chọn lấy
Omit -> bỏ đi

Record -> map key sang value
```

### 9. Các lỗi thường gặp

#### 1. Nhầm Pick và Omit

```ts
type OnlyName = Pick<User, "name">; // Chỉ giữ name
type WithoutName = Omit<User, "name">; // Giữ mọi thứ trừ name
```

#### 2. Nghĩ Partial chỉ làm một field optional

`Partial<T>` làm toàn bộ property của `T` thành optional.

```ts
type UpdateUser = Partial<User>;
```

Nếu chỉ muốn một vài field optional, có thể kết hợp `Partial`, `Pick` và `Omit`.

```ts
type UserWithOptionalContact = Omit<User, "email"> &
  Partial<Pick<User, "email">>;
```

#### 3. Nhầm thứ tự Record<K, T>

Trong `Record<K, T>`:

```txt
K -> key
T -> value
```

Ví dụ:

```ts
type ScoreMap = Record<string, number>;
```

Nghĩa là object có key là `string` và value là `number`.

#### 4. Dùng field không tồn tại trong Pick hoặc Omit

```ts
type InvalidUser = Pick<User, "username">;
```

`username` không tồn tại trong `User`, nên TypeScript sẽ báo lỗi.

### 10. Câu hỏi thường gặp

1. Utility Types trong TypeScript là gì?
   - Là các type có sẵn giúp biến đổi type đã có thành type mới.
2. `Partial<T>` làm gì?
   - Biến tất cả property của `T` thành optional.
3. `Required<T>` làm gì?
   - Biến tất cả property của `T` thành bắt buộc.
4. Sự khác nhau giữa `Pick` và `Omit` là gì?
   - `Pick` tạo type chỉ gồm các property được chọn. `Omit` tạo type bằng cách loại bỏ các property được chọn.
5. `Record<K, T>` làm gì?
   - Tạo object type có key thuộc kiểu `K` và value thuộc kiểu `T`.
6. Utility Types có thể kết hợp không?
   - Có. Ví dụ: `Partial<Pick<User, "name" | "email">>`.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/utility-type.ts
```
