# ReactJS Theory

## 8. useContext

### 1. useContext là gì?

`useContext` là React Hook dùng để đọc dữ liệu từ Context mà không cần truyền props qua nhiều tầng component.

Vấn đề thường gặp là props drilling:

```jsx
function App() {
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Header user={user} />;
}

function Header({ user }) {
  return <Profile user={user} />;
}

function Profile({ user }) {
  return <h1>{user.name}</h1>;
}
```

Ở ví dụ trên, `Layout` và `Header` có thể không cần dùng `user`, nhưng vẫn phải nhận và truyền xuống chỉ để `Profile` dùng.

`useContext` giúp component con đọc dữ liệu từ Context trực tiếp, miễn là component đó nằm bên trong Provider.

### 2. Tạo Context

Dùng `createContext` để tạo Context.

```jsx
import { createContext } from "react";

const UserContext = createContext(null);
```

`UserContext` là nơi React dùng để chia sẻ dữ liệu trong component tree.

Giá trị truyền vào `createContext(null)` là default value. Default value chỉ được dùng khi component đọc context nhưng không nằm trong Provider nào.

### 3. Provider cung cấp dữ liệu

Provider dùng để cung cấp dữ liệu cho các component con.

```jsx
function App() {
  const user = {
    name: "Nhat",
  };

  return (
    <UserContext.Provider value={user}>
      <Profile />
    </UserContext.Provider>
  );
}
```

Điểm quan trọng:

```jsx
value = { user };
```

Đây là dữ liệu được chia sẻ cho các component nằm bên trong Provider.

Có thể hình dung:

```txt
UserContext.Provider
        |
        | user
        v
     Profile
```

### 4. useContext để lấy dữ liệu

Trong component con, dùng `useContext(ContextName)` để đọc giá trị từ Context.

```jsx
import { useContext } from "react";

function Profile() {
  const user = useContext(UserContext);

  return <h1>{user.name}</h1>;
}
```

Lúc này không cần truyền:

```jsx
<Profile user={user} />
```

`Profile` lấy `user` trực tiếp từ `UserContext`.

### 5. Ví dụ thực tế với Theme Context

Context thường phù hợp với dữ liệu cần nhiều component ở nhiều tầng sử dụng, ví dụ:

```txt
current user
theme
language
authentication information
feature flags
```

Ví dụ `ThemeContext`:

```jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Navbar />
      <MainContent />
    </ThemeContext.Provider>
  );
}

function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <nav>
      <p>Theme: {theme}</p>
      <button
        type="button"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        Toggle theme
      </button>
    </nav>
  );
}

function MainContent() {
  const { theme } = useContext(ThemeContext);

  return <main>Current theme: {theme}</main>;
}
```

Trong ví dụ trên, cả `Navbar` và `MainContent` đều đọc được `theme` mà không cần truyền props qua nhiều tầng.

### 6. Tạo custom hook cho Context

Trong project thực tế, thường tách logic đọc context thành custom hook.

```jsx
function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeContext.Provider");
  }

  return context;
}
```

Sau đó dùng:

```jsx
function Navbar() {
  const { theme, setTheme } = useTheme();

  return <p>{theme}</p>;
}
```

Cách này giúp:

- Code gọn hơn.
- Dễ tái sử dụng.
- Báo lỗi rõ ràng nếu component nằm ngoài Provider.

### 7. useContext không thay thế mọi props

Đây là điểm rất dễ hiểu nhầm. Không phải cứ có props là nên đổi sang Context.

Ví dụ:

```jsx
<UserCard name="Nhat" />
```

Nếu `UserCard` cần `name` và chỉ nhận trực tiếp từ parent, dùng props vẫn đơn giản và rõ ràng hơn.

Context phù hợp hơn khi:

```txt
một dữ liệu
   ↓
cần nhiều component ở nhiều tầng sử dụng
```

Nên dùng props khi:

```txt
Parent -> Child trực tiếp
```

Nên cân nhắc Context khi:

```txt
Parent -> ... -> Deep Child
```

### 8. Context re-render khi value thay đổi

Khi `value` của Provider thay đổi, các component đang đọc Context đó có thể re-render.

Ví dụ:

```jsx
<ThemeContext.Provider value={{ theme, setTheme }}>
  <AppContent />
</ThemeContext.Provider>
```

Mỗi lần `theme` thay đổi, component dùng `useContext(ThemeContext)` sẽ nhận giá trị mới và render lại.

Vì vậy không nên đưa mọi dữ liệu vào một Context lớn nếu không cần thiết. Có thể tách context theo mục đích:

```txt
AuthContext
ThemeContext
LanguageContext
```

### 9. Lỗi thường gặp

#### 1. Component nằm ngoài Provider

Ví dụ:

```jsx
<UserContext.Provider value={user}>
  <Header />
</UserContext.Provider>

<Profile />
```

Nếu `Profile` dùng `useContext(UserContext)`, nó không nhận được `user` từ Provider phía trên vì `Profile` nằm ngoài Provider đó.

#### 2. Lạm dụng Context

Không nên dùng Context chỉ để tránh truyền props một tầng:

```txt
Parent -> Child
```

Trong trường hợp này, props thường đơn giản và dễ đọc hơn.

#### 3. Quên truyền value cho Provider

Sai:

```jsx
<UserContext.Provider>
  <Profile />
</UserContext.Provider>
```

Đúng:

```jsx
<UserContext.Provider value={user}>
  <Profile />
</UserContext.Provider>
```

#### 4. Nghĩ Context là state management hoàn chỉnh

Context giúp chia sẻ dữ liệu, nhưng không tự xử lý mọi bài toán state phức tạp. Với state lớn, nhiều action phức tạp hoặc performance nhạy cảm, có thể cần kết hợp `useReducer` hoặc thư viện state management khác.

### 10. Câu hỏi thường gặp

1. `useContext` dùng để làm gì?
   - `useContext` cho phép component đọc dữ liệu từ React Context mà không cần truyền props qua từng component trung gian.
2. Context giải quyết vấn đề gì?
   - Context giúp giảm props drilling khi cùng một dữ liệu cần được dùng bởi nhiều component ở nhiều tầng khác nhau.
3. `useContext` có thể thay thế hoàn toàn props không?
   - Không. Props vẫn phù hợp cho giao tiếp trực tiếp giữa parent và child. Context phù hợp hơn cho dữ liệu dùng chung ở nhiều tầng.
4. Context Provider là gì?
   - Provider là component cung cấp `value` cho các component con nằm bên trong nó.
5. Component nằm ngoài Provider thì nhận được gì?
   - Nó sẽ nhận default value được truyền vào `createContext(defaultValue)`.
6. Khi `value` của Provider thay đổi thì điều gì xảy ra?
   - Các component đang đọc Context đó có thể re-render để nhận giá trị mới.
