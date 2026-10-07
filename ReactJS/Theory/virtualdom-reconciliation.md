# ReactJS Theory

## 12. Virtual DOM và Reconciliation

Virtual DOM và Reconciliation là hai khái niệm quan trọng để hiểu cách React cập nhật UI.

Ghi nhớ ngắn:

```txt
Virtual DOM     -> biểu diễn UI trong bộ nhớ
Reconciliation  -> quá trình so sánh UI cũ và UI mới
DOM update      -> cập nhật DOM thật khi cần thiết
```

Khi state/props/context thay đổi, React không sửa toàn bộ DOM thật ngay lập tức. React render lại component để tạo ra mô tả UI mới, so sánh với mô tả UI trước đó, rồi chỉ commit những thay đổi cần thiết xuống DOM thật.

### 1. Virtual DOM là gì?

Virtual DOM là cách nói phổ biến để chỉ một representation của UI trong bộ nhớ JavaScript.

Ví dụ JSX:

```jsx
function App() {
  return (
    <section>
      <h1>Hello React</h1>
      <p>Count: 0</p>
    </section>
  );
}
```

React có thể biểu diễn UI này dưới dạng các object JavaScript mô tả element type, props và children.

Có thể hình dung đơn giản:

```txt
section
  h1: "Hello React"
  p: "Count: 0"
```

Virtual DOM không phải DOM thật. Nó nhẹ hơn DOM thật và được React dùng để tính toán UI nên thay đổi như thế nào.

### 2. Khi state thay đổi thì điều gì xảy ra?

Ví dụ:

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section>
      <h1>Hello</h1>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </section>
  );
}
```

Khi `count` đổi từ `0` sang `1`, React tạo UI mới:

```txt
Before:
<h1>Hello</h1>
<p>Count: 0</p>

After:
<h1>Hello</h1>
<p>Count: 1</p>
```

React nhận ra:

```txt
<h1>Hello</h1>   -> không đổi
<p>Count: 0</p>  -> đổi thành <p>Count: 1</p>
```

Vì vậy React chỉ cần cập nhật phần text trong `<p>`, không cần tạo lại toàn bộ DOM.

Luồng đơn giản:

```txt
state changes
    |
component re-renders
    |
new UI description is created
    |
React compares old UI and new UI
    |
React updates only necessary real DOM parts
```

### 3. Reconciliation là gì?

Reconciliation là quá trình React so sánh cây UI cũ với cây UI mới để quyết định phần nào cần thay đổi.

Ví dụ trước khi update:

```jsx
<div>
  <h1>Hello</h1>
  <p>0</p>
</div>
```

Sau khi update:

```jsx
<div>
  <h1>Hello</h1>
  <p>1</p>
