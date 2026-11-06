/**
 * Authorization, Content-Type và Accept — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/request-headers-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/messages -Headers @{ Authorization="Bearer valid-token"; Accept="application/json" } -ContentType application/json -Body '{"message":"Hello"}'
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/messages -Headers @{ Authorization="Bearer valid-token"; Accept="text/plain" } -ContentType application/json -Body '{"message":"Hello"}'
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/messages -Headers @{ Accept="application/json" } -ContentType application/json -Body '{"message":"Hello"}'
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/messages -Headers @{ Authorization="Bearer valid-token"; Accept="application/json" } -ContentType text/plain -Body 'Hello'
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/messages -Headers @{ Authorization="Bearer valid-token"; Accept="application/xml" } -ContentType application/json -Body '{"message":"Hello"}'
 *
 * Quan sát StatusCode, Content-Type, Location và Vary trong response.
 * Dừng server: nhấn Ctrl+C. Dữ liệu được đặt lại khi chạy lại.
 */

const http = require("node:http");

const messages = [];
let nextId = 1;

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(body, null, 2));
}

function sendError(response, statusCode, error, message, headers = {}) {
  sendJson(response, statusCode, { statusCode, error, message }, headers);
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

function authenticate(request) {
  return request.headers.authorization === "Bearer valid-token";
}

function getMediaType(contentType = "") {
  return contentType.split(";", 1)[0].trim().toLowerCase();
}

function parseAccept(acceptHeader = "*/*") {
  return acceptHeader
    .split(",")
    .map((part, index) => {
      const [range, ...parameters] = part.trim().toLowerCase().split(";");
      const qualityParameter = parameters.find(
        (parameter) => parameter.trim().startsWith("q="),
      );
      const quality = qualityParameter
        ? Number(qualityParameter.trim().slice(2))
        : 1;

      return {
        range,
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((item) => item.quality > 0)
    .sort((left, right) => {
      return right.quality - left.quality || left.index - right.index;
    });
}

function rangeMatches(range, mediaType) {
  if (range === "*/*" || range === mediaType) {
    return true;
  }

  const [rangeType, rangeSubtype] = range.split("/");
  const [mediaTypeName] = mediaType.split("/");
  return rangeSubtype === "*" && rangeType === mediaTypeName;
}

function negotiateResponseType(acceptHeader) {
  const supportedTypes = ["application/json", "text/plain"];

  for (const preference of parseAccept(acceptHeader)) {
    const match = supportedTypes.find((mediaType) => {
      return rangeMatches(preference.range, mediaType);
    });

    if (match) {
      return match;
    }
  }

  return null;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://" + request.headers.host);

  if (request.method !== "POST" || url.pathname !== "/messages") {
    return sendError(
      response,
      404,
      "Not Found",
      "Endpoint không tồn tại.",
    );
  }

  // Authorization mang credential; server vẫn phải xác minh token.
  if (!authenticate(request)) {
    return sendError(
      response,
      401,
      "Unauthorized",
      "Bearer token thiếu hoặc không hợp lệ.",
      { "WWW-Authenticate": "Bearer" },
    );
  }

  // Content-Type mô tả request body.
  if (getMediaType(request.headers["content-type"]) !== "application/json") {
    return sendError(
      response,
      415,
      "Unsupported Media Type",
      "Endpoint này chỉ nhận application/json.",
      { Accept: "application/json" },
    );
  }

  // Accept mô tả response media type mà client chấp nhận.
  const responseType = negotiateResponseType(request.headers.accept);
  if (!responseType) {
    return sendError(
      response,
      406,
      "Not Acceptable",
      "Server chỉ có thể trả application/json hoặc text/plain.",
      { Vary: "Accept" },
    );
  }

  try {
    const { message } = await readJsonBody(request);

    if (typeof message !== "string" || message.trim() === "") {
      return sendError(
        response,
        400,
        "Bad Request",
        "message là chuỗi bắt buộc.",
      );
    }

    const createdMessage = {
      id: nextId++,
      message: message.trim(),
    };
    messages.push(createdMessage);

    const commonHeaders = {
      Location: "/messages/" + createdMessage.id,
      Vary: "Accept",
    };

    if (responseType === "text/plain") {
      response.writeHead(201, {
        "Content-Type": "text/plain; charset=utf-8",
        ...commonHeaders,
      });
      return response.end(
        "Message " + createdMessage.id + " created: " + createdMessage.message,
      );
    }

    return sendJson(response, 201, { data: createdMessage }, commonHeaders);
  } catch (error) {
    return sendError(response, 400, "Bad Request", error.message);
  }
});

server.listen(3000, () => {
  console.log("Request headers API đang chạy tại http://localhost:3000");
  console.log("Token thử nghiệm: Bearer valid-token");
});
