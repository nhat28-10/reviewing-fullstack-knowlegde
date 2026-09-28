/*
  Shallow Copy vs Deep Copy trong JavaScript

  Chạy file:
  node JavaScript/Examples/shallowcopy-deepcopy.js
*/

console.log("=== 1. Gán object chỉ copy reference ===");

const user1 = {
  name: "Nhat",
};

const user2 = user1;

user2.name = "Minh";

console.log("user1:", user1);
console.log("user2:", user2);
console.log("user1 === user2:", user1 === user2);

/*
  user1 và user2 cùng trỏ tới một object.
  Sửa qua user2 cũng làm object mà user1 đang trỏ tới thay đổi.
*/

console.log("\n=== 2. Shallow copy với spread object ===");

const originalUser = {
  name: "Nhat",
  address: {
    city: "HCM",
  },
};

const shallowCopy = { ...originalUser };

console.log("originalUser === shallowCopy:", originalUser === shallowCopy);
console.log(
  "originalUser.address === shallowCopy.address:",
  originalUser.address === shallowCopy.address
);

shallowCopy.address.city = "Ha Noi";

console.log("originalUser.address.city:", originalUser.address.city);
console.log("shallowCopy.address.city:", shallowCopy.address.city);

/*
  Object ngoài đã khác nhau.
  Nhưng address bên trong vẫn là cùng một reference.
*/

console.log("\n=== 3. Shallow copy với array ===");

const users = [
  {
    id: 1,
    profile: {
      city: "Da Nang",
    },
  },
];

const copiedUsers = [...users];

console.log("users === copiedUsers:", users === copiedUsers);
console.log("users[0] === copiedUsers[0]:", users[0] === copiedUsers[0]);

copiedUsers[0].profile.city = "Hue";

console.log("users[0].profile.city:", users[0].profile.city);
console.log("copiedUsers[0].profile.city:", copiedUsers[0].profile.city);

/*
  Array ngoài là array mới.
  Nhưng object phần tử bên trong vẫn dùng chung reference.
*/

console.log("\n=== 4. Deep copy với structuredClone() ===");

const product = {
  name: "Keyboard",
  options: {
    color: "Black",
    layout: "US",
  },
  tags: ["accessory", "office"],
};

const deepCopy = structuredClone(product);

console.log("product === deepCopy:", product === deepCopy);
console.log("product.options === deepCopy.options:", product.options === deepCopy.options);
console.log("product.tags === deepCopy.tags:", product.tags === deepCopy.tags);

deepCopy.options.color = "White";
deepCopy.tags.push("gaming");

console.log("product:", product);
console.log("deepCopy:", deepCopy);

/*
  structuredClone() tạo bản copy độc lập cho nested object/array.
  Sửa deepCopy không làm product thay đổi.
*/

console.log("\n=== 5. Update nested object không mutate object cũ ===");

const currentUser = {
  id: 1,
  name: "Nhat",
  profile: {
    age: 22,
    city: "HCM",
  },
};

const updatedUser = {
  ...currentUser,
  profile: {
    ...currentUser.profile,
    age: 23,
  },
};

console.log("currentUser:", currentUser);
console.log("updatedUser:", updatedUser);
console.log("currentUser.profile === updatedUser.profile:", currentUser.profile === updatedUser.profile);

/*
  Pattern này thường dùng khi update nested state trong React.
  Ta copy object ngoài và copy cả nested object cần thay đổi.
*/

console.log("\n=== 6. JSON trick có giới hạn ===");

const data = {
  name: "Nhat",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  value: undefined,
  sayHi() {
    return "Hi";
  },
};

const jsonCopy = JSON.parse(JSON.stringify(data));

console.log("data:", data);
console.log("jsonCopy:", jsonCopy);
console.log("typeof jsonCopy.createdAt:", typeof jsonCopy.createdAt);
console.log("jsonCopy.sayHi:", jsonCopy.sayHi);
console.log("jsonCopy.value:", jsonCopy.value);

/*
  JSON trick có thể dùng với data JSON đơn giản.
  Nhưng Date thành string, function và undefined có thể bị mất.
*/

console.log("\n=== 7. Tổng kết nhanh ===");

/*
  const b = a:
  - Chỉ copy reference.

  Shallow copy:
  - Copy tầng ngoài.
  - Ví dụ: { ...obj }, [...arr], Object.assign(), slice().

  Deep copy:
  - Copy cả nested object/array.
  - Ví dụ hiện đại: structuredClone().
*/
