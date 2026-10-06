# ReactJS Theory

## 4. Render List & Key

### 1. Render list là gì?

Trong React, khi có một mảng dữ liệu, ta thường dùng `.map()` để render nhiều phần tử UI.

Ví dụ:

```jsx
const users = ["Nhat", "Duy", "Giap"];

function App() {
  return (
    <ul>
      {users.map((user) => (
        <li key={user}>{user}</li>
      ))}
    </ul>
  );
}
```

UI sẽ render ra danh sách:

```txt
Nhat
Duy
Giap
```

Điểm cần nhớ:

```txt
array data -> map() -> JSX list
```

### 2. Vì sao thường dùng map()?

`.map()` nhận vào một callback và trả về một array mới.

Trong React, array mới đó thường là array chứa JSX:

```jsx
const numbers = [1, 2, 3];

const listItems = numbers.map((number) => <li key={number}>{number}</li>);
```

Sau đó có thể render:

```jsx
function App() {
  return <ul>{listItems}</ul>;
}
```

Hoặc viết trực tiếp trong JSX:

```jsx
function App() {
  return (
    <ul>
      {numbers.map((number) => (
        <li key={number}>{number}</li>
      ))}
    </ul>
  );
}
```

### 3. Key để làm gì?

Khi render list, mỗi item nên có một `key` duy nhất và ổn định.

Ví dụ:

```jsx
const users = [
  { id: 1, name: "Nhat" },
  { id: 2, name: "Duy" },
];

function App() {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

`key` giúp React xác định item nào trong list:

```txt
item nào được thêm
item nào bị xóa
item nào thay đổi
item nào giữ nguyên
```

Nhờ vậy React có thể cập nhật UI chính xác và hiệu quả hơn.

### 4. Vì sao nên dùng id làm key?

Cách tốt:

```jsx
users.map((user) => <li key={user.id}>{user.name}</li>);
```

Cách không nên ưu tiên:

```jsx
users.map((user, index) => <li key={index}>{user.name}</li>);
```

Nên hạn chế dùng `index` làm key nếu list có thể:

- Thêm item.
- Xóa item.
- Sort item.
- Filter item.
- Thay đổi thứ tự item.

Vì `index` có thể thay đổi theo vị trí trong array. Khi vị trí thay đổi, React có thể khớp nhầm UI cũ với dữ liệu mới.

Nên ưu tiên các giá trị:

```txt
database id
uuid
unique stable value
```

### 5. Key phải unique ở đâu?

`key` chỉ cần unique giữa các sibling trong cùng một list. Không bắt buộc unique toàn bộ application.

Ví dụ:

```jsx
function UserList({ users }) {
  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

Nếu có hai list khác nhau, hai list đó có thể trùng key với nhau miễn là trong từng list riêng lẻ không bị trùng.

### 6. Key không phải props bình thường

`key` là giá trị đặc biệt React dùng nội bộ. Component con không đọc được `key` từ `props`.

Ví dụ:

```jsx
function UserList({ users }) {
  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} />
      ))}
    </div>
  );
}

function UserCard(props) {
  console.log(props.key); // undefined

  return <article>User card</article>;
}
```

Nếu component con cần `id`, hãy truyền riêng:

```jsx
<UserCard key={user.id} userId={user.id} user={user} />
```

### 7. Đặt key đúng vị trí khi tách component

`key` nên đặt ở element/component được tạo trực tiếp trong `.map()`.

Đúng:

```jsx
function UserList({ users }) {
  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

function UserCard({ user }) {
  return <article>{user.name}</article>;
}
```

Không nên đặt `key` bên trong `UserCard` nếu `.map()` đang render `<UserCard />`:

```jsx
function UserList({ users }) {
  return (
    <div>
      {users.map((user) => (
        <UserCard user={user} />
      ))}
    </div>
  );
}

function UserCard({ user }) {
  return <article key={user.id}>{user.name}</article>;
}
```

Ở ví dụ sai, React cần `key` tại nơi list được tạo, tức là chỗ `.map()` render ra `<UserCard />`.

### 8. Render list kết hợp conditional rendering

Khi list rỗng, có thể render empty state:

```jsx
function UserList({ users }) {
  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Có thể filter trước khi render:

```jsx
function ActiveUserList({ users }) {
  const activeUsers = users.filter((user) => user.isActive);

  return (
    <ul>
      {activeUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 9. Lỗi thường gặp

#### 1. Quên key khi render list

Sai:

```jsx
users.map((user) => <li>{user.name}</li>);
```

Đúng:

```jsx
users.map((user) => <li key={user.id}>{user.name}</li>);
```

#### 2. Dùng index làm key cho list thay đổi

Không nên:

```jsx
users.map((user, index) => <li key={index}>{user.name}</li>);
```

Nếu list có thêm, xóa, sort hoặc filter, hãy dùng id ổn định.

#### 3. Dùng Math.random() làm key

Không nên:

```jsx
users.map((user) => <li key={Math.random()}>{user.name}</li>);
```

Vì mỗi lần render, key sẽ thay đổi. React sẽ xem item như phần tử mới hoàn toàn và có thể làm mất state bên trong item.

#### 4. Nghĩ key truyền được vào props

Sai:

```jsx
function UserCard(props) {
  console.log(props.key);
}
```

Nếu cần dùng id trong component con:

```jsx
<UserCard key={user.id} userId={user.id} />
```

### 10. File example

File example cho phần này:

```txt
ReactJS/Examples/renderlist-key.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` từ file example để quan sát render list, key, filter, sort, add, delete và empty state.

### 11. Câu hỏi thường gặp

1. Mục đích của `key` trong React list là gì?
   - `key` giúp React xác định item nào được thêm, xóa, thay đổi hoặc giữ nguyên, từ đó cập nhật UI chính xác và hiệu quả hơn.
2. Tại sao nên tránh dùng array index làm key?
   - Vì index thay đổi khi list thêm, xóa, sort hoặc filter item. Điều này có thể khiến React khớp nhầm UI cũ với dữ liệu mới.
3. Nên dùng giá trị nào làm key?
   - Nên dùng giá trị ổn định và duy nhất trong list, ví dụ `id` từ database, `uuid` hoặc unique slug.
4. `key` có truyền vào component con qua props không?
   - Không. `key` là giá trị đặc biệt React dùng nội bộ. Nếu component con cần id, hãy truyền thêm prop riêng như `userId`.
5. `key` có cần unique toàn bộ app không?
   - Không. `key` chỉ cần unique giữa các sibling trong cùng một list.
