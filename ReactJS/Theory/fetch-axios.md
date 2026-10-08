# ReactJS Theory

## 16. fetch / Axios, loading và error handling

Trong React, `fetch` và `Axios` thường được dùng để gọi API từ frontend tới backend.

Ví dụ các việc thường làm:

```txt
GET danh sách users
POST form đăng nhập
PUT/PATCH cập nhật profile
DELETE một item
Gửi token trong headers
Xử lý loading, error và data
```

Ghi nhớ nhanh:

```txt
fetch -> API built-in của browser
Axios -> thư viện HTTP client bên ngoài
```

### 1. fetch là gì?

`fetch` là API có sẵn trong browser để gửi HTTP request.

Ví dụ gọi GET:

```jsx
async function getUsers() {
  const response = await fetch("/api/users");
  const data = await response.json();

  return data;
}
```

Khi dùng `fetch`, response trả về là một `Response` object. Nếu muốn lấy JSON body, cần gọi:

```jsx
const data = await response.json();
```

Ví dụ POST JSON:

```jsx
async function createUser(user) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();
  return data;
}
```

### 2. Axios là gì?

`Axios` là thư viện HTTP client. Muốn dùng Axios trong project React, thường cần cài thêm:

```bash
npm install axios
```

Ví dụ GET:

```jsx
import axios from "axios";

async function getUsers() {
  const response = await axios.get("/api/users");

  return response.data;
}
```

Ví dụ POST JSON:

```jsx
async function createUser(user) {
  const response = await axios.post("/api/users", user);

  return response.data;
}
```

Điểm tiện của Axios là request/response JSON thường ngắn gọn hơn, có `baseURL`, `timeout`, `interceptors` và cơ chế error handling thuận tiện.

### 3. So sánh fetch và Axios

| Tiêu chí             | fetch                                    | Axios                                   |
| -------------------- | ---------------------------------------- | --------------------------------------- |
| Có sẵn trong browser | Có                                       | Không, cần cài thư viện                 |
| Parse JSON response  | Cần `response.json()`                    | Có sẵn trong `response.data`            |
| HTTP status 404/500  | Không tự reject, cần check `response.ok` | Mặc định reject với status ngoài 2xx    |
| Timeout              | Cần tự xử lý bằng `AbortController`      | Có option `timeout`                     |
| Interceptors         | Không có sẵn                             | Có request/response interceptors        |
| Base URL             | Tự viết wrapper                          | Có thể dùng `axios.create({ baseURL })` |
| Bundle size          | Không tăng bundle                        | Tăng bundle vì thêm dependency          |

Chọn cái nào?

- Dùng `fetch` nếu muốn nhẹ, không thêm dependency và API call đơn giản.
- Dùng `Axios` nếu app có nhiều API, cần base URL, token, timeout, interceptors hoặc xử lý lỗi tập trung.

### 4. Loading, error và data

Khi gọi API trong React, thường cần ít nhất 3 state:

```jsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");
```

Luồng phổ biến:

```txt
request bắt đầu
    |
setIsLoading(true)
setError("")
    |
gọi API
    |
thành công -> setData(...)
thất bại  -> setError(...)
    |
finally -> setIsLoading(false)
```

Ví dụ:

```jsx
async function fetchUsers() {
  try {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();
    setUsers(users);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
}
```

### 5. Điểm dễ nhầm của fetch

Với `fetch`, HTTP status như `404` hoặc `500` không tự động nhảy vào `catch`.

Ví dụ:

```jsx
const response = await fetch("/api/users/unknown");
```

Nếu server trả `404`, request vẫn có thể resolve thành công ở tầng Promise. Vì vậy cần kiểm tra:

```jsx
if (!response.ok) {
  throw new Error(`HTTP error: ${response.status}`);
}
```

`response.ok` là `true` khi status nằm trong khoảng `200-299`.

Ghi nhớ:

```txt
fetch catch -> thường bắt network error hoặc lỗi bị throw thủ công
fetch 404/500 -> cần tự check response.ok
```

### 6. Error handling với Axios

Axios mặc định reject Promise nếu HTTP status nằm ngoài khoảng 2xx.

Ví dụ:

```jsx
try {
  const response = await axios.get("/api/users/unknown");
  setUser(response.data);
} catch (error) {
  if (error.response) {
    setError(`Server error: ${error.response.status}`);
  } else if (error.request) {
    setError("No response from server");
  } else {
    setError(error.message);
  }
}
```

Các case thường gặp:

```txt
error.response -> server có trả response, ví dụ 400/401/404/500
error.request  -> request đã gửi nhưng không nhận response
error.message  -> lỗi setup request hoặc lỗi khác
```

### 7. Gọi API trong useEffect

Gọi API khi component mount thường đặt trong `useEffect`.

