# ReactJS Theory

## 20. Redux Toolkit cơ bản

Redux Toolkit, thường viết là RTK, là cách được khuyến nghị để viết Redux hiện đại. RTK giúp tạo store, reducer và action gọn hơn Redux truyền thống.

Flow cần nhớ:

```txt
Component
-> dispatch(action)
-> reducer trong slice xử lý action
-> store cập nhật state
-> useSelector đọc state mới
-> component re-render
```

### 1. Cài đặt

Với React app, thường cần 2 package:

```bash
npm install @reduxjs/toolkit react-redux
```

Trong đó:

- `@reduxjs/toolkit`: cung cấp `configureStore`, `createSlice`.
- `react-redux`: cung cấp `Provider`, `useSelector`, `useDispatch` để kết nối Redux với React.

### 2. Store là gì?

Store là nơi chứa Redux state của ứng dụng.

Ví dụ tạo store:

```jsx
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```

Có thể hiểu state trong store sẽ có dạng:

```txt
store
└── counter
    └── value
```

`counter` là một phần state được quản lý bởi `counterReducer`.

### 3. Provider dùng để làm gì?

Redux `Provider` giúp các component React bên trong đọc được store.

Ví dụ trong `main.jsx`:

```jsx
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

Nếu component dùng `useSelector` hoặc `useDispatch` nhưng không nằm trong `Provider`, app sẽ lỗi vì không tìm thấy Redux store.

### 4. Slice và reducer

Một slice thường gom các phần liên quan đến một feature:

- `name`: tên slice.
- `initialState`: state ban đầu.
- `reducers`: các hàm xử lý action.
- `actions`: action creators được Redux Toolkit tự tạo.
- `reducer`: reducer được export để đưa vào store.

Ví dụ `counterSlice`:

```jsx
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    increaseByAmount(state, action) {
      state.value += action.payload;
    },
  },
});

export const { decrement, increment, increaseByAmount } =
  counterSlice.actions;

export default counterSlice.reducer;
```

Cấu trúc cần nhớ:

```txt
counterSlice
├── name
├── initialState
├── reducers
├── actions
└── reducer
```

### 5. Vì sao được viết `state.value += 1`?

Trong reducer của Redux Toolkit, code nhìn giống đang mutate state:

```jsx
state.value += 1;
```

Cách viết này được phép vì Redux Toolkit dùng Immer bên dưới. Immer giúp tạo immutable update an toàn từ code nhìn giống mutation.

Điểm cần nhớ:

```txt
Redux Toolkit reducer
-> có thể viết kiểu mutate state
-> Immer tạo state mới an toàn phía dưới
```

Nếu viết Redux reducer thuần không dùng Redux Toolkit, không nên mutate trực tiếp state.

### 6. useSelector

`useSelector` dùng để đọc dữ liệu từ Redux store.

```jsx
import { useSelector } from "react-redux";

const count = useSelector((state) => state.counter.value);
```

Luồng:

```txt
Redux store
-> state.counter.value
-> count trong component
```

Khi `state.counter.value` thay đổi, component đang dùng selector này sẽ nhận giá trị mới và có thể re-render.

### 7. useDispatch

`useDispatch` dùng để gửi action tới Redux store.

```jsx
import { useDispatch } from "react-redux";
import { increment } from "./counterSlice";

const dispatch = useDispatch();

