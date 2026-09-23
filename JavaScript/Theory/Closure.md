# JavaScript Theory

## Closure trong JavaScript

- Là một function có thể tiếp tục truy cập các biến ở scope bên ngoài, ngay cả sau khi function bên ngoài đã chạy xong

### 1. Hiểu đơn giản trước

- Ví dụ

```js
    function outer() {
        const name = "Nhật"

        function inner() {
            console.log(name);
        }
        return inner;
    }
    const fn = outer();
    fn(); => Output là Nhật

    - Điều đáng chú ý là: outer() đã chạy xong rồi. Nhưng function inner() vẫn nhớ được const name = "Nhật". Đó chính là closure
    - Sau khi const fn = outer(), fn chính là function inner. Khi chạy fn() nó vẫn truy cập được name
```

### 2. Giải thích kỹ thuật

- JavaScript sử dụng `lexical scope`. Điều này có nghĩa: Function có thể truy cập các biến dựa trên nơi function được khai báo trong code

- Ví dụ

```js
function outer() {
  const age = 22;

  function inner() {
    console.log(age);
  }
  return inner;
}

- inner() được khai báo bên trong outer(), vì vậy nó có quyền truy cập vào: age
- Điều đặc biệt của closure là quyền truy cập đó vẫn được giữ lại khi function được trả ra ngoài
const fn = outer()
fn() -> Vì vậy có thể nói "A closure is created when a function members variables from its lexical scope even after the outer function has finished executing"
```

### 3. Closure không phải chỉ là nested function

- Đây là điểm dễ hiểu nhầm. Closure có nested function

```js
function outer() {
  const x = 10;

  function inner() {
    console.log(x);
  }
  // inner();

}
const fn = outer();
fn()

- inner truy cập được x. Nhưng closure trở nên rõ nhất khi function đó sống lâu hơn outer function
- outer() đã kết thúc nhưng x vẫn được giữ để inner() sử dụng
```

### 4. Ví dụ closure phổ biến nhất: Counter

```js
function createCounter() {
    let count = 0
    return function () {
        count++;
        return count;
    };
}
const counter = createCounter();
console.log(counter())
console.log(counter())
=> Output là 1 2 và tại sao count không reset về 0?. Bởi vì const counter = createCounter(); tạo ra một closure giữ reference đến biến count. nên mỗi lần counter() nó sử dụng lại count trước đó
- Luồng:createCounter() | count = 0 -> return function -> counter() -> count = 1 | count = 2
```

### 5. Một điểm rất quan trọng: mỗi closure có state riêng

```js
function createCounter() {
  let count = 0;
  return () => {
    count++;
    return count;
  };
}
const counter1 = createCounter();
const counter2 = createCounter();
console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1

- Tại sao counter2() lại là 1? Là bởi vì createCounter() được gọi 2 lần. Mỗi lần tạo ra 1 lexical enviroment riêng. counter1 -> count riêng = 2 & counter 2 -> count riêng = 1
- Hai closure không dùng chung count
```

### 6. Closure có ích gì trong thực tế

- Một use case rất phổ biến là private state

```js
function createUser() {
    let pasword = '123456'
    return {
        checkPassword(input) {
            return input === pasword;
        },
        changePassword(newPassword) {
            password = newPassword
        }
    }
}
const user = createUser();

- Bên ngoài không truy cập trực tiếp được console.log(user.password) => kết quả là undefined
- Nhưng có thể
console.log(user.checkPassword('123456')); // true
user.changePassword('abcdef');
console.log(user.checkPassword('abcdef')) // true
- Biến password được giữ lại bởi closure nhưng không expose trực tiếp ra bên ngoài
```

### 7. Ví dụ backend thực tế

- Giả sử bạn muốn tạo một logger có prefix riêng cho từng service

```js
function createrLogger(serviceName) {
    return function(message) {
        console.log(`[{serviceName}] ${message}`)
    }
}
const userLogger = createrLogger("UserService");
const authLogger = createLogger("AuthService");

userLogger("User created")
authLogger("Login successful");

Output
[UserService] User created
[AuthSerive] Login successful
- Ở đây userLogger nhớ serviceName ="UserService" còn authLogger nhớ serviceName = "AuthService" => Đây là closure
```

- Trong backend có thể dùng concept này để tạo
  - Logger configuration
  - middleware factory
  - validation factory
  - permission checker
  - API client có config riêng

### 8. Ví dụ middle gần với Express

```js
function requireRole(role) {
    return function(req,res,next) {
        if(req.user.role !== role) {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }
        next();
    }
}
Dùng: app.get("/admin",requireRole("ADMIN"),adminController)
Khi chạy: requireRole("ADMIN")
Function bên trong nhớ: role = "ADMIN". Sau này khi request tới req.user.role !== role. Nó vẫn truy cập được role. Đây là một ví dụ trong backend
```

