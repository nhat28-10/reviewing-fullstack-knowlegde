/*
  Scope trong JavaScript: Global Scope, Function Scope, Block Scope

  Cách học:
  1. Đọc từng phần từ trên xuống.
  2. Chạy file: node JavaScript/Examples/scope.js
  3. Các dòng lỗi đang được comment lại.
  4. Muốn thấy lỗi thật thì bỏ comment từng dòng một rồi chạy lại.
*/

console.log("=== 1. Scope là gì? ===");

/*
  Scope là phạm vi mà một biến có thể được truy cập.

  Nói đơn giản:
  - Biến được khai báo ở đâu thì thường chỉ dùng được trong phạm vi đó.
  - Scope bên trong có thể nhìn ra scope bên ngoài.
  - Scope bên ngoài không nhìn được vào scope bên trong.
*/

const globalMessage = "Tôi ở Global Scope"
function showMessage() {
    console.log("Trong function: ", globalMessage)
}
showMessage();
console.log("Ngoài function: ", globalMessage);

console.log("\n=== 2. Global Scope ===");

const appName = "Review JavaScript";
let currentTopic = "Scope";
console.log("appName: ", appName);
console.log("currentTopic: ", currentTopic);

function printGlobalInfo() {
    console.log("Trong function vẫn đọc được appName: ", appName);
    console.log("Trong function vẫn đọc được currentTopic: ", currentTopic);
}
printGlobalInfo();

/*
  Global scope là scope ngoài cùng.

  Biến global có thể được truy cập từ nhiều nơi.
  Nhưng không nên lạm dụng biến global vì dễ bị ghi đè
  và làm code khó kiểm soát.
*/

console.log("\n=== 3. Function Scope ===");

function learnFunctionScope() {
    const lessonName = "Function Scope";
    let duration = 30;
    var level = "Basic"

    console.log("Trong function - lessonName:", lessonName);
    console.log("Trong function - duration:", duration);
    console.log("Trong function - level:", level);
    // learnFunctionScope() // Gọi trong function nhé!
}
learnFunctionScope();

// Lỗi: biến khai báo trong function không dùng được ở ngoài function.
// console.log(lessonName);
// ReferenceError: lessonName is not defined

// console.log(duration);
// ReferenceError: duration is not defined

// console.log(level);
// ReferenceError: level is not defined

/*
  Function scope:
  - Biến khai báo trong function chỉ sống bên trong function đó.
  - Bên ngoài function không truy cập được.
  - Điều này đúng với var, let, const.
*/

console.log("\n=== 4. Block Scope với let và const ===");
if (true) {
    const blockMessage = "Tôi ở trong Block"
    let blockCount = 1;
    console.log("Trong block - blockMessage: ", blockMessage)
    console.log("Trong block - blockCount: ", blockCount);
}

// Lỗi: let/const chỉ tồn tại trong block nơi nó được khai báo.
// console.log(blockMessage);
// ReferenceError: blockMessage is not defined

// console.log(blockCount);
// ReferenceError: blockCount is not defined

/*
  Block là phần code nằm trong cặp dấu { }.

  Ví dụ:
  - if (...) { }
  - for (...) { }
  - while (...) { }

  let và const có block scope.
*/

console.log("\n=== 5. var không có block scope ===");

if (true) {
    var varInBlock = "var nằm trong if block"
}
console.log("Ngoài block vẫn đọc được varInBlock: ", varInBlock);

/*
  Đây là điểm dễ nhầm:

  var không có block scope.
  var chỉ có function scope.

  Vì vậy var khai báo trong if/for block
  vẫn có thể bị truy cập ở bên ngoài block.
*/

console.log("\n=== 6. var vẫn bị giới hạn bởi function scope ===");

function testVarFunctionScope() {
    if (true) {
        var message = "Var trong block nhưng thuộc function"
    }
    console.log("Trong function đọc được message: ", message);
}
testVarFunctionScope()