dispatch(increment());
```

Luồng:

```txt
dispatch(increment())
-> reducer increment chạy
-> state.value tăng
-> store cập nhật
-> component dùng useSelector nhận state mới
```

### 8. Action payload

Khi action cần dữ liệu đi kèm, dữ liệu đó thường nằm trong `action.payload`.

Ví dụ:

```jsx
dispatch(increaseByAmount(5));
```

Reducer nhận:

```jsx
increaseByAmount(state, action) {
  state.value += action.payload;
}
```

Ở đây:

```txt
action.type    -> "counter/increaseByAmount"
action.payload -> 5
```

### 9. Ví dụ component hoàn chỉnh

```jsx
import { useDispatch, useSelector } from "react-redux";
import { decrement, increment, increaseByAmount } from "./counterSlice";

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <section>
      <p>Count: {count}</p>

      <button type="button" onClick={() => dispatch(decrement())}>
        -
      </button>
      <button type="button" onClick={() => dispatch(increment())}>
        +
      </button>
      <button type="button" onClick={() => dispatch(increaseByAmount(5))}>
        +5
      </button>
    </section>
  );
}
```

### 10. Cách chia file thường gặp

Với project nhỏ hoặc lúc học, có thể để store và slice gần nhau. Với project thực tế, thường tách theo feature:

```txt
src/
├── app/
│   └── store.js
├── features/
│   └── counter/
│       ├── counterSlice.js
│       └── Counter.jsx
└── main.jsx
```

Ý tưởng:

- `store.js`: tạo Redux store.
- `counterSlice.js`: chứa state và reducers của counter feature.
- `Counter.jsx`: component đọc state và dispatch action.
- `main.jsx`: bọc app bằng Redux `Provider`.

### 11. Nhớ nhanh

```txt
configureStore
-> tạo store

Provider
-> đưa store vào React app

createSlice
-> tạo reducer + actions cho một feature

reducer
-> xử lý action và cập nhật state

action
-> mô tả chuyện gì vừa xảy ra

payload
-> dữ liệu gửi kèm action

useSelector
-> đọc state từ store

useDispatch
-> gửi action tới store
```

### 12. Lỗi hay gặp

#### 1. Quên bọc app bằng `Provider`

Nếu quên `Provider`, component dùng `useSelector` hoặc `useDispatch` sẽ không đọc được store.

#### 2. Quên thêm reducer vào store

Nếu tạo `counterSlice` nhưng không đưa vào `configureStore`, `state.counter` sẽ không tồn tại.

```jsx
export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```

#### 3. Nhầm action creator với action object

Đúng:

```jsx
dispatch(increment());
```

Sai:

```jsx
dispatch(increment);
```

`increment` là action creator. Cần gọi `increment()` để tạo action object.

#### 4. Lạm dụng Redux cho state local

State chỉ dùng trong một component, ví dụ input đang nhập hoặc trạng thái đóng/mở modal nhỏ, thường nên để `useState`.

#### 5. Đọc quá nhiều state trong một selector

Nếu component chỉ cần `state.counter.value`, không nên selector cả store. Selector càng rõ nhu cầu thì component càng dễ hiểu và dễ tối ưu.

### 13. File example

File example cho phần này:

```txt
ReactJS/Examples/basicreduxtoolkit.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Tạo Redux store bằng `configureStore`.
- Tạo counter slice bằng `createSlice`.
- Bọc app bằng `Provider`.
- Đọc state bằng `useSelector`.
- Dispatch action bằng `useDispatch`.
- Gửi dữ liệu qua `action.payload`.

Để chạy example cần cài:

```bash
npm install @reduxjs/toolkit react-redux
```

### 14. Câu hỏi thường gặp

1. Redux store là gì?
   - Redux store là nơi lưu Redux state tập trung của ứng dụng.
2. Slice trong Redux Toolkit là gì?
   - Slice gom `initialState`, reducer logic và action creators cho một feature cụ thể.
3. `useSelector` dùng để làm gì?
   - `useSelector` cho phép React component đọc dữ liệu từ Redux store.
4. `useDispatch` dùng để làm gì?
   - `useDispatch` trả về hàm `dispatch`, dùng để gửi action tới Redux store.
5. `action.payload` là gì?
   - `payload` là dữ liệu gửi kèm action, ví dụ số lượng cần tăng hoặc sản phẩm cần thêm vào cart.
6. Chuyện gì xảy ra khi dispatch một action?
   - Action được gửi tới store, reducer phù hợp xử lý action, state được cập nhật, component đọc state đó có thể re-render.