```jsx
import { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
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

Không nên viết callback của `useEffect` thành `async` trực tiếp:

```jsx
useEffect(async () => {
  const response = await fetch("/api/users");
}, []);
```

Nên tạo async function bên trong effect rồi gọi nó.

### 8. Cleanup request với AbortController

Nếu component unmount khi request chưa xong, hoặc user đổi query liên tục, request cũ có thể không còn cần thiết.

Với `fetch`, có thể dùng `AbortController`:

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users", {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setError(error.message);
    }
  }

  fetchUsers();

  return () => {
    controller.abort();
  };
}, []);
```

Ý nghĩa:

```txt
component mount -> gọi API
component unmount -> abort request
```

### 9. Axios instance

Với app có nhiều API, nên tạo Axios instance để dùng chung config.

```jsx
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
```

Khi gọi:

```jsx
const response = await api.get("/users");
```

Lợi ích:

- Không lặp lại base URL.
- Cấu hình timeout một chỗ.
- Dễ thêm token vào headers.
- Dễ xử lý lỗi tập trung bằng interceptors.

### 10. Axios interceptors

Interceptors cho phép can thiệp trước khi request gửi đi hoặc sau khi response trả về.

Ví dụ thêm token:

```jsx
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

Ví dụ xử lý lỗi response:

```jsx
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized");
    }

    return Promise.reject(error);
  },
);
```

Interceptors hữu ích, nhưng không nên nhét mọi business logic vào đó. Nên dùng cho những logic chung như token, refresh token, logging hoặc normalize error.

### 11. POST, PUT/PATCH và DELETE

Với `fetch`, thường cần tự set method, headers và body.

```jsx
await fetch("/api/users/1", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Nhat",
  }),
});
```

Với Axios:

```jsx
await axios.patch("/api/users/1", {
  name: "Nhat",
});
```

DELETE:

```jsx
await fetch("/api/users/1", {
  method: "DELETE",
});

await axios.delete("/api/users/1");
```

### 12. Lỗi thường gặp

#### 1. Quên check response.ok khi dùng fetch

```jsx
const response = await fetch("/api/users");
const data = await response.json();
```

Nếu server trả `500`, đoạn code trên vẫn có thể chạy tới `response.json()`. Nên check:

```jsx
if (!response.ok) {
  throw new Error("Failed to fetch users");
}
```

#### 2. Quên set loading false trong finally

Nếu chỉ set loading false trong block thành công, khi API lỗi UI có thể bị kẹt ở trạng thái loading.

Nên dùng:

```jsx
finally {
  setIsLoading(false);
}
```

#### 3. Gọi API trực tiếp trong render

Không nên:

```jsx
function Users() {
  fetch("/api/users");

  return <p>Users</p>;
}
```

Mỗi lần render có thể gọi API lại. Nên gọi trong event handler, `useEffect`, hoặc data fetching layer phù hợp.

#### 4. Không xử lý component unmount

Request cũ có thể trả về sau khi component không còn cần dữ liệu. Với `fetch`, có thể dùng `AbortController`. Với Axios bản mới, cũng có thể dùng `signal`.

#### 5. Không phân biệt lỗi server và lỗi network

Nên hiển thị message phù hợp:

```txt
server error -> API trả 400/401/500
network error -> mất mạng, CORS, server không phản hồi
```

#### 6. Lưu token sai chỗ hoặc gửi token thiếu kiểm soát

Nếu gửi token trong header, nên có chiến lược rõ ràng về lưu trữ, refresh token, logout và xử lý `401`. Phần này thường phụ thuộc vào backend và yêu cầu bảo mật của app.

### 13. File example

File example cho phần này:

```txt
ReactJS/Examples/fetch-axios.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Gọi API bằng `fetch`.
- Gọi API bằng `axios`.
- Quản lý loading, error và data.
- Retry request.
- POST dữ liệu demo.

Nếu chạy phần Axios, cần cài:

```bash
npm install axios
```

### 14. Câu hỏi thường gặp

1. `fetch` và Axios khác nhau chính ở đâu?
   - `fetch` là API built-in của browser, còn Axios là thư viện HTTP client. Axios có nhiều tiện ích hơn như `response.data`, `timeout`, `baseURL` và interceptors.
2. Vì sao dùng `fetch` cần check `response.ok`?
   - Vì `fetch` không tự reject Promise khi server trả HTTP error như `404` hoặc `500`.
3. Axios có tự parse JSON không?
   - Có. Dữ liệu response thường nằm trong `response.data`.
4. Khi gọi API trong React cần state gì?
   - Thường cần `data`, `isLoading` và `error`.
5. Có nên gọi API trực tiếp trong render không?
   - Không. Nên gọi trong `useEffect`, event handler hoặc một data fetching layer phù hợp.
6. Khi nào nên dùng Axios?
   - Khi app có nhiều API và cần cấu hình chung như base URL, timeout, token, interceptors hoặc xử lý lỗi tập trung.
