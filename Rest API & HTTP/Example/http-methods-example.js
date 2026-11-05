/**
 * GET, POST, PUT, PATCH, DELETE — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/http-methods-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *   Invoke-RestMethod http://localhost:3000/users
 *   Invoke-RestMethod -Method Post -Uri http://localhost:3000/users -ContentType application/json -Body '{"name":"Binh","email":"binh@example.com"}'
 *   Invoke-RestMethod -Method Put -Uri http://localhost:3000/users/1 -ContentType application/json -Body '{"name":"An Nguyen","email":"an.nguyen@example.com"}'
 *   Invoke-RestMethod -Method Patch -Uri http://localhost:3000/users/1 -ContentType application/json -Body '{"name":"An Tran"}'
 *   Invoke-RestMethod -Method Delete -Uri http://localhost:3000/users/1
 *
 * Dừng server: nhấn Ctrl+C. Dữ liệu chỉ nằm trong bộ nhớ và được đặt lại khi chạy lại.
 */

const http = require("node:http");

const users = [{ id: 1, name: "An", email: "an@example.com" }];
let nextId = 2;

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

function findUserIndex(id) {
  return users.findIndex((user) => user.id === Number(id));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://" + request.headers.host);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const isUsersCollection = url.pathname === "/users";
  const isUserItem = pathParts.length === 2 && pathParts[0] === "users";

  // GET /users: đọc collection.
  if (request.method === "GET" && isUsersCollection) {
    return sendJson(response, 200, { data: users });
  }

  // GET /users/:id: đọc một resource.
  if (request.method === "GET" && isUserItem) {
    const user = users.find((item) => item.id === Number(pathParts[1]));

    if (!user) {
      return sendJson(response, 404, { message: "Không tìm thấy user." });
    }

    return sendJson(response, 200, { data: user });
  }

  // POST /users: tạo resource mới trong collection.
  if (request.method === "POST" && isUsersCollection) {
    try {
      const { name, email } = await readJsonBody(request);

      if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
        return sendJson(response, 400, {
          message: "name và email là các chuỗi bắt buộc.",
        });
      }

      const user = {
        id: nextId++,
        name: name.trim(),
        email: email.trim(),
      };
      users.push(user);

      return sendJson(response, 201, { data: user }, {
        Location: "/users/" + user.id,
      });
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  // PUT /users/:id: yêu cầu đủ name và email để thay thế trạng thái.
  if (request.method === "PUT" && isUserItem) {
    const index = findUserIndex(pathParts[1]);

    if (index === -1) {
      return sendJson(response, 404, { message: "Không tìm thấy user." });
    }

    try {
      const { name, email } = await readJsonBody(request);

      if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
        return sendJson(response, 400, {
          message: "PUT yêu cầu đầy đủ name và email.",
        });
      }

      users[index] = {
        id: users[index].id,
        name: name.trim(),
        email: email.trim(),
      };

      return sendJson(response, 200, { data: users[index] });
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  // PATCH /users/:id: chỉ thay đổi các trường được gửi lên.
  if (request.method === "PATCH" && isUserItem) {
    const index = findUserIndex(pathParts[1]);

    if (index === -1) {
      return sendJson(response, 404, { message: "Không tìm thấy user." });
    }

    try {
      const changes = await readJsonBody(request);
      const allowedFields = ["name", "email"];
      const providedFields = allowedFields.filter(
        (field) => changes[field] !== undefined,
      );

      if (
        providedFields.length === 0 ||
        providedFields.some((field) => !isNonEmptyString(changes[field]))
      ) {
        return sendJson(response, 400, {
          message: "PATCH yêu cầu ít nhất name hoặc email hợp lệ.",
        });
      }

      for (const field of providedFields) {
        users[index][field] = changes[field].trim();
      }

      return sendJson(response, 200, { data: users[index] });
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  // DELETE /users/:id: xóa resource và không trả response body.
  if (request.method === "DELETE" && isUserItem) {
    const index = findUserIndex(pathParts[1]);

    if (index === -1) {
      return sendJson(response, 404, { message: "Không tìm thấy user." });
    }

    users.splice(index, 1);
    response.writeHead(204);
    return response.end();
  }

  if (isUsersCollection || isUserItem) {
    response.setHeader(
      "Allow",
      isUsersCollection ? "GET, POST" : "GET, PUT, PATCH, DELETE",
    );
    return sendJson(response, 405, {
      message: "HTTP method không được hỗ trợ cho URI này.",
    });
  }

  return sendJson(response, 404, { message: "Endpoint không tồn tại." });
});

server.listen(3000, () => {
  console.log("HTTP methods API đang chạy tại http://localhost:3000");
  console.log("Thử: Invoke-RestMethod http://localhost:3000/users");
});
