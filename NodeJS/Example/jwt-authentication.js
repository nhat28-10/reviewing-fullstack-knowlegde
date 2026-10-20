/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Tạo file NodeJS/.env (không commit) với tối thiểu:
 *   JWT_SECRET=<một secret dài, ngẫu nhiên>
 *
 * Chạy ví dụ (Node.js 20.6+):
 *   npm run start:jwt
 *
 * Đăng nhập demo: demo@example.com / DemoPassword123!
 */

const crypto = require("node:crypto");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const jwtIssuer = process.env.JWT_ISSUER || "nodejs-example-api";
const jwtAudience = process.env.JWT_AUDIENCE || "nodejs-example-client";

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required. Add it to NodeJS/.env before starting the example.");
}

app.use(express.json());

const usersByEmail = new Map();
const usersById = new Map();

function createAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    jwtSecret,
    {
      algorithm: "HS256",
      audience: jwtAudience,
      expiresIn: "15m",
      issuer: jwtIssuer,
      jwtid: crypto.randomUUID(),
    },
  );
}

function readBearerToken(req) {
  const authorization = req.get("authorization");

  if (!authorization) return null;

  const [scheme, token, extraValue] = authorization.split(" ");
  if (scheme !== "Bearer" || !token || extraValue) return null;

  return token;
}

function authenticate(req, res, next) {
  const token = readBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Bearer token is required" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      audience: jwtAudience,
      issuer: jwtIssuer,
    });

    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    const user = usersById.get(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    req.auth = payload;
    req.currentUser = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.auth.role !== role) {
      return res.status(403).json({ message: "You do not have permission for this action" });
    }

    return next();
  };
}

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = usersByEmail.get(String(email || "").toLowerCase());

    // Cùng một lỗi cho email/mật khẩu sai để tránh tiết lộ account nào tồn tại.
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({ accessToken: createAccessToken(user) });
  } catch (error) {
    return next(error);
  }
});

app.get("/profile", authenticate, (req, res) => {
  res.json({
    id: req.currentUser.id,
    email: req.currentUser.email,
    role: req.currentUser.role,
    tokenSubject: req.auth.sub,
  });
});

app.get("/admin", authenticate, requireRole("ADMIN"), (req, res) => {
  res.json({ message: "Admin-only data" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

async function start() {
  const demoUser = {
    id: "user-1",
    email: "demo@example.com",
    passwordHash: await bcrypt.hash("DemoPassword123!", 12),
    role: "USER",
  };

  usersByEmail.set(demoUser.email, demoUser);
  usersById.set(demoUser.id, demoUser);

  app.listen(port, () => {
    console.log(`JWT example is running at http://localhost:${port}`);
    console.log("POST /login with demo@example.com / DemoPassword123!");
    console.log("Use the returned token: GET /profile with Authorization: Bearer <token>");
    console.log("GET /admin demonstrates 403 because the demo user has role USER.");
  });
}

start().catch((error) => {
  console.error("Unable to start the example:", error);
  process.exitCode = 1;
});
