/**
 * API Versioning — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/api-versioning-example.js"
 *
 * Kiểm tra URI Versioning trong PowerShell:
 *   Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/v1/users/10
 *   Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/v2/users/10
 *
 * Kiểm tra Header Versioning:
 *   Invoke-WebRequest -UseBasicParsing -Uri http://localhost:3000/api/users/10 -Headers @{ "Api-Version"="1" }
 *   Invoke-WebRequest -UseBasicParsing -Uri http://localhost:3000/api/users/10 -Headers @{ "Api-Version"="2" }
 *
 * Kiểm tra endpoint trung lập:
 *   Invoke-RestMethod http://localhost:3000/health
 *
 * Quan sát body v1/v2, Deprecation, Sunset, Link và Vary.
 * Dừng server: nhấn Ctrl+C.
 */

const http = require("node:http");

// Cùng một domain model/data source cho cả hai API contracts.
const users = [
  {
    id: 10,
    firstName: "Minh",
    lastName: "Nhat",
    displayName: "Nhat",
    email: "nhat@example.com",
  },
];

const V1_DEPRECATION_HEADERS = {
  Deprecation: "@1793491200",
  Sunset: "Thu, 31 Dec 2026 23:59:59 GMT",
  Link: '</docs/migrations/v1-to-v2>; rel="deprecation"',
};

class HttpError extends Error {
  constructor(statusCode, error, message) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(body, null, 2));
}

function sendError(response, error) {
  const knownError = error instanceof HttpError;

  sendJson(response, knownError ? error.statusCode : 500, {
    statusCode: knownError ? error.statusCode : 500,
    error: knownError ? error.error : "Internal Server Error",
    message: knownError
      ? error.message
      : "Đã xảy ra lỗi ngoài dự kiến.",
  });
}

function findUser(idText) {
  if (!/^\d+$/.test(idText)) {
    throw new HttpError(
      400,
      "Bad Request",
      "User ID phải là số nguyên dương.",
    );
  }

  const user = users.find((item) => item.id === Number(idText));
  if (!user) {
    throw new HttpError(
      404,
      "Not Found",
      "Không tìm thấy user.",
    );
  }

  return user;
}

function toUserV1(user) {
  return {
    id: user.id,
    name: user.displayName,
  };
}

function toUserV2(user) {
  return {
    id: String(user.id),
    fullName: user.firstName + " " + user.lastName,
    profile: {
      displayName: user.displayName,
      contact: {
        email: user.email,
      },
    },
  };
}

function sendVersionedUser(response, version, user, extraHeaders = {}) {
  if (version === "1") {
    return sendJson(
      response,
      200,
      {
        apiVersion: "1",
        data: toUserV1(user),
      },
      {
        ...V1_DEPRECATION_HEADERS,
        ...extraHeaders,
      },
    );
  }

  if (version === "2") {
    return sendJson(
      response,
      200,
      {
        apiVersion: "2",
        data: toUserV2(user),
      },
      extraHeaders,
    );
  }

  throw new HttpError(
    404,
    "Not Found",
    "API version không được hỗ trợ. Hãy dùng v1 hoặc v2.",
  );
}

function handleRequest(request, response) {
  const url = new URL(request.url, "http://" + request.headers.host);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    throw new HttpError(
      405,
      "Method Not Allowed",
      "Ví dụ chỉ hỗ trợ GET.",
    );
  }

  // VERSION_NEUTRAL tương đương: endpoint không có version.
  if (url.pathname === "/health") {
    return sendJson(response, 200, {
      status: "ok",
      supportedApiVersions: ["1", "2"],
    });
  }

  if (url.pathname === "/docs/migrations/v1-to-v2") {
    return sendJson(response, 200, {
      title: "Migrate API v1 to v2",
      changes: [
        "id đổi từ number sang string",
        "name được thay bằng fullName",
        "profile.contact được bổ sung",
      ],
    });
  }

  // URI Versioning: /api/v1/users/10 hoặc /api/v2/users/10.
  if (
    pathParts.length === 4 &&
    pathParts[0] === "api" &&
    /^v\d+$/.test(pathParts[1]) &&
    pathParts[2] === "users"
  ) {
    const version = pathParts[1].slice(1);
    const user = findUser(pathParts[3]);
    return sendVersionedUser(response, version, user);
  }

  // Header Versioning: URL ổn định, Api-Version chọn contract.
  if (
    pathParts.length === 3 &&
    pathParts[0] === "api" &&
    pathParts[1] === "users"
  ) {
    const version = request.headers["api-version"];

    if (typeof version !== "string" || version === "") {
      throw new HttpError(
        400,
        "Bad Request",
        "Header Api-Version là bắt buộc; hỗ trợ 1 hoặc 2.",
      );
    }

    const user = findUser(pathParts[2]);
    return sendVersionedUser(response, version, user, {
      Vary: "Api-Version",
    });
  }

  throw new HttpError(
    404,
    "Not Found",
    "Endpoint không tồn tại.",
  );
}

const server = http.createServer((request, response) => {
  try {
    handleRequest(request, response);
  } catch (error) {
    if (!response.headersSent) {
      sendError(response, error);
    }
  }
});

server.listen(3000, () => {
  console.log("API Versioning demo chạy tại http://localhost:3000");
  console.log("URI versions: /api/v1/users/10 và /api/v2/users/10");
});
