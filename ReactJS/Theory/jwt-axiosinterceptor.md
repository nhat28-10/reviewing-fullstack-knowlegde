# ReactJS Theory

## 17. JWT phía frontend và Axios interceptor

JWT ở phía frontend thường được dùng để giữ trạng thái đăng nhập và gửi kèm thông tin xác thực khi gọi API cần bảo vệ.

Điểm quan trọng cần nhớ:

```txt
Frontend chỉ gửi token
Backend mới là nơi verify token và quyết định quyền truy cập
```

### 1. JWT phía frontend dùng để làm gì?

Sau khi đăng nhập thành công, backend thường trả về:

- `accessToken`: token sống ngắn, dùng để gọi API cần đăng nhập.
- `refreshToken`: token sống dài hơn, dùng để xin `accessToken` mới khi token cũ hết hạn.

Ví dụ gửi `accessToken` thủ công:

```jsx
axios.get("/api/profile", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

Luồng cơ bản:

```txt
User login
-> Backend trả token
-> Frontend lưu hoặc giữ token
-> Frontend gửi accessToken trong Authorization header
-> Backend verify token
-> Backend cho phép hoặc từ chối request
```

JWT có thể được decode ở frontend để đọc dữ liệu phục vụ UI, ví dụ `name`, `role` hoặc `exp`. Tuy nhiên, việc decode ở frontend không phải là kiểm tra bảo mật đáng tin cậy. Mọi quyền truy cập quan trọng vẫn phải được backend kiểm tra.

### 2. Axios interceptor là gì?

Axios interceptor cho phép chạy logic tập trung trước khi request được gửi đi hoặc sau khi response được trả về.

Có 2 loại thường dùng:

- Request interceptor: thêm token, thêm header chung, gắn `baseURL`, log request.
- Response interceptor: xử lý lỗi chung, bắt `401`, refresh token, normalize error.

### 3. Request interceptor để tự gắn token

Thay vì lặp lại `Authorization` header ở mọi API call, có thể tạo một Axios instance và gắn token bằng interceptor.

```jsx
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

Sau đó khi gọi API:

```jsx
api.get("/profile");
api.get("/users");
api.post("/orders", orderPayload);
```

Token sẽ được tự động thêm vào request nếu đang tồn tại.

### 4. Response interceptor để xử lý lỗi chung

Response interceptor thường dùng để xử lý lỗi lặp lại ở nhiều nơi, đặc biệt là `401 Unauthorized`.

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

Luồng phổ biến khi `accessToken` hết hạn:

```txt
API trả 401
-> Frontend gọi API refresh token
-> Backend trả accessToken mới
-> Frontend lưu accessToken mới
-> Frontend gửi lại request ban đầu
```

Ví dụ retry request một lần sau khi refresh token:

```jsx
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshRequest = originalRequest.url === "/auth/refresh";

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");
    const response = await axios.post("/auth/refresh", { refreshToken });
    const { accessToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    return api(originalRequest);
  },
);
```

`_retry` giúp tránh vòng lặp vô hạn nếu refresh token cũng lỗi hoặc token mới vẫn không hợp lệ.

### 5. Lưu token ở frontend

Không có nơi lưu token nào hoàn toàn miễn nhiễm rủi ro. Cách lưu phụ thuộc vào yêu cầu bảo mật và kiến trúc backend.

| Cách lưu | Ưu điểm | Rủi ro cần chú ý |
| --- | --- | --- |
| Memory | Khó bị đọc lại sau khi reload tab | Mất token khi refresh trang |
| `localStorage` | Dễ dùng, dễ debug | JavaScript đọc được, cần phòng XSS |
| `sessionStorage` | Tự mất khi đóng tab | JavaScript vẫn đọc được |
| HttpOnly cookie | JavaScript không đọc trực tiếp được | Cần xử lý CSRF tùy cách thiết kế |

Với dự án thực tế, nên thống nhất sớm:

- Token sống bao lâu.
- Refresh token được lưu ở đâu.
- Khi nào logout.
- Khi refresh token thất bại thì điều hướng người dùng thế nào.
- Backend kiểm tra quyền truy cập theo role/permission ra sao.

### 6. Lỗi hay gặp

#### 1. Gắn token thủ công ở mọi request

Không tối ưu:

```jsx
axios.get("/users", {
  headers: { Authorization: `Bearer ${token}` },
});

axios.get("/profile", {
  headers: { Authorization: `Bearer ${token}` },
});
```

Nên gom logic này vào request interceptor.

#### 2. Nghĩ frontend có thể verify JWT để bảo mật

Frontend có thể decode JWT để hiển thị UI phù hợp, nhưng backend vẫn phải verify chữ ký, hạn sử dụng và quyền truy cập.

#### 3. Không chặn retry vô hạn

Nếu response interceptor cứ gặp `401` là refresh và gọi lại request, app có thể bị vòng lặp vô hạn. Nên có cờ như `_retry` hoặc cơ chế giới hạn retry.

#### 4. Quên xử lý refresh token thất bại

Nếu refresh token hết hạn hoặc không hợp lệ, nên xóa token cũ và đưa user về màn hình đăng nhập.

```jsx
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
```

#### 5. Nhét quá nhiều business logic vào interceptor

Interceptor nên xử lý logic chung như token, refresh token, logging hoặc normalize error. Logic riêng của từng màn hình vẫn nên nằm ở service, hook hoặc component phù hợp.

### 7. File example

File example cho phần này:

```txt
ReactJS/Examples/jwt-axiosinterceptor.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Login và lưu token demo.
- Request interceptor tự gắn `Authorization` header.
- Response interceptor bắt `401`, refresh token và gửi lại request ban đầu.
- Logout và xóa token.

Để chạy example cần cài Axios:

```bash
npm install axios
```

### 8. Câu hỏi thường gặp

1. JWT trên frontend dùng để làm gì?
   - Frontend dùng `accessToken` để gửi kèm request đến API cần xác thực, thường qua `Authorization: Bearer <token>`.
2. Vì sao nên dùng request interceptor?
   - Để tự động gắn token vào request và tránh lặp code header ở từng API call.
3. Response interceptor thường dùng cho việc gì?
   - Xử lý lỗi chung như `401`, refresh token, logout hoặc điều hướng người dùng về trang đăng nhập.
4. Frontend có verify JWT được không?
   - Frontend có thể decode JWT để đọc dữ liệu phục vụ UI, nhưng verify bảo mật đáng tin cậy phải nằm ở backend.
5. Vì sao cần `_retry` khi refresh token?
   - Để request ban đầu chỉ được thử lại một lần, tránh vòng lặp vô hạn khi token không hợp lệ.
6. Nên lưu token ở đâu?
   - Không có câu trả lời đúng cho mọi dự án. `localStorage`, `sessionStorage`, memory và HttpOnly cookie đều có trade-off riêng.
