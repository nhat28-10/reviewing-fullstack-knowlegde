/*
  Callback - Promise - Async/Await trong JavaScript

  Chạy file:
  node JavaScript/Examples/callback-promise-async-await.js
*/

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
console.log("=== 1. Callback cơ bản ===");

function processUser(name, callback) {
  console.log(`Processing ${name}`);
  callback();
}

processUser("Nhat", () => {
  console.log("Done");
});

/*
  Function () => console.log("Done") được truyền vào processUser.
  Đó là callback.
*/

console.log("\n=== 2. Callback async với setTimeout ===");

function getUserWithCallback(id, callback) {
  setTimeout(() => {
    callback({
      id,
      name: "Nhat",
    });
  }, 200);
}

getUserWithCallback(1, (user) => {
  console.log("callback user:", user);
});

await wait(300);

/*
  setTimeout chạy sau 200ms.
  Function nhận user là callback.
*/

console.log("\n=== 3. Callback hell nhìn như thế nào? ===");

function login(callback) {
  setTimeout(() => callback("token-123"), 100);
}

function getProfile(token, callback) {
  setTimeout(() => callback({ token, name: "Nhat" }), 100);
}

function getOrders(profile, callback) {
  setTimeout(() => callback([`${profile.name}'s order`]), 100);
}

login((token) => {
  getProfile(token, (profile) => {
    getOrders(profile, (orders) => {
      console.log("orders from callback hell:", orders);
    });
  });
});

await wait(400);

/*
  Khi nhiều task phụ thuộc nhau,
  callback bị lồng vào callback khác nên khó đọc.
*/

console.log("\n=== 4. Promise với then/catch ===");

function getUserWithPromise(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!id) {
        reject(new Error("Missing user id"));
        return;
      }

      resolve({
        id,
        name: "Minh",
      });
    }, 200);
  });
}

getUserWithPromise(2)
  .then((user) => {
    console.log("promise user:", user);
  })
  .catch((error) => {
    console.log("promise error:", error.message);
  });

await wait(300);

/*
  resolve() sẽ chạy .then().
  reject() sẽ chạy .catch().
*/

console.log("\n=== 5. Async/Await ===");

async function showUser() {
  const user = await getUserWithPromise(3);

  console.log("async/await user:", user);
}

await showUser();

/*
  await lấy giá trị mà Promise resolve ra.
  Code nhìn giống tuần tự hơn so với .then().
*/

console.log("\n=== 6. async function luôn trả về Promise ===");

async function getName() {
  return "Duy";
}

const namePromise = getName();

console.log("getName() trả về Promise:", namePromise instanceof Promise);
console.log("await getName():", await namePromise);

/*
  Dù return string, async function vẫn trả về Promise.
*/

console.log("\n=== 7. Quên await ===");

const userPromise = getUserWithPromise(4);

console.log("Không await:", userPromise);
console.log("Có await:", await userPromise);

/*
  Không await thì nhận Promise.
  Có await thì nhận user object.
*/

console.log("\n=== 8. Xử lý lỗi với try/catch ===");

async function showUserError() {
  try {
    const user = await getUserWithPromise();
    console.log(user);
  } catch (error) {
    console.log("caught error:", error.message);
  }
}

await showUserError();

/*
  Với async/await, thường dùng try/catch để xử lý Promise reject.
*/

console.log("\n=== 9. Tổng kết nhanh ===");

/*
  Callback:
  - Truyền function vào function khác để chạy sau.

  Promise:
  - Đại diện cho kết quả async trong tương lai.
  - Dùng .then() và .catch().

  Async/Await:
  - Cú pháp viết Promise dễ đọc hơn.
  - await lấy giá trị Promise resolve ra.
  - Dùng try/catch để xử lý lỗi.
*/
}

main();
