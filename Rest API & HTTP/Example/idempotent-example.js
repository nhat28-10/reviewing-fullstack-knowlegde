/**
 * Idempotent — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/idempotent-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *
 * PUT cùng body hai lần — trạng thái cuối giống nhau:
 *   $putBody = '{"name":"Laptop","price":20000000,"stock":10}'
 *   Invoke-RestMethod -Method Put -Uri http://localhost:3000/products/10 -ContentType application/json -Body $putBody
 *   Invoke-RestMethod -Method Put -Uri http://localhost:3000/products/10 -ContentType application/json -Body $putBody
 *
 * PATCH đặt giá trị hai lần — có thể idempotent:
 *   Invoke-RestMethod -Method Patch -Uri http://localhost:3000/products/10/price -ContentType application/json -Body '{"price":25000000}'
 *   Invoke-RestMethod -Method Patch -Uri http://localhost:3000/products/10/price -ContentType application/json -Body '{"price":25000000}'
 *
 * PATCH tăng stock hai lần — không idempotent:
 *   Invoke-RestMethod -Method Patch -Uri http://localhost:3000/products/10/stock -ContentType application/json -Body '{"incrementBy":1}'
 *   Invoke-RestMethod -Method Patch -Uri http://localhost:3000/products/10/stock -ContentType application/json -Body '{"incrementBy":1}'
 *
 * POST payment cùng Idempotency-Key — lần hai trả lại payment cũ:
 *   $headers = @{ "Idempotency-Key"="payment-demo-001" }
 *   $paymentBody = '{"orderId":"order-42","amount":500000}'
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/payments -Headers $headers -ContentType application/json -Body $paymentBody
 *   Invoke-WebRequest -UseBasicParsing -Method Post -Uri http://localhost:3000/payments -Headers $headers -ContentType application/json -Body $paymentBody
 *
 * Quan sát X-Idempotent-Replay ở response payment thứ hai.
 * Dừng server: nhấn Ctrl+C. Dữ liệu được đặt lại khi chạy lại.
 */

const http = require("node:http");
const { createHash, randomUUID } = require("node:crypto");

