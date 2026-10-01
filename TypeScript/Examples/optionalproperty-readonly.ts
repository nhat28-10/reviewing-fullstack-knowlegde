/*
  Optional Property & Readonly trong TypeScript

  Nội dung minh họa:
  1. Optional property
  2. Optional property và undefined
  3. Default value với nullish coalescing
  4. Readonly property
  5. Optional + readonly
  6. Readonly array
  7. const khác readonly

  Chạy file:
  npx tsx TypeScript/Examples/optionalproperty-readonly.ts
*/

console.log("=== 1. Optional Property ===");

interface User {
  id: number;
  name: string;
  phone?: string;
}

const userWithoutPhone: User = {
  id: 1,
  name: "Nhat",
};

const userWithPhone: User = {
  id: 2,
  name: "Minh",
  phone: "0123456789",
};

console.log("userWithoutPhone:", userWithoutPhone);
console.log("userWithPhone:", userWithPhone);

console.log("\n=== 2. Optional Property And Undefined ===");

function formatPhone(user: User): string {
  return user.phone?.toUpperCase() ?? "NO_PHONE";
}

console.log("format userWithoutPhone:", formatPhone(userWithoutPhone));
console.log("format userWithPhone:", formatPhone(userWithPhone));

// Nếu gọi trực tiếp, TypeScript sẽ báo lỗi vì phone có thể là undefined:
// userWithoutPhone.phone.toUpperCase();

console.log("\n=== 3. Default Value ===");

interface CreateUserInput {
  name: string;
  role?: "USER" | "ADMIN";
}

function createUser(input: CreateUserInput) {
  return {
    name: input.name,
    role: input.role ?? "USER",
  };
}

console.log(createUser({ name: "Nhat" }));
console.log(createUser({ name: "Admin", role: "ADMIN" }));

console.log("\n=== 4. Readonly Property ===");

interface Product {
  readonly id: string;
  name: string;
  price: number;
}

const product: Product = {
  id: "PRODUCT_001",
  name: "Keyboard",
  price: 500,
};

product.name = "Mechanical Keyboard";

console.log("product:", product);

// Readonly property không được gán lại:
// product.id = "PRODUCT_002";

console.log("\n=== 5. Optional + Readonly ===");

interface Profile {
  readonly id: number;
  username: string;
  avatarUrl?: string;
}

const profile: Profile = {
  id: 1,
  username: "nhat",
};

console.log("profile:", profile);
console.log("avatar:", profile.avatarUrl ?? "DEFAULT_AVATAR");

// profile.id = 2; // Error

console.log("\n=== 6. Readonly Array ===");

const scores: readonly number[] = [8, 9, 10];

console.log("first score:", scores[0]);
console.log("scores:", scores);

// Readonly array không cho sửa mảng:
// scores.push(11);

console.log("\n=== 7. const vs readonly ===");

const mutableUser = {
  id: 1,
  name: "Nhat",
};

mutableUser.name = "Minh";

console.log("mutableUser:", mutableUser);

interface ReadonlyUser {
  readonly id: number;
  name: string;
}

const readonlyUser: ReadonlyUser = {
  id: 1,
  name: "Nhat",
};

readonlyUser.name = "Minh";

console.log("readonlyUser:", readonlyUser);

// const không cho gán lại biến:
// mutableUser = { id: 2, name: "Other" };

// readonly không cho gán lại property:
// readonlyUser.id = 2;
