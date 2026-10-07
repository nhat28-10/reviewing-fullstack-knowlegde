# ReactJS Theory

## 11. Component re-render khi nào?

Re-render nghĩa là React gọi lại function component để tính ra UI mới.

Một component React thường re-render khi dữ liệu mà React đang theo dõi thay đổi.

Các trường hợp quan trọng:

```txt
1. State của component thay đổi
2. Props truyền vào component thay đổi
3. Context mà component đang dùng thay đổi
4. Parent component re-render
5. Key của component thay đổi khiến component bị remount
```

Điểm rất quan trọng:

```txt
Re-render không luôn luôn đồng nghĩa với update DOM thật.
```

React có thể gọi lại component để tính UI mới, sau đó so sánh với UI trước đó và chỉ cập nhật DOM thật khi cần.

### 1. State thay đổi

Khi state thay đổi bằng setter như `setState`, component sở hữu state đó sẽ re-render.

Ví dụ:

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Luồng:

```txt
click button
    |
setCount(...)
    |
count changes
    |
Counter re-renders
    |
UI shows new count
```

Nếu set lại cùng một giá trị state, React có thể bỏ qua re-render vì state không đổi.

Ví dụ:

```jsx
setCount(0);
```

Nếu `count` hiện tại đã là `0`, React không cần render lại UI mới.

### 2. Props thay đổi

Props là dữ liệu parent truyền xuống child. Khi props thay đổi, child cần re-render để phản ánh dữ liệu mới.

```jsx
function User({ name }) {
  console.log("User render");

  return <p>{name}</p>;
}

function App() {
  const [name, setName] = useState("Nhat");

  return (
    <>
      <button type="button" onClick={() => setName("David")}>
        Change name
      </button>

      <User name={name} />
    </>
  );
}
```

Khi `name` thay đổi từ `"Nhat"` sang `"David"`, component `User` re-render để hiển thị props mới.

### 3. Context thay đổi

Nếu component dùng `useContext`, component đó có thể re-render khi `value` của Provider thay đổi.

```jsx
function Profile() {
  const theme = useContext(ThemeContext);

  return <p>Theme: {theme}</p>;
}
```

Nếu `ThemeContext.Provider` đổi `value`, các component đang đọc context đó sẽ nhận giá trị mới và có thể re-render.

Ví dụ:

```jsx
<ThemeContext.Provider value={theme}>
  <Profile />
</ThemeContext.Provider>
```

Khi `theme` đổi, `Profile` cần render lại để hiển thị theme mới.

### 4. Parent re-render thì child thường cũng re-render

Đây là điểm rất dễ nhầm.

Khi parent re-render, React thường gọi lại các child bên trong parent đó, kể cả khi child không nhận props.

```jsx
import { useState } from "react";

function Child() {
  console.log("Child render");

  return <p>Child</p>;
}

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>

      <Child />
    </>
  );
}
```

Khi `count` thay đổi:

```txt
Parent state changes
    |
Parent re-renders
    |
Child is called again by default
```

Điều này không có nghĩa DOM của `Child` chắc chắn bị update. Nó chỉ có nghĩa React gọi lại function `Child` để tính UI.

### 5. Key thay đổi có thể làm component remount

`key` thường dùng khi render list, nhưng nó cũng ảnh hưởng tới việc React giữ lại hay tạo mới component.

Nếu `key` thay đổi, React xem đó là component khác và sẽ unmount component cũ, sau đó mount component mới.

```jsx
function App() {
  const [version, setVersion] = useState(1);

  return (
    <>
      <button type="button" onClick={() => setVersion(version + 1)}>
        Reset profile
      </button>

      <Profile key={version} />
    </>
  );
}
```

Khi `version` đổi, `Profile` không chỉ re-render mà bị remount. State bên trong `Profile` sẽ reset.

### 6. Re-render khác DOM update

Re-render nghĩa là React gọi lại component:

```jsx
function Greeting() {
  console.log("Greeting render");

  return <h1>Hello</h1>;
}
```

Nhưng React không nhất thiết sửa DOM thật sau mỗi lần re-render.

Luồng đơn giản:

```txt
component re-renders
    |
React calculates new UI
    |
React compares previous UI and new UI
    |
React updates real DOM only if needed
```

Vì vậy, thấy `console.log("render")` chạy nhiều lần không luôn đồng nghĩa với việc DOM thật bị thay đổi nhiều lần.

### 7. useRef thay đổi có làm re-render không?

Không. Cập nhật `ref.current` không trigger re-render.

```jsx
import { useRef } from "react";

function CounterRef() {
  const countRef = useRef(0);

  function handleClick() {
    countRef.current += 1;
    console.log(countRef.current);
  }

  return (
    <button type="button" onClick={handleClick}>
      Increase ref
    </button>
  );
}
```

`countRef.current` thay đổi, nhưng UI không tự cập nhật vì React không render lại component.

Nếu dữ liệu cần hiển thị lên UI và cập nhật khi thay đổi, thường nên dùng `useState`.

