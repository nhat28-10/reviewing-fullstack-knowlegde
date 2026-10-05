# ReactJS Theory

## 1. JSX, Component và Function Component

### 1. Sơ lược

Trong React, ta thường gặp 3 khái niệm nền tảng:

- `JSX`: cú pháp giúp viết UI gần giống HTML bên trong JavaScript.
- `Component`: một phần UI độc lập, có thể tái sử dụng.
- `Function Component`: component được viết bằng JavaScript function và return về JSX.

Ví dụ:

```jsx
function Welcome() {
  return <h1>Hello React</h1>;
}
```

Trong ví dụ trên:

- `Welcome` là một function component.
- `<h1>Hello React</h1>` là JSX.
- Component `Welcome` có thể được dùng trong JSX bằng `<Welcome />`.

### 2. JSX là gì?

JSX nhìn gần giống HTML:

```jsx
const element = <h1>Hello Nhat</h1>;
```

Nhưng JSX không phải HTML. JSX là một syntax extension của JavaScript. Trong quá trình build, JSX sẽ được compiler như Babel hoặc công cụ build như Vite chuyển đổi thành JavaScript mà React có thể xử lý.

#### Chèn JavaScript vào JSX

Trong JSX, dùng `{}` để chèn JavaScript expression:

```jsx
function UserGreeting() {
  const name = "Nhat";

  return <h1>Hello {name}</h1>;
}
```

Output UI:

```txt
Hello Nhat
```

Trong `{}` có thể đặt expression:

```jsx
<p>{1 + 2}</p>
<p>{user.name}</p>
<p>{isAdmin ? "Admin" : "User"}</p>
```

Không đặt trực tiếp statement như `if`, `for`, `while` vào bên trong JSX:

```jsx
<p>{if (isAdmin) { return "Admin"; }}</p> // Sai
```

Nếu cần xử lý điều kiện, có thể dùng ternary operator hoặc tách logic ra trước `return`:

```jsx
function UserRole() {
  const isAdmin = true;

  return <p>{isAdmin ? "Admin" : "User"}</p>;
}
```

### 3. Một số khác biệt giữa JSX và HTML

Ví dụ JSX:

```jsx
function App() {
  return (
    <div className="container">
      <label htmlFor="email">Email</label>
      <input id="email" />
    </div>
  );
}
```

HTML tương ứng thường viết:

```html
<div class="container">
  <label for="email">Email</label>
  <input id="email" />
</div>
```

Một số điểm cần nhớ trong JSX:

```txt
class -> className
for   -> htmlFor
```

Các tag không có children nên tự đóng:

```jsx
<img src="/avatar.png" alt="Avatar" />
<input id="email" />
```

Style inline trong JSX dùng object:

```jsx
<h1 style={{ color: "red", fontSize: "24px" }}>Hello</h1>
```

### 4. Component là gì?

Component là một khối UI độc lập, có thể tái sử dụng và kết hợp với các component khác để tạo thành giao diện lớn hơn.

Ví dụ cấu trúc một trang:

```txt
App
├── Header
├── Navbar
├── ProductList
│   ├── ProductCard
│   ├── ProductCard
│   └── ProductCard
└── Footer
```

Thay vì viết toàn bộ giao diện trong một file lớn, ta có thể chia thành nhiều component:

```jsx
function App() {
  return (
    <>
      <Header />
      <Navbar />
      <ProductList />
      <Footer />
    </>
  );
}
```

Cách chia này giúp:

- Code dễ đọc hơn.
- Dễ maintain hơn.
- Tái sử dụng UI tốt hơn.
- Chia nhỏ logic theo từng phần màn hình.

Ví dụ `ProductCard` có thể được dùng nhiều lần thay vì copy cùng một đoạn JSX nhiều lần.

### 5. Function Component

Function component về bản chất là một JavaScript function return về JSX.

```jsx
function Header() {
  return (
    <header>
      <h1>My Website</h1>
    </header>
  );
}
```

Có thể viết bằng arrow function:

```jsx
const Header = () => {
  return <h1>My Website</h1>;
};
```

Nếu component chỉ return một expression, có thể viết ngắn:

```jsx
const Header = () => <h1>My Website</h1>;
```

Sử dụng component:

