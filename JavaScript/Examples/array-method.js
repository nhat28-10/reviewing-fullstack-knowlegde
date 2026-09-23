/*
  Array Methods trong JavaScript

  Chạy file:
  node JavaScript/Examples/array-method.js
*/

const users = [
  { id: 1, name: "Nhat", role: "USER", active: true, age: 22 },
  { id: 2, name: "Minh", role: "ADMIN", active: true, age: 25 },
  { id: 3, name: "Duy", role: "USER", active: false, age: 19 },
];

console.log("=== 1. map(): biến đổi từng phần tử ===");

const names = users.map((user) => user.name);
const userLabels = users.map((user) => `${user.id} - ${user.name}`);

console.log("names:", names);
console.log("userLabels:", userLabels);

/*
  map() trả về array mới.
  Thường dùng khi muốn lấy hoặc biến đổi dữ liệu từng phần tử.
*/

console.log("\n=== 2. filter(): lọc nhiều phần tử ===");

const activeUsers = users.filter((user) => user.active);
const adultUsers = users.filter((user) => user.age >= 20);

console.log("activeUsers:", activeUsers);
console.log("adultUsers:", adultUsers);

/*
  filter() luôn trả về array.
  Nếu không có phần tử phù hợp thì trả về [].
*/

console.log("\n=== 3. find(): tìm phần tử đầu tiên ===");

const admin = users.find((user) => user.role === "ADMIN");
const missingUser = users.find((user) => user.id === 999);

console.log("admin:", admin);
console.log("missingUser:", missingUser);

/*
  find() trả về một phần tử đầu tiên tìm thấy.
  Nếu không tìm thấy thì trả về undefined.
*/

console.log("\n=== 4. filter() vs find() ===");

const filteredUser = users.filter((user) => user.id === 1);
const foundUser = users.find((user) => user.id === 1);

console.log("filter result:", filteredUser);
console.log("find result:", foundUser);

/*
  filter() trả về array: [{ ... }]
  find() trả về object trực tiếp: { ... }
*/

console.log("\n=== 5. reduce(): gom array thành một kết quả ===");

const orders = [
  { id: 1, total: 100 },
  { id: 2, total: 200 },
  { id: 3, total: 50 },
];

const revenue = orders.reduce((sum, order) => {
  return sum + order.total;
}, 0);

console.log("revenue:", revenue);

/*
  sum là accumulator.
  0 là initial value.

  Luồng chạy:
  0 + 100 = 100
  100 + 200 = 300
  300 + 50 = 350
*/

console.log("\n=== 6. some(): có ít nhất một phần tử đúng? ===");

const hasAdmin = users.some((user) => user.role === "ADMIN");
const hasBlockedUser = users.some((user) => user.active === false);

console.log("hasAdmin:", hasAdmin);
console.log("hasBlockedUser:", hasBlockedUser);

/*
  some() trả về true nếu có ít nhất một phần tử thỏa điều kiện.
*/

console.log("\n=== 7. every(): tất cả phần tử đều đúng? ===");

const allUsersActive = users.every((user) => user.active);
const allUsersHaveName = users.every((user) => user.name);

console.log("allUsersActive:", allUsersActive);
console.log("allUsersHaveName:", allUsersHaveName);

/*
  every() trả về true nếu tất cả phần tử đều thỏa điều kiện.
  Chỉ cần một phần tử sai thì kết quả là false.
*/

console.log("\n=== 8. Chain methods: kết hợp nhiều method ===");

const activeUserNames = users
  .filter((user) => user.active)
  .map((user) => user.name);

console.log("activeUserNames:", activeUserNames);

/*
  Có thể kết hợp method:
  - filter trước để lọc user active
  - map sau để lấy name
*/

console.log("\n=== 9. Tổng kết nhanh ===");

/*
  map:
  - Biến đổi từng phần tử.
  - Trả về array mới, thường cùng số lượng phần tử.

  filter:
  - Lọc nhiều phần tử.
  - Trả về array.

  find:
  - Tìm phần tử đầu tiên.
  - Trả về element hoặc undefined.

  reduce:
  - Gom array thành một kết quả.

  some:
  - Có ít nhất một phần tử đúng không?
  - Trả về boolean.

  every:
  - Tất cả phần tử đều đúng không?
  - Trả về boolean.
*/
