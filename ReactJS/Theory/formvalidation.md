# ReactJS Theory

## 15. Form validation

Form validation là quá trình kiểm tra dữ liệu user nhập vào form có hợp lệ hay không trước khi xử lý hoặc gửi lên server.

Ví dụ các rule thường gặp:

```txt
name không được rỗng
email phải đúng định dạng
password phải có ít nhất 8 ký tự
confirm password phải giống password
age phải lớn hơn hoặc bằng 18
terms phải được tick trước khi submit
```

Trong React, validation thường đi cùng controlled form vì React state đang giữ giá trị input, nên ta có thể kiểm tra và hiển thị lỗi dựa trên state.

### 1. Form validation là gì?

Ví dụ validate khi submit:

```jsx
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setError("Email is invalid");
      return;
    }

    setError("");
    console.log("Submit:", email);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      {error && <p>{error}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

Luồng chính:

```txt
User submit form
    |
preventDefault()
    |
validate dữ liệu
    |
Nếu lỗi -> lưu error và hiển thị cho user
Nếu hợp lệ -> xử lý tiếp hoặc gọi API
```

### 2. Validate khi nào?

Có nhiều thời điểm để validate form.

| Thời điểm  | Cách làm                                                           | Phù hợp khi                               |
| ---------- | ------------------------------------------------------------------ | ----------------------------------------- |
| Khi submit | Chỉ validate trong `handleSubmit`                                  | Form đơn giản, không muốn báo lỗi quá sớm |
| Khi nhập   | Validate trong `onChange` hoặc tính lỗi từ state                   | Cần feedback realtime                     |
| Khi blur   | Validate trong `onBlur`                                            | Muốn báo lỗi sau khi user rời khỏi field  |
| Kết hợp    | Dùng `touched` hoặc `submitted` để quyết định khi nào hiển thị lỗi | Form nhiều field, UX tốt hơn              |

Không phải lúc nào cũng nên hiện lỗi ngay từ ký tự đầu tiên. Ví dụ user vừa focus vào email mà đã hiện "Email is required" thì UX có thể hơi khó chịu.

Một pattern phổ biến:

```txt
validate data luôn có thể chạy
nhưng chỉ hiển thị lỗi khi field đã touched hoặc user đã submit
```

### 3. Quản lý errors bằng object

Với form có nhiều field, nên lưu error bằng object thay vì một string duy nhất.

Ví dụ:

```jsx
const [form, setForm] = useState({
  email: "",
  password: "",
});

const [errors, setErrors] = useState({});
```

Function validate:

```jsx
function validateForm(values) {
  const nextErrors = {};

  if (!values.email.trim()) {
    nextErrors.email = "Email is required";
  } else if (!values.email.includes("@")) {
    nextErrors.email = "Email is invalid";
  }

  if (!values.password) {
    nextErrors.password = "Password is required";
  } else if (values.password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters";
  }

  return nextErrors;
}
```

Khi submit:

```jsx
function handleSubmit(event) {
  event.preventDefault();

  const nextErrors = validateForm(form);
  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    return;
  }

  console.log("Submit:", form);
}
```

Ghi nhớ:

```txt
errors object rỗng -> form hợp lệ
errors object có key -> form đang có lỗi
```

### 4. Touched fields

`touched` dùng để biết user đã tương tác với field nào. Nhờ đó ta có thể tránh hiển thị lỗi quá sớm.

Ví dụ:

```jsx
const [touched, setTouched] = useState({});

function handleBlur(event) {
  const { name } = event.target;

  setTouched((currentTouched) => ({
    ...currentTouched,
    [name]: true,
  }));
}
```

Khi render lỗi:

```jsx
{
  touched.email && errors.email && <p>{errors.email}</p>;
}
```

Ý nghĩa:

```txt
Field chưa touched -> chưa hiển thị lỗi
Field đã touched và có error -> hiển thị lỗi
```

Ngoài `touched`, ta cũng có thể dùng state như `isSubmitted` để sau lần submit đầu tiên thì hiển thị tất cả lỗi.

### 5. Disable submit button

Có thể disable button khi form chưa hợp lệ.

```jsx
const errors = validateForm(form);
const canSubmit = Object.keys(errors).length === 0;

return (
  <button type="submit" disabled={!canSubmit}>
    Submit
  </button>
);
```

Nhưng cần cẩn thận:

- Disable button giúp UX rõ hơn, nhưng không thay thế validation trong `handleSubmit`.
- Vẫn phải validate lại khi submit vì state có thể thay đổi hoặc logic có thể bị gọi bằng cách khác.
- Nên cho user biết vì sao button bị disabled, ví dụ hiển thị lỗi dưới field.

### 6. Native HTML validation

HTML có sẵn một số validation attribute:

```jsx
<input type="email" required minLength={8} />
```

Các attribute thường gặp:

- `required`: bắt buộc nhập.
- `minLength`: độ dài tối thiểu.
- `maxLength`: độ dài tối đa.
- `min`, `max`: giá trị nhỏ nhất/lớn nhất cho number/date.
- `pattern`: regex pattern.
- `type="email"`: kiểm tra định dạng email cơ bản.

Nếu muốn tự kiểm soát toàn bộ UI lỗi bằng React, có thể thêm `noValidate` vào form để tắt popup validation mặc định của browser.

```jsx
<form noValidate onSubmit={handleSubmit}>
  ...
