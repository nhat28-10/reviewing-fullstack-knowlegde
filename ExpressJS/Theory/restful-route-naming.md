# ExpressJS: RESTful Route Naming

## Mục lục

- [RESTful route naming là gì?](#restful-route-naming-là-gì)
- [Nguyên tắc đặt tên](#nguyên-tắc-đặt-tên)
- [CRUD routes trong ExpressJS](#crud-routes-trong-expressjs)
- [Quan hệ và action endpoints](#quan-hệ-và-action-endpoints)
- [Các lỗi thường gặp](#các-lỗi-thường-gặp)
- [Câu hỏi ôn tập](#câu-hỏi-ôn-tập)

## RESTful route naming là gì?

RESTful route naming là cách thiết kế URL API xoay quanh **resource** thay vì tên hàm hoặc hành động triển khai. Resource có thể là `users`, `products`, `orders` hoặc `families`.

HTTP method biểu thị ý định của request; URL path nhận diện resource. Vì vậy, với các thao tác CRUD thông thường, ưu tiên danh từ trong path.

| Thiết kế chưa tốt | Thiết kế theo resource |
| --- | --- |
| `GET /getUsers` | `GET /users` |
| `POST /createUser` | `POST /users` |
| `GET /getUser/10` | `GET /users/10` |
| `PATCH /updateUser/10` | `PATCH /users/10` |
| `DELETE /deleteUser/10` | `DELETE /users/10` |

> Đây là quy ước thiết kế phổ biến, không phải quy tắc bắt buộc của Express hoặc HTTP. Điều quan trọng nhất là API dễ hiểu và nhất quán.

## Nguyên tắc đặt tên

### 1. Ưu tiên danh từ số nhiều cho collection

Collection thường dùng danh từ số nhiều:

```text
/users
/products
/orders
/order-items
```

Tránh để lộ tên hàm hay cách triển khai nội bộ:

```text
/getAllUsers
/createProduct
/getProductsFromDatabase
```

Số nhiều không phải yêu cầu của HTTP, nhưng là quy ước dễ hiểu khi URL biểu diễn một tập resource.

### 2. Dùng ID cho resource cụ thể

```http
GET /products
GET /products/10
```

- `/products` biểu diễn collection sản phẩm.
- `/products/10` biểu diễn product có ID `10`.

Trong Express router:

```js
router.get("/", getProducts);
router.get("/:id", getProductById);
```

### 3. Dùng query string cho thao tác trên collection

Query parameters phù hợp cho filtering, pagination, sorting hoặc searching:

```http
GET /products?category=laptop
GET /products?page=2&limit=10
GET /products?sort=price&order=asc
GET /products?search=wireless
```

Không cần tạo endpoint riêng cho từng điều kiện như `/getProductsByCategory` hoặc `/getPage2Products`.

### 4. Dùng chữ thường và kebab-case

Chọn một convention rồi áp dụng xuyên suốt:

- Dùng chữ thường: `/products`.
- Dùng kebab-case cho nhiều từ: `/order-items`.
- Nhất quán giữa collection và nested resource: `/users/:userId/orders`.

### 5. Version API khi cần

Một quy ước phổ biến là version trong URL:

```text
/api/v1/products
```

Versioning có nhiều chiến lược; URL versioning chỉ là một lựa chọn. Không nhất thiết thêm version khi API nội bộ hoặc API chưa có nhu cầu compatibility rõ ràng.

## CRUD routes trong ExpressJS

Ví dụ Product API:

```js
const express = require("express");

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/", createProduct);
productRouter.patch("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

app.use("/api/v1/products", productRouter);
```

Từ đó có các endpoint:

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `GET` | `/api/v1/products` | Lấy danh sách products. |
| `GET` | `/api/v1/products/:id` | Lấy product cụ thể. |
| `POST` | `/api/v1/products` | Tạo product. |
| `PATCH` | `/api/v1/products/:id` | Cập nhật một phần product. |
| `DELETE` | `/api/v1/products/:id` | Xoá product. |

Tên controller như `getProducts`, `createProduct` hay `deleteProduct` hoàn toàn có thể dùng động từ. Quy ước ưu tiên danh từ chỉ áp dụng cho URL path, không áp dụng cho tên hàm.

## Quan hệ và action endpoints

### Quan hệ giữa resources

Nested route thể hiện quan hệ rõ ràng:

```http
GET /users/10/orders
```

Ý nghĩa: lấy orders thuộc user `10`. Tránh lồng quá sâu, vì API sẽ khó đọc và bảo trì. Khi quan hệ được dùng thường xuyên như một resource độc lập, `/orders?userId=10` cũng có thể phù hợp.

### Khi nào dùng action endpoint?

Không phải mọi nghiệp vụ đều là CRUD. Với một action không diễn đạt rõ bằng tạo/đọc/sửa/xoá resource, path có động từ có thể hợp lý:

```http
POST /auth/login
POST /auth/logout
POST /orders/15/cancel
```

Ví dụ `cancel` là một business action có side effect; nó không chỉ là “sửa một field”. API contract cần mô tả rõ action đó có thể gọi khi nào, quyền cần có và kết quả trả về.

Nếu action tạo một resource mới, hãy cân nhắc biểu diễn resource đó. Ví dụ `POST /orders/15/cancellations` có thể thích hợp khi cần lưu lịch sử hoặc thông tin huỷ đơn.

## Các lỗi thường gặp

| Hiểu nhầm | Cách hiểu đúng |
| --- | --- |
| URL phải diễn tả hành động bằng động từ | Với CRUD, HTTP method thường đã diễn tả hành động; URL nên nhận diện resource. |
| Mọi API bắt buộc dùng số nhiều | Không bắt buộc, nhưng số nhiều là quy ước phổ biến cho collections. |
| Cùng path không thể hỗ trợ nhiều methods | Có thể. Express chọn handler dựa trên cả method và path. |
| Filtering phải tạo endpoint mới | Thường dùng query string cho filtering/pagination/sorting. |
| Controller và URL phải có cùng tên | Không. Controller có thể đặt tên theo hành động. |
| REST cấm hoàn toàn động từ trong URL | Không. Action endpoint có thể phù hợp cho nghiệp vụ không phải CRUD. |

## Câu hỏi ôn tập

1. **RESTful route naming là gì?**  
   Là quy ước đặt URL API xoay quanh resources thay vì tên hành động/hàm.

2. **Vì sao CRUD URL ưu tiên danh từ?**  
   HTTP method đã mô tả ý định thao tác, còn path nên xác định resource.

3. **Vì sao collection thường dùng số nhiều?**  
   Đó là convention giúp biểu diễn tập resource rõ ràng và nhất quán.

4. **Thiết kế filtering và pagination thế nào?**  
   Dùng query parameters, ví dụ `GET /products?category=laptop&page=2`.

5. **Khi nào action endpoint hợp lý?**  
   Khi nghiệp vụ không diễn đạt rõ bằng CRUD, ví dụ `POST /orders/:id/cancel` hoặc `POST /auth/login`.

## Thực hành

Chạy ví dụ gồm RESTful product routes, filtering và order action tại [RESTful Route Naming Example](../Example/restful-route-naming-example.js).

## Tham khảo

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Azure API Design Best Practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
