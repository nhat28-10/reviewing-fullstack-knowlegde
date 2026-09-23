/*
  Spread - Rest - Destructuring trong JavaScript

  Chạy file:
  node JavaScript/Examples/spread-rest-destructuring.js
*/

console.log("=== 1. Spread với array ===");

const oldNumbers = [1, 2, 3];
const newNumbers = [...oldNumbers, 4, 5];

console.log("oldNumbers:", oldNumbers);
console.log("newNumbers:", newNumbers);

/*
  ...oldNumbers bung các phần tử 1, 2, 3 ra array mới.
*/

console.log("\n=== 2. Spread với object ===");

const user = {
  name: "Nhat",
  age: 22,
};

const updatedUser = {
  ...user,
  age: 23,
};

console.log("user:", user);
console.log("updatedUser:", updatedUser);

/*
  Thuộc tính nằm sau sẽ ghi đè thuộc tính trước.
  Vì vậy age trong updatedUser là 23.
*/

console.log("\n=== 3. Spread chỉ là shallow copy ===");

const original = {
  name: "Nhat",
  profile: {
    city: "Da Nang",
  },
};

const copy = { ...original };

copy.profile.city = "Ho Chi Minh";

console.log("original.profile.city:", original.profile.city);
console.log("copy.profile.city:", copy.profile.city);

/*
  profile là object lồng bên trong.
  Spread chỉ copy tầng đầu, nên original.profile và copy.profile vẫn dùng chung reference.
*/

console.log("\n=== 4. Rest parameter ===");

function sum(...numbers) {
  return numbers.reduce((total, number) => total + number, 0);
}

console.log(sum(1, 2, 3)); // 6
console.log(sum(5, 10, 15, 20)); // 50

/*
  ...numbers gom nhiều arguments thành một array.
*/

console.log("\n=== 5. Array destructuring ===");

const colors = ["red", "green", "blue"];

const [firstColor, secondColor] = colors;

console.log("firstColor:", firstColor);
console.log("secondColor:", secondColor);

/*
  Array destructuring lấy dữ liệu theo vị trí.
*/

console.log("\n=== 6. Object destructuring ===");

const product = {
  id: 1,
  name: "Keyboard",
  price: 500,
};

const { name, price } = product;
const { name: productName } = product;

console.log("name:", name);
console.log("price:", price);
console.log("productName:", productName);

/*
  Object destructuring lấy dữ liệu theo tên property.
  Có thể đổi tên biến bằng cú pháp name: productName.
*/

console.log("\n=== 7. Rest + destructuring với object ===");

const account = {
  id: 1,
  email: "nhat@example.com",
  password: "123456",
  role: "USER",
};

const { password, ...safeAccount } = account;

console.log("password:", password);
console.log("safeAccount:", safeAccount);

/*
  password được lấy riêng.
  ...safeAccount gom các property còn lại.
  Pattern này hay dùng để tránh trả password về API response.
*/

console.log("\n=== 8. Rest + destructuring với array ===");

const scores = [10, 20, 30, 40];

const [firstScore, ...otherScores] = scores;

console.log("firstScore:", firstScore);
console.log("otherScores:", otherScores);

/*
  firstScore lấy phần tử đầu.
  ...otherScores gom các phần tử còn lại thành array.
*/

console.log("\n=== 9. Tổng kết nhanh ===");

/*
  Spread:
  - Bung array/object ra.
  - Ví dụ: [...arr], { ...obj }

  Rest:
  - Gom nhiều giá trị lại.
  - Ví dụ: function sum(...numbers) {}

  Destructuring:
  - Lấy dữ liệu từ array/object ra biến.
  - Array theo vị trí, object theo tên property.
*/
