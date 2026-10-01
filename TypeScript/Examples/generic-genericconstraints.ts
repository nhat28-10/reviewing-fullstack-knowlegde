/*
  Generic & Generic Constraints trong TypeScript

  Nội dung minh họa:
  1. Generic function
  2. Type inference với generic
  3. Generic với array
  4. Generic với nhiều type
  5. Generic constraints
  6. any vs generic
  7. Generic interface cho API response
  8. keyof với generic constraints

  Chạy file:
  npx tsx TypeScript/Examples/generic-genericconstraints.ts
*/

console.log("=== 1. Generic Function ===");

function getValue<T>(value: T): T {
  return value;
}

const explicitName = getValue<string>("Nhat");
const explicitAge = getValue<number>(22);

console.log("explicitName:", explicitName);
console.log("explicitAge:", explicitAge);

console.log("\n=== 2. Type Inference With Generic ===");

const inferredName = getValue("Minh");
const inferredAge = getValue(25);

console.log("inferredName:", inferredName.toUpperCase());
console.log("inferredAge:", inferredAge + 1);

console.log("\n=== 3. Generic With Array ===");

function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

const firstNumber = getFirst([10, 20, 30]);
const firstUser = getFirst(["Nhat", "Minh"]);
const emptyValue = getFirst([]);

console.log("firstNumber:", firstNumber);
console.log("firstUser:", firstUser);
console.log("emptyValue:", emptyValue);

console.log("\n=== 4. Generic With Multiple Types ===");

function createPair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const userAgePair = createPair("Nhat", 22);

console.log("userAgePair:", userAgePair);

console.log("\n=== 5. Generic Constraints ===");

function printLength<T extends { length: number }>(value: T): number {
  return value.length;
}

console.log("string length:", printLength("Hello"));
console.log("array length:", printLength([1, 2, 3]));

// number không có property length nên sẽ bị TypeScript báo lỗi:
// printLength(100);

interface HasId {
  id: number;
}

function printId<T extends HasId>(item: T): void {
  console.log("id:", item.id);
}

printId({ id: 1, name: "Nhat" });

// Object thiếu id sẽ bị lỗi:
// printId({ name: "Nhat" });

console.log("\n=== 6. any vs Generic ===");

function identityAny(value: any): any {
  return value;
}

function identityGeneric<T>(value: T): T {
  return value;
}

const anyResult = identityAny("Nhat");
const genericResult = identityGeneric("Nhat");

console.log("anyResult:", anyResult);
console.log("genericResult uppercase:", genericResult.toUpperCase());

console.log("\n=== 7. Generic Interface For API Response ===");

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type User = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  price: number;
};

const userResponse: ApiResponse<User> = {
  success: true,
  data: {
    id: 1,
    name: "Nhat",
  },
};

const productResponse: ApiResponse<Product> = {
  success: true,
  data: {
    id: 10,
    price: 500,
  },
};

console.log("userResponse:", userResponse);
console.log("productResponse:", productResponse);

console.log("\n=== 8. keyof With Generic Constraints ===");

function getProperty<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const user = {
  id: 1,
  name: "Nhat",
  email: "nhat@gmail.com",
};

console.log("user name:", getProperty(user, "name"));
console.log("user email:", getProperty(user, "email"));

// Key không tồn tại trong object sẽ bị TypeScript báo lỗi:
// getProperty(user, "phone");