// Lỗi: var trong function không truy cập được từ ngoài function.
// console.log(message);
// ReferenceError: message is not defined

/*
  Tóm lại:
  - var không bị giới hạn bởi block.
  - Nhưng var vẫn bị giới hạn bởi function.
*/

console.log("\n=== 7. Scope lookup: tìm biến từ trong ra ngoài ===");

const language = "JavaScript";
function outer() {
    const topic = "Scope";

    function inner() {
        const level = "Basic"
        console.log("inner đọc được level: ", level)
        console.log("inner đọc được topic: ", topic)
        console.log("inner đọc được language", language)
    }
    inner();
}
outer();

// Lỗi: outer không đọc được biến level nằm trong inner.
// console.log(level);
// ReferenceError: level is not defined

/*
  Khi gặp một biến, JavaScript sẽ tìm theo thứ tự:
  1. Scope hiện tại
  2. Scope bên ngoài gần nhất
  3. Tiếp tục đi ra ngoài
  4. Global scope

  Nếu không tìm thấy ở đâu hết thì báo ReferenceError.
*/

console.log("\n=== 8. Shadowing ===");

const userName = "Nhat";
function showUserName() {
    const userName = "John"
    console.log("Trong function: ", userName)
}
showUserName();
console.log("Ngoài function: ", userName)

/*
  Shadowing xảy ra khi biến ở scope bên trong
  trùng tên với biến ở scope bên ngoài.

  Trong ví dụ trên:
  - Ngoài function có userName = "Nhat"
  - Trong function cũng có userName = "John"

  Khi console.log trong function,
  JavaScript ưu tiên biến gần nhất nên in ra "John".
*/

console.log("\n=== 9. Shadowing trong block ===");

let status = "global status"
if (true) {
    let status = "block status"
    console.log("Trong block: ", status)
}
console.log("Ngoài block: ", status)

/*
  let/const cho phép khai báo biến trùng tên
  nếu chúng nằm ở scope khác nhau.

  Đây không phải lỗi cú pháp.
  Nhưng nếu lạm dụng sẽ làm code khó đọc.
*/

console.log("\n=== 10. Lexical Scope ===");

const school = "JavaScript School"
function createLesson() {
    const lesson = "Scope"

    function printLesson() {
        console.log("school: ", school)
        console.log("lesson: ", lesson)
    }
    return printLesson();
}
const lessonPrinter = createLesson();
lessonPrinter();

/*
  Lexical scope nghĩa là:
  Scope được quyết định bởi vị trí viết code,
  không phải vị trí gọi function.

  printLesson được viết bên trong createLesson,
  nên nó nhớ được biến lesson của createLesson.
*/

console.log("\n=== 11. Lỗi thường gặp: dùng biến ngoài scope ===");

function calculateTotal() {
    const price = 100;
    const quantity = 2;

    return price * quantity;
}
const total = calculateTotal();
console.log("Total: ", total)

// Lỗi: price chỉ tồn tại trong function calculateTotal.
// console.log(price);
// ReferenceError: price is not defined

/*
  Nếu cần dùng giá trị ở ngoài function,
  hãy return giá trị đó ra ngoài.
*/

console.log("\n=== 12. Tổng kết ===");

/*
  Global Scope:
  - Scope ngoài cùng.
  - Dễ truy cập nhưng không nên lạm dụng.

  Function Scope:
  - Biến trong function chỉ dùng được trong function.
  - var, let, const đều bị giới hạn bởi function.

  Block Scope:
  - Scope bên trong { }.
  - let và const có block scope.
  - var không có block scope.

  Scope Lookup:
  - JavaScript tìm biến từ scope gần nhất ra scope ngoài cùng.

  Shadowing:
  - Biến scope trong trùng tên với biến scope ngoài.
  - Không phải lúc nào cũng sai, nhưng cần dùng cẩn thận.

  Lexical Scope:
  - Scope phụ thuộc vào nơi function được viết.
*/