/*
  Union Type & Intersection Type trong TypeScript

  Nội dung minh họa:
  1. Union type
  2. Type narrowing
  3. Literal union
  4. Intersection type

  Chạy file:
  npx tsx TypeScript/Examples/union-type-intersection-type.ts
*/

console.log("=== 1. Union Type ===");

let id: string | number;

id = 123;
console.log("number id:", id);

id = "USER_123";
console.log("string id:", id);

function printId(userId: string | number): void {
  console.log("userId:", userId);
}

printId(1);
printId("USER_001");

console.log("\n=== 2. Type Narrowing ===");

function formatId(userId: string | number): string {
  if (typeof userId === "string") {
    return userId.toUpperCase();
  }

  return userId.toString();
}

console.log("format string id:", formatId("user_123"));
console.log("format number id:", formatId(123));

// Nếu không narrowing, TypeScript sẽ báo lỗi vì number không có toUpperCase:
// function wrongFormatId(userId: string | number) {
//   return userId.toUpperCase();
// }

console.log("\n=== 3. Literal Union ===");

type Status = "pending" | "success" | "failed";

function getStatusMessage(status: Status): string {
  if (status === "pending") {
    return "Đang xử lý";
  }

  if (status === "success") {
    return "Thành công";
  }

  return "Thất bại";
}

console.log(getStatusMessage("pending"));
console.log(getStatusMessage("success"));

// Giá trị không nằm trong union sẽ bị lỗi:
// getStatusMessage("done");

console.log("\n=== 4. Intersection Type ===");

type User = {
  id: number;
  name: string;
};

type AuthInfo = {
  accessToken: string;
};

type AuthenticatedUser = User & AuthInfo;

const currentUser: AuthenticatedUser = {
  id: 1,
  name: "Nhat",
  accessToken: "abc123",
};

console.log("currentUser:", currentUser);

// Intersection yêu cầu object có đủ field từ cả User và AuthInfo:
// const invalidUser: AuthenticatedUser = {
//   id: 1,
//   name: "Nhat",
// };
