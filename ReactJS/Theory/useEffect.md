# ReactJS Theory

## 6. useEffect

### 1. useEffect là gì?

`useEffect` là React Hook dùng để chạy side effect sau khi component render.

Side effect là những việc tương tác với bên ngoài quá trình render UI thuần túy, ví dụ:

- Gọi API.
- Set timer.
- Thêm hoặc xóa event listener.
- Đồng bộ dữ liệu với `localStorage`.
- Kết nối hoặc hủy kết nối subscription.
- Cập nhật `document.title`.

Cú pháp cơ bản:

```jsx
import { useEffect } from "react";

useEffect(() => {
  console.log("Effect runs");
});
```

Điểm cần nhớ:

```txt
render UI
   ↓
React updates DOM
   ↓
useEffect runs
```

### 2. Dependency array

Dependency array quyết định khi nào effect chạy lại.

#### 1. Không truyền dependency array

Effect chạy sau mỗi lần render:

```jsx
useEffect(() => {
  console.log("Run after every render");
});
```

Cách này ít dùng hơn vì dễ gây chạy quá nhiều nếu không cần thiết.

#### 2. Dependency array rỗng

Effect chạy sau lần render đầu tiên:

```jsx
useEffect(() => {
  console.log("Component mounted");
}, []);
```

Thường dùng cho những logic chỉ cần setup một lần khi component mount, ví dụ gọi API lần đầu hoặc thêm event listener.

```jsx
useEffect(() => {
  fetchUsers();
}, []);
```

#### 3. Có dependency

Effect chạy sau lần render đầu tiên và chạy lại khi dependency thay đổi:

```jsx
useEffect(() => {
  console.log("userId changed");
}, [userId]);
```

Luồng:

```txt
component mount
+
userId changes
```

Ví dụ:

```jsx
useEffect(() => {
  fetch(`/api/users/${userId}`);
}, [userId]);
```

### 3. Cleanup trong useEffect

Effect có thể return một cleanup function.

Ví dụ timer:

```jsx
useEffect(() => {
  const timerId = setInterval(() => {
    console.log("Running");
  }, 1000);

  return () => {
    clearInterval(timerId);
  };
}, []);
```

Cleanup dùng để dọn resource khi:

- Component unmount.
- Hoặc trước khi effect chạy lại do dependency thay đổi.

Ví dụ event listener:

```jsx
useEffect(() => {
  function handleResize() {
    console.log(window.innerWidth);
  }

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

Luồng cần nhớ:

```txt
effect setup
     ↓
dependency changes or component unmounts
     ↓
cleanup old setup
     ↓
