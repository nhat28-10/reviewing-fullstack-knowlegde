/*
  Basic Types trong TypeScript

  Nội dung minh họa:
  1. string, number, boolean
  2. array
  3. tuple
  4. type inference

  Chạy file:
  npx tsx TypeScript/Examples/basic-types.ts
*/

console.log("=== 1. string, number, boolean ===");

const username: string = "Nhat";
const age: number = 22;
const isActive: boolean = true;

console.log("username:", username);
console.log("age:", age);
console.log("isActive:", isActive);

// Sai kiểu sẽ bị TypeScript báo lỗi:
// const wrongAge: number = "22";

console.log("\n=== 2. Array ===");

const userIds: number[] = [1, 2, 3, 4];
const roles: Array<string> = ["User", "Admin"];

console.log("userIds:", userIds);
console.log("roles:", roles);

// Array string thì không thể chứa number:
// const wrongRoles: string[] = ["User", 123];

console.log("\n=== 3. Tuple ===");

const user: [number, string, boolean] = [1, "Nhat", true];
const coordinate: [number, number] = [10.75, 106.67];

console.log("user tuple:", user);
console.log("coordinate:", coordinate);

// Tuple cần đúng type theo từng vị trí:
// const wrongUser: [number, string, boolean] = ["Nhat", 1, true];

console.log("\n=== 4. Type Inference ===");

let score = 10;
score = 9;

console.log("score:", score);

// TypeScript tự hiểu score là number, nên dòng này sẽ lỗi:
// score = "9";
