/**
 * Status code 400, 401, 403, 404, 409 và 500 — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/status-code-error-example.js"
 *
 * Kiểm tra trong PowerShell (các lệnh cố ý nhận error response):
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/users -ContentType application/json -Body '{"name":"","email":"invalid"}'
 *   Invoke-WebRequest -UseBasicParsing http://localhost:3000/profile
 *   Invoke-WebRequest -UseBasicParsing -Method Delete -Uri http://localhost:3000/admin/users/1 -Headers @{ Authorization = "Bearer valid-user-token" }
 *   Invoke-WebRequest -UseBasicParsing http://localhost:3000/users/999
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/users -ContentType application/json -Body '{"name":"Other","email":"nhat@example.com"}'
 *   Invoke-WebRequest -UseBasicParsing http://localhost:3000/debug/crash
 *
 * PowerShell ném exception cho 4xx/5xx; status code vẫn xuất hiện trong thông báo.
 * Dừng server: nhấn Ctrl+C. Dữ liệu được đặt lại khi chạy lại.
 */

const http = require("node:http");

const users = [{ id: 1, name: "Nhat", email: "nhat@example.com" }];
let nextId = 2;
let requestSequence = 0;

const errorNames = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  500: "Internal Server Error",
};

class HttpError extends Error {
  constructor(statusCode, message, headers = {}) {
    super(message);
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(body, null, 2));
}

function sendError(response, error, requestId) {
  const knownError = error instanceof HttpError;
  const statusCode = knownError ? error.statusCode : 500;
  const message = knownError
    ? error.message
    : "Đã xảy ra lỗi ngoài dự kiến.";
  const headers = knownError ? error.headers : {};

  if (!knownError) {
    // Chi tiết chỉ được log phía server, không gửi stack trace cho client.
    console.error("[" + requestId + "]", error);
  }

  sendJson(response, statusCode, {
    statusCode,
    error: errorNames[statusCode],
    message,
    requestId,
  }, {
    "X-Request-Id": requestId,
    ...headers,
  });
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
        reject(new HttpError(400, "Body phải là JSON hợp lệ."));
      }
    });
    request.on("error", reject);
  });
}

function getRole(request) {
  const authorization = request.headers.authorization;

  if (authorization === "Bearer valid-admin-token") {
    return "ADMIN";
  }

  if (authorization === "Bearer valid-user-token") {
    return "USER";
  }

  throw new HttpError(
    401,
    "Access token thiếu, hết hạn hoặc không hợp lệ.",
    { "WWW-Authenticate": "Bearer" },
  );
}

function isValidEmail(value) {
  return (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

async function handleRequest(request, response, requestId) {
  const url = new URL(request.url, "http://" + request.headers.host);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // 400: dữ liệu request không hợp lệ.
  // 409: dữ liệu hợp lệ nhưng email xung đột với state hiện tại.
  if (request.method === "POST" && url.pathname === "/users") {
    const { name, email } = await readJsonBody(request);

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !isValidEmail(email)
    ) {
      throw new HttpError(400, "name và email hợp lệ là bắt buộc.");
    }

    if (users.some((user) => user.email === email.trim().toLowerCase())) {
      throw new HttpError(409, "Email đã tồn tại.");
    }

    const user = {
      id: nextId++,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };
    users.push(user);

    return sendJson(response, 201, { data: user }, {
      Location: "/users/" + user.id,
      "X-Request-Id": requestId,
    });
  }

  // 401: thiếu hoặc sai credential.
  if (request.method === "GET" && url.pathname === "/profile") {
    const role = getRole(request);
    return sendJson(response, 200, {
      data: { id: 1, name: "Nhat", role },
    }, {
      "X-Request-Id": requestId,
    });
  }

  // 403: đã xác thực nhưng role USER không có quyền quản trị.
  if (
    request.method === "DELETE" &&
    pathParts.length === 3 &&
    pathParts[0] === "admin" &&
    pathParts[1] === "users"
  ) {
    const role = getRole(request);

    if (role !== "ADMIN") {
      throw new HttpError(403, "Bạn không có quyền xóa user.");
    }

    const index = users.findIndex(
      (user) => user.id === Number(pathParts[2]),
    );
    if (index === -1) {
      throw new HttpError(404, "Không tìm thấy user.");
    }

    users.splice(index, 1);
    response.writeHead(204, { "X-Request-Id": requestId });
    return response.end();
  }

  // 400 nếu ID sai định dạng; 404 nếu ID hợp lệ nhưng resource không có.
  if (
    request.method === "GET" &&
    pathParts.length === 2 &&
    pathParts[0] === "users"
  ) {
    if (!/^\d+$/.test(pathParts[1])) {
      throw new HttpError(400, "User ID phải là số nguyên dương.");
    }

    const user = users.find((item) => item.id === Number(pathParts[1]));
    if (!user) {
      throw new HttpError(404, "Không tìm thấy user.");
    }

    return sendJson(response, 200, { data: user }, {
      "X-Request-Id": requestId,
    });
  }

  // 500: mô phỏng exception ngoài dự kiến để kiểm tra global handler.
  if (request.method === "GET" && url.pathname === "/debug/crash") {
    throw new Error("Thông tin nội bộ chỉ được ghi trong server log.");
  }

  throw new HttpError(404, "Endpoint không tồn tại.");
}

const server = http.createServer((request, response) => {
  const requestId = "req-" + String(++requestSequence).padStart(4, "0");

  Promise.resolve(handleRequest(request, response, requestId)).catch(
    (error) => {
      if (!response.headersSent) {
        sendError(response, error, requestId);
      }
    },
  );
});

server.listen(3000, () => {
  console.log("Error status API đang chạy tại http://localhost:3000");
  console.log("Thử endpoint /profile mà không gửi Authorization header.");
});
