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
