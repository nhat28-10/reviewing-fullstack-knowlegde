/*
  Type Alias & Interface trong TypeScript

  Nội dung minh họa:
  1. Type alias cho object, union, tuple, function type
  2. Interface cho object shape
  3. Mở rộng interface bằng extends
  4. Mở rộng type bằng intersection
  5. Declaration merging
  6. Interface với class

  Chạy file:
  npx tsx TypeScript/Examples/typealias-interface.ts
*/

console.log("=== 1. Type Alias ===");

type UserId = string | number;
type Status = "pending" | "success" | "failed";
type Coordinate = [number, number];
type Logger = (message: string) => void;

type UserByType = {
  id: UserId;
  name: string;
  status: Status;
};

const userByType: UserByType = {
  id: "USER_001",
  name: "Nhat",
  status: "success",
};

const coordinate: Coordinate = [10.75, 106.67];

const logMessage: Logger = (message) => {
  console.log("log:", message);
};

console.log("userByType:", userByType);
console.log("coordinate:", coordinate);
logMessage("Type alias can describe function type");

// Giá trị không nằm trong literal union sẽ bị lỗi:
// const wrongStatus: Status = "done";

console.log("\n=== 2. Interface ===");

interface UserByInterface {
  id: number;
  name: string;
  email?: string;
}

const userByInterface: UserByInterface = {
  id: 1,
  name: "Nhat",
};

console.log("userByInterface:", userByInterface);

console.log("\n=== 3. Interface extends ===");

interface BaseUser {
  id: number;
  name: string;
}

interface AdminUser extends BaseUser {
  permissions: string[];
}

const adminByInterface: AdminUser = {
  id: 2,
  name: "Admin",
  permissions: ["CREATE_USER", "DELETE_USER"],
};

console.log("adminByInterface:", adminByInterface);

console.log("\n=== 4. Type Intersection ===");

type Product = {
  id: number;
  name: string;
};

type ProductWithStock = Product & {
  stock: number;
};

const product: ProductWithStock = {
  id: 101,
  name: "Keyboard",
  stock: 20,
};

console.log("product:", product);

console.log("\n=== 5. Declaration Merging ===");

interface Profile {
  username: string;
}

interface Profile {
  age: number;
}

const profile: Profile = {
  username: "nhat",
  age: 22,
};

console.log("profile:", profile);

// Type alias không thể khai báo trùng tên trong cùng scope:
// type Account = { username: string };
// type Account = { age: number };

console.log("\n=== 6. Interface With Class ===");

interface Repository {
  findById(id: number): string;
}

class UserRepository implements Repository {
  findById(id: number): string {
    return `User ${id}`;
  }
}

const userRepository = new UserRepository();

console.log(userRepository.findById(1));