let product = {
  id: 10,
  name: "Laptop",
  price: 15000000,
  stock: 10,
};
const orders = [];
const payments = [];
const idempotencyRecords = new Map();

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
  const statusCode = knownError ? error.statusCode : 500;

  if (!knownError) {
    console.error(error);
  }

  sendJson(response, statusCode, {
    statusCode,
    error: knownError ? error.error : "Internal Server Error",
    message: knownError
      ? error.message
      : "Đã xảy ra lỗi ngoài dự kiến.",
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

function requireProduct() {
  if (!product) {
    throw new HttpError(
      404,
      "Not Found",
      "Product không tồn tại.",
    );
  }

  return product;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isNonNegativeNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function fingerprintPayment(input) {
  const normalized = JSON.stringify({
    orderId: input.orderId,
    amount: input.amount,
  });

  return createHash("sha256").update(normalized).digest("hex");
}

async function handleRequest(request, response) {
  const url = new URL(request.url, "http://" + request.headers.host);

  if (request.method === "GET" && url.pathname === "/products/10") {
    return sendJson(response, 200, { data: requireProduct() });
  }

  // PUT: cùng representation tiếp tục hướng tới cùng trạng thái.
  if (request.method === "PUT" && url.pathname === "/products/10") {
    const body = await readJsonBody(request);

    if (
      !isNonEmptyString(body.name) ||
      !isNonNegativeNumber(body.price) ||
      !Number.isInteger(body.stock) ||
      body.stock < 0
    ) {
      throw new HttpError(
        400,
        "Bad Request",
        "PUT yêu cầu đầy đủ name, price và stock hợp lệ.",
      );
    }

    const created = product === null;
    product = {
      id: 10,
      name: body.name.trim(),
      price: body.price,
      stock: body.stock,
    };

    return sendJson(
      response,
      created ? 201 : 200,
      { data: product },
      created ? { Location: "/products/10" } : {},
    );
  }

  // PATCH đặt price: gửi lặp lại cùng giá trị cho cùng trạng thái cuối.
  if (
    request.method === "PATCH" &&
    url.pathname === "/products/10/price"
  ) {
    const currentProduct = requireProduct();
    const { price } = await readJsonBody(request);

    if (!isNonNegativeNumber(price)) {
      throw new HttpError(
        400,
        "Bad Request",
        "price phải là số không âm.",
      );
    }

    currentProduct.price = price;
    return sendJson(response, 200, { data: currentProduct });
  }

  // PATCH tăng stock: mỗi lần gọi tiếp tục tạo thêm hiệu ứng.
  if (
    request.method === "PATCH" &&
    url.pathname === "/products/10/stock"
  ) {
    const currentProduct = requireProduct();
    const { incrementBy } = await readJsonBody(request);

    if (!Number.isInteger(incrementBy) || incrementBy === 0) {
      throw new HttpError(
        400,
        "Bad Request",
        "incrementBy phải là số nguyên khác 0.",
      );
    }

    if (currentProduct.stock + incrementBy < 0) {
      throw new HttpError(
        409,
        "Conflict",
        "Stock không thể âm.",
      );
    }

    currentProduct.stock += incrementBy;
    return sendJson(response, 200, { data: currentProduct });
  }

  // DELETE: lần đầu 204, các lần sau 404; trạng thái cuối vẫn như nhau.
  if (request.method === "DELETE" && url.pathname === "/products/10") {
    requireProduct();
    product = null;
    response.writeHead(204);
    return response.end();
  }

  // POST thông thường: mỗi lần gọi tạo một order khác.
  if (request.method === "POST" && url.pathname === "/orders") {
    const { productId, quantity } = await readJsonBody(request);

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      throw new HttpError(
        400,
        "Bad Request",
        "productId và quantity hợp lệ là bắt buộc.",
      );
    }

    const order = {
      id: "order-" + (orders.length + 1),
      productId,
      quantity,
    };
    orders.push(order);

    return sendJson(response, 201, { data: order }, {
      Location: "/orders/" + order.id,
    });
  }

  // POST với Idempotency-Key: cùng key + payload trả lại kết quả cũ.
  if (request.method === "POST" && url.pathname === "/payments") {
    const idempotencyKey = request.headers["idempotency-key"];

    if (
      typeof idempotencyKey !== "string" ||
      idempotencyKey.trim() === ""
    ) {
      throw new HttpError(
        400,
        "Bad Request",
        "Idempotency-Key là bắt buộc.",
      );
    }

    const body = await readJsonBody(request);
    if (
      !isNonEmptyString(body.orderId) ||
      !isNonNegativeNumber(body.amount) ||
      body.amount === 0
    ) {
      throw new HttpError(
        400,
        "Bad Request",
        "orderId và amount dương là bắt buộc.",
      );
    }

    const fingerprint = fingerprintPayment(body);
    const existingRecord = idempotencyRecords.get(idempotencyKey);

    if (existingRecord) {
      if (existingRecord.fingerprint !== fingerprint) {
        throw new HttpError(
          409,
          "Conflict",
          "Idempotency-Key đã được dùng với payload khác.",
        );
      }

      return sendJson(
        response,
        existingRecord.statusCode,
        existingRecord.responseBody,
        {
          Location: "/payments/" + existingRecord.paymentId,
          "X-Idempotent-Replay": "true",
        },
      );
    }

    const payment = {
      id: randomUUID(),
      orderId: body.orderId.trim(),
      amount: body.amount,
      status: "SUCCEEDED",
    };
    payments.push(payment);

    const responseBody = { data: payment };
    // Demo chạy một process nên thao tác này tuần tự. Production cần lưu
    // key/fingerprint/kết quả atomically bằng transaction/unique constraint.
    idempotencyRecords.set(idempotencyKey, {
      fingerprint,
      paymentId: payment.id,
      statusCode: 201,
      responseBody,
    });

    return sendJson(response, 201, responseBody, {
      Location: "/payments/" + payment.id,
      "X-Idempotent-Replay": "false",
    });
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
  console.log("Idempotent demo chạy tại http://localhost:3000");
  console.log("Product ban đầu: GET http://localhost:3000/products/10");
});
