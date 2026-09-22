### 1. What is hoisting in JavaScript?

- Hoisting là cơ chế JavaScript xử lý declaration trước khi thực thi code trong một scope. Với var, biến được hoist và initialized với undefined, nên truy cập trước declaration sẽ trả về undefined. let và const cũng được hoist nhưng nằm trong Temporal Dead Zone cho đến khi declaration được thực thi, nên truy cập trước đó sẽ gây ReferenceError.

### 2. What is Temporal Dead Zone?

- TDZ là khoảng thời gian từ lúc bắt đầu scope cho đến khi biến let hoặc const được khai báo và initialized. Trong khoảng đó biến không thể được truy cập.

### 3. Primitive type và reference type khác nhau như thế nào?

- Primitive values được copy theo giá trị, nên thay đổi biến mới không ảnh hưởng biến ban đầu. Với object, array hoặc function, các biến có thể cùng tham chiếu đến một object, nên thay đổi object qua một reference có thể được nhìn thấy qua reference khác.
- Với `null` vs `undefined` thì nói `undefined`thường xuất hiện khi một biến hoặc property chưa có giá trị, còn `null` thường được developer chủ động dùng để biểu diễn việc không có giá trị.

### 4. What is the difference between == and ===?

- `==` uses loose equality and can perform type coercion before comparing values, while `===` uses strict equality and compares without that coercion. In most cases I prefer `===` because its behavior is more predictable.

### 5. What is the difference between Truthy and Falsy?

- `Truthy` and `Falsy` describe how JavaScript treats values in a boolean context. Values like `0, empty string, null, undefined, NaN, and false` are falsy, while values such as non-empty strings, arrays, and objects are truthy.
