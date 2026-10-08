# ReactJS Theory

## 13. React.memo và tối ưu render

`React.memo` là một API dùng để tối ưu component function. Nó giúp component con có thể bỏ qua lần re-render khi parent re-render nhưng props truyền vào component con không thay đổi.

Ý tưởng ngắn gọn:

```txt
Parent re-render
    |
Child bình thường -> thường được gọi lại
Child dùng memo  -> có thể bỏ qua nếu props không đổi
```

Lưu ý quan trọng: `React.memo` là tối ưu hiệu năng, không phải cơ chế sửa logic. Nếu component bị lỗi khi không có `memo`, hãy sửa nguyên nhân trước rồi mới tối ưu.

### 1. React.memo là gì?

Mặc định, khi parent re-render, các child component bên trong parent thường cũng được gọi lại để React tính UI mới.

Ví dụ:

```jsx
import { useState } from "react";

function Child({ name }) {
  console.log("Child render");

  return <p>Hello {name}</p>;
}

export default function Parent() {
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

Mỗi lần `count` thay đổi:

```txt
Parent re-render
Child cũng render lại
```

Trong ví dụ này, prop `name="Nhat"` không đổi nhưng `Child` vẫn bị gọi lại vì parent re-render.

Có thể dùng `memo` để tối ưu:

```jsx
import { memo, useState } from "react";

const Child = memo(function Child({ name }) {
  console.log("Child render");

  return <p>Hello {name}</p>;
});