</div>
```

React so sánh và thấy:

```txt
div -> giống type
h1  -> giống type và nội dung không đổi
p   -> giống type nhưng text thay đổi
```

Kết quả: React chỉ cập nhật phần text trong `<p>`.

### 4. Render phase và Commit phase

Có thể chia quá trình cập nhật UI thành 2 phần dễ nhớ:

```txt
Render phase -> React tính UI mới và so sánh
Commit phase -> React áp dụng thay đổi vào DOM thật
```

Trong render phase:

- React gọi component.
- Component trả về JSX.
- React tạo mô tả UI mới.
- React reconciliation để tìm ra thay đổi.

Trong commit phase:

- React cập nhật DOM thật.
- React gắn/xóa/cập nhật node DOM khi cần.
- Browser sau đó paint UI lên màn hình.

Điểm cần nhớ:

```txt
Component re-render không luôn luôn đồng nghĩa với DOM thật bị update.
```

### 5. Diffing hoạt động theo type element

Khi so sánh cây UI, React quan tâm element type.

Nếu type giống nhau, React có thể giữ lại DOM node và cập nhật props/children cần thiết.

```jsx
<button className="primary">Save</button>
```

Đổi thành:

```jsx
<button className="danger">Delete</button>
```

React có thể giữ lại DOM node `<button>`, rồi cập nhật `className` và text.

Nếu type khác nhau, React thường bỏ cây cũ và tạo cây mới.

```jsx
<button>Save</button>
```

Đổi thành:

```jsx
<a href="/save">Save</a>
```

Vì type đổi từ `button` sang `a`, React xem đây là element khác.

### 6. Key liên quan gì tới Reconciliation?

Khi render list, `key` giúp React nhận diện item nào là item cũ, item nào mới, item nào bị xóa hoặc đổi vị trí.

Ví dụ tốt:

```jsx
users.map((user) => <UserCard key={user.id} user={user} />);
```

`key` ổn định giúp React reconciliation chính xác hơn:

```txt
item nào giữ nguyên
item nào được thêm
item nào bị xóa
item nào đổi vị trí
```

Nếu dùng `index` làm key cho list có thể thêm, xóa, sort hoặc filter, React có thể khớp nhầm item cũ với dữ liệu mới.

Không nên:

```jsx
users.map((user, index) => <UserCard key={index} user={user} />);
```

Nên dùng:

```jsx
users.map((user) => <UserCard key={user.id} user={user} />);
```

### 7. Virtual DOM và Reconciliation khác nhau thế nào?

| Khái niệm | Ý nghĩa | Cách nhớ |
| --- | --- | --- |
| Virtual DOM | Mô tả UI trong bộ nhớ | Thứ được React dùng để biểu diễn UI |
| Reconciliation | Quá trình so sánh UI cũ và UI mới | Cách React tìm ra phần cần thay đổi |
| DOM update | Áp dụng thay đổi vào DOM thật | Bước commit xuống browser |

Ghi nhớ:

```txt
Virtual DOM     = thứ được so sánh
Reconciliation  = quá trình so sánh
Commit          = cập nhật DOM thật
```

### 8. Virtual DOM có phải lúc nào cũng nhanh hơn DOM thật không?

Không nên hiểu máy móc rằng Virtual DOM luôn nhanh hơn mọi cách cập nhật DOM.

Ý tưởng chính của React là:

- UI được mô tả theo state.
- Khi state đổi, React tính UI mới.
- React tự quyết định thay đổi DOM thật tối thiểu cần thiết.
- Developer ít phải thao tác DOM thủ công.

Lợi ích lớn không chỉ là performance, mà còn là cách viết UI dễ dự đoán hơn:

```txt
state -> UI
```

Thay vì tự viết nhiều bước DOM manipulation thủ công.

### 9. Hiểu nhầm thường gặp

#### 1. React copy toàn bộ Virtual DOM xuống Real DOM

Không đúng.

React không copy toàn bộ Virtual DOM xuống DOM thật. React tính UI mới, reconciliation tìm ra thay đổi cần thiết, rồi commit thay đổi đó xuống DOM thật.

#### 2. Mỗi lần re-render đều update DOM thật

Không đúng.

Component có thể re-render, nhưng nếu kết quả UI không thay đổi ở DOM thật, React có thể không cần sửa DOM.

#### 3. Virtual DOM là DOM thật nằm trong memory

Không chính xác.

Virtual DOM là object/mô tả UI trong JavaScript memory. Nó không có đầy đủ API và behavior như DOM thật.

#### 4. Key chỉ dùng để tắt warning

Không đúng.

`key` giúp React reconciliation list chính xác hơn. Warning chỉ là dấu hiệu React nhắc mình cung cấp thông tin cần thiết.

#### 5. Dùng `Math.random()` làm key cho chắc unique

Không nên.

```jsx
items.map((item) => <Item key={Math.random()} item={item} />);
```

Mỗi lần render, key lại đổi. React sẽ xem item như phần tử mới, dễ làm mất state bên trong item và gây render không cần thiết.

### 10. File example

File example cho phần này:

```txt
ReactJS/Examples/virtualdom-reconciliation.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- State thay đổi làm React tính UI mới.
- DOM chỉ cần cập nhật phần text thay đổi.
- List với key ổn định giữ state item tốt hơn.
- Đổi key làm component remount và reset state.

### 11. Câu hỏi thường gặp

1. Virtual DOM là gì?
   - Virtual DOM là representation của UI trong bộ nhớ JavaScript, giúp React tính toán UI mới trước khi cập nhật DOM thật.
2. Reconciliation trong React là gì?
   - Reconciliation là quá trình React so sánh cây UI cũ với cây UI mới để xác định phần nào cần cập nhật.
3. Virtual DOM và Reconciliation khác nhau thế nào?
   - Virtual DOM là mô tả UI trong memory. Reconciliation là quá trình so sánh mô tả UI cũ và mới.
4. React có update toàn bộ DOM sau mỗi lần render không?
   - Không. React chỉ commit những thay đổi cần thiết xuống DOM thật.
5. Vì sao `key` quan trọng trong list?
   - `key` giúp React nhận diện item qua các lần render, từ đó xử lý thêm, xóa, đổi vị trí hoặc giữ nguyên item chính xác hơn.
6. Có nên dùng `index` làm key không?
   - Chỉ nên dùng khi list tĩnh, không thêm/xóa/sort/filter. Với list thay đổi, nên dùng id ổn định.
7. Có nên dùng `Math.random()` làm key không?
   - Không. Key thay đổi liên tục làm React xem item là mới ở mỗi lần render, có thể mất state và render lại không cần thiết.
