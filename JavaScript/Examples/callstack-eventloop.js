/*
  Call Stack & Event Loop trong JavaScript

  Chạy file:
  node JavaScript/Examples/callstack-eventloop.js
*/

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  console.log("=== 1. Call Stack cơ bản ===");

  function first() {
    second();
    console.log("First");
  }

  function second() {
    console.log("Second");
  }

  first();

  /*
    first() được đưa vào Call Stack.
    Trong first() gọi second(), nên second() được đưa lên trên first().
    second() chạy xong trước, sau đó first() mới chạy tiếp.
  */

  console.log("\n=== 2. setTimeout không chạy ngay dù delay là 0 ===");

  console.log("A");

  setTimeout(() => {
    console.log("B - setTimeout callback");
  }, 0);

  console.log("C");

  await wait(10);

  /*
    Output phần này:
    A
    C
    B - setTimeout callback

    Vì callback của setTimeout phải chờ Call Stack rỗng.
  */

  console.log("\n=== 3. Promise microtask chạy trước setTimeout ===");

  console.log("D");

  setTimeout(() => {
    console.log("F - macrotask từ setTimeout");
  }, 0);

  Promise.resolve().then(() => {
    console.log("E - microtask từ Promise");
  });

  console.log("G");

  await wait(10);

  /*
    Output phần này:
    D
    G
    E - microtask từ Promise
    F - macrotask từ setTimeout

    Code đồng bộ chạy trước.
    Sau đó microtask chạy trước macrotask.
  */

  console.log("\n=== 4. Async/Await không dừng toàn bộ chương trình ===");

  async function getData() {
    console.log("Async A");

    await Promise.resolve();

    console.log("Async B - sau await");
  }

  console.log("Start");

  getData();

  console.log("End");

  await wait(10);

  /*
    Output phần này:
    Start
    Async A
    End
    Async B - sau await

    await chỉ tạm dừng phần còn lại của getData(),
    không làm toàn bộ chương trình dừng lại.
  */

  console.log("\n=== 5. Tổng kết nhanh ===");

  /*
    Call Stack:
    - Nơi JavaScript thực thi function.
    - Hoạt động theo LIFO.

    Event Loop:
    - Kiểm tra khi Call Stack rỗng.
    - Đưa các callback async đang chờ vào Call Stack.

    Microtask:
    - Promise.then()
    - phần sau await

    Macrotask:
    - setTimeout()
    - setInterval()
    - event callback
  */
}

main();
