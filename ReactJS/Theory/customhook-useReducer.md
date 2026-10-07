# ReactJS Theory

## 10. Custom Hook và useReducer cơ bản

Custom Hook giúp tái sử dụng logic giữa nhiều component. `useReducer` giúp quản lý state có nhiều kiểu cập nhật theo cách rõ ràng hơn.

Hai phần này thường đi cùng nhau trong project thực tế:

```txt
Custom Hook -> đóng gói logic
useReducer  -> quản lý state phức tạp bằng reducer + action
```

### 1. Custom Hook là gì?

Custom Hook là một function JavaScript do mình tự viết để tái sử dụng logic có dùng React Hooks.

Quy tắc quan trọng:

- Tên custom hook nên bắt đầu bằng `use`.
- Hook phải được gọi ở top-level của component hoặc custom hook khác.
- Không gọi hook trong `if`, `for`, callback lồng sâu hoặc function bình thường.

Ví dụ custom hook `useToggle`:

```jsx
import { useState } from "react";

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  function toggle() {
    setValue((currentValue) => !currentValue);
  }

  return [value, toggle];
}
```

Sử dụng:

```jsx
function Modal() {
  const [isOpen, toggle] = useToggle(false);

  return (
    <>
      <button type="button" onClick={toggle}>
        Toggle
      </button>

      {isOpen && <p>Modal is open</p>}
    </>
  );
}
```

Điểm cần nhớ:

```txt
Custom Hook -> tái sử dụng logic
Component   -> tái sử dụng UI
```

Custom Hook không chia sẻ state tự động giữa các component. Mỗi lần gọi custom hook là một state riêng.

### 2. Khi nào nên tạo Custom Hook?

Nên cân nhắc tạo custom hook khi:

- Nhiều component dùng chung một đoạn logic state/effect.
- Component đang quá dài vì chứa nhiều logic không trực tiếp liên quan tới UI.
- Muốn đặt tên rõ ràng cho một hành vi, ví dụ `useToggle`, `useLocalStorage`, `useFetch`, `useCart`.
- Muốn dễ test và dễ bảo trì hơn.

Ví dụ logic fetch dữ liệu có thể tách thành `useUsers`, logic giỏ hàng có thể tách thành `useCart`.

Không nên tạo custom hook quá sớm nếu logic chỉ dùng một lần và vẫn còn đơn giản.

### 3. useReducer là gì?

`useReducer` là React Hook dùng để quản lý state bằng reducer function.

Cú pháp:

```jsx
import { useReducer } from "react";

const [state, dispatch] = useReducer(reducer, initialState);
```

Các phần chính:

```txt
state        -> state hiện tại
dispatch     -> function gửi action
reducer      -> function nhận state + action và trả về state mới
initialState -> state ban đầu
```

Luồng hoạt động:

```txt
user action
    |
dispatch(action)
    |
reducer(state, action)
    |
new state
    |
component re-renders
```

Ví dụ counter:

```jsx
import { useReducer } from "react";

function counterReducer(state, action) {
  if (action.type === "increment") {
    return state + 1;
  }

  if (action.type === "decrement") {
    return state - 1;
  }

  if (action.type === "reset") {
    return 0;
  }

  return state;
}

function Counter() {
  const [count, dispatch] = useReducer(counterReducer, 0);

  return (
    <>
      <p>Count: {count}</p>

      <button type="button" onClick={() => dispatch({ type: "increment" })}>
        +
      </button>

      <button type="button" onClick={() => dispatch({ type: "decrement" })}>
        -
      </button>

      <button type="button" onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
    </>
  );
}
```

### 4. Action là gì?

Action là object mô tả điều gì vừa xảy ra.

Thông thường action có dạng:

```jsx
{
  type: "add_todo",
  payload: {
    title: "Learn useReducer",
  },
}
```

- `type`: tên hành động.
- `payload`: dữ liệu gửi kèm nếu cần.

Ví dụ reducer cho todo:

```jsx
function todoReducer(state, action) {
  switch (action.type) {
    case "add_todo": {
      return [
        ...state,
        {
          id: Date.now(),
          title: action.payload.title,
          isDone: false,
        },
      ];
    }

    case "toggle_todo": {
      return state.map((todo) =>
        todo.id === action.payload.todoId
          ? { ...todo, isDone: !todo.isDone }
          : todo
      );
    }

    default: {
      return state;
    }
  }
}
```

`switch...case` thường được dùng với reducer vì dễ đọc khi có nhiều action.

### 5. useState vs useReducer

Không phải cứ có state là phải dùng `useReducer`.

Nên dùng `useState` khi state đơn giản:

```jsx
const [isOpen, setIsOpen] = useState(false);
const [name, setName] = useState("");
```

Nên cân nhắc `useReducer` khi:

- State là object/array có nhiều kiểu cập nhật.
- Logic update phụ thuộc vào action rõ ràng như add, remove, update, reset.
- Nhiều state liên quan chặt chẽ với nhau.
- Component có nhiều setter khiến logic bị phân tán.

Ghi nhớ:

```txt
useState   -> state đơn giản
useReducer -> state phức tạp hơn hoặc có nhiều action
```

