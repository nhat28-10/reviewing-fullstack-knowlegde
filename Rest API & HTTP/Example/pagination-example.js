/**
 * Offset và Cursor Pagination — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/pagination-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *
 * Offset pagination:
 *   Invoke-RestMethod 'http://localhost:3000/offset/products?page=2&limit=5'
 *   Invoke-RestMethod 'http://localhost:3000/offset/products?page=99&limit=5'
 *
 * Cursor pagination:
 *   $first = Invoke-RestMethod 'http://localhost:3000/cursor/products?limit=5'
 *   $first
 *   Invoke-RestMethod \"http://localhost:3000/cursor/products?limit=5&cursor=$($first.pageInfo.nextCursor)\"
 *
 * Validation lỗi:
 *   Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/offset/products?page=0&limit=5'
 *   Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/cursor/products?limit=1000'
 *
 * Hai lệnh cuối cố ý nhận 400. Dừng server: nhấn Ctrl+C.
 */

const http = require("node:http");

const MAX_LIMIT = 10;
const DEFAULT_LIMIT = 5;
const products = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: "Product " + String(index + 1).padStart(2, "0"),
  price: (index + 1) * 100000,
}));

class HttpError extends Error {
  constructor(statusCode, error, message) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
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

function parsePositiveInteger(value, defaultValue, fieldName) {
  if (value === null) {
    return defaultValue;
  }

  if (!/^\d+$/.test(value)) {
    throw new HttpError(
      400,
      "Bad Request",
      fieldName + " phải là số nguyên dương.",
    );
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new HttpError(
      400,
      "Bad Request",
      fieldName + " phải là số nguyên dương.",
    );
  }

  return number;
}

function parseLimit(url) {
  const limit = parsePositiveInteger(
    url.searchParams.get("limit"),
    DEFAULT_LIMIT,
    "limit",
  );

  if (limit > MAX_LIMIT) {
    throw new HttpError(
      400,
      "Bad Request",
      "limit không được vượt quá " + MAX_LIMIT + ".",
    );
  }

  return limit;
}

function assertAllowedQueryKeys(url, allowedKeys) {
  const unknownKey = [...url.searchParams.keys()].find(
    (key) => !allowedKeys.has(key),
  );

  if (unknownKey) {
    throw new HttpError(
      400,
      "Bad Request",
      "Query parameter không hỗ trợ: " + unknownKey,
    );
  }
}

function encodeCursor(id) {
  // Base64url giúp cursor opaque với client, nhưng không phải mã hóa/chữ ký.
  return Buffer.from(JSON.stringify({ id }), "utf8").toString(
    "base64url",
  );
}

function decodeCursor(cursor) {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      !Number.isSafeInteger(decoded.id) ||
      decoded.id < 1
    ) {
      throw new Error("Invalid cursor id");
    }

    return decoded.id;
  } catch {
    throw new HttpError(
      400,
      "Bad Request",
      "cursor không hợp lệ.",
    );
  }
}

function handleOffsetPagination(url, response) {
  assertAllowedQueryKeys(url, new Set(["page", "limit"]));

  const page = parsePositiveInteger(
    url.searchParams.get("page"),
    1,
    "page",
  );
  const limit = parseLimit(url);
  const skip = (page - 1) * limit;
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const data = products.slice(skip, skip + limit);

  return sendJson(response, 200, {
    data,
    meta: {
      page,
      limit,
      skip,
      total,
      totalPages,
      hasPreviousPage: page > 1 && total > 0,
      hasNextPage: page * limit < total,
    },
  });
}

function handleCursorPagination(url, response) {
  assertAllowedQueryKeys(url, new Set(["cursor", "limit"]));

  const limit = parseLimit(url);
  const cursorText = url.searchParams.get("cursor");
  const cursorId =
    cursorText === null ? undefined : decodeCursor(cursorText);

  // Keyset pagination: id > cursorId, orderBy id asc.
  const candidates = products
    .filter((product) => {
      return cursorId === undefined || product.id > cursorId;
    })
    .sort((left, right) => left.id - right.id)
    .slice(0, limit + 1);

  const hasNextPage = candidates.length > limit;
  const data = candidates.slice(0, limit);
  const nextCursor =
    hasNextPage && data.length > 0
      ? encodeCursor(data[data.length - 1].id)
      : null;

  return sendJson(response, 200, {
    data,
    pageInfo: {
      limit,
      hasNextPage,
      nextCursor,
    },
  });
}

const server = http.createServer((request, response) => {
  try {
    const url = new URL(request.url, "http://" + request.headers.host);

    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      throw new HttpError(
        405,
        "Method Not Allowed",
        "Ví dụ chỉ hỗ trợ GET.",
      );
    }

    if (url.pathname === "/offset/products") {
      return handleOffsetPagination(url, response);
    }

    if (url.pathname === "/cursor/products") {
      return handleCursorPagination(url, response);
    }

    throw new HttpError(
      404,
      "Not Found",
      "Endpoint không tồn tại.",
    );
  } catch (error) {
    if (!response.headersSent) {
      sendError(response, error);
    }
  }
});

server.listen(3000, () => {
  console.log("Pagination demo chạy tại http://localhost:3000");
  console.log("Offset: /offset/products?page=1&limit=5");
  console.log("Cursor: /cursor/products?limit=5");
});
