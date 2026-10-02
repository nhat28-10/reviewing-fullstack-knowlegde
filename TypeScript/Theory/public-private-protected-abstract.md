# TypeScript Theory

## 11. public - private - protected - abstract

### 1. public

`public` nghĩa là property hoặc method có thể được truy cập ở mọi nơi.

Đây cũng là access modifier mặc định trong TypeScript class.

```ts
class User {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  public sayHello(): void {
    console.log(`Hello ${this.name}`);
  }
}

const user = new User("Nhat");

console.log(user.name); // OK
user.sayHello(); // OK
```

Nếu không viết `public`, property và method vẫn mặc định là `public`.

```ts
class Product {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

Nhớ nhanh:

```txt
public -> truy cập ở đâu cũng được
```

### 2. private

`private` chỉ cho phép truy cập bên trong chính class khai báo nó.

```ts
class User {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  checkPassword(password: string): boolean {
    return this.password === password;
  }
}
const user = new User("123456");

console.log(user.password); // Error
```

TypeScript sẽ báo lỗi vì `password` là `private`. Nhưng bên trong class `User`, ta vẫn dùng được `this.password`.

`private` phù hợp với dữ liệu hoặc logic không muốn code bên ngoài truy cập trực tiếp.

Nhớ nhanh:

```txt
private -> chỉ dùng bên trong chính class đó
```

### 3. protected

`protected` gần giống `private`, nhưng class con kế thừa vẫn truy cập được.

```ts
class User {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class Admin extends User {
  printName(): void {
    console.log(this.name);
  }
}
```

Trong `Admin`, `this.name` hợp lệ vì `Admin` kế thừa `User`.

Nhưng bên ngoài class vẫn không truy cập được:

```ts
const admin = new Admin("Nhat");
console.log(admin.name); // Error
```

So sánh nhanh:

```txt
private
-> chỉ chính class

protected
-> chính class + class con

public
-> mọi nơi
```

### 4. private vs protected

Ví dụ:

```ts
class User {
  private password: string;
  protected role: string;

  constructor(password: string, role: string) {
    this.password = password;
    this.role = role;
  }
}

class Admin extends User {
  printData(): void {
    console.log(this.role); // OK
    console.log(this.password); // Error
  }
}
```

Tại sao lại vậy?

```txt
role     -> protected -> class con được dùng
password -> private   -> class con không được dùng
```

### 5. abstract class

`abstract class` là class dùng làm base class. Nó không được dùng để tạo object trực tiếp.

```ts
abstract class Animal {
  abstract makeSound(): void;
}

const animal = new Animal(); // Error
```

Thay vào đó, class con sẽ kế thừa abstract class và implement các abstract method.

```ts
class Dog extends Animal {
  makeSound(): void {
    console.log("Woof");
  }
}
const dog = new Dog();

dog.makeSound();
```

Nhớ nhanh:

```txt
abstract class -> class nền, không khởi tạo trực tiếp
```

### 6. Abstract method

Method được đánh dấu `abstract` không có implementation trong abstract class. Class con bắt buộc phải implement method đó.

```ts
abstract class Payment {
  abstract pay(amount: number): void;
}

class CreditCardPayment extends Payment {
  pay(amount: number): void {
    console.log(`Pay ${amount} by credit card`);
  }
}

class CashPayment extends Payment {} // Error vì chưa implement pay()
```

Abstract class vẫn có thể chứa method bình thường.

```ts
abstract class Payment {
  abstract pay(amount: number): void;

  printReceipt(): void {
    console.log("Receipt created");
  }
}
```

```txt
abstract method
-> class con bắt buộc tự implement

normal method
-> base class có thể implement sẵn
```

### 7. Ví dụ thực tế

Giả sử backend có nhiều loại notification.

```ts
abstract class NotificationService {
  abstract send(message: string): void;

