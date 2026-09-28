/*
  Microtask vs Macrotask trong JavaScript

  Chạy file:
  node JavaScript/Examples/microtask-macrotask.js
*/

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  console.log("=== 1. Microtask với Promise.then() ===");

  console.log("A");

  Promise.resolve().then(() => {
    console.log("B - microtask từ Promise.then()");
  });

  console.log("C");

  await wait(10);

  /*
    Output phần này:
    A
    C
    B - microtask từ Promise.then()
  */

  console.log("\n=== 2. Macrotask với setTimeout() ===");

  console.log("D");

  setTimeout(() => {
    console.log("E - macrotask từ setTimeout()");
  }, 0);

  console.log("F");

  await wait(10);

  /*
    Output phần này:
    D
    F
    E - macrotask từ setTimeout()
  */

  console.log("\n=== 3. Microtask chạy trước macrotask ===");

  console.log("1");

  setTimeout(() => {
    console.log("2 - macrotask");
  }, 0);

  Promise.resolve().then(() => {
    console.log("3 - microtask");
  });

  console.log("4");

  await wait(10);

  /*
    Output phần này:
    1
    4
    3 - microtask
    2 - macrotask
  */

  console.log("\n=== 4. queueMicrotask() ===");

  console.log("Start");

  queueMicrotask(() => {
    console.log("Microtask từ queueMicrotask()");
  });

  Promise.resolve().then(() => {
    console.log("Microtask từ Promise.then()");
  });

  console.log("End");

  await wait(10);

  /*
    queueMicrotask() và Promise.then() đều đưa callback vào microtask queue.
    Callback nào được đăng ký trước thì thường chạy trước.
  */

  console.log("\n=== 5. Async/Await và microtask ===");

  async function test() {
    console.log("Async A");

    await Promise.resolve();

    console.log("Async B - sau await");
  }

  console.log("Before test");

  test();

  console.log("After test");

  await wait(10);

  /*
    Output phần này:
    Before test
    Async A
    After test
    Async B - sau await

    await chỉ tạm dừng phần còn lại của test().
  */

  console.log("\n=== 6. Tổng kết nhanh ===");

  /*
    Thứ tự ưu tiên cơ bản:
    1. Sync code
    2. Microtask queue
    3. Macrotask queue

    Microtask:
    - Promise.then()
    - Promise.catch()
    - Promise.finally()
    - queueMicrotask()
    - phần sau await

    Macrotask:
    - setTimeout()
    - setInterval()
    - event callback
  */
}

main();
