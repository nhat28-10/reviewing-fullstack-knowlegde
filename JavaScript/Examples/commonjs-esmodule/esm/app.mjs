/*
  ES Modules dùng import và export

  Chạy file:
  node JavaScript/Examples/commonjs-esmodule/esm/app.mjs
*/

import multiply, { add, subtract, appName } from "./math.mjs";

console.log("=== ES Modules ===");
console.log("appName:", appName);
console.log("add:", add(2, 3));
console.log("subtract:", subtract(10, 4));
console.log("multiply:", multiply(3, 4));

/*
  add, subtract, appName là named export nên import trong { }.
  multiply là default export nên import không cần { }.
*/
