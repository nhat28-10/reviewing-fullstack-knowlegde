# Password hashing với bcrypt

## 1. Vì sao phải hash password?

Password không được lưu plaintext trong database. Nếu database bị lộ, plaintext password có thể bị dùng ngay để đăng nhập và thử lại trên các dịch vụ khác.

Thay vào đó, server lưu **password hash**:

```text
Password người dùng
  → bcrypt.hash()
  → passwordHash
  → lưu passwordHash vào database
```

Khi đăng nhập, server dùng `bcrypt.compare(password, passwordHash)`. Không có bước “giải mã hash về password”.

| Hashing password | Encryption |
| --- | --- |
| Một chiều; không dùng để lấy lại password gốc. | Có thể giải mã bằng key phù hợp. |
| Dùng để xác minh password. | Dùng cho dữ liệu cần khôi phục plaintext. |
| Dùng thuật toán slow/adaptive như bcrypt, Argon2id, scrypt. | Không thay thế password hashing. |

Không dùng MD5, SHA-1, SHA-256 hay SHA-512 đơn thuần để lưu password: chúng quá nhanh, giúp attacker thử nhiều password hơn khi database bị lộ.

## 2. bcrypt là gì?

`bcrypt` là password hashing algorithm có **salt ngẫu nhiên** và **cost factor** có thể điều chỉnh. Trong Node.js:

```bash
npm install bcrypt
```

Hai API thường dùng:

| API | Mục đích |
| --- | --- |
| `bcrypt.hash(password, cost)` | Tạo hash để lưu. |
| `bcrypt.compare(password, hash)` | Kiểm tra password nhập vào có khớp hash đã lưu không. |

```js
const bcrypt = require("bcrypt");

async function demo() {
  const password = "MyPassword123!";
  const passwordHash = await bcrypt.hash(password, 12);
  const isMatch = await bcrypt.compare(password, passwordHash);

  console.log(isMatch); // true
}

demo().catch(console.error);
```

`hash()` tạo kết quả khác nhau cho cùng một password vì mỗi lần có salt mới. `compare()` đọc thông tin cần thiết từ chuỗi hash để xác minh.

## 3. Salt là gì?

Salt là dữ liệu ngẫu nhiên được kết hợp trong password hashing. Hai user dùng cùng password vẫn nhận hash khác nhau:

```text
User A: "123456" + salt A → hash A
User B: "123456" + salt B → hash B
```

Salt giúp chống precomputed/rainbow-table attack. Với bcrypt, salt và cost được đóng gói trong chuỗi hash; thường không cần cột salt riêng và không dùng fixed salt.

## 4. Cost factor và hiệu năng

Cost factor quyết định bcrypt tốn bao nhiêu công sức tính toán. Cost cao hơn làm brute-force khó hơn, nhưng cũng làm đăng ký/đăng nhập chậm hơn và tăng CPU usage server.

```js
const passwordHash = await bcrypt.hash(password, 12);
```

`12` chỉ là ví dụ. Hãy benchmark trên hạ tầng thật và chọn cost cân bằng giữa bảo mật, trải nghiệm người dùng và khả năng chống resource exhaustion. OWASP nêu bcrypt work factor tối thiểu 10 khi bcrypt là lựa chọn phù hợp.

Khi nâng cost, có thể re-hash password sau lần đăng nhập thành công tiếp theo. Không cần biết plaintext password cũ ngoài lần user vừa nhập để làm việc này.

## 5. bcrypt và giới hạn input

Nhiều implementation bcrypt chỉ sử dụng tối đa **72 bytes** input. Với Unicode, 72 bytes không đồng nghĩa 72 ký tự.

Khi dùng bcrypt trực tiếp, validate theo byte length:

```js
if (Buffer.byteLength(password, "utf8") > 72) {
  throw new Error("Password is too long for bcrypt");
}
```

Không tự “pre-hash rồi bcrypt” nếu chưa hiểu đầy đủ các rủi ro thiết kế. Nếu dự án mới có lựa chọn, cân nhắc Argon2id; nếu hệ thống đang dùng bcrypt, cấu hình cost và validation đúng là quan trọng.

## 6. Register và login đúng cách

### Register

1. Validate input, đặc biệt password length và định dạng email.
2. Kiểm tra email đã tồn tại.
3. Dùng `await bcrypt.hash(password, cost)`.
4. Chỉ lưu `passwordHash`.
5. Không log password/hash và không gửi hash về client.

