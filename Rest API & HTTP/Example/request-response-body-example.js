/**
 * Request Body và Response Body — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/request-response-body-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/products -ContentType application/json -Body '{"name":"Laptop","price":20000000,"passwordHash":"must-not-be-saved"}'
 *   Invoke-RestMethod http://localhost:3000/products/1
 *   Invoke-WebRequest -UseBasicParsing -Method Delete -Uri http://localhost:3000/products/1
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/products -ContentType text/plain -Body 'Laptop'
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/products -ContentType application/json -Body '{"name":'
 *
 * Hai lệnh cuối cố ý nhận 415 và 400. Response không bao giờ trả
 * costPrice, supplierSecret hoặc field thừa do client gửi.
 * Dừng server: nhấn Ctrl+C. Dữ liệu được đặt lại khi chạy lại.
 */

const http = require("node:http");

const MAX_BODY_BYTES = 10 * 1024;
const products = [];
let nextId = 1;

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
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const errorName =
    error instanceof HttpError ? error.error : "Internal Server Error";
  const message =
    error instanceof HttpError
      ? error.message
      : "Đã xảy ra lỗi ngoài dự kiến.";

  if (!(error instanceof HttpError)) {
    console.error(error);
  }

  sendJson(response, statusCode, {
    statusCode,
    error: errorName,
    message,
  });
}

function getMediaType(contentType = "") {
  return contentType.split(";", 1)[0].trim().toLowerCase();
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let tooLarge = false;

    request.on("data", (chunk) => {
      totalBytes += chunk.length;

      if (totalBytes > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      if (tooLarge) {
        return reject(
          new HttpError(
            413,
            "Content Too Large",
            "Request body vượt quá giới hạn 10 KB.",
          ),
        );
      }

      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(text || "{}"));
      } catch {
        reject(
          new HttpError(
            400,
            "Bad Request",
            "Request body phải là JSON hợp lệ.",
          ),
        );
      }
    });

    request.on("error", reject);
  });
}

function validateCreateProduct(body) {
  if (
    body === null ||
    Array.isArray(body) ||
    typeof body !== "object"
  ) {
    throw new HttpError(
      400,
      "Bad Request",
      "Request body phải là một JSON object.",
    );
  }

  if (typeof body.name !== "string" || body.name.trim() === "") {
    throw new HttpError(
      400,
      "Bad Request",
      "name là chuỗi bắt buộc.",
    );
  }

  if (
    typeof body.price !== "number" ||
    !Number.isFinite(body.price) ||
    body.price < 0
  ) {
    throw new HttpError(
      400,
      "Bad Request",
      "price phải là số không âm.",
    );
  }

  // Chỉ lấy field được phép, không truyền nguyên body vào data layer.
  return {
    name: body.name.trim(),
    price: body.price,
  };
}

function toProductResponse(product) {
  // Response DTO: cố ý không trả field nội bộ/nhạy cảm.
  return {
    id: product.id,
    name: product.name,
    price: product.price,
  };
}

async function handleRequest(request, response) {
  const url = new URL(request.url, "http://" + request.headers.host);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const isCollection = url.pathname === "/products";
  const isItem =
    pathParts.length === 2 && pathParts[0] === "products";

  // Request body JSON -> validation -> domain object -> response body JSON.
  if (request.method === "POST" && isCollection) {
    if (
      getMediaType(request.headers["content-type"]) !==
      "application/json"
    ) {
      throw new HttpError(
        415,
        "Unsupported Media Type",
        "Endpoint này chỉ nhận application/json.",
      );
    }

    const declaredLength = Number(request.headers["content-length"]);
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_BODY_BYTES
    ) {
      throw new HttpError(
        413,
        "Content Too Large",
        "Request body vượt quá giới hạn 10 KB.",
      );
    }

    const requestBody = await readJsonBody(request);
    const input = validateCreateProduct(requestBody);

    const product = {
      id: nextId++,
      ...input,
      costPrice: input.price * 0.7,
      supplierSecret: "internal-only",
    };
    products.push(product);

    return sendJson(
      response,
      201,
      { data: toProductResponse(product) },
      { Location: "/products/" + product.id },
    );
  }

  if (request.method === "GET" && isItem) {
    if (!/^\d+$/.test(pathParts[1])) {
      throw new HttpError(
        400,
        "Bad Request",
        "Product ID phải là số nguyên dương.",
      );
    }

    const product = products.find(
      (item) => item.id === Number(pathParts[1]),
    );
    if (!product) {
      throw new HttpError(
        404,
        "Not Found",
        "Không tìm thấy product.",
      );
    }

    return sendJson(response, 200, {
      data: toProductResponse(product),
    });
  }

  // 204 thành công nhưng không gửi response body.
  if (request.method === "DELETE" && isItem) {
    const index = products.findIndex(
      (item) => item.id === Number(pathParts[1]),
    );
    if (index === -1) {
      throw new HttpError(
        404,
        "Not Found",
        "Không tìm thấy product.",
      );
    }

    products.splice(index, 1);
    response.writeHead(204);
    return response.end();
  }

  throw new HttpError(
    404,
    "Not Found",
    "Endpoint không tồn tại.",
  );
}

const server = http.createServer((request, response) => {
  Promise.resolve(handleRequest(request, response)).catch((error) => {
    if (!response.headersSent) {
      sendError(response, error);
    }
  });
});

server.listen(3000, () => {
  console.log("Request/response body API chạy tại http://localhost:3000");
  console.log("Request body tối đa: 10 KB");
});