```jsx
function App() {
  return (
    <div>
      <Header />
      <Header />
    </div>
  );
}
```

React sẽ render 2 lần component `Header`.

#### Quy tắc quan trọng

Tên component nên bắt đầu bằng chữ hoa:

```jsx
function UserCard() {
  return <div>User card</div>;
}

function App() {
  return <UserCard />;
}
```

Không nên viết component bằng chữ thường:

```jsx
function userCard() {
  return <div>User card</div>;
}
```

React dùng chữ hoa để phân biệt custom component với HTML/native element như:

```jsx
<div />
<p />
<button />
```

### 6. Component phải return gì?

Một component thường return JSX:

```jsx
function App() {
  return <h1>Hello</h1>;
}
```

Nếu có nhiều element, cần bọc chúng trong một parent element:

```jsx
function App() {
  return (
    <div>
      <h1>Hello</h1>
      <p>Welcome</p>
    </div>
  );
}
```

Hoặc dùng Fragment để tránh thêm `<div>` không cần thiết:

```jsx
function App() {
  return (
    <>
      <h1>Hello</h1>
      <p>Welcome</p>
    </>
  );
}
```

`<>...</>` là React Fragment.

Component cũng có thể return `null` nếu không muốn render gì:

```jsx
function AdminPanel({ isAdmin }) {
  if (!isAdmin) {
    return null;
  }

  return <section>Admin Panel</section>;
}
```

### 7. Ví dụ thực tế ở frontend

Giả sử có trang danh sách user:

```jsx
function UserCard() {
  return (
    <article>
      <h2>Nguyen Van A</h2>
      <p>Developer</p>
    </article>
  );
}

function App() {
  return (
    <main>
      <h1>User List</h1>

      <UserCard />
      <UserCard />
    </main>
  );
}
```

Luồng có thể hiểu là:

```txt
App
 ↓
UserCard
 ↓
JSX
 ↓
React render UI
```

### 8. Những lỗi thường gặp

#### 1. Nghĩ JSX là HTML

Không chính xác. JSX nhìn giống HTML, nhưng nó vẫn là syntax extension của JavaScript dùng để mô tả UI trong React.

#### 2. Nghĩ component chỉ là HTML được tách file

Component không chỉ chứa giao diện. Component có thể kết hợp:

```txt
UI
+ JavaScript logic
+ state
+ event handling
+ hooks
```

#### 3. Gọi component như function bình thường

Thông thường trong JSX nên dùng:

```jsx
<UserCard />
```

Không nên gọi trực tiếp:

```jsx
UserCard();
```

React cần quản lý component trong component tree để xử lý render, state, hooks và lifecycle đúng cách.

#### 4. JSX return nhiều root element

Cách viết sai:

```jsx
return (
  <h1>Hello</h1>
  <p>Welcome</p>
);
```

Cách viết đúng:

```jsx
return (
  <>
    <h1>Hello</h1>
    <p>Welcome</p>
  </>
);
```

#### 5. Quên đóng tag trong JSX

Sai:

```jsx
return <input id="email">;
```

Đúng:

```jsx
return <input id="email" />;
```

### 9. File example

File example cho phần này:

```txt
ReactJS/Examples/jsx-component-functioncomponent.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` từ file example để quan sát UI.

### 10. Câu hỏi thường gặp

1. JSX trong React là gì?
   - JSX là syntax extension của JavaScript, cho phép mô tả UI bằng cú pháp gần giống HTML. JSX sẽ được chuyển đổi thành JavaScript để React xử lý.
2. React Component là gì?
   - React component là một phần UI độc lập và có thể tái sử dụng. Component giúp chia giao diện thành những phần nhỏ, rõ trách nhiệm và dễ maintain.
3. Function Component là gì?
   - Function component là một JavaScript function return về JSX. Function component cũng có thể dùng props, state, event handler và React Hooks.
4. Tại sao tên React component nên bắt đầu bằng chữ hoa?
   - Vì React dùng tên viết hoa để phân biệt custom component với HTML/native element. Ví dụ `<UserCard />` là component, còn `<div />` là HTML element.
5. Component có bắt buộc phải return JSX không?
   - Thường là có, nhưng component cũng có thể return `null` nếu không muốn render gì.