export default function Parent() {
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

Khi `Parent` re-render nhưng prop `name` vẫn giống lần trước, `Child` có thể được bỏ qua.

### 2. Khi props thay đổi thì sao?

`React.memo` không chặn mọi lần render. Nếu props thay đổi, component vẫn re-render bình thường.

```jsx
const Child = memo(function Child({ name }) {
  console.log("Child render");

  return <p>Hello {name}</p>;
});
```

Nếu `name` đổi từ `"Nhat"` sang `"David"`, `Child` cần render lại để hiển thị dữ liệu mới.

Ghi nhớ:

```txt
props không đổi -> memo có thể bỏ qua re-render
props thay đổi  -> component re-render bình thường
```

### 3. React.memo so sánh props như thế nào?

Theo mặc định, React so sánh từng prop bằng `Object.is`. Đây là kiểu so sánh nông, hay còn gọi là shallow comparison.

Với primitive value:

```jsx
<Child name="Nhat" age={20} />
```

Nếu `name` và `age` không đổi, props được xem là giống nhau.

Với object, array hoặc function:

```jsx
<Child user={{ name: "Nhat" }} />
```

Object `{ name: "Nhat" }` được tạo mới sau mỗi lần parent render. Nội dung nhìn giống nhau nhưng reference khác nhau, nên `React.memo` vẫn xem prop này là đã thay đổi.

Tương tự với array:

```jsx
<Child items={[1, 2, 3]} />
```

Và function:

```jsx
<Child onClick={() => console.log("Click")} />
```

Mỗi lần parent render, function mới được tạo ra.

### 4. Kết hợp với useCallback

Khi truyền callback xuống component con đã được `memo`, cần chú ý function reference.

Ví dụ chưa tối ưu:

```jsx
const Child = memo(function Child({ onClick }) {
  console.log("Child render");

  return (
    <button type="button" onClick={onClick}>
      Click
    </button>
  );
});

function Parent() {
  const [count, setCount] = useState(0);

  function handleClick() {
    console.log("Child button clicked");
  }

  return (
    <>
      <button type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>

      <Child onClick={handleClick} />
    </>
  );
}
```

Mỗi lần `Parent` render, `handleClick` là một function reference mới. Vì vậy, `Child` vẫn có thể re-render dù đã dùng `memo`.

Có thể dùng `useCallback`:

```jsx
const handleClick = useCallback(() => {
  console.log("Child button clicked");
}, []);
```

`useCallback` giúp giữ function reference ổn định khi dependencies không đổi.

Ghi nhớ:

```txt
React.memo  -> ghi nhớ component dựa trên props
useCallback -> ghi nhớ function reference
useMemo     -> ghi nhớ value
```

### 5. Kết hợp với useMemo

Nếu prop là object hoặc array, có thể dùng `useMemo` để giữ reference ổn định.

Ví dụ chưa tối ưu:

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  const user = {
    name: "Nhat",
    role: "Frontend Developer",
  };

  return (
    <>
      <button type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>

      <UserCard user={user} />
    </>
  );
}
```

Mỗi lần `Parent` render, `user` là một object mới.

Có thể dùng `useMemo`:

```jsx
const user = useMemo(() => {
  return {
    name: "Nhat",
    role: "Frontend Developer",
  };
}, []);
```

Tuy nhiên, không nên lạm dụng `useMemo`. Nếu có thể truyền primitive props trực tiếp thì thường đơn giản hơn:

```jsx
<UserCard name="Nhat" role="Frontend Developer" />
```

### 6. React.memo không chặn state và context

`React.memo` chỉ so sánh props từ parent truyền xuống. Component vẫn re-render nếu:

- State bên trong chính component đó thay đổi.
- Context mà component đang dùng thay đổi.
- Props thật sự thay đổi.

Ví dụ:

```jsx
const Counter = memo(function Counter() {
  const [count, setCount] = useState(0);

  console.log("Counter render");

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
});
```

Dù `Counter` được bọc bằng `memo`, khi state `count` thay đổi thì `Counter` vẫn re-render.

### 7. Custom comparison

`memo` có thể nhận tham số thứ hai là function so sánh props.

```jsx
const Chart = memo(
  function Chart({ data }) {
    return <LineChart data={data} />;
  },
  function arePropsEqual(prevProps, nextProps) {
    return prevProps.data.length === nextProps.data.length;
  }
);
```

Function `arePropsEqual` trả về:

```txt
true  -> props được xem là giống nhau, có thể bỏ qua render
false -> props khác nhau, render lại
```

Cần cẩn thận với custom comparison:

- Phải so sánh đủ các props ảnh hưởng tới UI và behavior.
- Không nên deep compare dữ liệu lớn nếu chưa đo hiệu năng.
- Nếu props có function, phải kiểm tra function đó nữa để tránh dùng closure cũ.

Trong đa số trường hợp, nên ưu tiên thiết kế props đơn giản và ổn định trước khi viết custom comparison.

### 8. Khi nào nên dùng React.memo?

Nên cân nhắc dùng `React.memo` khi:

- Component render tương đối tốn chi phí.
- Parent re-render thường xuyên.
- Props của child thường giữ nguyên.
- Component con nhận object, array hoặc function đã được ổn định bằng `useMemo` hoặc `useCallback`.
- Đã dùng React DevTools Profiler hoặc quan sát thực tế thấy render là vấn đề.

Không nên bọc mọi component bằng `memo` chỉ vì muốn app nhanh hơn. Memoization cũng có chi phí so sánh props và có thể làm code khó đọc hơn.

### 9. Lỗi thường gặp

#### 1. Nghĩ React.memo ngăn mọi re-render

Không đúng. `React.memo` chỉ giúp bỏ qua re-render khi props không đổi. State và context thay đổi vẫn khiến component re-render.

#### 2. Truyền object hoặc array mới mỗi lần render

```jsx
<UserCard user={{ name: "Nhat" }} />
```

Object mới được tạo ra sau mỗi lần parent render, nên `memo` không giúp nhiều.

#### 3. Truyền function mới mỗi lần render

```jsx
<UserCard onSelect={() => selectUser(user.id)} />
```

Nếu `UserCard` được bọc bằng `memo`, callback mới có thể làm component re-render. Có thể cân nhắc `useCallback` nếu đây thật sự là vấn đề hiệu năng.

#### 4. Tối ưu quá sớm

Nếu component nhỏ, render nhanh và app không bị lag, thêm `memo`, `useMemo`, `useCallback` có thể không đem lại lợi ích rõ ràng.

### 10. So sánh nhanh

| Công cụ | Ghi nhớ cái gì? | Dùng khi nào? |
| --- | --- | --- |
| `React.memo` | Kết quả render của component theo props | Muốn component con bỏ qua render khi props không đổi |
| `useMemo` | Một value | Muốn giữ kết quả tính toán hoặc object/array reference ổn định |
| `useCallback` | Một function reference | Muốn giữ callback ổn định khi truyền xuống component con hoặc làm dependency |

### 11. File example

File example cho phần này:

```txt
ReactJS/Examples/reactmemo-optimizerender.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Parent re-render nhưng child dùng `React.memo` có thể không render lại.
- Function prop cần `useCallback` để giữ reference ổn định.
- Object prop cần `useMemo` hoặc nên được tách thành primitive props.
- State bên trong component memoized vẫn làm component đó re-render.

### 12. Câu hỏi thường gặp

1. `React.memo` là gì?
   - `React.memo` là API tối ưu giúp component function có thể bỏ qua re-render khi props không đổi.
2. `React.memo` có giống `useMemo` không?
   - Không. `React.memo` dùng cho component, còn `useMemo` dùng để ghi nhớ một value trong component.
3. Vì sao component đã dùng `memo` vẫn re-render?
   - Vì props thay đổi, state bên trong component thay đổi, context thay đổi, hoặc props là object/function/array mới sau mỗi lần render.
4. Vì sao `useCallback` thường đi cùng `React.memo`?
   - Vì `useCallback` giữ function reference ổn định, giúp component con dùng `memo` không bị re-render chỉ vì nhận một function prop mới.
5. Có nên dùng `React.memo` cho mọi component không?
   - Không. Chỉ nên dùng khi có lý do hiệu năng rõ ràng, vì memoization cũng có chi phí và làm code phức tạp hơn.
