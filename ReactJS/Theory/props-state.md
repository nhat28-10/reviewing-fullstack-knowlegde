# ReactJS Theory

## 2. Props & State

### 1. Sơ lược

Trong React, có thể nhớ ngắn gọn như sau:

- `Props`: dữ liệu được truyền từ component cha xuống component con.
- `State`: dữ liệu nội bộ của component, có thể thay đổi theo thời gian.

Ví dụ về props:

```jsx
function UserCard({ name }) {
  return <h2>{name}</h2>;
}

function App() {
  return <UserCard name="Nhat" />;
}
```

Trong ví dụ trên, `name="Nhat"` là prop được `App` truyền xuống `UserCard`.

Ví dụ về state:

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return <p>{count}</p>;
}
```

Trong ví dụ trên, `count` là state của component `Counter`.

### 2. Props là gì?

`props` là viết tắt của `properties`. Props cho phép component cha truyền dữ liệu xuống component con.

```jsx
function UserCard(props) {
  return <h2>{props.name}</h2>;
}

function App() {
  return <UserCard name="Nhat" />;
}
```

Luồng dữ liệu lúc này:

```txt
App
 |
 | name="Nhat"
 v
UserCard
```

Ta cũng có thể destructuring props:

```jsx
function UserCard({ name }) {
  return <h2>{name}</h2>;
}
```

Cách destructuring này rất phổ biến trong React.

#### Props có thể truyền nhiều loại dữ liệu

String:

```jsx
<UserCard name="Nhat" />
```

Number:

```jsx
<UserCard age={22} />
```

Boolean:

```jsx
<UserCard isAdmin={true} />
```

Object:

```jsx
<UserCard user={{ name: "Nhat", age: 22 }} />
```

Array:

```jsx
<UserList users={users} />
```

Function:

```jsx
<Button onClick={handleClick} />
```

Children:

```jsx
<Card>
  <h2>Hello React</h2>
</Card>
```

### 3. Props là read-only

Component con không nên sửa props trực tiếp.

Ví dụ không nên viết:

```jsx
function UserCard({ name }) {
  name = "ABC";

  return <h2>{name}</h2>;
}
```

Cách nghĩ đúng trong React:

```txt
Parent owns the data
        |
        v
Child receives the data
```

Component con nhận props để sử dụng, không phải để sửa trực tiếp. Hãy luôn nhớ:

```txt
Props are read-only.
```

Nếu component con cần yêu cầu thay đổi dữ liệu, component cha có thể truyền một function xuống qua props:

```jsx
function LikeButton({ onLike }) {
  return <button onClick={onLike}>Like</button>;
}
```

### 4. State là gì?

State là dữ liệu thuộc về component và có thể thay đổi. Khi state thay đổi, React có thể render lại component để cập nhật UI.

Ví dụ nút đếm:

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function handleIncrease() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrease}>Increase</button>
    </div>
  );
}
```

Luồng cơ bản:

```txt
state changes
     ↓
component may re-render
     ↓
UI updates
```

Với `useState`, ta thường có cú pháp:

```jsx
const [value, setValue] = useState(initialValue);
```

Trong đó:

- `value`: giá trị state hiện tại.
- `setValue`: function dùng để cập nhật state.
- `initialValue`: giá trị ban đầu của state.

### 5. Cập nhật state đúng cách

Không nên sửa state trực tiếp:

```jsx
count = count + 1; // Sai
```

Nên cập nhật state thông qua setter:

```jsx
setCount(count + 1);
```

Nếu state mới phụ thuộc vào state cũ, nên dùng callback form:

```jsx
setCount((prevCount) => prevCount + 1);
```

Cách này an toàn hơn trong các trường hợp React gom nhiều lần cập nhật state lại với nhau.

Với object hoặc array, không nên mutate trực tiếp:

```jsx
user.name = "Minh"; // Sai
```

Nên tạo object hoặc array mới:

```jsx
setUser({
  ...user,
  name: "Minh",
});
```

### 6. Props vs State

| Props                                  | State                            |
| -------------------------------------- | -------------------------------- |
| Được truyền từ parent                  | Được quản lý bên trong component |
| Read-only đối với component nhận       | Có thể cập nhật qua setter       |
| Dùng để truyền dữ liệu giữa components | Dùng để lưu dữ liệu thay đổi     |
| Parent control                         | Component control                |

Ví dụ:

