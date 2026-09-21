/*
    Variables trong JavaScript: var, let, const

        Cách hiểu:
        1. Chạy file: node JavaScript/Examples/variable.js
        2. Đọc từng block từ trên xuống dưới.
        3. Các dòng sai sẽ được comment lại. Nếu muốn thấy lỗi thật,hay bỏ dấu // của từng dòng và chạy lại file.
*/
console.log("=== 1. Khai báo biến cơ bản ===");
var userName = "Nhat";
let age = 22;
const country = "Viet Nam";

console.log("var userName:", userName);
console.log("let age:", age);
console.log("const country:", country);

/*
    Ghi nhớ nhanh
    - var: Cách cũ, có thể gắn lại, có thể khai báo lại
    - let: Cách mới, có thể gắn lại, không được khai báo lại trong cùng scope
    - const: Cách mới, không thể gắn lại, phải gắn giá trị khi khai báo ngoài ra có thể thay đổi được thuộc tính trong object

 */

console.log("\n=== 2. var: Có thể gắn lại và khai báo lại ===");
var job = "Full-stack Developer";
console.log("Lần 1:", job);

job = "Backend Developer";
console.log("Sau khi gắn lại giá trị:", job);

var job = "Frontend Developer";
console.log("Sau khi gắn lại bằng var:", job);
/* 
    Điểm cẩn thận với var:
    Var cho phép khai báo lại nên đôi khi mình vô tình ghi đè giá trị cũ.
*/

console.log("\n=== 3. let: Có thể gắn lại nhưng không được khai báo lại ===");

let score = 10;
console.log("Score lần 1:", score);

score = 20;
console.log("Score lần 2:", score);

// Lỗi: let không được khai báo lại trong cùng một scope
// VD: let score = 10, mà phía dưới let score = 20l thì báo SyntaxError: Identifier 'score' has already been declared

/* 
    Khi nào nên dùng let?
    Dùng let khi giá trị của biến cần thay đổi sau đó
    Ví dụ: biến đếm, trạng thái bật/tắt, tổng tiền đang tính ,...
    let retryCount = 1;
    retryCount++;
*/

console.log("\n=== 4. const: Không được gắn lại ===");
const pi = 3.14;
console.log("pi:", pi);
/* 
    Lỗi: const không cho gắn giá trị mới
    const pi = 3.14159 // TypeError: Assignment to constant variable

    Lỗi: Const sau khi khai báo phải gắn giá trị ngay
    const emptyValue; // SyntaxError: Missing initializer in const declaration

    Khi nào nên dùng const
    Mặc định nên dùng const trước
    Nếu sau này cần gắn giá trị thì đổi sang let
*/

console.log("\n=== 5. const: với object/array: không đổi biến, nhưng đổi được bên trong ===");

const user = {
    name: "Nhat",
    age: 22,
}
console.log("User ban đầu:", user);

user.age = "23"
console.log("Sau khi đổi thuộc tính age", user);

user.email = "nhat@example.com";
console.log("Sau khi thêm thuộc tính email", user);

/* 
    Lỗi: không được gắn user sang 1 object mới
    VD: user = {name: "Alex"}; // TypeError: Assigment to constant varaible
*/

const numbers = [1, 2, 3];
console.log("Mảng number ban đầu: ", numbers);

numbers.push(4);
console.log("Sau khi push vào array const numbers:", numbers);

/* 
    Lỗi: Như object không được gắn sang mảng mới
    VD: number = [1,2,3,4,5] // TypeError như trên
    Điểm quan trọng: 
    - const không cho gắn lại biến
    - const không làm object/array thành bất biến hoàn toàn
*/
