# ReactJS Theory

## 9. useMemo vs useCallback

`useMemo` và `useCallback` đều là React Hook dùng để tối ưu performance bằng cách ghi nhớ kết quả giữa các lần render.

Điểm khác nhau quan trọng nhất:

```txt
useMemo     -> ghi nhớ một value
useCallback -> ghi nhớ một function
```

Không phải component nào cũng cần dùng hai hook này. Chỉ nên dùng khi có lý do rõ ràng như phép tính tốn chi phí, object/array/function reference làm component con re-render không cần thiết, hoặc dependency của hook khác cần một reference ổn định.

### 1. useMemo là gì?

`useMemo` dùng để memoize kết quả của một phép tính. React sẽ dùng lại kết quả cũ nếu dependency chưa thay đổi.

Cú pháp:

```jsx
import { useMemo } from "react";

const value = useMemo(() => {
  return someCalculation();
}, [dependency]);
```

Ví dụ:

```jsx
const total = useMemo(() => {
  return products.reduce((sum, product) => sum + product.price, 0);
}, [products]);
```

Ý nghĩa:

- `products` không đổi -> dùng lại `total` cũ.
- `products` thay đổi -> chạy lại callback và tính `total` mới.

`useMemo` thường hữu ích khi:

- Phép tính tương đối nặng.
- Cần tạo object/array ổn định để truyền xuống component con.
- Cần tránh tính toán lại khi dependency không đổi.

Ví dụ lọc danh sách:

```jsx
function ProductList({ products }) {
  const expensiveProducts = useMemo(() => {
    return products.filter((product) => product.price > 1000);
  }, [products]);

  return <p>Total expensive products: {expensiveProducts.length}</p>;
}
```

Nếu `products` không đổi, React không cần filter lại danh sách.

### 2. useCallback là gì?

`useCallback` dùng để memoize function reference. React sẽ giữ lại cùng một function nếu dependency chưa thay đổi.

Cú pháp:

```jsx
import { useCallback } from "react";

const fn = useCallback(() => {
  // logic
}, [dependency]);
```

Ví dụ:

```jsx
const handleDelete = useCallback(() => {
  deleteUser(userId);
}, [userId]);
```

Ý nghĩa:

- `userId` không đổi -> dùng lại function cũ.
- `userId` thay đổi -> tạo function mới.

`useCallback` thường hữu ích khi:

- Truyền callback xuống component con đang được tối ưu bằng `React.memo`.
- Function là dependency của `useEffect`, `useMemo` hoặc hook khác.
- Cần giữ function reference ổn định giữa các lần render.

Ví dụ với `React.memo`:

```jsx
import { memo, useCallback, useState } from "react";

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

  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []);

  return (
    <>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increase
      </button>
      <Child onClick={handleClick} />
    </>
  );
}
```

Trong ví dụ trên, `handleClick` ổn định nên `Child` có thể tránh re-render không cần thiết nếu props khác cũng không đổi.

### 3. So sánh useMemo và useCallback

| Hook | Ghi nhớ | Trả về | Dùng khi |
| --- | --- | --- | --- |
| `useMemo` | Kết quả của phép tính | Value | Cần tránh tính toán lại hoặc cần value reference ổn định |
| `useCallback` | Function reference | Function | Cần truyền callback ổn định hoặc dùng function làm dependency |

Ví dụ ngắn:

```jsx
const result = useMemo(() => {
  return calculate();
}, []);

const handleClick = useCallback(() => {
  console.log("Click");
}, []);
```

Ghi nhớ:

```txt
useMemo     -> nhớ kết quả
useCallback -> nhớ function
```

### 4. Dependency array

Cả `useMemo` và `useCallback` đều phụ thuộc vào dependency array.

```jsx
const total = useMemo(() => {
  return price * quantity;
}, [price, quantity]);

const handleAddToCart = useCallback(() => {
  addToCart(productId, quantity);
}, [productId, quantity]);
```

Nếu callback sử dụng biến nào từ component scope, biến đó thường nên nằm trong dependency array.

Sai:

```jsx
const total = useMemo(() => {
  return price * quantity;
}, [price]);
```