```js
const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.create({
  data: {
    email,
    passwordHash,
  },
});
```

### Login

1. Lấy user theo email.
2. So sánh password với hash đã lưu bằng `await bcrypt.compare()`.
3. Trả thông báo chung `Invalid credentials` nếu email không tồn tại hoặc password không đúng.
4. Chỉ sau đó mới tạo session/token theo thiết kế ứng dụng.

```js
const isMatch = await bcrypt.compare(password, user.passwordHash);

if (!isMatch) {
  return res.status(401).json({ message: "Invalid credentials" });
}
```

## 7. Async API, HTTPS và phòng vệ bổ sung

- Dùng API bất đồng bộ `bcrypt.hash()`/`bcrypt.compare()` trong request handler. `hashSync()`/`compareSync()` có thể chặn event loop.
- Luôn dùng HTTPS/TLS để bảo vệ password khi truyền từ client đến server. Hash ở client không thay thế HTTPS; hash đó có thể trở thành một credential có thể replay.
- Áp dụng rate limit/throttling cho login để giảm password spraying và CPU exhaustion do bcrypt.
- Cân nhắc MFA, password reset an toàn, audit log và monitoring cho hệ thống thật.
- Pepper là lớp defence-in-depth tùy chọn; nếu dùng, lưu riêng trong secret manager/HSM, không cùng database với password hash.

## 8. Hiểu nhầm thường gặp

| Hiểu nhầm | Giải thích đúng |
| --- | --- |
| bcrypt mã hoá password rồi giải mã khi login | bcrypt tạo hash một chiều; login dùng `compare()`. |
| Cùng password luôn có hash giống nhau | Salt ngẫu nhiên làm hash thường khác nhau. |
| Hash password lần nữa rồi so sánh `===` | Sai vì salt khác; dùng `bcrypt.compare()`. |
| Lưu cả `password` và `passwordHash` cho chắc | Chỉ lưu hash; không lưu plaintext. |
| `hashSync()` phù hợp cho mọi API | Tránh dùng trong request path vì có thể block event loop. |
| Cost càng cao càng tốt | Cost quá cao làm login chậm và có thể tăng rủi ro DoS; cần benchmark. |
| bcrypt xử lý password dài vô hạn | Cần xét giới hạn 72 bytes của bcrypt. |

## 9. Ví dụ thực hành

Ví dụ Express ở [NodeJS/Example/password-hashing-bcrypt.js](../Example/password-hashing-bcrypt.js) dùng in-memory store để tập trung vào hash/compare:

- `POST /register`: hash password trước khi lưu.
- `POST /login`: so sánh password với hash đã lưu.
- `GET /users`: chỉ trả id/email, không trả password hash.

```bash
cd NodeJS
npm install
npm run start:bcrypt
```

Ví dụ curl:

```bash
curl -X POST http://localhost:3000/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"nhat@example.com\",\"password\":\"MyPassword123!\"}"
```

## 10. Câu hỏi ôn tập

### 1. bcrypt là gì?

Bcrypt là password hashing algorithm có salt ngẫu nhiên và cost factor điều chỉnh được. Nó dùng để lưu password verifier, không dùng để mã hoá/giải mã password.

### 2. Hashing khác encryption như thế nào?

Hashing password là một chiều và phục vụ xác minh; encryption có thể giải mã bằng key. Password nên được hash bằng password hashing algorithm thay vì lưu plaintext hoặc reversible encryption.

### 3. Salt trong bcrypt là gì?

Salt là giá trị ngẫu nhiên gắn với từng lần hash. Nó khiến cùng password có hash khác nhau và làm giảm hiệu quả của rainbow table. Bcrypt lưu salt cần thiết trong chuỗi hash.

### 4. bcrypt.hash() khác bcrypt.compare() như thế nào?

`hash()` tạo hash để lưu khi register/change password. `compare()` nhận password input và hash đã lưu, trả về boolean để xác minh login.

### 5. Vì sao ưu tiên API bcrypt bất đồng bộ trong Node.js?

Bcrypt tốn CPU. API async giúp main JavaScript thread không bị block trong lúc công việc hashing/compare đang được xử lý; điều này giúp server tiếp tục xử lý request khác.