  protected log(message: string): void {
    console.log(`Sending: ${message}`);
  }
}
```

Email service:

```ts
class EmailService extends NotificationService {
  send(message: string): void {
    this.log(message);
    console.log("Send email");
  }
}
```

SMS service:

```ts
class SmsService extends NotificationService {
  send(message: string): void {
    this.log(message);
    console.log("Send SMS");
  }
}
```

Base class định nghĩa rằng notification service nào cũng phải có `send()`, nhưng mỗi loại service tự quyết định cách gửi.

### 8. Constructor shorthand

TypeScript có syntax rút gọn khi khai báo property trong constructor.

Thay vì:

```ts
class User {
  public name: string;
  private password: string;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
  }
}
```

Có thể viết:

```ts
class User {
  constructor(
    public name: string,
    private password: string,
  ) {}
}
```

TypeScript sẽ tự tạo property và gán giá trị cho bạn.

Constructor shorthand dùng được với cả `public`, `private`, `protected`, `readonly`.

```ts
class Product {
  constructor(
    public readonly id: number,
    public name: string,
    private cost: number,
  ) {}
}
```

### 9. Lưu ý về private ở runtime

`private` của TypeScript chủ yếu là kiểm tra ở compile/type-check time. Nó giúp chặn lỗi khi viết TypeScript, nhưng không nên hiểu là tự động mã hóa hoặc bảo mật dữ liệu thật sự.

```ts
class User {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }
}
```

`private password` giúp code bên ngoài không được truy cập trực tiếp trong TypeScript:

```ts
const user = new User("123456");

console.log(user.password); // Error
```

Nhưng nó không có nghĩa password được hash, mã hóa, hoặc an toàn trong database/API response.

### 10. Lỗi thường gặp

#### 1. Nghĩ private bảo mật dữ liệu thật sự

`private` chủ yếu giúp kiểm soát việc truy cập trong TypeScript code. Nó không có nghĩa password tự động được mã hóa hoặc bảo mật trong database.

#### 2. Nghĩ class con truy cập được private

Class con không truy cập được `private` property của class cha.

```txt
private -> class hiện tại
protected -> class hiện tại + subclass
```

#### 3. Nghĩ abstract class không có code

Sai. Abstract class vẫn có thể có:

```txt
property
constructor
normal method
abstract method
```

Chỉ là abstract class không được instantiate trực tiếp.

#### 4. Quên implement abstract method

Nếu class con kế thừa abstract class, nó bắt buộc phải implement toàn bộ abstract method.

```ts
abstract class Repository {
  abstract findAll(): string[];
}

class UserRepository extends Repository {}
```

Đoạn trên lỗi vì `UserRepository` chưa implement `findAll()`.

### 11. Câu hỏi thường gặp

1. `public` là gì trong TypeScript?
   - `public` nghĩa là property hoặc method có thể được truy cập ở mọi nơi. Đây là modifier mặc định trong TypeScript class.
2. `private` là gì trong TypeScript?
   - `private` nghĩa là property hoặc method chỉ được truy cập bên trong class nơi nó được khai báo.
3. `protected` trong TypeScript là gì?
   - `protected` nghĩa là property hoặc method được truy cập bên trong class khai báo nó và các class con, nhưng không truy cập được từ bên ngoài class.
4. Sự khác nhau giữa `private` và `protected` là gì?
   - `private` chỉ được truy cập trong class đã khai báo. `protected` được truy cập trong class đã khai báo và class con.
5. Abstract class là gì?
   - Abstract class là base class không thể khởi tạo trực tiếp. Nó có thể định nghĩa abstract method để class con bắt buộc implement.
6. Abstract class có thể chứa phương thức bình thường không?
   - Có. Abstract class có thể chứa cả method đã implement sẵn và abstract method.
7. Constructor shorthand là gì?
   - Là cú pháp khai báo access modifier ngay trong constructor để TypeScript tự tạo property và gán giá trị.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/public-private-protected-abstract.ts
```