### 8. React.memo giúp giảm re-render không cần thiết

`React.memo` có thể giúp component con bỏ qua re-render nếu props không thay đổi.

```jsx
import { memo, useState } from "react";

const Child = memo(function Child({ name }) {
  console.log("Child render");

  return <p>{name}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>

      <Child name="Nhat" />
    </>
  );
}
```

Trong ví dụ trên, khi `count` thay đổi, `Parent` re-render. Nhưng `Child` có thể không re-render vì prop `name` vẫn là `"Nhat"`.

Lưu ý: `React.memo` so sánh props theo shallow comparison. Nếu truyền object, array hoặc function mới mỗi lần render, component con vẫn có thể re-render.

```jsx
<Child user={{ name: "Nhat" }} />
```

Object trên được tạo mới mỗi lần parent render.

Có thể kết hợp:

- `useMemo` để giữ object/array reference ổn định.
- `useCallback` để giữ function reference ổn định.
- `React.memo` để child bỏ qua re-render khi props không đổi.

### 9. Strict Mode có thể làm render log chạy 2 lần

Trong môi trường development, nếu app được bọc bởi `React.StrictMode`, React có thể gọi component nhiều hơn một lần để giúp phát hiện side effect không an toàn.

Ví dụ trong `main.jsx` của Vite thường có:

```jsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

Vì vậy, khi debug bằng `console.log("render")`, có thể thấy log chạy 2 lần trong development. Đây không nhất thiết là bug trong logic render.

Khi build production, hành vi này không giống development Strict Mode.

### 10. Khi nào cần tối ưu re-render?

Không phải re-render nào cũng xấu.

React được thiết kế để re-render component khi dữ liệu thay đổi. Chỉ nên tối ưu khi:

- Component render chậm thật sự.
- List lớn render lại quá nhiều.
- Component con nặng bị render lại dù props không đổi.
- Có lag rõ khi nhập input, filter, sort hoặc thao tác UI.
- Dùng React DevTools Profiler thấy component tốn nhiều thời gian render.

Nên ưu tiên code dễ đọc trước. Khi có dấu hiệu performance thật sự, mới dùng `React.memo`, `useMemo`, `useCallback` hoặc tách component hợp lý.

### 11. Lỗi thường gặp

#### 1. Nghĩ parent re-render không ảnh hưởng child

Theo mặc định, khi parent re-render, child bên trong parent thường cũng được gọi lại.

Nếu child nặng và props không đổi, có thể cân nhắc `React.memo`.

#### 2. Nghĩ re-render luôn update DOM thật

Không đúng. Re-render là React tính UI mới. DOM thật chỉ update nếu React thấy cần thiết.

#### 3. Dùng useRef rồi mong UI tự cập nhật

`ref.current` thay đổi không làm component re-render. Nếu muốn UI cập nhật, dùng state.

#### 4. Truyền object/function mới vào component memoized

```jsx
<UserCard user={{ name: "Nhat" }} onClick={() => console.log("Click")} />
```

Mỗi lần parent render, object và function trên là reference mới. Nếu `UserCard` dùng `React.memo`, props vẫn bị xem là thay đổi.

#### 5. Tối ưu quá sớm

Không nên bọc mọi component bằng `React.memo` hoặc dùng `useMemo`, `useCallback` ở mọi nơi. Memoization cũng có chi phí và làm code khó đọc hơn.

### 12. File example

File example cho phần này:

```txt
ReactJS/Examples/componentre-render.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- State thay đổi làm component re-render.
- Parent re-render kéo theo child render lại.
- `React.memo` giúp child bỏ qua render khi props không đổi.
- `useRef` thay đổi nhưng không tự update UI.
- Đổi `key` làm component remount và reset state bên trong.

### 13. Câu hỏi thường gặp

1. Khi nào React component re-render?
   - Khi state thay đổi, props thay đổi, context đang dùng thay đổi, parent re-render, hoặc key thay đổi khiến component bị remount.
2. Re-render có luôn cập nhật DOM thật không?
   - Không. React chỉ cập nhật DOM thật nếu kết quả UI mới khác UI cũ ở phần cần thay đổi.
3. Thay đổi `ref.current` có làm component re-render không?
   - Không. `useRef` giữ giá trị qua các lần render nhưng thay đổi ref không trigger re-render.
4. Vì sao child re-render dù props không đổi?
   - Vì parent re-render thì child thường cũng được gọi lại theo mặc định. Có thể dùng `React.memo` nếu child nặng và props ổn định.
5. `React.memo` có ngăn mọi re-render không?
   - Không. Nó chỉ giúp bỏ qua re-render khi props không đổi theo shallow comparison. Nếu props là object/function mới mỗi lần render, child vẫn có thể re-render.
6. Vì sao console log render chạy 2 lần trong development?
   - Có thể do `React.StrictMode` trong development. React cố ý gọi thêm để phát hiện vấn đề side effect.
