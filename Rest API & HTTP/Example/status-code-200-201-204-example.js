/**
 * Status code 200, 201 và 204 — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/status-code-200-201-204-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *   Invoke-WebRequest -UseBasicParsing http://localhost:3000/users/1
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/users -ContentType application/json -Body '{"name":"Binh","email":"binh@example.com"}'
 *   Invoke-WebRequest -UseBasicParsing -Method Patch -Uri http://localhost:3000/users/1 -ContentType application/json -Body '{"name":"An Nguyen"}'
 *   Invoke-WebRequest -UseBasicParsing -Method Delete -Uri http://localhost:3000/users/1
 *
 * Quan sát StatusCode, header Location và Content.Length của từng response.
 * Dừng server: nhấn Ctrl+C. Dữ liệu được đặt lại khi chạy lại.
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

function sendNoContent(response) {
  response.writeHead(204);
  response.end();
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

  // 200 OK: thành công và trả JSON representation.
  if (request.method === "GET" && isUserItem) {
    const index = findUserIndex(pathParts[1]);

    if (index === -1) {
      return sendJson(response, 404, { message: "Không tìm thấy user." });
    }

    return sendJson(response, 200, { data: users[index] });
  }

  // 201 Created: tạo resource, trả representation và Location.
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

  // 204 No Content: cập nhật thành công nhưng không trả response body.
  if (request.method === "PATCH" && isUserItem) {
    const index = findUserIndex(pathParts[1]);

    if (index === -1) {
      return sendJson(response, 404, { message: "Không tìm thấy user." });
    }

    try {
      const { name } = await readJsonBody(request);

      if (!isNonEmptyString(name)) {
        return sendJson(response, 400, {
          message: "name là chuỗi bắt buộc.",
        });
      }

      users[index].name = name.trim();
      return sendNoContent(response);
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  // 204 No Content: xóa thành công và không trả response body.
  if (request.method === "DELETE" && isUserItem) {
    const index = findUserIndex(pathParts[1]);

    if (index === -1) {
      return sendJson(response, 404, { message: "Không tìm thấy user." });
    }

    users.splice(index, 1);
    return sendNoContent(response);
  }

  if (isUsersCollection || isUserItem) {
    response.setHeader(
      "Allow",
      isUsersCollection ? "POST" : "GET, PATCH, DELETE",
    );
    return sendJson(response, 405, {
      message: "HTTP method không được hỗ trợ cho URI này.",
    });
  }

  return sendJson(response, 404, { message: "Endpoint không tồn tại." });
});

server.listen(3000, () => {
  console.log("Status code API đang chạy tại http://localhost:3000");
  console.log("Thử: Invoke-WebRequest -UseBasicParsing http://localhost:3000/users/1");
});
