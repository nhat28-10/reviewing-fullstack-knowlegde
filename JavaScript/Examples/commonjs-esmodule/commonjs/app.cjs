/*
  CommonJS dùng require() và module.exports

  Chạy file:
  node JavaScript/Examples/commonjs-esmodule/commonjs/app.cjs
*/

const { add, subtract, appName } = require("./math.cjs");

console.log("=== CommonJS ===");
console.log("appName:", appName);
console.log("add:", add(2, 3));
console.log("subtract:", subtract(10, 4));

/*
  require("./math.cjs") lấy object được export từ module.exports.
  Sau đó destructuring để lấy add, subtract, appName.
*/
