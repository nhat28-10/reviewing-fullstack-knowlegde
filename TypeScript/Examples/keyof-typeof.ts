/*
  keyof & typeof trong TypeScript

  Nội dung minh họa:
  1. keyof lấy key của type
  2. Dùng keyof để giới hạn key hợp lệ
  3. keyof kết hợp với generic
  4. typeof lấy type từ biến
  5. typeof ở runtime và type level
  6. Kết hợp keyof typeof
  7. keyof typeof với config
  8. typeof với as const

  Chạy file:
  npx tsx TypeScript/Examples/keyof-typeof.ts
*/

console.log("=== 1. keyof ===");

type User = {
  id: number;
  name: string;
  age: number;
};

type UserKey = keyof User;

function printUserKey(key: UserKey): void {
  console.log("user key:", key);
}

printUserKey("id");
printUserKey("name");

// Key không tồn tại trong User sẽ bị TypeScript báo lỗi:
// printUserKey("email");

console.log("\n=== 2. keyof To Limit Valid Keys ===");

const user: User = {
  id: 1,
  name: "Nhat",
  age: 22,
};

function printUserValue(key: keyof User): void {
  console.log(`${key}:`, user[key]);
}

printUserValue("id");
printUserValue("age");

console.log("\n=== 3. keyof With Generic ===");

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const userId = getProperty(user, "id");
const userName = getProperty(user, "name");

console.log("userId:", userId);
console.log("userName:", userName);

// Key không tồn tại trong object sẽ bị lỗi:
// getProperty(user, "email");

console.log("\n=== 4. typeof In TypeScript ===");

const product = {
  id: 101,
  name: "Keyboard",
  price: 500,
};

type Product = typeof product;

const anotherProduct: Product = {
  id: 102,
  name: "Mouse",
  price: 250,
};

console.log("product:", product);
console.log("anotherProduct:", anotherProduct);

console.log("\n=== 5. typeof Runtime vs Type Level ===");

const message = "Hello TypeScript";

console.log("runtime typeof message:", typeof message);

type MessageType = typeof message;

const copiedMessage: MessageType = "Another message";

console.log("copiedMessage:", copiedMessage);

console.log("\n=== 6. keyof typeof ===");

const profile = {
  id: 1,
  username: "nhat",
  email: "nhat@gmail.com",
};

type ProfileKey = keyof typeof profile;

function printProfileValue(key: ProfileKey): void {
  console.log(`${key}:`, profile[key]);
}

printProfileValue("username");
printProfileValue("email");

console.log("\n=== 7. Config Example ===");

const config = {
  apiUrl: "http://localhost:3000",
  timeout: 5000,
  debug: true,
};

type ConfigKey = keyof typeof config;

function getConfigValue(key: ConfigKey) {
  return config[key];
}

console.log("apiUrl:", getConfigValue("apiUrl"));
console.log("timeout:", getConfigValue("timeout"));

// Config key không hợp lệ sẽ bị lỗi:
// getConfigValue("baseUrl");

console.log("\n=== 8. typeof With as const ===");

const routes = {
  home: "/",
  profile: "/profile",
  settings: "/settings",
} as const;

type RouteName = keyof typeof routes;
type RoutePath = (typeof routes)[RouteName];

function navigate(routeName: RouteName): RoutePath {
  return routes[routeName];
}

console.log("home path:", navigate("home"));
console.log("settings path:", navigate("settings"));

// Route name không hợp lệ sẽ bị lỗi:
// navigate("admin");
