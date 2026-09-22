/*
  Primitive & Reference trong JavaScript

  Chạy file:
  node JavaScript/Examples/primitive-reference.js
*/

console.log("=== 1. Primitive copy theo value ===");

let a = 10
let b = a;

b = 20
console.log("a:", a) // 10
console.log("b:", b) // 20
/**
 * b nhận 1 bản copy giá trị từ a.
 * Vì vậy đổi b không làm đổi a
 */

console.log("\n=== 2. Reference copy theo địa chỉ tham chiếu ===");

const user1 = {
    name: "Nhat"
}
const user2 = user1
user2.name = "John"
console.log("user1:", user1) // name = John
console.log("user2:", user2) // name = John

/**
 * user1 và user2 cùng trỏ tới 1 object
 * Sửa qua user2 cũng làm object mà user1 đang trỏ tới thay đổi.
 */

console.log("\n=== 3. So sánh object ===");

const obj1 = {
    name: "Nhat"
}

const obj2 = {
    name: "Nhat"
}
console.log(obj1 === obj2) // false

const obj3 = obj1
console.log(obj1 === obj3) // true

/**
 * obj1 và obj2 nhìn giống nhau nhưng thật chất là khác nhau
 * obj3 = obj1 nên cả hai cùng tham chiếu đến 1 object
 */

console.log("\n=== 4. Shallow copy với spread operator ===");

const originalUser = {
    name: "Nhat",
    age: 22
}

const copiedUser = {
    ...originalUser,
}

copiedUser.name = "John"

console.log("originalUser:", originalUser) // name:"Nhat",age: 22
console.log("copiedUser:", copiedUser) // name :"John", age:22
/**
 * Spread operator tạo object mới ở tầng đầu tiên
 * Đây gọi là shadow copy
 */

console.log("\n=== 5. undefined ===");

let age;
console.log(age) // undefined

const student = {
    name: "Nhat"
}
console.log(student.email) // undefined

function doNothing() {

}
console.log(doNothing()) // undefined

/**
 * Undefined thường xuất hiện khi
 * Biến chưa được gắn giá trị
 * Thuộc tính không tồn tại
 * Function không trả gì về
 */

console.log("\n=== 6. null ===");

const selectedUser = null

const profile = {
    name: "Nhat",
    avatar: null,
}

console.log(selectedUser) // null
console.log(profile.avatar) // null

/**
 * null thường được lập trình viên chủ động gán
 * Ý nghĩa: Hiện tại không có giá trị
 */

console.log("\n=== 7. null vs undefined ===");

const account = {
    name: "Nhat",
    avatar: null,
}
console.log(account.avatar) // null
console.log(account.email) // undefined

/**
 * avatar: null -> Nghĩa là field avatar có tồn tồn, nhưng chưa có giá trị
 * email undefined -> Nghĩa là thuộc tính email không tồn tại trong object trên
 */

console.log("\n=== 8. typeof null ===");

console.log(typeof undefined) // "undefined"
console.log(typeof null) // "object"

/**
 * typeof null trả về "object" là lỗi lịch sử của JavaScript
 * Nhưng null vẫn là primitive value
 */