# ReactJS Theory

## 5. useState

### 1. useState là gì?

`useState` là React Hook giúp function component lưu và cập nhật state.

Cú pháp cơ bản:

```jsx
import { useState } from "react";

const [state, setState] = useState(initialState);
```

Ý nghĩa:

```txt
state        -> giá trị state hiện tại
setState     -> function dùng để cập nhật state
initialState -> giá trị ban đầu của state
```

Ví dụ:

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

Ban đầu `count` là `0`. Khi click button, `setCount(count + 1)` cập nhật state. Khi state thay đổi, React render lại component để UI hiển thị giá trị mới.

Luồng cơ bản:

```txt
user action
    ↓
setState(...)
    ↓
state changes
    ↓
component re-renders
    ↓
UI updates
```

### 2. Không sửa state trực tiếp

Không nên sửa state trực tiếp:

```jsx
count = count + 1; // Sai
```

Nên cập nhật state bằng setter:

```jsx
setCount(count + 1);
```

React cần setter như `setCount()` để biết state đã thay đổi và cần render lại UI.

Với object cũng vậy:

```jsx
const [user, setUser] = useState({
  name: "Nhat",
  age: 22,
});
```

Không nên mutate trực tiếp:

```jsx
user.name = "David"; // Sai
```

Nên tạo object mới:

```jsx
setUser({
  ...user,
  name: "David",
});
```

Với array, cũng nên tạo array mới:

```jsx
setUsers([...users, newUser]);
```

Không nên:

```jsx
users.push(newUser); // Sai
```

### 3. Khi state mới phụ thuộc vào state cũ

Cách này dùng được trong trường hợp đơn giản:

```jsx
setCount(count + 1);
```

Nhưng nếu state mới phụ thuộc vào state trước đó, nên dùng callback updater:

```jsx
setCount((prevCount) => prevCount + 1);
```

Ví dụ:

```jsx
function handleIncreaseThreeTimes() {
  setCount((prevCount) => prevCount + 1);
  setCount((prevCount) => prevCount + 1);
  setCount((prevCount) => prevCount + 1);
}
```

Mỗi lần update sẽ dựa trên giá trị mới nhất trước đó. Đây là cách an toàn hơn khi update liên tiếp hoặc khi logic phụ thuộc vào state cũ.

Ghi nhớ:

```txt
new state depends on previous state -> use callback updater
```

### 4. State update không xảy ra ngay lập tức

Không nên kỳ vọng state đổi ngay ở dòng kế tiếp sau khi gọi setter:

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // Có thể vẫn là giá trị cũ trong render hiện tại
  }
}
```

React sẽ lên lịch cập nhật state, sau đó render lại component. Giá trị state mới sẽ xuất hiện ở lần render tiếp theo.

### 5. State có thể chứa gì?

State có thể chứa nhiều kiểu dữ liệu:

```jsx
const [name, setName] = useState("");
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
const [users, setUsers] = useState([]);
const [user, setUser] = useState({ name: "Nhat", age: 22 });
```

Ví dụ controlled input:

```jsx
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");

  return (
    <input
      type="email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
    />
  );
}
```

Luồng khi user nhập input:

```txt
onChange
   ↓
setEmail(...)
   ↓
email changes
   ↓
component re-renders
   ↓
input value updates
```

### 6. Multiple state hay object state?

Có thể tách state riêng nếu mỗi state thay đổi độc lập:

```jsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLoading, setIsLoading] = useState(false);
```

Có thể dùng object state nếu các giá trị thuộc cùng một nhóm dữ liệu:

```jsx
const [form, setForm] = useState({
  email: "",
  password: "",
});
```

Khi update object state, nhớ merge lại field cũ:

```jsx
setForm({
  ...form,
  email: "nhat@example.com",
});
```

Hoặc dùng callback updater:

```jsx
setForm((prevForm) => ({
  ...prevForm,
  email: "nhat@example.com",
}));
```

### 7. Lazy initial state

Nếu giá trị khởi tạo tốn chi phí tính toán, có thể truyền function vào `useState`.

```jsx
const [items, setItems] = useState(() => {
  return getInitialItems();
});
```

Function này chỉ chạy ở lần render đầu tiên, không chạy lại ở mỗi lần re-render.

### 8. Khi nào nên dùng useState?

Nên dùng `useState` khi component cần nhớ dữ liệu thay đổi theo thời gian và sự thay đổi đó ảnh hưởng đến UI.

Ví dụ:

```txt
counter value
input value
modal open/close
selected tab
loading status
error message
list item added/deleted
```

Không phải mọi biến đều cần đưa vào state. Nếu giá trị có thể tính từ props hoặc state hiện có, thường không cần tạo state riêng.

```jsx
function CartSummary({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <p>Total: {total}</p>;
}
```

### 9. Lỗi thường gặp

#### 1. Sửa state trực tiếp

Sai:

```jsx
user.name = "David";
users.push(newUser);
```

Đúng:

```jsx
setUser({ ...user, name: "David" });
setUsers([...users, newUser]);
```

#### 2. Gọi setter ngay trong lúc render

Sai:

```jsx
function App() {
  const [count, setCount] = useState(0);

  setCount(count + 1);

  return <p>{count}</p>;
}
```

Cách này có thể gây render lặp liên tục:

```txt
render
  ↓
setCount
  ↓
render
  ↓
setCount
  ↓
...
```

Setter nên được gọi trong event handler, effect hoặc một logic phù hợp, không gọi trực tiếp mỗi lần render.

#### 3. Quên dùng callback updater khi phụ thuộc state cũ

Nên dùng:

```jsx
setCount((prevCount) => prevCount + 1);
```

Thay vì phụ thuộc vào giá trị `count` có thể đã cũ trong render hiện tại.

#### 4. Nghĩ state update ngay lập tức

Không nên viết logic phụ thuộc vào state mới ngay sau dòng setter:

```jsx
setCount(count + 1);
console.log(count); // Có thể vẫn là giá trị cũ
```

#### 5. Gọi useState trong if hoặc loop

Hook nên được gọi ở top-level của component:

```jsx
function App() {
  const [count, setCount] = useState(0);

  return <p>{count}</p>;
}
```

Không nên:

```jsx
if (isLoggedIn) {
  const [count, setCount] = useState(0); // Sai
}
```

### 10. File example

File example cho phần này:

```txt
ReactJS/Examples/useState.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` từ file example để quan sát counter, controlled input, object state, array state và callback updater.

### 11. Câu hỏi thường gặp

1. `useState` là gì trong React?
   - `useState` là React Hook cho phép function component lưu và cập nhật state.
2. Điều gì xảy ra khi state được cập nhật?
   - React sẽ render lại component để UI có thể phản ánh state mới.
3. Có nên cập nhật state trực tiếp không?
   - Không. Nên cập nhật state thông qua setter như `setCount`, `setUser`, `setUsers`.
4. Khi nào nên dùng callback updater?
   - Khi state mới phụ thuộc vào state trước đó, ví dụ `setCount((prevCount) => prevCount + 1)`.
5. State update có xảy ra ngay lập tức không?
   - Không nên hiểu như vậy. React lên lịch cập nhật state và giá trị mới sẽ có ở lần render tiếp theo.
6. Có nên gọi `useState` trong `if` hoặc `for` không?
   - Không. Hook nên được gọi ở top-level của function component.
