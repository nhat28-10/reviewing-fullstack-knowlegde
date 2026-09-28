/*
  Try - Catch - Finally trong JavaScript

  Chạy file:
  node JavaScript/Examples/try-catch-finally.js
*/

console.log("=== 1. Try/Catch cơ bản ===");

try {
  const user = JSON.parse("invalid json");

  console.log(user);
} catch (error) {
  console.log("Có lỗi:", error.message);
}

/*
  JSON.parse("invalid json") bị lỗi.
  Khi lỗi xảy ra trong try, JavaScript bỏ qua phần còn lại của try và nhảy vào catch.
*/

console.log("\n=== 2. Khi try không có lỗi ===");

try {
  const user = JSON.parse('{"id":1,"name":"Nhat"}');

  console.log("User:", user);
} catch (error) {
  console.log("Catch sẽ không chạy:", error.message);
}

/*
  Nếu try chạy thành công thì catch không chạy.
*/

console.log("\n=== 3. Finally luôn chạy ===");

try {
  console.log("Try chạy thành công");
} catch (error) {
  console.log("Catch:", error.message);
} finally {
  console.log("Finally vẫn chạy sau try thành công");
}

try {
  throw new Error("Lỗi test finally");
} catch (error) {
  console.log("Catch:", error.message);
} finally {
  console.log("Finally vẫn chạy sau khi có lỗi");
}

/*
  finally phù hợp cho những việc luôn cần làm ở cuối:
  - tắt loading
  - đóng connection
  - clear timer
  - cleanup tài nguyên
*/

console.log("\n=== 4. Throw new Error ===");

function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }

  return a / b;
}

try {
  const result = divide(10, 0);

  console.log("Result:", result);
} catch (error) {
  console.log("Divide error:", error.message);
}

/*
  throw new Error() giúp chủ động ném lỗi khi dữ liệu không hợp lệ.
*/

console.log("\n=== 5. Async/Await với try/catch/finally ===");

function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!id) {
        reject(new Error("Missing user id"));
        return;
      }

      resolve({
        id,
        name: "Nhat",
      });
    }, 300);
  });
}

async function showUser(id) {
  let loading = false;

  try {
    loading = true;
    console.log("Loading:", loading);

    const user = await fetchUser(id);

    console.log("User:", user);
  } catch (error) {
    console.log("Fetch user error:", error.message);
  } finally {
    loading = false;
    console.log("Loading:", loading);
  }
}

async function main() {
  console.log("\n--- Case thành công ---");
  await showUser(1);

  console.log("\n--- Case thất bại ---");
  await showUser();

  console.log("\n=== 6. Tổng kết nhanh ===");

  /*
    try:
    - Chứa code có thể phát sinh lỗi.

    catch:
    - Xử lý lỗi được ném ra trong try.

    finally:
    - Luôn chạy sau try/catch.
    - Hay dùng để cleanup hoặc reset trạng thái.

    async/await:
    - Nếu Promise reject, await sẽ throw error.
    - Dùng try/catch để bắt lỗi từ await.
  */
}

main();