Đúng:

```jsx
const total = useMemo(() => {
  return price * quantity;
}, [price, quantity]);
```

Nếu thiếu dependency, component có thể dùng dữ liệu cũ và gây bug khó phát hiện.

### 5. Khi nào không nên dùng?

Không nên dùng `useMemo` hoặc `useCallback` chỉ vì thấy component có re-render.

Ví dụ này thường không cần `useMemo`:

```jsx
const fullName = firstName + " " + lastName;
```

Không cần thiết phải viết:

```jsx
const fullName = useMemo(() => {
  return firstName + " " + lastName;
}, [firstName, lastName]);
```

Với phép tính đơn giản, chi phí memoization có thể còn không đáng so với việc tính trực tiếp.

Không nên dùng `useCallback` cho mọi event handler:

```jsx
function Button() {
  function handleClick() {
    console.log("Clicked");
  }

  return (
    <button type="button" onClick={handleClick}>
      Click
    </button>
  );
}
```

Nếu component con không dùng `React.memo` hoặc function không làm dependency cho hook khác, `useCallback` có thể không mang lại lợi ích rõ ràng.

### 6. Lỗi thường gặp

#### 1. Lạm dụng memoization

`useMemo` và `useCallback` cũng có chi phí riêng. Nếu dùng quá nhiều, code sẽ khó đọc hơn mà performance chưa chắc tốt hơn.

Nên bắt đầu với code đơn giản trước. Khi thấy phép tính nặng, component con re-render nhiều, hoặc có vấn đề performance thật sự thì mới tối ưu.

#### 2. Dependency sai hoặc thiếu

```jsx
const handleSubmit = useCallback(() => {
  submitForm(formData);
}, []);
```

Ví dụ trên dùng `formData` nhưng dependency array lại rỗng. Function có thể giữ `formData` cũ.

Nên viết:

```jsx
const handleSubmit = useCallback(() => {
  submitForm(formData);
}, [formData]);
```

#### 3. Nghĩ useMemo luôn ngăn component re-render

`useMemo` chỉ ghi nhớ value. Nó không tự ngăn component re-render.

Nếu muốn tối ưu component con, thường cần kết hợp:

- `React.memo` cho component con.
- `useMemo` để giữ object/array prop ổn định.
- `useCallback` để giữ function prop ổn định.

#### 4. Truyền object hoặc array mới mỗi lần render

```jsx
<UserList filters={{ status: "active" }} />
```

Mỗi lần parent render, object `filters` mới được tạo. Nếu `UserList` dùng `React.memo`, prop này vẫn bị xem là thay đổi.

Có thể dùng `useMemo`:

```jsx
const filters = useMemo(() => {
  return { status: "active" };
}, []);

<UserList filters={filters} />;
```

### 7. File example

File example cho phần này:

```txt
ReactJS/Examples/usememo-usecallback.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- `useMemo` tính lại danh sách đã lọc và tổng tiền khi dependency đổi.
- `useCallback` giữ callback ổn định khi truyền xuống component con.
- `React.memo` giúp component con tránh re-render khi props không đổi.

### 8. Câu hỏi thường gặp

1. `useMemo` và `useCallback` khác nhau như thế nào?
   - `useMemo` ghi nhớ một value đã được tính. `useCallback` ghi nhớ một function reference.
2. Khi nào nên dùng `useMemo`?
   - Khi có phép tính tương đối nặng, hoặc cần giữ object/array reference ổn định để tránh re-render không cần thiết.
3. Khi nào nên dùng `useCallback`?
   - Khi cần giữ function reference ổn định, đặc biệt khi truyền callback xuống component con được tối ưu bằng `React.memo` hoặc khi function là dependency của hook khác.
4. Có nên dùng hai hook này ở mọi nơi không?
   - Không. Chỉ nên dùng khi có lý do rõ ràng vì memoization cũng có chi phí và làm code phức tạp hơn.
5. `useCallback(fn, deps)` có giống `useMemo(() => fn, deps)` không?
   - Về ý tưởng là gần giống nhau. `useCallback` là cách viết trực tiếp hơn khi thứ cần ghi nhớ là function.
