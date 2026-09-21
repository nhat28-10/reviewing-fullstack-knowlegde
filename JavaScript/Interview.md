### 1. What is hoisting in JavaScript?

- Hoisting là cơ chế JavaScript xử lý declaration trước khi thực thi code trong một scope. Với var, biến được hoist và initialized với undefined, nên truy cập trước declaration sẽ trả về undefined. let và const cũng được hoist nhưng nằm trong Temporal Dead Zone cho đến khi declaration được thực thi, nên truy cập trước đó sẽ gây ReferenceError.

### 2. What is Temporal Dead Zone?

- TDZ là khoảng thời gian từ lúc bắt đầu scope cho đến khi biến let hoặc const được khai báo và initialized. Trong khoảng đó biến không thể được truy cập.
