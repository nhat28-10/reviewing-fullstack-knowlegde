/**
 * Path Params và Query Params — ví dụ chạy độc lập
 *
 * Yêu cầu: Node.js 18 trở lên. Không cần cài package.
 * Chạy từ thư mục gốc repository:
 *   node "Rest API & HTTP/Example/path-query-params-example.js"
 *
 * Kiểm tra trong PowerShell (mở terminal khác):
 *   Invoke-RestMethod http://localhost:3000/users/1
 *   Invoke-RestMethod 'http://localhost:3000/users/1?include=tags'
 *   Invoke-RestMethod 'http://localhost:3000/users?role=ADMIN&status=ACTIVE&page=1&limit=2'
 *   Invoke-RestMethod 'http://localhost:3000/users?search=nhat&sort=name&order=desc'
 *   Invoke-RestMethod 'http://localhost:3000/users?tag=backend&tag=admin'
 *   Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/users?page=0'
 *
 * Lệnh cuối cố ý nhận 400 để minh họa validation.
 * Dừng server: nhấn Ctrl+C.
 */

const http = require("node:http");

const users = [
  {
    id: 1,
    name: "Nhat",
    role: "ADMIN",
    status: "ACTIVE",
    tags: ["backend", "admin"],
  },
  {
    id: 2,
    name: "An",
    role: "USER",
    status: "ACTIVE",
    tags: ["frontend"],
  },
  {
    id: 3,
    name: "Minh Nhat",
    role: "USER",
    status: "INACTIVE",
    tags: ["backend"],
  },
  {
    id: 4,
    name: "Binh",
    role: "ADMIN",
    status: "ACTIVE",
    tags: ["backend", "admin", "devops"],
  },
];

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body, null, 2));
}

function sendBadRequest(response, message) {
  return sendJson(response, 400, {
    statusCode: 400,
    error: "Bad Request",
    message,
  });
}

function parsePositiveInteger(value, defaultValue) {
  if (value === null) {
    return defaultValue;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 1 ? number : null;
}

function pickUserRepresentation(user, include) {
  if (include === "tags") {
    return user;
  }

  const { tags, ...withoutTags } = user;
  return withoutTags;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://" + request.headers.host);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, {
      statusCode: 405,
      error: "Method Not Allowed",
      message: "Ví dụ này chỉ hỗ trợ GET.",
    });
  }

  // Path param :id nhận diện một user cụ thể.
  // Query param include tùy chỉnh representation trả về.
  if (pathParts.length === 2 && pathParts[0] === "users") {
    const idText = pathParts[1];

    if (!/^\d+$/.test(idText) || Number(idText) < 1) {
      return sendBadRequest(response, "User ID phải là số nguyên dương.");
    }

    const includeValues = url.searchParams.getAll("include");
    if (
      includeValues.length > 1 ||
      (includeValues[0] !== undefined && includeValues[0] !== "tags")
    ) {
      return sendBadRequest(response, "include chỉ chấp nhận giá trị tags.");
    }

    const user = users.find((item) => item.id === Number(idText));
    if (!user) {
      return sendJson(response, 404, {
        statusCode: 404,
        error: "Not Found",
        message: "Không tìm thấy user.",
      });
    }

    return sendJson(response, 200, {
      data: pickUserRepresentation(user, includeValues[0]),
    });
  }

  // Query params lọc, tìm kiếm, sắp xếp và phân trang collection.
  if (url.pathname === "/users") {
    const allowedKeys = new Set([
      "role",
      "status",
      "search",
      "sort",
      "order",
      "page",
      "limit",
      "tag",
    ]);
    const unknownKey = [...url.searchParams.keys()].find(
      (key) => !allowedKeys.has(key),
    );

    if (unknownKey) {
      return sendBadRequest(
        response,
        "Query parameter không hỗ trợ: " + unknownKey,
      );
    }

    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim().toLowerCase();
    const sort = url.searchParams.get("sort") || "id";
    const order = url.searchParams.get("order") || "asc";
    const page = parsePositiveInteger(url.searchParams.get("page"), 1);
    const limit = parsePositiveInteger(url.searchParams.get("limit"), 2);
    const tags = url.searchParams.getAll("tag");

    if (role !== null && !["ADMIN", "USER"].includes(role)) {
      return sendBadRequest(response, "role phải là ADMIN hoặc USER.");
    }

    if (status !== null && !["ACTIVE", "INACTIVE"].includes(status)) {
      return sendBadRequest(
        response,
        "status phải là ACTIVE hoặc INACTIVE.",
      );
    }

    if (!["id", "name"].includes(sort)) {
      return sendBadRequest(response, "sort chỉ chấp nhận id hoặc name.");
    }

    if (!["asc", "desc"].includes(order)) {
      return sendBadRequest(response, "order chỉ chấp nhận asc hoặc desc.");
    }

    if (page === null || limit === null || limit > 100) {
      return sendBadRequest(
        response,
        "page phải >= 1; limit phải nằm trong khoảng 1..100.",
      );
    }

    let result = users.filter((user) => {
      const matchesRole = role === null || user.role === role;
      const matchesStatus = status === null || user.status === status;
      const matchesSearch =
        !search || user.name.toLowerCase().includes(search);
      const matchesTags = tags.every((tag) => user.tags.includes(tag));

      return (
        matchesRole &&
        matchesStatus &&
        matchesSearch &&
        matchesTags
      );
    });

    result = [...result].sort((left, right) => {
      const comparison =
        sort === "id"
          ? left.id - right.id
          : left.name.localeCompare(right.name, "vi");
      return order === "asc" ? comparison : -comparison;
    });

    const total = result.length;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return sendJson(response, 200, {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        role,
        status,
        search: search || null,
        tags,
        sort,
        order,
      },
    });
  }

  return sendJson(response, 404, {
    statusCode: 404,
    error: "Not Found",
    message: "Endpoint không tồn tại.",
  });
});

server.listen(3000, () => {
  console.log("Path/query params API đang chạy tại http://localhost:3000");
  console.log("Thử: Invoke-RestMethod http://localhost:3000/users/1");
});