Ví dụ giỏ hàng thường hợp với `useReducer` hơn `useState` vì có nhiều action:

```txt
add item
remove item
increase quantity
decrease quantity
clear cart
```

### 6. Kết hợp Custom Hook và useReducer

Trong thực tế, có thể đóng gói reducer vào custom hook để component dùng gọn hơn.

Ví dụ `useCounter`:

```jsx
import { useReducer } from "react";

const initialState = {
  count: 0,
};

function counterReducer(state, action) {
  switch (action.type) {
    case "increment": {
      return {
        ...state,
        count: state.count + 1,
      };
    }

    case "decrement": {
      return {
        ...state,
        count: state.count - 1,
      };
    }

    case "reset": {
      return initialState;
    }

    default: {
      return state;
    }
  }
}

function useCounter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  function increment() {
    dispatch({ type: "increment" });
  }

  function decrement() {
    dispatch({ type: "decrement" });
  }

  function reset() {
    dispatch({ type: "reset" });
  }

  return {
    count: state.count,
    increment,
    decrement,
    reset,
  };
}
```

Component dùng custom hook:

```jsx
function Counter() {
  const { count, increment, decrement, reset } = useCounter();

  return (
    <>
      <p>Count: {count}</p>
      <button type="button" onClick={increment}>
        +
      </button>
      <button type="button" onClick={decrement}>
        -
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </>
  );
}
```

Lợi ích:

- Component chỉ tập trung render UI.
- Logic update state nằm trong reducer/custom hook.
- Dễ tái sử dụng logic ở nhiều component khác.

### 7. Reducer nên là pure function

Reducer nên là pure function:

- Nhận `state` và `action`.
- Trả về state mới.
- Không mutate state cũ.
- Không gọi API, không set timeout, không tạo side effect bên trong reducer.

Sai:

```jsx
function reducer(state, action) {
  state.count++;
  return state;
}
```

Đúng:

```jsx
function reducer(state, action) {
  return {
    ...state,
    count: state.count + 1,
  };
}
```

Với array:

```jsx
function reducer(state, action) {
  return {
    ...state,
    items: [...state.items, action.payload.item],
  };
}
```

Không nên:

```jsx
state.items.push(action.payload.item);
return state;
```

### 8. Lỗi thường gặp

#### 1. Mutate state trong reducer

Reducer phải trả về object/array mới khi state thay đổi. Nếu mutate state cũ rồi return lại cùng reference, React có thể không cập nhật UI đúng như mong đợi.

#### 2. Quên return state ở default case

Sai:

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
  }
}
```

Nên có `default`:

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    default:
      return state;
  }
}
```

#### 3. Dispatch sai action type

```jsx
dispatch({ type: "incremnt" });
```

Nếu reducer không có case `"incremnt"`, action sẽ không làm state thay đổi. Nên đặt action type rõ ràng và thống nhất.

#### 4. Đưa side effect vào reducer

Không nên gọi API hoặc ghi `localStorage` trực tiếp trong reducer. Reducer chỉ nên tính state mới.

Nếu cần side effect, hãy xử lý trong event handler, custom hook hoặc `useEffect`.

#### 5. Tạo custom hook nhưng trả về API khó dùng

Custom hook nên trả về những value/function mà component thật sự cần.

Ví dụ dễ dùng:

```jsx
return {
  items: state.items,
  total,
  addItem,
  removeItem,
  clearCart,
};
```

Thay vì bắt component bên ngoài phải biết quá nhiều chi tiết reducer nếu không cần thiết.

### 9. File example

File example cho phần này:

```txt
ReactJS/Examples/customhook-useReducer.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- `useToggle` custom hook cho modal.
- `useCart` custom hook kết hợp với `useReducer`.
- Các action `add_item`, `increase_quantity`, `decrease_quantity`, `remove_item`, `clear_cart`.
- Cách reducer trả về state mới mà không mutate state cũ.

### 10. Câu hỏi thường gặp

1. Custom Hook là gì?
   - Custom Hook là function JavaScript bắt đầu bằng `use`, dùng để tái sử dụng logic có sử dụng React Hooks giữa nhiều component.
2. Custom Hook có tái sử dụng UI không?
   - Không. Custom Hook tái sử dụng logic. Muốn tái sử dụng UI thì dùng component.
3. `useReducer` là gì?
   - `useReducer` là React Hook quản lý state thông qua reducer function và action được gửi bằng `dispatch`.
4. Khi nào nên dùng `useReducer` thay cho `useState`?
   - Khi state phức tạp hơn, có nhiều kiểu cập nhật, hoặc nhiều state liên quan chặt chẽ với nhau.
5. Reducer nhận gì và trả về gì?
   - Reducer nhận `state` hiện tại và `action`, sau đó trả về state mới.
6. Có nên mutate state trong reducer không?
   - Không. Reducer nên trả về state mới bằng cách tạo object/array mới.
7. Có thể kết hợp Custom Hook và `useReducer` không?
   - Có. Đây là cách rất phổ biến để đóng gói logic state phức tạp và giúp component gọn hơn.