### 9. Ví dụ trong Frontend

- Closure xuất hiện rất nhiều trong event handler

```js
function createButtonHandler(username) {
  return function () {
    console.log(`Hello ${username}`);
  };
}

const handleClick = createButtonHandler("Nhật");

button.addEventListener("click", handleClick);
Sau khi: createButtonHandler() đã chạy xong, khi user click sau vài giây hoặc vài phút thì handler vẫn nhớ: username = "Nhật" => Đó là closure
```

### 10. Closure với setTimeout

- Ví dụ

```js
function greetLater(name) {
  setTimeout(() => {
    console.log(`Hello ${name}`);
  }, 1000);
}

greetLater("Nhật");
Sau 1 giây: Hello Nhật. Function greetLater() đã kết thúc từ lâu trước khi callback chạy. Nhưng arrow callback vẫn truy cập được name. Vì đó là closure
```

### 11. Closure giữ biến, không phải "copy giá trị lúc tạo"

- Đây là một điểm hơi dễ nhầm

```js
function outer() {
  let value = 1;

  const inner = () => {
    console.log(value);
  };

  value = 10;

  return inner;
}

const fn = outer();

fn(); => Output là 10 không phải 1. Vì Closure truy cập tới biến value trong lexical enviroment. Sau khi value = 10 thì function thấy giá trị mới.
```

- Bạn tạm hiểu là: Closure giữ khả năng truy cập tới biến, chứ không đơn giản chụp 1 bản copy của giá trị tại thời điểm function được tạo

### 12. Lỗi thường gặp: Nghĩ biến bị reset

- Ví dụ

```js
function createCounter() {
    let count = 0;

    return () => ++count;
}

const counter = createCounter();

console.log(counter());
console.log(counter());
Bạn nghĩ log ra là 1 1 vì tưởng mỗi lần gọi counter() thì let count = chạy lại. Nhưng không phải createCounter() chỉ chạy 1 lần: const counter = createCounter(). Sau đó bạn chỉ gọi function được return ra
=> Output là 1 và 2
```

### 13. Nhưng nếu gọi outer function lại thì sao?

- So sánh

```js
function createCounter() {
  let count = 0;

  return () => ++count;
}
```

- Trường hợp A:

```js
const counter = createCounter();

console.log(counter());
console.log(counter());
Output: 1 | 2. Nhưng nếu gọi lại 2 lần console.log(createCounter()()); thì output sẽ là 1 | 1. Vì sao? vì mỗi console.log(createCounter()()); tạo closure mới và count mới
```

### 14. Lỗi thường gặp với loop

- Ví dụ

```js
for (var i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);
    }, 1000);
}
=> Kết quả là 3 | 3 | 3 không phải là 0 | 1 | 2. Vì var i là một biến duy nhất được các callback closure cùng truy cập. Đến khi callback chạy thì loop đã kết thúc và i === 3
```

- Nếu dùng `let`

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
=> Output lúc này là 0 | 1 | 2 Vì let trong fore tạo binding riêng cho mỗi iteration. Bạn không cần đào sâu lúc này chỉ cần nhớ. Var -> callbacks có thể cùng giữ 1 biến i. let -> mỗi iteration có binding i riêng
```

### 15. Closure có liên quan gì tới memory?

- Closure có thể giữ biến sống lâu hơn bình thường

```js
function createHandler() {
    const hugeData = new Array(1000000);

    return function() {
        console.log(hugeData.length);
    };
}

const handler = createHandler();
Vì handler vẫn cần hugeData, JavaScript không thể đơn giản phóng nó. Điều này không có nghĩ: Closure gây memory leak. Đúng hơn là: "Closure có thể giữ references sống lâu hơn nếu function vẫn còn được sử dụng.
```

### 16. Closure và scope khác nhau như thế nào

- Hai concept liên quan nhưng không giống nhau
- `Scope`: Xác định biến nào có thể được truy cập ở một vị trí trong code

```js
function outer() {
  const x = 10;

  function inner() {
    console.log(x);
  }
}
inner có quyền truy cập x vì lexical scope
```

- `Closure`: Function tiếp tục giữ khả năng truy cập những biến đó kể cả khi outer function đã kết thúc

```js
function outer() {
  const x = 10;

  return () => console.log(x);
}

const fn = outer();

fn();
```

### 17. Cần nhớ là

- 1. Inner function truy cập outer variables nhờ lexical scope
- 2. Closure cho phép function tiếp tục truy cập các biến đó sau khi outer function đã kết thúc
- 3. Mỗi lần gọi outer function có thể tạo ra closure/state riêng.
- 4. Closure thường dùng cho private state, callback, event handler, middleware/function factory
