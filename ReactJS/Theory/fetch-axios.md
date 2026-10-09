# ReactJS Theory

## 16 — fetch / Axios; loading, error handling

### 1. fetch và Axios dùng để làm gì

- Cả 2 đều dùng để gọi API từ FE

#### 1. fetch

- Có sẵn trong trình duyệt

```js
const res = await fetch("/api/users/");
const data = await res.json();
```

#### 2. Axios

- Là một thư viện

```js
const res = await axios.get("/api/users");
console.log(res.data);
```

- Điểm nhớ nhanh là ` fetch -> built-in"` còn `Axios -> thư viên`
- Axios thường tiện hơn khi làm dự án lớn vì hỗ trợ config, interceptor, error handling dễ hơn.

### 2. Loading State

- Khi gọi API cần cho user biết dữ liệu đang được tải

```js
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

const fetchUsers = async () => {
  setLoading(true);

  const response = await fetch("/api/users");
  const data = await response.json();

  setUsers(data);
  setLoading(false);
};
```

- Ở UI

```js
if (loading) {
  return <p>Loading....</p>;
}
```

- Luồng lúc này sẽ là

```txt
request được gửi
-> loading = true
-> API trả về
-> Lưu dữ liệu
-> Loading = false
```

### 3. Error Handling

- API có thể thất bại nên phải xử lý lỗi. Ví dụ với fetch

```js
const [error, setError] = useState(null);

const fetchUsers = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    setUsers(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

- Điểm quan trọng là

```txt
try -> gọi API
catch -> xử lý lỗi
finally -> luôn chạy, thường dùng tắt loading
```

### 4. fetch có một điểm dễ nhầm

- Với fetch, HTTP lỗi như 404 hay 500 không nhất thiết tự nhảy vào catch. Nên thường phải kiểm tra

```js
if (!response.ok) {
  throw new Error("Request failed");
}
```

- Trong khi Axios thường reject Promise với các HTTP lỗi như 4xx,5xx nên đi vào catch

### 5. Ví dụ thực tế với useEffect

```js
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error("Failed to load users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return users.map((user) => <p key={user.id}>{user.name}</p>);
}
```

- Đây là flow khá phổ biến

```txt
mount
→ call API
→ loading
→ success hoặc error
→ render kết quả
```

### 6. Các câu hỏi hay gặp

#### 1. Sự khác nhau giữa fetch và Axios là gi?

- fetch được xây dựng trong trình duyệt trong khi Axios là 1 công cụ HTTP thứ 3. Axios cung cấp những tính năng như interceptors và nhiều thuận tiện cho việc request và kiểm soát lỗi

#### 2. Tại sao chúng ta cần state loading?

- Một loading state sẽ cho UI hiển thị rằng request đó đang trong qua trình và ngắn chặn user nghĩ rằng hệ thống không phản hồi

#### 3. Làm thế nào để bạn kiểm soát API lỗi trong React?

- Dùng try/catch,dự trữ lỗi bên trong state và hiển thị lỗi thích hợp trên UI

#### 4. Tại sao chúng ta kiểm tra response.ok khi sử dụng fetch?

- Bởi vì fetch không tự động reject promise cho lỗi HTTP như 404 hoặc 500 thế nên chúng ta cần kiểm tra trạng thái phải hồi thủ công
