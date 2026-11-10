# REST API & HTTP: Idempotent

## Mục lục

- [Idempotent là gì?](#idempotent-là-gì)
- [Idempotent không có nghĩa response giống nhau](#idempotent-không-có-nghĩa-response-giống-nhau)
- [HTTP methods nào idempotent?](#http-methods-nào-idempotent)
- [GET và các safe methods](#get-và-các-safe-methods)
- [POST thường không idempotent](#post-thường-không-idempotent)
- [PUT và DELETE](#put-và-delete)
- [PATCH có idempotent không?](#patch-có-idempotent-không)
- [Ví dụ với NestJS và Prisma](#ví-dụ-với-nestjs-và-prisma)
- [Retry và Idempotency-Key](#retry-và-idempotency-key)
- [Phân biệt idempotent, safe và stateless](#phân-biệt-idempotent-safe-và-stateless)
- [Những lỗi thường gặp](#những-lỗi-thường-gặp)
- [Thực hành](#thực-hành)
- [Câu hỏi ôn tập](#câu-hỏi-ôn-tập)

## Idempotent là gì?

Idempotent (tính lũy đẳng) nghĩa là gửi **cùng một request** nhiều lần có hiệu ứng mong muốn lên trạng thái server giống như gửi một lần.

Ví dụ đặt giá sản phẩm thành `20.000.000`:

```http
PUT /api/v1/products/10
Content-Type: application/json

{
  "name": "Laptop Dell",
  "price": 20000000
}
```

Giả sử API triển khai `PUT` đúng ngữ nghĩa thay thế:

| Số lần gửi cùng request | Giá sau request |
| --- | ---: |
| 1 | 20.000.000 |
| 2 | 20.000.000 |
| 3 | 20.000.000 |
| 10 | 20.000.000 |

Hiệu ứng cuối vẫn là “giá bằng `20.000.000`”, không phải mỗi lần tăng thêm `20.000.000`.

Ba điểm cần chú ý:

- Phải là **cùng request**; request khác payload không thuộc so sánh này.
- Idempotency nói về hiệu ứng mong muốn lên trạng thái server.
- Nó không yêu cầu server hoàn toàn không có side effect phụ như logging, metric hoặc audit.

## Idempotent không có nghĩa response giống nhau

Client gửi:

```http
DELETE /api/v1/users/10
```

Kết quả có thể là:

- Lần đầu: `204 No Content` — user được xóa.
- Lần sau: `404 Not Found` — user không còn tồn tại.

![DELETE được gọi nhiều lần](./img/ExampleDeleteWhenCalledAlot.png)

Response khác nhau nhưng trạng thái cuối giống nhau: user `10` không tồn tại. `DELETE` vẫn idempotent.

Response cũng có thể khác do:

- Timestamp/request ID mới.
- Dữ liệu bị một request khác cập nhật.
- Cache, rate limit hoặc trạng thái dependency.
- Lần đầu tạo/thay thế resource, lần sau chỉ xác nhận trạng thái đã có.

Idempotency không đảm bảo status code, headers hoặc body của mọi lần gọi giống hệt nhau.

## HTTP methods nào idempotent?

Theo HTTP semantics, các method chuẩn có đặc tính sau:

| Method | Safe? | Idempotent? | Ý nghĩa chính |
| --- | --- | --- | --- |
| `GET` | Có | Có | Đọc representation |
| `HEAD` | Có | Có | Lấy headers như GET, không có body |
| `OPTIONS` | Có | Có | Hỏi khả năng giao tiếp |
| `TRACE` | Có | Có | Diagnostic loop-back |
| `PUT` | Không | Có | Tạo/thay thế trạng thái tại URI đích |
| `DELETE` | Không | Có | Yêu cầu xóa resource |
| `POST` | Không | Không được đảm bảo | Xử lý payload theo semantics của resource |
| `PATCH` | Không | Không được đảm bảo | Áp dụng tập thay đổi |

`CONNECT` không được HTTP đảm bảo idempotent. Bài học thực tế thường tập trung vào `GET`, `POST`, `PUT`, `PATCH` và `DELETE`.

Đây là semantics mà client, proxy và server dựa vào. Nếu backend dùng `PUT` để “tăng stock thêm 1”, endpoint đó vi phạm kỳ vọng semantics của `PUT`.

## GET và các safe methods

`GET` chỉ yêu cầu đọc resource:

```http
GET /api/v1/products/10
```

Gửi nhiều lần không yêu cầu thay đổi application state, nên `GET` vừa **safe** vừa **idempotent**.

Response có thể thay đổi nếu resource bị request khác cập nhật giữa hai lần gọi. Điều đó không làm `GET` mất tính idempotent vì bản thân request GET không yêu cầu thay đổi resource.

Safe không có nghĩa server không được ghi bất kỳ thứ gì. Access log, metric hoặc cache vẫn có thể thay đổi; client chỉ không yêu cầu thay đổi application state.

Mọi safe method đều idempotent, nhưng method idempotent không nhất thiết safe. `PUT` và `DELETE` idempotent nhưng làm thay đổi resource.

## POST thường không idempotent

```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "Laptop Dell",
  "price": 20000000
}
```

Nếu server tạo resource mới mỗi lần:

| Request | Kết quả |
| --- | --- |
| Lần 1 | Product ID `10` |
| Lần 2 | Product ID `11` |
| Lần 3 | Product ID `12` |

`POST` không được HTTP đảm bảo idempotent. Tuy nhiên, một endpoint POST cụ thể có thể được thiết kế để chống xử lý trùng, ví dụ:

- Unique business key.
- Idempotency key.
- Deduplication ID từ message.
- Database constraint và transaction.

Đó là đảm bảo do API cung cấp thêm, không phải đặc tính mặc định của method `POST`.

## PUT và DELETE

### PUT

```http
PUT /api/v1/products/10
Content-Type: application/json

{
  "name": "Laptop Dell",
  "price": 20000000
}
```

Mỗi lần gửi đều hướng resource `10` đến cùng trạng thái. Server có thể trả `201` khi tạo ở lần đầu và `200`/`204` ở lần sau; hiệu ứng cuối vẫn giống nhau.

Trường do server quản lý như `updatedAt` có thể đổi mỗi lần. Điều này không nhất thiết phá idempotency nếu application state mà request yêu cầu vẫn giống nhau.

### DELETE

`DELETE /users/10` nhiều lần vẫn hướng đến trạng thái user `10` không tồn tại. Lần sau có thể trả `404`, nhưng hiệu ứng mong muốn không bị nhân đôi.

Không nên hiểu idempotent là client có thể gọi vô hạn mà không tốn tài nguyên hoặc không bị rate limit.

## PATCH có idempotent không?

`PATCH` không được đảm bảo idempotent; điều đó phụ thuộc patch document và logic server.

### PATCH có thể idempotent

```http
PATCH /api/v1/products/10
Content-Type: application/merge-patch+json

{
  "price": 20000000
}
```

Nếu semantics là đặt `price` bằng giá trị cố định, gửi lặp lại vẫn cho cùng trạng thái.

### PATCH không idempotent

```http
PATCH /api/v1/products/10/stock
Content-Type: application/json

{
  "incrementBy": 1
}
```

| Lần gọi | Stock |
| --- | ---: |
| Ban đầu | 10 |
| 1 | 11 |
| 2 | 12 |
| 3 | 13 |

Mỗi request tăng thêm một lần nên thao tác không idempotent.

Với JSON Patch, operation `replace` thường có thể idempotent, trong khi `add` vào array có thể không idempotent tùy path/document.

## Ví dụ với NestJS và Prisma

### PATCH đặt giá trị: có thể idempotent

```ts
@Patch(":id/price")
updatePrice(
  @Param("id", ParseIntPipe) id: number,
  @Body() dto: UpdatePriceDto,
) {
  return this.prisma.product.update({
    where: { id },
    data: { price: dto.price },
  });
}
```

Cùng `dto.price` tiếp tục đặt giá bằng cùng giá trị.

### PATCH tăng giá trị: không idempotent

```ts
@Patch(":id/stock")
increaseStock(
  @Param("id", ParseIntPipe) id: number,
  @Body() dto: IncreaseStockDto,
) {
  return this.prisma.product.update({
    where: { id },
    data: {
      stock: {
        increment: dto.incrementBy,
      },
    },
  });
}
```

Mỗi lần gọi tiếp tục tăng stock. Cần validation `incrementBy` và xử lý concurrent update theo yêu cầu nghiệp vụ.

## Retry và Idempotency-Key

Giả sử server xử lý payment thành công nhưng kết nối đứt trước khi client nhận response. Client không biết payment đã được tạo hay chưa.

Với operation vốn idempotent, retry cùng request thường giảm nguy cơ nhân đôi hiệu ứng. Tuy nhiên, client vẫn cần:

- Chỉ retry lỗi phù hợp.
- Dùng timeout và exponential backoff/jitter.
- Tôn trọng `Retry-After` nếu có.
- Giới hạn số lần retry.
- Không giả định mọi `4xx`/`5xx` đều nên retry.

Với `POST` tạo payment/order, API có thể hỗ trợ:

```http
POST /payments
Idempotency-Key: payment-attempt-8f30
Content-Type: application/json

{
  "orderId": "order-42",
  "amount": 500000
}
```

Thiết kế idempotency key nên:

1. Scope key theo user/tenant/endpoint phù hợp.
2. Lưu key cùng fingerprint của payload và kết quả.
3. Lặp lại cùng key + cùng payload: trả lại kết quả đã lưu.
4. Cùng key nhưng payload khác: từ chối, thường bằng `409 Conflict`.
5. Ghi nhận key và kết quả atomically để tránh hai request đồng thời cùng xử lý.
6. Có thời gian lưu/expire được ghi rõ trong API contract.

Chỉ thêm unique constraint vào `idempotencyKey` nhưng lưu sau khi side effect đã xảy ra có thể vẫn tạo race condition. Production thường cần transaction, unique constraint/lock và trạng thái `processing/completed/failed` phù hợp.

Không dùng key dễ đoán bị tái sử dụng giữa các operation; client thường tạo UUID hoặc giá trị entropy cao.

## Phân biệt idempotent, safe và stateless

| Khái niệm | Câu hỏi |
| --- | --- |
| Safe | Request có yêu cầu thay đổi application state không? |
| Idempotent | Gửi lặp cùng request có nhân đôi hiệu ứng mong muốn không? |
| Stateless | Server có phụ thuộc client session context giữa requests không? |

Ví dụ:

- `GET /products/10`: safe, idempotent, và có thể được xử lý stateless.
- `PUT /products/10`: không safe nhưng idempotent.
- `POST /orders`: thường không safe và không idempotent.
- Một endpoint có thể stateless nhưng vẫn không idempotent.

## Những lỗi thường gặp

| Hiểu nhầm | Cách hiểu đúng |
| --- | --- |
| Idempotent nghĩa response luôn giống nhau | Chỉ hiệu ứng mong muốn lên state cần giống nhau |
| DELETE lần hai trả 404 nên không idempotent | Trạng thái cuối vẫn là resource không tồn tại |
| PATCH luôn không idempotent | Patch đặt giá trị cố định có thể idempotent |
| POST không bao giờ có thể chống trùng | API có thể thêm idempotency key/deduplication |
| PUT tăng stock vẫn đúng semantics | Tăng mỗi lần vi phạm kỳ vọng idempotent của PUT |
| Idempotent đồng nghĩa safe | PUT/DELETE idempotent nhưng không safe |
| Idempotent đồng nghĩa stateless | Đây là hai thuộc tính khác nhau |
| Method idempotent thì retry vô hạn | Retry vẫn cần policy, backoff và giới hạn |
| Cùng idempotency key dùng payload nào cũng được | Payload khác cần bị phát hiện và từ chối |

## Thực hành

Chạy [ví dụ Idempotent](../Example/idempotent-example.js). Ví dụ dùng Node.js có sẵn để minh họa `PUT`, `DELETE`, PATCH đặt/tăng giá trị, `POST` thông thường tạo trùng và `POST /payments` chống xử lý lặp bằng `Idempotency-Key`.

## Câu hỏi ôn tập

1. **Idempotency trong HTTP là gì?**
   Gửi cùng request nhiều lần có hiệu ứng mong muốn lên trạng thái server giống gửi một lần.

2. **Idempotent có yêu cầu response giống nhau không?**
   Không. Status, headers hoặc body có thể khác; điều quan trọng là hiệu ứng mong muốn lên state.

3. **Những HTTP methods phổ biến nào idempotent?**
   `GET`, `HEAD`, `OPTIONS`, `PUT` và `DELETE` là idempotent; `POST` và `PATCH` không được đảm bảo.

4. **PATCH có thể idempotent không?**
   Có. Patch đặt giá trị cố định có thể idempotent; patch tăng/append thường không.

5. **Vì sao idempotency hữu ích khi retry?**
   Nó giảm nguy cơ cùng request bị xử lý lặp và nhân đôi hiệu ứng khi response bị mất.

6. **Idempotency-Key cần xử lý thế nào?**
   Lưu key cùng fingerprint/kết quả atomically; cùng key và payload trả kết quả cũ, payload khác phải bị từ chối.

7. **Idempotent khác stateless thế nào?**
   Idempotent nói về hiệu ứng khi lặp request; stateless nói về client session context giữa requests.