run new setup if needed
```

### 4. Ví dụ gọi API với useEffect

Khi gọi API, thường cần quản lý `loading`, `error` và `data`.

```jsx
import { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/users");
        const data = await response.json();

        setUsers(data);
      } catch (error) {
        setError("Cannot load users");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Không nên khai báo callback của `useEffect` là `async` trực tiếp:

```jsx
useEffect(async () => {
  const response = await fetch("/api/users");
}, []); // Không nên
```

Nên tạo async function bên trong effect rồi gọi nó:

```jsx
useEffect(() => {
  async function fetchUsers() {
    const response = await fetch("/api/users");
  }

  fetchUsers();
}, []);
```

### 5. Dependency array là phần quan trọng nhất

Có 3 dạng cần nhớ:

```jsx
useEffect(() => {
  // chạy sau mỗi render
});

useEffect(() => {
  // chạy sau render đầu tiên
}, []);

useEffect(() => {
  // chạy sau render đầu tiên và khi value thay đổi
}, [value]);
```

Ví dụ:

```jsx
const [count, setCount] = useState(0);

useEffect(() => {
  console.log(count);
}, [count]);
```

Mỗi lần `count` thay đổi, effect sẽ chạy lại.

Nếu effect dùng một biến từ component scope, thường biến đó nên nằm trong dependency array:

```jsx
useEffect(() => {
  console.log(userId);
}, [userId]);
```

### 6. useEffect không dùng để xử lý mọi logic

Không phải logic nào cũng cần `useEffect`.

Nếu có thể tính giá trị trực tiếp từ props/state, hãy tính trực tiếp trong render:

```jsx
function CartSummary({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <p>Total: {total}</p>;
}
```

Không cần tạo state và effect chỉ để tính `total`:

```jsx
function CartSummary({ items }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));
  }, [items]);

  return <p>Total: {total}</p>;
}
```

Ví dụ trên không cần thiết vì `total` có thể tính trực tiếp từ `items`.

### 7. Lỗi thường gặp

#### 1. Thiếu dependency

Sai:

```jsx
useEffect(() => {
  console.log(userId);
}, []);
```

Effect đang sử dụng `userId` nhưng dependency array không có `userId`. Cách thường đúng hơn:

```jsx
useEffect(() => {
  console.log(userId);
}, [userId]);
```

Nếu thiếu dependency, effect có thể dùng giá trị cũ.

#### 2. Gây vòng lặp vô hạn

Ví dụ:

```jsx
useEffect(() => {
  setCount(count + 1);
}, [count]);
```

Luồng:

```txt
count changes
     ↓
effect runs
     ↓
setCount
     ↓
count changes
     ↓
effect runs
     ↓
...
```

#### 3. Quên cleanup

Nếu thêm timer hoặc event listener mà không cleanup, component unmount rồi resource vẫn có thể còn chạy.

Sai:

```jsx
useEffect(() => {
  setInterval(() => {
    console.log("Running");
  }, 1000);
}, []);
```

Đúng:

```jsx
useEffect(() => {
  const timerId = setInterval(() => {
    console.log("Running");
  }, 1000);

  return () => {
    clearInterval(timerId);
  };
}, []);
```

#### 4. Dùng async trực tiếp cho effect callback

Không nên:

```jsx
useEffect(async () => {
  await fetchUsers();
}, []);
```

Nên:

```jsx
useEffect(() => {
  async function run() {
    await fetchUsers();
  }

  run();
}, []);
```

#### 5. Dùng useEffect thay cho event handler

Nếu logic xảy ra vì user click button, thường nên đặt trong event handler.

```jsx
function SaveButton() {
  function handleSave() {
    console.log("Save data");
  }

  return (
    <button type="button" onClick={handleSave}>
      Save
    </button>
  );
}
```

Không cần `useEffect` cho những logic gắn trực tiếp với event như vậy.

### 8. File example

File example cho phần này:

```txt
ReactJS/Examples/useEffect.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` từ file example để quan sát document title, timer cleanup, resize listener, dependency array và fake API loading/error/data.

### 9. Câu hỏi thường gặp

1. `useEffect` dùng để làm gì?
   - `useEffect` dùng để xử lý side effect trong React component như gọi API, timer, subscription, event listener hoặc đồng bộ với hệ thống bên ngoài component.
2. Dependency array rỗng `[]` có nghĩa là gì?
   - Effect chạy sau lần render đầu tiên và không chạy lại vì không theo dõi dependency nào.
3. Cleanup trong `useEffect` là gì?
   - Cleanup là function được return từ effect, dùng để dọn resource như timer, subscription hoặc event listener khi component unmount hoặc trước khi effect chạy lại.
4. Effect với `[value]` chạy khi nào?
   - Chạy sau lần render đầu tiên và chạy lại mỗi khi `value` thay đổi.
5. Có nên viết `useEffect(async () => {})` không?
   - Không nên. Hãy tạo async function bên trong effect rồi gọi function đó.
6. Có phải mọi logic đều nên đặt trong `useEffect` không?
   - Không. Nếu logic có thể tính trực tiếp từ props/state hoặc xảy ra do event của user, thường không cần `useEffect`.
