/**
 * PUT và PATCH — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/put-patch-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *   Invoke-RestMethod http://localhost:3000/users/10
 *   Invoke-RestMethod -Method Put -Uri http://localhost:3000/users/10 -ContentType application/json -Body '{"name":"Minh Nhat","email":"minh@example.com","age":23}'
 *   Invoke-RestMethod -Method Patch -Uri http://localhost:3000/users/10 -ContentType application/json -Body '{"name":"Nhat Tran"}'
 *   Invoke-RestMethod -Method Patch -Uri http://localhost:3000/users/10/age -ContentType application/json -Body '{"incrementBy":1}'
 *
 * Hãy gửi mỗi request nhiều lần rồi quan sát:
 * - PUT cùng body và PATCH đặt name cho cùng trạng thái cuối (idempotent).
 * - PATCH tăng age tiếp tục thay đổi trạng thái (không idempotent).
 * Dừng server: nhấn Ctrl+C.
 */

const http = require("node:http");

let user = {
  id: 10,
  name: "Nhat",
  email: "nhat@gmail.com",
  age: 22,
};

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(body, null, 2));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Body phải là JSON hợp lệ."));
      }
    });
    request.on("error", reject);
  });
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isValidAge(value) {
  return Number.isInteger(value) && value >= 0;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://" + request.headers.host);
  const isUserRoute = url.pathname === "/users/10";
  const isAgeRoute = url.pathname === "/users/10/age";

  if (request.method === "GET" && isUserRoute) {
    return sendJson(response, 200, { data: user });
  }

  // PUT thay thế tất cả trường mà client được phép quản lý.
  if (request.method === "PUT" && isUserRoute) {
    try {
      const replacement = await readJsonBody(request);

      if (
        !isNonEmptyString(replacement.name) ||
        !isNonEmptyString(replacement.email) ||
        !isValidAge(replacement.age)
      ) {
        return sendJson(response, 400, {
          message: "PUT yêu cầu đầy đủ name, email và age hợp lệ.",
        });
      }

      user = {
        id: user.id,
        name: replacement.name.trim(),
        email: replacement.email.trim(),
        age: replacement.age,
      };

      return sendJson(response, 200, { data: user });
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  // PATCH này đặt giá trị các trường được gửi, nên cùng body có tính idempotent.
  if (request.method === "PATCH" && isUserRoute) {
    try {
      const changes = await readJsonBody(request);
      const allowedFields = ["name", "email", "age"];
      const providedFields = Object.keys(changes);

      if (
        providedFields.length === 0 ||
        providedFields.some((field) => !allowedFields.includes(field))
      ) {
        return sendJson(response, 400, {
          message: "Chỉ được PATCH name, email hoặc age.",
        });
      }

      if (
        (changes.name !== undefined && !isNonEmptyString(changes.name)) ||
        (changes.email !== undefined && !isNonEmptyString(changes.email)) ||
        (changes.age !== undefined && !isValidAge(changes.age))
      ) {
        return sendJson(response, 400, {
          message: "Giá trị PATCH không hợp lệ.",
        });
      }

      user = {
        ...user,
        ...changes,
        ...(changes.name === undefined ? {} : { name: changes.name.trim() }),
        ...(changes.email === undefined ? {} : { email: changes.email.trim() }),
      };

      return sendJson(response, 200, { data: user });
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  // PATCH theo contract riêng: mỗi lần gọi đều tăng age nên không idempotent.
  if (request.method === "PATCH" && isAgeRoute) {
    try {
      const { incrementBy } = await readJsonBody(request);

      if (!Number.isInteger(incrementBy) || incrementBy === 0) {
        return sendJson(response, 400, {
          message: "incrementBy phải là số nguyên khác 0.",
        });
      }

      const nextAge = user.age + incrementBy;
      if (!isValidAge(nextAge)) {
        return sendJson(response, 400, {
          message: "Kết quả age phải là số nguyên không âm.",
        });
      }

      user.age = nextAge;
      return sendJson(response, 200, { data: user });
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  if (isUserRoute) {
    response.setHeader("Allow", "GET, PUT, PATCH");
    return sendJson(response, 405, {
      message: "HTTP method không được hỗ trợ cho URI này.",
    });
  }

  if (isAgeRoute) {
    response.setHeader("Allow", "PATCH");
    return sendJson(response, 405, {
      message: "HTTP method không được hỗ trợ cho URI này.",
    });
  }

  return sendJson(response, 404, { message: "Endpoint không tồn tại." });
});

server.listen(3000, () => {
  console.log("PUT/PATCH API đang chạy tại http://localhost:3000");
  console.log("Thử: Invoke-RestMethod http://localhost:3000/users/10");
});
