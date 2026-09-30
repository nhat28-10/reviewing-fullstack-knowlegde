/*
  any, unknown, never, void trong TypeScript

  Nội dung minh họa:
  1. any
  2. unknown
  3. void
  4. never

  Chạy file:
  npx tsx TypeScript/Examples/any-unknown-never-void.ts
*/

console.log("=== 1. any ===");

let data: any = "Nhat";

console.log("data as string:", data.toUpperCase());

data = 123;
console.log("data as number:", data);

// TypeScript vẫn cho phép dòng này, nhưng runtime sẽ lỗi:
// data.toUpperCase();

function handleResponse(response: any): void {
  console.log("username:", response.user.name);
}

handleResponse({
  user: {
    name: "Nhat",
  },
});

console.log("\n=== 2. unknown ===");

let value: unknown = "Hello TypeScript";

if (typeof value === "string") {
  console.log("uppercase:", value.toUpperCase());
}

value = 99;

if (typeof value === "number") {
  console.log("fixed:", value.toFixed(2));
}

// Với unknown, TypeScript bắt buộc kiểm tra type trước khi dùng:
// value.toUpperCase();

console.log("\n=== 3. void ===");

function logMessage(message: string): void {
  console.log("log:", message);
}

const result = logMessage("Function này không trả về giá trị hữu ích");
console.log("result:", result);

console.log("\n=== 4. never ===");

function throwError(message: string): never {
  throw new Error(message);
}

function checkStatus(status: "success" | "failed"): void {
  if (status === "success") {
    console.log("Request thành công");
    return;
  }

  if (status === "failed") {
    throwError("Request thất bại");
  }
}

try {
  checkStatus("success");
  checkStatus("failed");
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log("caught error:", error.message);
  }
}
