/*
  public - private - protected - abstract trong TypeScript

  Nội dung minh họa:
  1. public
  2. private
  3. protected
  4. private vs protected
  5. abstract class
  6. abstract method + normal method
  7. Ví dụ notification service
  8. Constructor shorthand

  Chạy file:
  npx tsx TypeScript/Examples/public-private-protected-abstract.ts
*/

console.log("=== 1. public ===");

class PublicUser {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  public sayHello(): void {
    console.log(`Hello ${this.name}`);
  }
}

const publicUser = new PublicUser("Nhat");

console.log("public name:", publicUser.name);
publicUser.sayHello();

console.log("\n=== 2. private ===");

class PrivateUser {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  checkPassword(password: string): boolean {
    return this.password === password;
  }
}

const privateUser = new PrivateUser("123456");

console.log("correct password:", privateUser.checkPassword("123456"));
console.log("wrong password:", privateUser.checkPassword("wrong"));

// private property không được truy cập từ bên ngoài class:
// console.log(privateUser.password);

console.log("\n=== 3. protected ===");

class BaseUser {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class AdminUser extends BaseUser {
  printName(): void {
    console.log("admin name:", this.name);
  }
}

const adminUser = new AdminUser("Nhat");

adminUser.printName();

// protected property không được truy cập từ bên ngoài class:
// console.log(adminUser.name);

console.log("\n=== 4. private vs protected ===");

class Account {
  private password: string;
  protected role: string;

  constructor(password: string, role: string) {
    this.password = password;
    this.role = role;
  }

  checkPassword(password: string): boolean {
    return this.password === password;
  }
}

class AdminAccount extends Account {
  printRole(): void {
    console.log("role from subclass:", this.role);

    // private property của class cha không dùng được trong class con:
    // console.log(this.password);
  }
}

const adminAccount = new AdminAccount("secret", "ADMIN");

adminAccount.printRole();
console.log("password valid:", adminAccount.checkPassword("secret"));

console.log("\n=== 5. abstract class ===");

abstract class Animal {
  abstract makeSound(): void;

  sleep(): void {
    console.log("Sleeping...");
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log("Woof");
  }
}

const dog = new Dog();

dog.makeSound();
dog.sleep();

// Abstract class không thể tạo object trực tiếp:
// const animal = new Animal();

console.log("\n=== 6. abstract method + normal method ===");

abstract class Payment {
  abstract pay(amount: number): void;

  printReceipt(amount: number): void {
    console.log(`Receipt created for ${amount}`);
  }
}

class CreditCardPayment extends Payment {
  pay(amount: number): void {
    console.log(`Pay ${amount} by credit card`);
    this.printReceipt(amount);
  }
}

class CashPayment extends Payment {
  pay(amount: number): void {
    console.log(`Pay ${amount} by cash`);
    this.printReceipt(amount);
  }
}

const creditCardPayment = new CreditCardPayment();
const cashPayment = new CashPayment();

creditCardPayment.pay(100);
cashPayment.pay(50);

console.log("\n=== 7. Notification Service Example ===");

abstract class NotificationService {
  abstract send(message: string): void;

  protected log(message: string): void {
    console.log(`Sending: ${message}`);
  }
}

class EmailService extends NotificationService {
  send(message: string): void {
    this.log(message);
    console.log("Send email");
  }
}

class SmsService extends NotificationService {
  send(message: string): void {
    this.log(message);
    console.log("Send SMS");
  }
}

const notificationServices: NotificationService[] = [
  new EmailService(),
  new SmsService(),
];

for (const service of notificationServices) {
  service.send("Your order has been shipped");
}

console.log("\n=== 8. Constructor Shorthand ===");

class Product {
  constructor(
    public readonly id: number,
    public name: string,
    private cost: number,
  ) {}

  getProfit(sellPrice: number): number {
    return sellPrice - this.cost;
  }
}

const product = new Product(1, "Keyboard", 300);

console.log("product id:", product.id);
console.log("product name:", product.name);
console.log("profit:", product.getProfit(500));

product.name = "Mechanical Keyboard";

console.log("updated product name:", product.name);

// readonly property không được gán lại:
// product.id = 2;
//
// private property không được truy cập từ bên ngoài:
// console.log(product.cost);
