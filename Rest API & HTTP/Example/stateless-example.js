/**
 * Stateful và Stateless — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/stateless-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *
 * 1. Session được tạo và chỉ lưu ở server A:
 *   $session = Invoke-RestMethod -Method Post -Uri http://localhost:3000/stateful/login -Headers @{ "X-Server"="A" } -ContentType application/json -Body '{"username":"Nhat","password":"demo"}'
 *   Invoke-RestMethod -Uri http://localhost:3000/stateful/profile -Headers @{ "X-Server"="A"; Authorization="Session $($session.sessionId)" }
 *   Invoke-WebRequest -UseBasicParsing -Uri http://localhost:3000/stateful/profile -Headers @{ "X-Server"="B"; Authorization="Session $($session.sessionId)" }
 *
 * 2. Token do A ký có thể được server B xác minh:
 *   $login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/stateless/login -Headers @{ "X-Server"="A" } -ContentType application/json -Body '{"username":"Nhat","password":"demo"}'
 *   Invoke-RestMethod -Uri http://localhost:3000/stateless/profile -Headers @{ "X-Server"="B"; Authorization="Bearer $($login.accessToken)" }
 *
 * Request stateful tới B cố ý nhận 401. Xem response header X-Handled-By
 * để biết instance mô phỏng nào đã xử lý request.
 * Dừng server: nhấn Ctrl+C.
 */

const http = require("node:http");
const {
  createHmac,
  randomUUID,
  timingSafeEqual,
} = require("node:crypto");

// Hai instance mô phỏng có memory riêng nhưng cùng cấu hình token.
const instances = {
  A: { sessions: new Map() },
  B: { sessions: new Map() },
};

// Chỉ phục vụ bài học. Production phải quản lý secret an toàn và dùng
// thư viện token/JWT đã được kiểm chứng.
const SHARED_SIGNING_SECRET = "demo-shared-secret";

class HttpError extends Error {
  constructor(statusCode, error, message, headers = {}) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.headers = headers;
  }
}

function sendJson(response, statusCode, body, serverName, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Handled-By": "server-" + serverName,
    ...headers,
  });
  response.end(JSON.stringify(body, null, 2));
}

function sendError(response, error, serverName) {
  const knownError = error instanceof HttpError;
  const statusCode = knownError ? error.statusCode : 500;

  if (!knownError) {
    console.error(error);
  }

  sendJson(
    response,
    statusCode,
    {
      statusCode,
      error: knownError ? error.error : "Internal Server Error",
      message: knownError
        ? error.message
        : "Đã xảy ra lỗi ngoài dự kiến.",
    },
    serverName,
    knownError ? error.headers : {},
  );
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
        reject(
          new HttpError(
            400,
            "Bad Request",
            "Body phải là JSON hợp lệ.",
          ),
        );
      }
    });
    request.on("error", reject);
  });
}

function selectInstance(request) {
  const serverName = request.headers["x-server"];

  if (serverName !== "A" && serverName !== "B") {
    throw new HttpError(
      400,
      "Bad Request",
      "Header X-Server phải là A hoặc B.",
    );
  }

  return {
    serverName,
    instance: instances[serverName],
  };
}

function validateCredentials(body) {
  if (body.username !== "Nhat" || body.password !== "demo") {
    throw new HttpError(
      401,
      "Unauthorized",
      "Username hoặc password không hợp lệ.",
      { "WWW-Authenticate": "Session, Bearer" },
    );
  }

  return {
    id: "user-123",
    name: "Nhat",
    role: "USER",
  };
}

function signPayload(encodedPayload) {
  return createHmac("sha256", SHARED_SIGNING_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}

function createSignedToken(user) {
  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 5 * 60,
  };
  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");

  return encodedPayload + "." + signPayload(encodedPayload);
}

function verifySignedToken(token) {
  const [encodedPayload, receivedSignature, extraPart] =
    token.split(".");

  if (!encodedPayload || !receivedSignature || extraPart) {
    throw new HttpError(
      401,
      "Unauthorized",
      "Token sai định dạng.",
      { "WWW-Authenticate": "Bearer" },
    );
  }

  const expectedSignature = signPayload(encodedPayload);
  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new HttpError(
      401,
      "Unauthorized",
      "Token không hợp lệ.",
      { "WWW-Authenticate": "Bearer" },
    );
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );

    if (
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      throw new Error("Invalid claims");
    }

    return payload;
  } catch {
    throw new HttpError(
      401,
      "Unauthorized",
      "Token hết hạn hoặc claims không hợp lệ.",
      { "WWW-Authenticate": "Bearer" },
    );
  }
}

function getCredential(request, scheme) {
  const authorization = request.headers.authorization || "";
  const prefix = scheme + " ";

  if (!authorization.startsWith(prefix)) {
    throw new HttpError(
      401,
      "Unauthorized",
      "Thiếu credential theo scheme " + scheme + ".",
      { "WWW-Authenticate": scheme },
    );
  }

  return authorization.slice(prefix.length);
}

async function handleRequest(request, response) {
  const { serverName, instance } = selectInstance(request);
  const url = new URL(request.url, "http://" + request.headers.host);

  // Stateful: session context chỉ tồn tại trong memory instance hiện tại.
  if (request.method === "POST" && url.pathname === "/stateful/login") {
    const user = validateCredentials(await readJsonBody(request));
    const sessionId = randomUUID();

    instance.sessions.set(sessionId, user);
    return sendJson(
      response,
      200,
      { sessionId, storedAt: "server-" + serverName },
      serverName,
    );
  }

  if (request.method === "GET" && url.pathname === "/stateful/profile") {
    const sessionId = getCredential(request, "Session");
    const user = instance.sessions.get(sessionId);

    if (!user) {
      throw new HttpError(
        401,
        "Unauthorized",
        "Server " + serverName + " không có session này.",
        { "WWW-Authenticate": "Session" },
      );
    }

    return sendJson(
      response,
      200,
      { data: user, sessionReadFrom: "server-" + serverName },
      serverName,
    );
  }

  // Stateless: A ký token; A hoặc B đều xác minh bằng shared key.
  if (request.method === "POST" && url.pathname === "/stateless/login") {
    const user = validateCredentials(await readJsonBody(request));
    const accessToken = createSignedToken(user);

    return sendJson(
      response,
      200,
      { accessToken, tokenType: "Bearer", expiresIn: 300 },
      serverName,
    );
  }

  if (request.method === "GET" && url.pathname === "/stateless/profile") {
    const token = getCredential(request, "Bearer");
    const claims = verifySignedToken(token);

    return sendJson(
      response,
      200,
      {
        data: {
          id: claims.sub,
          name: claims.name,
          role: claims.role,
        },
        verifiedBy: "server-" + serverName,
      },
      serverName,
    );
  }

  throw new HttpError(
    404,
    "Not Found",
    "Endpoint không tồn tại.",
  );
}

const server = http.createServer((request, response) => {
  let serverName = request.headers["x-server"];
  if (serverName !== "A" && serverName !== "B") {
    serverName = "unknown";
  }

  Promise.resolve(handleRequest(request, response)).catch((error) => {
    if (!response.headersSent) {
      sendError(response, error, serverName);
    }
  });
});

server.listen(3000, () => {
  console.log("Stateful/stateless demo chạy tại http://localhost:3000");
  console.log("Gửi header X-Server: A hoặc X-Server: B");
});
