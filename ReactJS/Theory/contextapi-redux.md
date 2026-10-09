# ReactJS Theory

## 19. Context API và Redux / Redux Toolkit

Context API và Redux đều có thể giúp nhiều component dùng chung dữ liệu, nhưng mục đích chính không hoàn toàn giống nhau.

Ghi nhớ nhanh:

```txt
Context API
-> truyền dữ liệu qua component tree

Redux / Redux Toolkit
-> quản lý global state có cấu trúc, predictable và dễ debug
```

### 1. Context API là gì?

Context API là tính năng built-in của React, dùng để chia sẻ dữ liệu cho nhiều component mà không cần truyền props qua từng tầng.

Context thường phù hợp với dữ liệu:

- Theme.
- Language.
- Current user.
- Auth state đơn giản.
- Feature flags.
- Config ít thay đổi.

Ví dụ tạo context:

```jsx
import { createContext } from "react";

const UserContext = createContext(null);
```

Provider cung cấp dữ liệu:

```jsx
function App() {
  const user = {
    id: 1,
    name: "Nhat",
  };

  return (
    <UserContext.Provider value={user}>
      <Profile />
    </UserContext.Provider>
  );
}
```

Component con đọc dữ liệu:

```jsx
import { useContext } from "react";

function Profile() {
  const user = useContext(UserContext);

  return <p>{user.name}</p>;
}
```

Luồng:

```txt
UserContext.Provider
-> value={user}
-> component con dùng useContext(UserContext)
```

### 2. Điểm mạnh và giới hạn của Context API

Điểm mạnh:

- Có sẵn trong React.
- Setup đơn giản.
- Rất hợp với state nhỏ, ít thay đổi.
- Giải quyết props drilling tốt.

Giới hạn:

- Không tự cung cấp kiến trúc quản lý state phức tạp.
- Khi `value` thay đổi, các component đọc context đó có thể re-render.
- Không có sẵn DevTools chuyên cho action/state history như Redux.
- Nếu nhét quá nhiều state vào một context lớn, code có thể khó tối ưu và khó bảo trì.

Vì vậy, Context không nên được hiểu là "Redux đơn giản". Context chủ yếu là cơ chế truyền dữ liệu qua component tree.

### 3. Redux là gì?

Redux là thư viện quản lý global state tập trung. State được đặt trong store, component đọc state từ store và cập nhật state bằng cách dispatch action.

Có thể hình dung:

```txt
Component
-> dispatch action
-> reducer xử lý action
-> store cập nhật state
-> component đọc state mới
```

Redux phù hợp với dữ liệu global có nhiều logic cập nhật, ví dụ:

- Shopping cart.
- Auth state phức tạp.
- Notifications.
- Filters/search/sort dùng ở nhiều màn hình.
- State cần debug qua action history.
- App có nhiều feature cùng đọc và cập nhật một phần state.

### 4. Redux Toolkit là gì?

Redux Toolkit, thường viết là RTK, là cách được khuyến nghị để viết Redux hiện đại. RTK giúp giảm boilerplate so với Redux truyền thống.

Các API thường gặp:

- `configureStore`: tạo Redux store.
- `createSlice`: tạo reducer và action creators trong cùng một nơi.
- `Provider`: bọc React app để component đọc được store.
- `useSelector`: đọc state từ store.
- `useDispatch`: dispatch action.

Ví dụ cấu trúc:

```txt
store
├── authSlice
├── cartSlice
└── notificationSlice
```

Ví dụ slice:

```jsx
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    addItem(state, action) {
      state.items.push(action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

Trong Redux Toolkit, code trong reducer nhìn giống mutate state, nhưng RTK dùng Immer bên dưới để tạo immutable update an toàn.

### 5. Setup Redux Toolkit cơ bản

Cài package:

```bash
npm install @reduxjs/toolkit react-redux
```

Tạo store:

```jsx
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});
```

Bọc app bằng Redux `Provider`:

```jsx
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

Đọc và cập nhật state trong component:

```jsx
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "./cartSlice";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const totalQuantity = useSelector((state) => state.cart.items.length);

  return (
    <button type="button" onClick={() => dispatch(addItem(product))}>
      Add to cart ({totalQuantity})
    </button>
  );
}
```

### 6. Context API vs Redux Toolkit

