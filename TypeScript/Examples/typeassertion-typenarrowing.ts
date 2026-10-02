/*
  Type Assertion & Type Narrowing trong TypeScript

  Nội dung minh họa:
  1. Type assertion
  2. Assertion không convert dữ liệu runtime
  3. Narrowing với typeof
  4. Narrowing với in
  5. Narrowing với instanceof
  6. Equality narrowing
  7. Discriminated union
  8. Custom type guard

  Chạy file:
  npx tsx TypeScript/Examples/typeassertion-typenarrowing.ts
*/

console.log("=== 1. Type Assertion ===");

const unknownMessage: unknown = "Hello TypeScript";
const message = unknownMessage as string;

console.log("uppercase message:", message.toUpperCase());

type ApiUser = {
  id: number;
  name: string;
};

const rawUser: unknown = {
  id: 1,
  name: "Nhat",
};

const assertedUser = rawUser as ApiUser;

console.log("assertedUser:", assertedUser);

console.log("\n=== 2. Assertion Does Not Convert Runtime Value ===");

const rawValue: unknown = "123";
const assertedNumber = rawValue as number;
const convertedNumber = Number(rawValue);

console.log("assertedNumber value:", assertedNumber);
console.log("typeof assertedNumber:", typeof assertedNumber);
console.log("convertedNumber value:", convertedNumber);
console.log("typeof convertedNumber:", typeof convertedNumber);

console.log("\n=== 3. Narrowing With typeof ===");

function formatValue(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return value.toFixed(2);
}

console.log("format string:", formatValue("hello"));
console.log("format number:", formatValue(123));

console.log("\n=== 4. Narrowing With in ===");

type Admin = {
  role: "admin";
  permissions: string[];
};

type NormalUser = {
  role: "user";
  email: string;
};

type Person = Admin | NormalUser;

function printPersonInfo(person: Person): void {
  if ("permissions" in person) {
    console.log("admin permissions:", person.permissions.join(", "));
  } else {
    console.log("user email:", person.email);
  }
}

printPersonInfo({
  role: "admin",
  permissions: ["CREATE", "DELETE"],
});

printPersonInfo({
  role: "user",
  email: "nhat@gmail.com",
});

console.log("\n=== 5. Narrowing With instanceof ===");

function printError(error: Error | string): void {
  if (error instanceof Error) {
    console.log("error message:", error.message);
  } else {
    console.log("error text:", error);
  }
}

printError(new Error("Something went wrong"));
printError("Network error");

console.log("\n=== 6. Equality Narrowing ===");

type Status = "loading" | "success" | "error";

function getStatusMessage(status: Status): string {
  if (status === "loading") {
    return "Đang tải";
  }

  if (status === "success") {
    return "Thành công";
  }

  return "Có lỗi xảy ra";
}

console.log("loading:", getStatusMessage("loading"));
console.log("success:", getStatusMessage("success"));
console.log("error:", getStatusMessage("error"));

console.log("\n=== 7. Discriminated Union ===");

type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  }

  return shape.width * shape.height;
}

console.log("circle area:", getArea({ kind: "circle", radius: 5 }));
console.log(
  "rectangle area:",
  getArea({ kind: "rectangle", width: 4, height: 6 })
);

console.log("\n=== 8. Custom Type Guard ===");

function isApiUser(value: unknown): value is ApiUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof value.id === "number" &&
    typeof value.name === "string"
  );
}

function printApiUser(value: unknown): void {
  if (isApiUser(value)) {
    console.log(`user #${value.id}: ${value.name}`);
    return;
  }

  console.log("Invalid user data");
}

printApiUser({ id: 1, name: "Nhat" });
printApiUser({ id: "wrong-id", name: "Nhat" });

// Assertion với DOM thường gặp trong frontend:
// const element = document.getElementById("email") as HTMLInputElement;
// console.log(element.value);
//
// Narrowing với DOM an toàn hơn:
// const element = document.getElementById("email");
// if (element instanceof HTMLInputElement) {
//   console.log(element.value);
// }
