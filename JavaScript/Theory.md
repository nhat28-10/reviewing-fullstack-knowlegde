# JavaScript Theory

## 1. Variables: var, let, const

### Ý chính

- `var` có function scope.
- `let` và `const` có block scope.
- `const` không cho gán lại biến, nhưng object/array bên trong vẫn có thể mutate.

### Khi nào dùng?

- Mặc định dùng `const`.
- Dùng `let` khi cần gán lại.
- Hạn chế dùng `var`.

### Ví dụ

Xem: `./Examples/variable.js`

### Câu hỏi dễ gặp

- Khác nhau giữa `var`, `let`, `const`?
- Hoisting là gì?
- Temporal Dead Zone là gì?

## 2. Scope: Block,Function,Global

### Ý chính

- `scope`: Scope giúp xác định một biến có thể truy cập được ở đâu trong chương trình
- JavaScript dùng `lexical scope`, nghĩa là scope được xác định dựa trên vị trí viết code
- Scope bên trong có thể truy cập biến ở scope bên ngoài
- Scope bên ngoài không thể truy cập biến được khai báo bên trong scope con.

### Các loại Scope

- `Global Scope`: Biến được khai báo ở ngoài function/block
- `Function Scope`: Biến khai báo trong function chỉ dùng trong function đó
- `Block Scope`: Phạm vị nằm trong `{}` ví dụ `if, for, while`\
- `var` có function scope, không có block scope
- `let và const` có block scope

### Ví dụ

- Xem: `.Examples/scope.js`

### Lưu ý

- Khi tìm biến, JavaScript sẽ tìm từ scope gần nhất ra scope bên ngoài
- Nếu không tìm thấy biến ở bất kỳ scope nào thì sẽ báo `ReferenceError`
- Tránh lạm dụng biến global vì dễ bị ghi đè hoặc khó kiểm soát

### Shadowing

- Shadowing xảy ra khi biến ở scope bên trong trùng tnee với biến ở scope bên ngoài

```js
const name = "Nhat";

function test() {
  const name = "John";
  console.log(name);
}

test(); // John => Kết quả là "John" vì JavaScript ưu tiên biến ở scope gần nhất.
```

#### Câu hỏi dễ gặp

- Scope trong JavaScript dùng để làm gì?
- Global Scope, function scope, block scope khác nhau thế nào
- Vì sao `var` trong block vẫn có thể truy ngoài ngoài block?
- Shadowing là gì
- Lexical Scope là gì?