| Tiêu chí | Context API | Redux Toolkit |
| --- | --- | --- |
| Bản chất | Tính năng built-in của React | Thư viện state management |
| Mục đích chính | Truyền dữ liệu qua component tree | Quản lý global state có cấu trúc |
| Setup | Đơn giản | Cần thêm package và store |
| Phù hợp | Theme, language, user đơn giản | Cart, auth phức tạp, nhiều action |
| Debug | Debug như React state thường | Có Redux DevTools và action history |
| Update logic | Tự tổ chức bằng state/reducer | Chuẩn hóa bằng action/reducer/slice |
| App size | Nhỏ đến vừa | Vừa đến lớn hoặc state phức tạp |

Ví dụ chọn Context:

```txt
Theme light/dark
-> ít action
-> ít logic cập nhật
-> nhiều component chỉ cần đọc theme
```

Ví dụ chọn Redux Toolkit:

```txt
Shopping cart
-> add item
-> remove item
-> update quantity
-> apply coupon
-> calculate total
-> sync với API
-> nhiều component cùng đọc/cập nhật
```

### 7. Có cần Redux cho mọi project không?

Không. Nếu app chỉ có local state, form nhỏ, theme hoặc current user đơn giản, dùng `useState`, `useReducer` hoặc Context có thể đủ.

Cách nghĩ thực tế:

```txt
State chỉ dùng trong một component
-> useState

State logic hơi phức tạp trong một khu vực
-> useReducer

State đơn giản cần chia sẻ qua nhiều tầng
-> Context API

Global state phức tạp, nhiều action, nhiều nơi cùng cập nhật
-> Redux Toolkit
```

Không nên thêm Redux chỉ vì app có vài state global đơn giản. Nhưng cũng không nên ép Context xử lý mọi thứ khi state đã phức tạp và cần cấu trúc rõ ràng hơn.

### 8. Lỗi hay gặp

#### 1. Dùng Context để chứa mọi state

Nếu tất cả state đều được nhét vào một context lớn, mỗi lần `value` thay đổi có thể làm nhiều component re-render không cần thiết. Nên tách context theo mục đích:

```txt
ThemeContext
AuthContext
LanguageContext
```

#### 2. Dùng Redux cho state quá nhỏ

Ví dụ một modal chỉ dùng trong một component thì `useState` thường đủ. Đưa state đó vào Redux có thể làm code phức tạp hơn cần thiết.

#### 3. Mutate state khi viết Redux thuần

Trong Redux Toolkit reducer có thể viết kiểu:

```jsx
state.items.push(action.payload);
```

Nhưng trong Redux thuần, mutate trực tiếp state là lỗi. Cần phân biệt Redux Toolkit dùng Immer, còn Redux reducer thuần phải tự return state mới.

#### 4. Quên bọc app bằng Provider

Context cần Context Provider. Redux cần Redux Provider.

```jsx
<Provider store={store}>
  <App />
</Provider>
```

Nếu component dùng `useSelector` hoặc `useDispatch` ngoài Redux Provider, app sẽ lỗi.

#### 5. Nghĩ Context luôn nhẹ hơn Redux về performance

Không phải lúc nào cũng vậy. Performance phụ thuộc vào cách tổ chức state, số component subscribe/read state và tần suất update. Với state global phức tạp, Redux có selector và cấu trúc cập nhật rõ ràng hơn.

### 9. File example

File example cho phần này:

```txt
ReactJS/Examples/contextapi-redux.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Context API quản lý theme.
- Redux Toolkit quản lý shopping cart.
- `useContext` đọc theme từ Provider.
- `useSelector` đọc cart từ Redux store.
- `useDispatch` dispatch action thêm/xóa/tăng/giảm item.

Để chạy example cần cài:

```bash
npm install @reduxjs/toolkit react-redux
```

### 10. Câu hỏi thường gặp

1. Context API và Redux khác nhau chính ở đâu?
   - Context API chủ yếu dùng để truyền dữ liệu qua component tree. Redux là thư viện quản lý global state có store, actions, reducers và DevTools.
2. Khi nào nên dùng Context API?
   - Khi dữ liệu chia sẻ tương đối đơn giản như theme, language, current user hoặc auth state đơn giản.
3. Khi nào nên dùng Redux Toolkit?
   - Khi global state phức tạp, có nhiều action, nhiều component cùng đọc/cập nhật hoặc cần debug action history.
4. Redux Toolkit có phải Redux không?
   - Có. Redux Toolkit là cách viết Redux hiện đại được khuyến nghị, giúp giảm boilerplate.
5. Có cần Redux cho mọi app React không?
   - Không. Nhiều app chỉ cần `useState`, `useReducer` và Context là đủ.
6. Context có thay thế Redux hoàn toàn không?
   - Không hoàn toàn. Context giải quyết truyền dữ liệu, còn Redux giải quyết quản lý state phức tạp theo cấu trúc rõ ràng.
