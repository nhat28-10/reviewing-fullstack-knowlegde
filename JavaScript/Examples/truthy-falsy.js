/*
  Truthy & Falsy trong JavaScript

  Chạy file:
  node JavaScript/Examples/truthy-falsy.js
*/

console.log("=== 1. Boolean context ===");

const name = "Nhat";

if (name) {
  console.log("name là truthy nên block if chạy");
}

/*
  Boolean context là những nơi JavaScript cần true/false,
  ví dụ: if, while, !, &&, ||, ternary...
*/

console.log("\n=== 2. Các giá trị falsy phổ biến ===");

const falsyValues = [
  { label: "false", value: false },
  { label: "0", value: 0 },
  { label: "-0", value: -0 },
  { label: "0n", value: 0n },
  { label: '""', value: "" },
  { label: "null", value: null },
  { label: "undefined", value: undefined },
  { label: "NaN", value: NaN },
];

for (const item of falsyValues) {
  console.log(item.label, "->", Boolean(item.value));
}

/*
  Những giá trị trên khi ép sang boolean đều là false.
  Các giá trị còn lại phần lớn là truthy.
*/

console.log("\n=== 3. Dễ nhầm nhưng là truthy ===");

const trickyTruthyValues = [
  { label: '"0"', value: "0" },
  { label: '"false"', value: "false" },
  { label: "[]", value: [] },
  { label: "{}", value: {} },
  { label: "function () {}", value: function () {} },
];

for (const item of trickyTruthyValues) {
  console.log(item.label, "->", Boolean(item.value));
}

/*
  "0" và "false" là string không rỗng nên truthy.
  [] và {} dù rỗng vẫn là object nên truthy.
*/

console.log("\n=== 4. Ứng dụng với if ===");

const errorMessage = "";

if (errorMessage) {
  console.log("Hiển thị lỗi:", errorMessage);
} else {
  console.log("Không có lỗi để hiển thị");
}

const user = null;

if (!user) {
  console.log("Chưa đăng nhập hoặc không tìm thấy user");
}

console.log("\n=== 5. == có type coercion ===");

console.log("5 == '5':", 5 == "5");
console.log("0 == false:", 0 == false);
console.log("'' == false:", "" == false);

/*
  == có thể ép kiểu trước khi so sánh.
  Vì vậy kết quả đôi khi dễ gây bất ngờ.
*/

console.log("\n=== 6. === không ép kiểu ===");

console.log("5 === '5':", 5 === "5");
console.log("0 === false:", 0 === false);
console.log("'' === false:", "" === false);

/*
  === so sánh nghiêm ngặt hơn.
  Thực tế thường ưu tiên dùng === để tránh lỗi do ép kiểu ngầm.
*/

console.log("\n=== 7. null và undefined ===");

console.log("null == undefined:", null == undefined);
console.log("null === undefined:", null === undefined);

/*
  null == undefined là true vì == cho phép coercion đặc biệt.
  null === undefined là false vì khác kiểu dữ liệu.
*/

console.log("\n=== 8. Tổng kết nhanh ===");

/*
  Falsy phổ biến:
  false, 0, -0, 0n, "", null, undefined, NaN

  Dễ nhầm nhưng truthy:
  "0", "false", [], {}, function () {}

  Nên dùng === thay vì == trong đa số trường hợp.
*/
