# ReactJS Theory

## 14. Controlled vs Uncontrolled Component

Trong React form, `controlled component` và `uncontrolled component` nói về nơi đang giữ giá trị hiện tại của input.

Ghi nhớ nhanh:

```txt
Controlled   -> React state là source of truth
Uncontrolled -> DOM tự giữ giá trị, React lấy ra khi cần
```

Hai cách này đều dùng được. Khác nhau chính nằm ở việc React có theo dõi giá trị input sau mỗi lần user nhập hay không.

### 1. Controlled component là gì?

Controlled component là input có giá trị được điều khiển bởi React state.

Ví dụ:

```jsx
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");

  return (
    <input
      type="email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      placeholder="your@email.com"
    />
  );
}
```

Luồng hoạt động:

```txt
User nhập vào input
    |
onChange chạy
    |
setEmail(...) cập nhật state
    |
Component re-render
    |
Input nhận value mới từ state
```

Ở đây, giá trị hiển thị trong input luôn đến từ `email`. Vì vậy React state là source of truth.

### 2. Uncontrolled component là gì?

Uncontrolled component là input để DOM tự giữ giá trị. React không cập nhật state sau mỗi lần user nhập. Khi cần đọc giá trị, ta thường dùng `ref`.

Ví dụ:

```jsx
import { useRef } from "react";

function LoginForm() {
  const emailRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    console.log(emailRef.current.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={emailRef}
        type="email"
        defaultValue="nhat@example.com"
        placeholder="your@email.com"
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

Ở đây:

```txt
DOM giữ giá trị input
React không re-render sau mỗi ký tự
Khi submit, React đọc giá trị qua ref
```

`defaultValue` chỉ đặt giá trị ban đầu. Sau đó DOM tự quản lý giá trị hiện tại.

### 3. So sánh controlled và uncontrolled

| Tiêu chí            | Controlled       | Uncontrolled                         |
| ------------------- | ---------------- | ------------------------------------ |
| Nơi giữ giá trị     | React state      | DOM                                  |
| Cách lấy giá trị    | Đọc từ state     | Đọc từ ref hoặc FormData             |
| Re-render khi nhập  | Có, vì state đổi | Không nhất thiết                     |
| Validation realtime | Dễ làm           | Không thuận tiện bằng                |
| Giá trị ban đầu     | `value` từ state | `defaultValue` hoặc `defaultChecked` |
| Checkbox/radio      | Dùng `checked`   | Dùng `defaultChecked`                |

Ví dụ controlled:

```jsx
<input value={email} onChange={(event) => setEmail(event.target.value)} />
```

Ví dụ uncontrolled:

```jsx
<input ref={emailRef} defaultValue="nhat@example.com" />
```

### 4. Khi nào dùng controlled component?

Controlled component thường phù hợp khi cần React biết giá trị input ngay khi user nhập.

Nên dùng controlled khi:

- Cần validation realtime.
- Cần disable button dựa trên input.
- Cần format dữ liệu khi nhập.
- Cần hiển thị preview ngay lập tức.
- Cần đồng bộ nhiều UI từ cùng một giá trị input.

Ví dụ disable button khi email rỗng:

```jsx
function LoginForm() {
  const [email, setEmail] = useState("");

  return (
    <>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <button type="button" disabled={!email.includes("@")}>
        Submit
      </button>
    </>
  );
}
```

Controlled input giúp UI luôn phản ánh state hiện tại.

### 5. Khi nào dùng uncontrolled component?

Uncontrolled component phù hợp khi form đơn giản và chỉ cần lấy dữ liệu ở thời điểm submit.

Nên dùng uncontrolled khi:

- Form rất đơn giản.
- Không cần validation realtime.
- Không cần preview hoặc đồng bộ UI theo từng ký tự.
- Cần thao tác với DOM element bằng `ref`.
- Input là file input.

Ví dụ đọc dữ liệu bằng `FormData`:

```jsx
function ContactForm() {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    console.log(formData.get("email"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" defaultValue="nhat@example.com" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

Với cách này, React không cần tạo state cho từng field nếu không dùng giá trị đó để render UI.

### 6. Checkbox, radio và select

Với text input, controlled dùng `value`.

```jsx
<input value={name} onChange={(event) => setName(event.target.value)} />
```

Với checkbox hoặc radio, controlled dùng `checked`.

```jsx
<input
  type="checkbox"
  checked={isAccepted}
  onChange={(event) => setIsAccepted(event.target.checked)}
/>
```

Uncontrolled checkbox dùng `defaultChecked`.

```jsx
<input type="checkbox" defaultChecked={true} />
```

Với `select`, controlled cũng dùng `value`.

```jsx
<select value={role} onChange={(event) => setRole(event.target.value)}>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>
```

Uncontrolled select dùng `defaultValue`.

```jsx
<select defaultValue="user">
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>
```

### 7. Không trộn controlled và uncontrolled

Một input không nên lúc thì uncontrolled, lúc thì controlled trong cùng vòng đời component.

Sai:

```jsx
function Form({ user }) {
  const [name, setName] = useState(user?.name);

  return (
    <input value={name} onChange={(event) => setName(event.target.value)} />
  );
}
```

Nếu `user?.name` ban đầu là `undefined`, input bắt đầu ở trạng thái uncontrolled. Sau đó khi `name` có string, input chuyển thành controlled và React sẽ cảnh báo.

Nên khởi tạo bằng string rỗng:

```jsx
const [name, setName] = useState(user?.name ?? "");
```

Hoặc đảm bảo prop `value` luôn là string:

```jsx
<input value={name ?? ""} onChange={(event) => setName(event.target.value)} />
```

### 8. Lỗi thường gặp

#### 1. Truyền value nhưng quên onChange

Sai:

```jsx
<input value={email} />
```

Input này sẽ giống read-only vì React luôn ép input quay về `email`.

Đúng:

```jsx
<input value={email} onChange={(event) => setEmail(event.target.value)} />
```

Nếu chỉ muốn set giá trị ban đầu và để DOM tự quản lý, dùng `defaultValue`:

```jsx
<input defaultValue="nhat@example.com" />
```

#### 2. Dùng value cho checkbox

Với checkbox, trạng thái tick/untick được quản lý bằng `checked`, không phải `value`.

```jsx
<input
  type="checkbox"
  checked={isAccepted}
  onChange={(event) => setIsAccepted(event.target.checked)}
/>
```

#### 3. Dùng null hoặc undefined cho controlled input

Controlled text input nên nhận string ổn định.

Không nên:

```jsx
<input value={name} onChange={(event) => setName(event.target.value)} />
```

Nếu `name` có thể là `null` hoặc `undefined`, nên viết:

```jsx
<input value={name ?? ""} onChange={(event) => setName(event.target.value)} />
```

#### 4. Controlled input làm re-render quá nhiều

Controlled input cập nhật state sau mỗi lần nhập, nên component chứa state sẽ re-render theo từng ký tự.

Nếu component lớn bị chậm, có thể:

- Tách form thành component nhỏ hơn.
- Chỉ để phần cần input state nằm trong component đó.
- Cân nhắc `useDeferredValue` cho UI nặng phụ thuộc vào input.

### 9. File example

File example cho phần này:

```txt
ReactJS/Examples/controlled-uncontrolledcomponent.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Controlled input cập nhật state và preview theo từng ký tự.
- Controlled checkbox dùng `checked`.
- Uncontrolled form đọc dữ liệu lúc submit bằng `FormData`.
- Uncontrolled input có thể đọc và focus bằng `ref`.

### 10. Câu hỏi thường gặp

1. Controlled component là gì?
   - Là input có giá trị hiện tại được quản lý bởi React state, thường dùng `value` hoặc `checked` kèm `onChange`.
2. Uncontrolled component là gì?
   - Là input để DOM tự giữ giá trị, React chỉ đọc giá trị khi cần bằng `ref` hoặc `FormData`.
3. Controlled và uncontrolled khác nhau chính ở đâu?
   - Controlled dùng React state làm source of truth, còn uncontrolled dùng DOM làm source of truth.
4. Khi nào nên dùng controlled?
   - Khi cần validation realtime, preview, disable button, format dữ liệu hoặc đồng bộ UI theo input.
5. Khi nào nên dùng uncontrolled?
   - Khi form đơn giản, chỉ cần lấy dữ liệu lúc submit hoặc không muốn tạo state cho từng field.
6. Có nên chuyển một input từ uncontrolled sang controlled không?
   - Không nên. Hãy giữ một kiểu ổn định trong suốt vòng đời input.
