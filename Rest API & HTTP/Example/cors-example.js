/**
 * CÀI ĐẶT
 * - Không cần cài package; chỉ cần Node.js 18+.
 *
 * CHẠY
 *   node "Rest API & HTTP/Example/cors-example.js"
 *
 * KIỂM TRA (mở terminal khác)
 * 1. Simple request từ origin được phép:
 *    curl.exe -i http://localhost:3000/api/users -H "Origin: http://localhost:5173"
 * 2. Preflight hợp lệ:
 *    curl.exe -i -X OPTIONS http://localhost:3000/api/products -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: authorization,content-type"
 * 3. Preflight từ origin không được phép (không có Access-Control-Allow-Origin):
 *    curl.exe -i -X OPTIONS http://localhost:3000/api/products -H "Origin: http://evil.example" -H "Access-Control-Request-Method: POST"
 * 4. Dừng server bằng Ctrl+C.
 *
 * Lưu ý: curl chỉ hiển thị header; chính trình duyệt mới thực thi CORS.
 */

const http = require("node:http");

const PORT = 3000;
const ALLOWED_ORIGINS = new Set(["http://localhost:5173"]);
const ALLOWED_METHODS = ["GET", "POST", "OPTIONS"];
const ALLOWED_HEADERS = ["authorization", "content-type"];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handlePreflight(req, res) {
  const origin = req.headers.origin;
  const requestedMethod = req.headers["access-control-request-method"];
  const requestedHeaders = String(
    req.headers["access-control-request-headers"] || "",
  )
    .split(",")
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);

  const originAllowed = ALLOWED_ORIGINS.has(origin);
  const methodAllowed = ALLOWED_METHODS.includes(requestedMethod);
  const headersAllowed = requestedHeaders.every((header) =>
    ALLOWED_HEADERS.includes(header),
  );

  if (!originAllowed || !methodAllowed || !headersAllowed) {
    return sendJson(res, 403, { error: "CORS preflight rejected" });
  }

  res.writeHead(204, {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
    "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(", "),
    "Access-Control-Max-Age": "600",
    Vary: "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
  });
  return res.end();
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    return handlePreflight(req, res);
  }

  // Thêm CORS header cho cả response thành công và response lỗi.
  setCorsHeaders(req, res);

  if (req.method === "GET" && req.url === "/api/users") {
    return sendJson(res, 200, [{ id: 1, name: "Nhat" }]);
  }

  if (req.method === "POST" && req.url === "/api/products") {
    return sendJson(res, 201, {
      id: 101,
      message: "Product created (demo)",
    });
  }

  return sendJson(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`CORS demo: http://localhost:${PORT}`);
  console.log("Allowed origin: http://localhost:5173");
});
