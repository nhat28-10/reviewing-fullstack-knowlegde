/**
 * REST và Resource — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/rest-resource-example.js"
 * Kiểm tra trong PowerShell (mở terminal khác):
 *   Invoke-RestMethod http://localhost:3000/families
 *   Invoke-RestMethod http://localhost:3000/families/42
 *   Invoke-WebRequest http://localhost:3000/families/999
 *   Invoke-RestMethod -Method Post -Uri http://localhost:3000/families -ContentType application/json -Body '{"name":"New Family"}'
 * Dừng server: nhấn Ctrl+C.
 */

const http = require("node:http");

const families = [
  { id: "42", name: "My Family", memberCount: 4 },
  { id: "43", name: "Weekend Club", memberCount: 2 },
];

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
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
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Collection resource: GET /families
  if (request.method === "GET" && url.pathname === "/families") {
    return sendJson(response, 200, { data: families });
  }

  // Item resource: GET /families/:id
  if (request.method === "GET" && pathParts.length === 2 && pathParts[0] === "families") {
    const family = families.find((item) => item.id === pathParts[1]);

    if (!family) {
      return sendJson(response, 404, { message: "Không tìm thấy family." });
    }

    // Đây là JSON representation của resource family.
    return sendJson(response, 200, { data: family });
  }

  // Tạo item trong collection: POST /families
  if (request.method === "POST" && url.pathname === "/families") {
    try {
      const { name, memberCount = 0 } = await readJsonBody(request);

      if (typeof name !== "string" || name.trim() === "") {
        return sendJson(response, 400, { message: "name là chuỗi bắt buộc." });
      }

      if (!Number.isInteger(memberCount) || memberCount < 0) {
        return sendJson(response, 400, { message: "memberCount phải là số nguyên không âm." });
      }

      const family = {
        id: String(Date.now()),
        name: name.trim(),
        memberCount,
      };

      families.push(family);
      return sendJson(response, 201, { data: family });
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
  }

  return sendJson(response, 404, { message: "Endpoint không tồn tại." });
});

server.listen(3000, () => {
  console.log("REST API đang chạy tại http://localhost:3000");
  console.log("Thử: curl http://localhost:3000/families/42");
});
