# ReactJS Theory

## 3. Event Handling & Conditional Rendering

### 1. Sơ lược

Trong React:

- `Event handling`: xử lý tương tác của user như click, nhập input, submit form, focus hoặc blur.
- `Conditional rendering`: render UI khác nhau dựa trên điều kiện.

Ví dụ ngắn:

```jsx
function LoginButton({ isLoggedIn }) {
  function handleClick() {
    console.log("Button clicked");
  }

  return (
    <button type="button" onClick={handleClick}>
      {isLoggedIn ? "Logout" : "Login"}
    </button>
  );
}
```

Trong ví dụ trên:

- `onClick={handleClick}` là event handling.
- `{isLoggedIn ? "Logout" : "Login"}` là conditional rendering.

### 2. Event handling là gì?

Event handling là cách React phản hồi lại các hành động của user.

Trong React, event được viết bằng `camelCase` và truyền vào một function:

```jsx
function Button() {
  function handleClick() {
    console.log("Clicked");
  }

  return (
    <button type="button" onClick={handleClick}>
      Click me
    </button>
  );
}
```

Một số event thường gặp:

```txt
onClick
onChange
onSubmit
onFocus
onBlur
onKeyDown
onMouseEnter
```

### 3. Không gọi handler ngay khi render

Cách viết đúng:

```jsx
<button type="button" onClick={handleClick}>
  Click me
</button>
```

Cách viết sai nếu chỉ muốn chạy khi user click:

```jsx
<button type="button" onClick={handleClick()}>
  Click me
</button>
```

Vì `handleClick()` sẽ gọi function ngay trong lúc render. React cần nhận một function để gọi sau khi event xảy ra.

Nếu cần truyền tham số, hãy bọc bằng arrow function:

```jsx
<button type="button" onClick={() => handleDelete(user.id)}>
  Delete
</button>
```

### 4. Event object

React sẽ truyền `event` object vào event handler. Object này chứa thông tin về sự kiện.

Ví dụ lấy giá trị input:

```jsx
function SearchInput() {
  function handleChange(event) {
    console.log(event.target.value);
  }

  return <input type="text" onChange={handleChange} />;
}
```

Với form submit, thường cần `event.preventDefault()` để browser không reload page:

```jsx
function LoginForm() {
  function handleSubmit(event) {
    event.preventDefault();
    console.log("Submit form");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 5. Conditional rendering là gì?

Conditional rendering nghĩa là render UI khác nhau dựa trên điều kiện.

React không có cú pháp riêng cho conditional rendering. Ta dùng JavaScript như `if`, ternary operator, `&&`, hoặc return `null`.

#### 1. Dùng if

Phù hợp khi cần tách nhiều nhánh logic trước `return`:

```jsx
function Status({ isLoggedIn }) {
  if (isLoggedIn) {
    return <p>Welcome</p>;
  }

  return <p>Please login</p>;
}
```

#### 2. Dùng ternary operator

Phù hợp khi có 2 UI khác nhau trong JSX:

```jsx
function Status({ isLoggedIn }) {
  return <p>{isLoggedIn ? "Welcome" : "Please login"}</p>;
}
```

Hoặc:

```jsx
function UserActions({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? <button>Logout</button> : <button>Login</button>}
    </div>
  );
}
```

#### 3. Dùng &&

Phù hợp khi chỉ muốn render một phần UI nếu điều kiện đúng:

```jsx
function AdminActions({ isAdmin }) {
  return <div>{isAdmin && <button>Delete User</button>}</div>;
}
```

Nếu `isAdmin` là `true`, button sẽ được render. Nếu `isAdmin` là `false`, React không render button.

#### 4. Return null

Phù hợp khi component không cần hiển thị gì:

```jsx
function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return <p>{message}</p>;
}
```

### 6. Ví dụ thực tế

```jsx
function UserPanel({ isLoggedIn, isAdmin }) {
  function handleLogout() {
    console.log("Logout");
  }

  if (!isLoggedIn) {
    return <p>Please login</p>;
  }

  return (
    <section>
      <p>Welcome back</p>

      {isAdmin && <button type="button">Open admin page</button>}

      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </section>
  );
}
```

Trong ví dụ trên:

- `onClick={handleLogout}` là event handling.
- `if (!isLoggedIn)` là conditional rendering.
- `{isAdmin && ...}` là conditional rendering.

### 7. Event handling kết hợp với state

Event handler thường được dùng để cập nhật state.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function handleIncrease() {
    setCount((prevCount) => prevCount + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={handleIncrease}>
        Increase
      </button>
    </div>
  );
}
```

Luồng xử lý:

```txt
user clicks button
        ↓
event handler runs
        ↓
state updates
        ↓
component re-renders
        ↓
UI updates
```

### 8. Lỗi thường gặp

#### 1. Gọi function ngay khi render

Sai:

```jsx
<button type="button" onClick={handleClick()}>
  Click me
</button>
```

Đúng:

```jsx
<button type="button" onClick={handleClick}>
  Click me
</button>
```

Nếu cần truyền tham số:

```jsx
<button type="button" onClick={() => handleClick(user.id)}>
  Click me
</button>
```

#### 2. Dùng if trực tiếp trong JSX

Sai:

```jsx
<p>{if (isLoggedIn) "Welcome"}</p>
```

Đúng:

```jsx
<p>{isLoggedIn ? "Welcome" : "Login"}</p>
```

Hoặc tách `if` ra trước `return`.

#### 3. Quên preventDefault khi submit form

Nếu không gọi `event.preventDefault()`, browser có thể reload page sau khi submit form.

```jsx
function handleSubmit(event) {
  event.preventDefault();
}
```

#### 4. Dùng && với number có thể render số 0

Cần cẩn thận với cách viết:

```jsx
{items.length && <ProductList items={items} />}
```

Nếu `items.length` là `0`, React có thể render ra `0`. Nên viết rõ điều kiện:

```jsx
{items.length > 0 && <ProductList items={items} />}
```

### 9. File example

File example cho phần này:

```txt
ReactJS/Examples/eventhandling-conditionalrendering.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` từ file example để quan sát event handling, form submit, conditional rendering và state update.

### 10. Câu hỏi thường gặp

1. Event handling trong React là gì?
   - Event handling là quá trình xử lý tương tác của user như click, nhập input, focus, blur hoặc submit form thông qua event handler function.
2. Conditional rendering là gì?
   - Conditional rendering là việc hiển thị UI khác nhau dựa trên điều kiện.
3. Sự khác nhau giữa `onClick={handleClick}` và `onClick={handleClick()}` là gì?
   - `onClick={handleClick}` truyền function cho React để gọi khi user click. `onClick={handleClick()}` gọi function ngay trong lúc render.
4. Khi nào dùng ternary, khi nào dùng `&&`?
   - Dùng ternary khi có 2 nhánh UI. Dùng `&&` khi chỉ muốn render thêm một phần UI nếu điều kiện đúng.
5. Tại sao cần `event.preventDefault()` khi submit form?
   - Vì hành vi mặc định của form submit có thể làm browser reload page. `event.preventDefault()` giúp chặn hành vi mặc định đó.