</form>
```

Native validation tiện cho form đơn giản, nhưng custom validation bằng React linh hoạt hơn khi cần message riêng, rule phức tạp, hoặc UI lỗi theo design system.

### 7. Client validation không thay thế backend validation

Frontend validation giúp:

- UX tốt hơn.
- Báo lỗi nhanh hơn.
- Tránh request không cần thiết.
- Giúp user sửa dữ liệu trước khi gửi.

Nhưng backend vẫn phải validate lại. Không nên nghĩ rằng "frontend đã validate rồi nên backend có thể tin dữ liệu".

Lý do:

- User có thể tắt JavaScript.
- Request có thể được gửi trực tiếp bằng tool khác.
- Client-side validation có thể bị bypass.
- Dữ liệu gửi lên API luôn cần được bảo vệ ở backend.

Ghi nhớ:

```txt
Frontend validation -> UX
Backend validation  -> security + data integrity
```

### 8. React Hook Form là gì?

React Hook Form là thư viện giúp quản lý form state và validation trong React với ít code thủ công hơn.

Ví dụ:

```jsx
import { useForm } from "react-hook-form";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  function onSubmit(data) {
    console.log(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: "Email is invalid",
          },
        })}
      />

      {errors.email && <p>{errors.email.message}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

React Hook Form hữu ích khi:

- Form có nhiều field.
- Cần giảm boilerplate state.
- Cần quản lý error, touched, dirty, submit state.
- Cần tích hợp với schema validation như Zod.

### 9. Zod là gì?

Zod là thư viện schema validation. Ta định nghĩa rule dữ liệu bằng schema, sau đó dùng schema đó để validate.

Ví dụ:

```jsx
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

Ý nghĩa:

```txt
email phải là email hợp lệ
password phải có ít nhất 8 ký tự
```

Zod giúp tách validation rule khỏi JSX, dễ tái sử dụng giữa nhiều form. Trong app thực tế, Zod thường được kết hợp với React Hook Form qua resolver.

### 10. Lỗi thường gặp

#### 1. Chỉ validate ở frontend

Sai tư duy:

```txt
Frontend đã validate rồi, backend không cần validate nữa
```

Backend vẫn phải validate lại vì dữ liệu từ client không đáng tin tuyệt đối.

#### 2. Có validation nhưng không hiển thị error

Nếu validation fail mà không báo lỗi rõ ràng, user sẽ không biết cần sửa gì.

Nên hiển thị error gần field liên quan:

```jsx
{
  errors.email && <p>{errors.email}</p>;
}
```

#### 3. Error message quá chung chung

Không nên chỉ hiện:

```txt
Invalid input
```

Nên cụ thể hơn:

```txt
Email is required
Password must be at least 8 characters
```

#### 4. Validation rule nằm rải rác

Nếu form lớn mà rule nằm lẫn trong JSX, code sẽ khó maintain. Có thể tách ra function `validateForm`, custom hook, hoặc schema như Zod.

#### 5. Quên clear error

Sau khi user sửa đúng dữ liệu, nên cập nhật hoặc xóa lỗi tương ứng để UI không giữ error cũ.

#### 6. Validate quá sớm

Hiển thị lỗi ngay khi user chưa tương tác có thể làm trải nghiệm khó chịu. Nên cân nhắc `touched`, `dirty`, hoặc `submitted`.

### 11. File example

File example cho phần này:

```txt
ReactJS/Examples/formvalidation.jsx
```

Nếu đặt file này vào một project React như Vite, có thể render component `App` để quan sát:

- Validate khi submit.
- Validate realtime dựa trên state.
- Quản lý `errors` bằng object.
- Dùng `touched` để tránh hiện lỗi quá sớm.
- Disable submit button khi form chưa hợp lệ.

### 12. Câu hỏi thường gặp

1. Form validation là gì?
   - Là quá trình kiểm tra dữ liệu user nhập có đúng yêu cầu hay không trước khi xử lý hoặc gửi lên server.
2. Validate trên frontend có đủ không?
   - Không. Frontend validation cải thiện UX, nhưng backend vẫn phải validate lại để đảm bảo bảo mật và tính đúng đắn của dữ liệu.
3. Nên validate khi nào?
   - Tùy UX. Có thể validate khi submit, khi nhập, khi blur, hoặc kết hợp với `touched`/`submitted`.
4. Vì sao nên lưu errors bằng object?
   - Vì form thường có nhiều field, mỗi field có thể có một lỗi riêng. Object giúp hiển thị lỗi đúng vị trí.
5. React Hook Form là gì?
   - Là thư viện quản lý form và validation trong React, giúp giảm code thủ công cho form lớn.
6. Zod là gì?
   - Là thư viện schema validation giúp định nghĩa rule dữ liệu rõ ràng và có thể tái sử dụng.
