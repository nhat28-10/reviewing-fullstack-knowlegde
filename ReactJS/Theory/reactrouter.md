# ReactJS Theory

## 18. React Router

React Router dùng để tạo client-side routing cho React app. Nghĩa là URL thay đổi, component tương ứng được render, nhưng trình duyệt không cần tải lại toàn bộ website.

Ví dụ:

```txt
/              -> Home
/login         -> Login
/users         -> User list
/users/123     -> User detail
/dashboard     -> Protected dashboard
```

Luồng cơ bản:

```txt
User click link
-> URL thay đổi
-> React Router match route phù hợp
-> React render component tương ứng
```

### 1. Cài đặt và cấu hình router

Với nhiều project React/Vite, thường dùng package `react-router-dom`:

```bash
npm install react-router-dom
```

Sau đó bọc app bằng `BrowserRouter`:

```jsx
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

`BrowserRouter` giúp React Router theo dõi URL trên browser và đồng bộ UI với route hiện tại.

### 2. Routes và Route

`Routes` là container chứa các `Route`. `Route` mô tả một URL sẽ render component nào.

```jsx
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/users/:userId" element={<UserDetail />} />
    </Routes>
  );
}
```

Ý nghĩa:

```txt
path="/"              -> render <Home />
path="/login"         -> render <Login />
path="/users/:userId" -> render <UserDetail />
```

`element` nhận vào JSX element, nên thường viết `element={<Home />}` chứ không viết `component={Home}`.

### 3. Link và NavLink

Không nên dùng thẻ `<a href="/login">` cho điều hướng nội bộ nếu muốn giữ client-side routing, vì browser có thể reload lại toàn trang.

Nên dùng `Link`:

```jsx
import { Link } from "react-router-dom";

function Header() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/users">Users</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}
```

Nếu cần biết link nào đang active, dùng `NavLink`:

```jsx
import { NavLink } from "react-router-dom";

<NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>
  Users
</NavLink>;
```

### 4. useNavigate

`useNavigate` dùng để chuyển route bằng code, ví dụ sau khi login thành công hoặc sau khi submit form.

```jsx
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  function handleLogin() {
    // login success
    navigate("/dashboard");
  }

  return (
    <button type="button" onClick={handleLogin}>
      Login
    </button>
  );
}
```

Một số cách dùng phổ biến:

```jsx
navigate("/dashboard");
navigate("/login", { replace: true });
navigate(-1);
```

`replace: true` thay entry hiện tại trong history, thường dùng khi redirect sau login/logout để user không quay lại màn hình cũ bằng nút Back.

### 5. useParams

`useParams` dùng để lấy dynamic params từ URL.

Route:

```jsx
<Route path="/users/:userId" element={<UserDetail />} />
```

URL:

```txt
/users/123
```

Trong component:

```jsx
import { useParams } from "react-router-dom";

function UserDetail() {
  const { userId } = useParams();

  return <p>User ID: {userId}</p>;
}
```

Kết quả:

```txt
userId = "123"
```

Lưu ý: URL params thường là string. Nếu cần số, hãy tự convert:

```jsx
const id = Number(userId);
```

### 6. Nested routes và Outlet

Nested routes dùng khi một layout cha có nhiều trang con. Component cha cần render `<Outlet />` để hiển thị route con.

```jsx
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <section>
      <h1>Dashboard</h1>
      <Outlet />
    </section>
  );
}

<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<DashboardHome />} />
    <Route path="settings" element={<DashboardSettings />} />
  </Route>
</Routes>;
```

Ý nghĩa:

```txt
/dashboard          -> DashboardLayout + DashboardHome
/dashboard/settings -> DashboardLayout + DashboardSettings
```

`index` là route mặc định của route cha.

### 7. Protected Route

Protected Route dùng để chặn những route yêu cầu đăng nhập hoặc quyền truy cập.

Ví dụ dùng `Outlet`:

```jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
```

Cách dùng:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

Luồng:

```txt
User vào /dashboard
-> ProtectedRoute kiểm tra authentication
-> Nếu đã login: render Dashboard
-> Nếu chưa login: redirect về /login
```

Điểm quan trọng: Protected Route phía frontend chỉ kiểm soát UI và navigation. Backend vẫn phải kiểm tra token, role và permission khi user gọi API. Không được xem Protected Route là lớp bảo mật duy nhất.

### 8. Route 404

Route `*` dùng để bắt những URL không match route nào.

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 9. Nhớ nhanh

```txt
BrowserRouter
-> kết nối React app với browser URL

Routes
-> container chứa route definitions

Route
-> map path với element

Link / NavLink
-> điều hướng không reload trang

useNavigate
-> chuyển route bằng code

useParams
-> lấy dynamic params từ URL

Outlet
-> vị trí render route con

Navigate
-> redirect bằng component

Protected Route
-> kiểm tra điều kiện trước khi render route con
```

### 10. Lỗi hay gặp

#### 1. Dùng `<a>` cho điều hướng nội bộ

Không tối ưu:

```jsx
<a href="/users">Users</a>
```

Nên dùng:

```jsx
<Link to="/users">Users</Link>
```

#### 2. Quên bọc app bằng `BrowserRouter`

Nếu dùng `Routes`, `Route`, `Link`, `useNavigate` hoặc `useParams` bên ngoài router, app sẽ lỗi vì các API này cần router context.

#### 3. Quên `<Outlet />` ở layout cha

Nested route sẽ không hiển thị nếu component cha không render `<Outlet />`.

#### 4. Nhầm params là number

`useParams()` trả về string. Nếu cần so sánh với id dạng number, hãy convert trước.

#### 5. Nghĩ Protected Route đã đủ bảo mật

Protected Route chỉ chặn UI ở frontend. Backend vẫn phải bảo vệ API.

### 11. File example

File example cho phần này:

```txt
ReactJS/Examples/reactrouter.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Public routes.
- `Link` và `NavLink`.
- Dynamic route với `useParams`.
- Nested routes với `Outlet`.
- Programmatic navigation với `useNavigate`.
- Protected route với `Navigate`.
- Route `*` cho trang 404.

Để chạy example cần cài:

```bash
npm install react-router-dom
```

### 12. Câu hỏi thường gặp

1. React Router dùng để làm gì?
   - React Router dùng để quản lý client-side routing trong React, giúp render component phù hợp theo URL mà không reload toàn bộ trang.
2. `Routes` và `Route` khác nhau thế nào?
   - `Routes` là container, còn mỗi `Route` định nghĩa một path và element tương ứng.
3. `useNavigate` dùng để làm gì?
   - Dùng để điều hướng bằng code, ví dụ sau khi login thành công hoặc sau khi submit form.
4. `useParams` dùng để làm gì?
   - Dùng để lấy dynamic parameter từ URL hiện tại, ví dụ `userId` trong `/users/:userId`.
5. `Outlet` dùng để làm gì?
   - `Outlet` là vị trí render route con trong nested routes.
6. Protected Route trên frontend đã đủ bảo mật chưa?
   - Chưa. Protected Route chỉ kiểm soát navigation/UI. Backend vẫn phải xác thực và phân quyền khi xử lý API.
