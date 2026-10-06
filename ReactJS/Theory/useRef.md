# ReactJS Theory

## 7. useRef

### 1. useRef là gì?

`useRef` là React Hook dùng để lưu một giá trị qua nhiều lần render mà không làm component re-render khi giá trị đó thay đổi.

`useRef` thường dùng cho 2 nhóm việc chính:

- Truy cập trực tiếp DOM element.
- Lưu giá trị mutable không cần hiển thị trực tiếp lên UI.

Cú pháp cơ bản:

```jsx
import { useRef } from "react";

const myRef = useRef(initialValue);
```

Giá trị được lưu trong `.current`:

```jsx
const countRef = useRef(0);

countRef.current = countRef.current + 1;
```

Khác với `useState`, khi `countRef.current` thay đổi thì component không tự re-render.

### 2. useRef để truy cập DOM

Ví dụ focus vào input:

```jsx
import { useRef } from "react";

function App() {
  const inputRef = useRef(null);

  function handleFocus() {
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button type="button" onClick={handleFocus}>
        Focus
      </button>
    </>
  );
}
```

Luồng hoạt động:

```txt
inputRef
   ↓
<input ref={inputRef} />
   ↓
inputRef.current
   ↓
DOM input element
```

Khi click button, `inputRef.current?.focus()` sẽ focus vào input.

### 3. useRef vs useState

Đây là phần quan trọng nhất.

#### 1. useState

```jsx
const [count, setCount] = useState(0);

setCount(1);
```

Luồng:

```txt
state changes
     ↓
component re-renders
     ↓
UI updates
```

#### 2. useRef

```jsx
const countRef = useRef(0);

countRef.current = 1;
```

Luồng:

```txt
ref value changes
     ↓
component does not re-render automatically
```

Ghi nhớ:

```txt
useState -> data ảnh hưởng UI
useRef   -> lưu giá trị không cần tự update UI
```

### 4. Lưu timer id bằng useRef

Một use case rất phổ biến là lưu id của timer.

```jsx
import { useRef } from "react";

function Timer() {
  const timerRef = useRef(null);

  function startTimer() {
    timerRef.current = setInterval(() => {
      console.log("Running");
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  return (
    <>
      <button type="button" onClick={startTimer}>
        Start
      </button>
      <button type="button" onClick={stopTimer}>
        Stop
      </button>
    </>
  );
}
```

`timerRef.current` lưu timer id qua nhiều lần render, nhưng không cần hiển thị ra UI nên không cần dùng `useState`.

### 5. Lưu giá trị trước đó bằng useRef

`useRef` cũng có thể dùng để lưu giá trị ở lần render trước.

```jsx
import { useEffect, useRef, useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const previousCountRef = useRef(0);

  useEffect(() => {
    previousCountRef.current = count;
  }, [count]);

  return (
    <div>
      <p>Current count: {count}</p>
      <p>Previous count: {previousCountRef.current}</p>

      <button type="button" onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}
```

Trong ví dụ trên:

- `count` là state vì cần render ra UI.
- `previousCountRef.current` lưu giá trị trước đó mà không cần tự trigger re-render.

### 6. Đếm số lần render bằng useRef

Vì ref giữ giá trị qua các lần render nhưng không gây re-render, ta có thể dùng nó để debug số lần component render.

```jsx
import { useEffect, useRef, useState } from "react";

function RenderCounter() {
  const [name, setName] = useState("");
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
  });

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <p>Render count: {renderCountRef.current}</p>
    </div>
  );
}
```

Lưu ý: nếu muốn UI hiển thị giá trị ref mới nhất ngay lập tức, state vẫn là lựa chọn phù hợp hơn.

### 7. Khi nào dùng useRef?

Nên cân nhắc dùng `useRef` khi:

- Cần focus input hoặc thao tác với DOM element.
- Cần lưu timer id.
- Cần lưu giá trị trước đó.
- Cần lưu mutable value không ảnh hưởng trực tiếp đến UI.
- Cần giữ một giá trị qua nhiều lần render nhưng không muốn thay đổi giá trị đó làm component re-render.

Không nên dùng `useRef` thay thế `useState` nếu dữ liệu cần hiển thị và cập nhật UI.

### 8. Lỗi thường gặp

#### 1. Dùng ref cho dữ liệu cần cập nhật UI

Ví dụ:

```jsx
const countRef = useRef(0);

function handleClick() {
  countRef.current++;
}
```

Nếu UI có:

```jsx
<p>{countRef.current}</p>
```

Thì việc tăng `countRef.current` không tự làm UI cập nhật. Nếu dữ liệu cần làm UI thay đổi, thường dùng `useState`.

#### 2. Quên `.current`

Sai:

```jsx
inputRef.focus();
```

Đúng:

```jsx
inputRef.current?.focus();
```

#### 3. Truy cập DOM ref trước khi element mount

Ban đầu DOM ref thường là `null`.

```jsx
const inputRef = useRef(null);
```

Vì vậy nên kiểm tra trước khi dùng:

```jsx
inputRef.current?.focus();
```

#### 4. Lạm dụng ref để né re-render

Không nên dùng ref chỉ để tránh re-render nếu dữ liệu đó thật sự là UI state. Re-render là cách React cập nhật UI đúng theo dữ liệu.

### 9. Câu hỏi thường gặp

1. `useRef` là gì trong React?
   - `useRef` là React Hook dùng để lưu giá trị qua nhiều lần render mà không làm component re-render khi giá trị đó thay đổi.
2. `useRef` thường dùng trong trường hợp nào?
   - Thường dùng để truy cập DOM element, lưu timer id, lưu giá trị trước đó hoặc lưu mutable value không cần update UI.
3. Khác nhau giữa `useRef` và `useState` là gì?
   - Cập nhật state làm component re-render. Cập nhật `ref.current` không tự làm component re-render.
4. Giá trị của ref nằm ở đâu?
   - Giá trị của ref nằm trong property `.current`.
5. Có nên dùng `useRef` cho dữ liệu hiển thị trên UI không?
   - Thường không. Nếu dữ liệu cần làm UI cập nhật, nên dùng `useState`.
