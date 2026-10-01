/*
  Typing Function & Callback trong TypeScript

  Nội dung minh họa:
  1. Typing parameter và return value
  2. Function trả về void
  3. Optional parameter và default parameter
  4. Callback không return value
  5. Callback có return value
  6. Tách callback type ra riêng
  7. Ví dụ backend/frontend

  Chạy file:
  npx tsx TypeScript/Examples/typingfunction-callback.ts
*/

console.log("=== 1. Typing Parameter And Return Value ===");

function add(a: number, b: number): number {
  return a + b;
}

console.log("add:", add(10, 20));

// Sai parameter type sẽ bị TypeScript báo lỗi:
// add("10", 20);

// Sai return type cũng sẽ bị TypeScript báo lỗi:
// function wrongAdd(a: number, b: number): number {
//   return "hello";
// }

console.log("\n=== 2. Function Return Void ===");

function printUser(name: string): void {
  console.log("user:", name);
}

printUser("Nhat");

console.log("\n=== 3. Optional And Default Parameter ===");

function greet(name: string, message?: string): string {
  return `${message ?? "Hello"} ${name}`;
}

function greetWithDefault(name: string, message: string = "Hi"): string {
  return `${message} ${name}`;
}

console.log(greet("Nhat"));
console.log(greet("Nhat", "Welcome"));
console.log(greetWithDefault("Minh"));
console.log(greetWithDefault("Minh", "Good morning"));

console.log("\n=== 4. Callback Without Return Value ===");

function processUser(callback: (name: string) => void): void {
  callback("Nhat");
}

processUser((name) => {
  console.log("processed user:", name.toUpperCase());
});

console.log("\n=== 5. Callback With Return Value ===");

function calculate(
  a: number,
  b: number,
  operation: (x: number, y: number) => number
): number {
  return operation(a, b);
}

const sum = calculate(10, 20, (x, y) => x + y);
const multiply = calculate(10, 20, (x, y) => x * y);

console.log("sum:", sum);
console.log("multiply:", multiply);

console.log("\n=== 6. Type Alias For Callback ===");

type Operation = (a: number, b: number) => number;

function runOperation(a: number, b: number, operation: Operation): number {
  return operation(a, b);
}

const subtract: Operation = (a, b) => a - b;

console.log("subtract:", runOperation(30, 12, subtract));

console.log("\n=== 7. Backend Example ===");

type User = {
  id: number;
  name: string;
};

function findUser(id: number, callback: (user: User) => void): void {
  const user: User = {
    id,
    name: "Nhat",
  };

  callback(user);
}

findUser(1, (user) => {
  console.log("found user:", user.name);
});

console.log("\n=== 8. Frontend Props Example ===");

type ButtonProps = {
  label: string;
  onClick: () => void;
};

type InputProps = {
  value: string;
  onChange: (value: string) => void;
};

function renderButton(props: ButtonProps): void {
  console.log("button:", props.label);
  props.onClick();
}

function renderInput(props: InputProps): void {
  console.log("input value:", props.value);
  props.onChange("New value");
}

renderButton({
  label: "Save",
  onClick: () => {
    console.log("button clicked");
  },
});

renderInput({
  value: "Initial value",
  onChange: (value) => {
    console.log("changed value:", value);
  },
});