```jsx
import { useState } from "react";

function Profile({ username }) {
  const [likes, setLikes] = useState(0);

  return (
    <div>
      <h2>{username}</h2>
      <p>Likes: {likes}</p>
      <button onClick={() => setLikes(likes + 1)}>Like</button>
    </div>
  );
}
```

Trong ví dụ trên:

- `username` là props vì được truyền từ bên ngoài vào.
- `likes` là state vì `Profile` tự quản lý và có thể thay đổi khi user click.

### 7. Ví dụ thực tế

Giả sử ta có một `ProductCard`:

```jsx
import { useState } from "react";

function ProductCard({ name, price }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <article>
      <h2>{name}</h2>
      <p>{price}</p>
      <p>{isFavorite ? "Favorite" : "Not Favorite"}</p>

      <button onClick={() => setIsFavorite(!isFavorite)}>
        Toggle favorite
      </button>
    </article>
  );
}

function App() {
  return <ProductCard name="Laptop" price={2000} />;
}
```

Trong ví dụ trên:

- `name` là props vì parent truyền vào.
- `price` là props vì parent truyền vào.
- `isFavorite` là state vì `ProductCard` tự quản lý trạng thái này.

### 8. Khi nào dùng props, khi nào dùng state?

Hãy đặt câu hỏi:

```txt
Ai là người sở hữu dữ liệu?
```

Nếu dữ liệu được component cha cung cấp theo luồng `Parent -> Child`, đó thường là props.

```jsx
<UserCard name="Nhat" />
```

Nếu dữ liệu thay đổi bên trong component và component cần nhớ giá trị đó qua các lần render, đó thường là state.

Ví dụ nên dùng state:

```txt
button clicked
modal opened
input changed
counter changed
selected tab changed
favorite toggled
```

Không phải mọi biến đều cần đưa vào state. Nếu một giá trị có thể tính ra từ props hoặc state hiện có, thường không cần tạo thêm state riêng.

```jsx
function CartSummary({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <p>Total: {total}</p>;
}
```

### 9. Lỗi thường gặp

#### 1. Nghĩ props và state giống nhau

Không chính xác. Cả props và state đều có thể ảnh hưởng đến UI, nhưng nguồn dữ liệu khác nhau:

```txt
Props -> external data
State -> internal mutable data
```

#### 2. Component con sửa trực tiếp props

```jsx
function Profile({ user }) {
  user.name = "ABC"; // Không nên

  return <h2>{user.name}</h2>;
}
```

Component con chỉ nên nhận props và xem props là read-only.

#### 3. Sửa state trực tiếp

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    count = count + 1; // Sai
  }
}
```

Phải dùng setter:

```jsx
setCount((prevCount) => prevCount + 1);
```

#### 4. Đưa mọi dữ liệu vào state

Không cần thiết. Ví dụ:

```jsx
const name = "Nhat";
```

Nếu `name` không thay đổi và không cần React theo dõi để cập nhật UI, thì không nhất thiết phải là state.

#### 5. Mong state thay đổi ngay lập tức sau khi gọi setter

Không nên phụ thuộc vào việc state đổi ngay ở dòng kế tiếp:

```jsx
setCount(count + 1);
console.log(count); // Có thể vẫn là giá trị cũ trong lần render hiện tại
```

React sẽ lên lịch cập nhật state và render lại component sau đó.

### 10. File example

File example cho phần này:

```txt
ReactJS/Examples/props-state.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` từ file example để quan sát props, state, callback props và controlled input.

### 11. Câu hỏi thường gặp

1. Sự khác nhau giữa props và state trong React là gì?
   - Props là dữ liệu được truyền từ component cha xuống component con và read-only đối với component nhận. State là dữ liệu nội bộ của component và có thể thay đổi theo thời gian.
2. Component con có thể sửa props không?
   - Không nên. Props thuộc quyền sở hữu của component cha. Nếu component con cần yêu cầu thay đổi dữ liệu, hãy truyền callback function từ cha xuống con.
3. Khi nào nên sử dụng state thay vì props?
   - Dùng state khi component cần tự quản lý dữ liệu thay đổi theo thời gian, ví dụ counter, input value, trạng thái modal, selected item hoặc favorite.
4. Có thể truyền function qua props không?
   - Có. Đây là cách phổ biến để component con kích hoạt hành vi được định nghĩa trong component cha.
5. Tại sao không nên sửa state trực tiếp?
   - Vì React cần setter như `setCount`, `setUser` để biết state đã thay đổi và render lại UI đúng cách.
