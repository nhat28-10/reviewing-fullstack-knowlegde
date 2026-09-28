/*
  Optional Chaining & Nullish Coalescing trong JavaScript

  Chạy file:
  node JavaScript/Examples/optionalchaining-nullishcoalescing.js
*/

console.log("=== 1. Optional chaining với object ===");

const userWithProfile = {
  profile: {
    name: "Nhat",
  },
};

const userWithoutProfile = {};

console.log("userWithProfile:", userWithProfile.profile?.name);
console.log("userWithoutProfile:", userWithoutProfile.profile?.name);

/*
  userWithoutProfile.profile là undefined.
  Nhờ có ?. nên code trả về undefined thay vì crash.
*/

console.log("\n=== 2. Optional chaining nhiều tầng ===");

const apiUser = {
  profile: {
    address: null,
  },
};

console.log("city:", apiUser.profile?.address?.city);

/*
  address là null.
  apiUser.profile?.address?.city trả về undefined.
*/

console.log("\n=== 3. Optional chaining với function ===");

const logger = {
  info(message) {
    console.log("info:", message);
  },
};

logger.info?.("User loaded");
logger.warn?.("This method does not exist");

/*
  info tồn tại nên được gọi.
  warn không tồn tại nên logger.warn?.() không chạy và không gây lỗi.
*/

console.log("\n=== 4. Optional chaining với array ===");

const users = [
  {
    name: "Nhat",
  },
];

const emptyUsers = null;

console.log("users?.[0]?.name:", users?.[0]?.name);
console.log("emptyUsers?.[0]?.name:", emptyUsers?.[0]?.name);

/*
  ?.[] hữu ích khi array có thể null hoặc undefined.
*/

console.log("\n=== 5. Nullish coalescing với ?? ===");

const displayName = null;
const nickname = "";
const count = 0;
const isActive = false;

console.log("displayName ?? 'Guest':", displayName ?? "Guest");
console.log("nickname ?? 'Guest':", nickname ?? "Guest");
console.log("count ?? 10:", count ?? 10);
console.log("isActive ?? true:", isActive ?? true);

/*
  ?? chỉ fallback khi bên trái là null hoặc undefined.
  "", 0, false vẫn là giá trị hợp lệ.
*/

console.log("\n=== 6. So sánh ?? và || ===");

console.log("'' || 'Guest':", "" || "Guest");
console.log("'' ?? 'Guest':", "" ?? "Guest");

console.log("0 || 10:", 0 || 10);
console.log("0 ?? 10:", 0 ?? 10);

console.log("false || true:", false || true);
console.log("false ?? true:", false ?? true);

/*
  || fallback với falsy value.
  ?? chỉ fallback với null hoặc undefined.
*/

console.log("\n=== 7. Kết hợp ?. và ?? ===");

const response = {
  user: {
    profile: null,
  },
};

const city = response.user?.profile?.address?.city ?? "Unknown";
const avatarUrl = response.user?.profile?.avatar ?? "/default-avatar.png";

console.log("city:", city);
console.log("avatarUrl:", avatarUrl);

/*
  Pattern này hay dùng khi đọc API response.
  ?. giúp truy cập an toàn.
  ?? giúp đặt fallback hợp lý.
*/

console.log("\n=== 8. Tổng kết nhanh ===");

/*
  Optional chaining ?.:
  - Dừng khi giá trị trước nó là null hoặc undefined.
  - Trả về undefined thay vì crash.
  - Dùng được với property, function, array index.

  Nullish coalescing ??:
  - Fallback khi bên trái là null hoặc undefined.
  - Không fallback với "", 0, false.
*/
