// Chạy trong PowerShell:
// $env:JWT_ACCESS_SECRET = "replace-with-a-long-random-development-secret"
// npm install
// npm run authorization
//
// Login để nhận token:
// curl.exe -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password123"}'
// Dùng accessToken nhận được trong header: Authorization: Bearer <accessToken>

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const accessSecret = process.env.JWT_ACCESS_SECRET;
const issuer = "learning-express-api";
const audience = "learning-express-client";

if (!accessSecret) {
  throw new Error("JWT_ACCESS_SECRET must be set before starting this example");
}

app.use(express.json());

const users = [
  { id: "user-1", email: "admin@example.com", password: "password123", role: "ADMIN" },
  { id: "user-2", email: "staff@example.com", password: "password123", role: "STAFF" },
  { id: "user-3", email: "user@example.com", password: "password123", role: "USER" },
];

// Giả lập dữ liệu membership do server/database quản lý.
const familyMemberships = [
  { userId: "user-2", familyId: "family-a", role: "FAMILY_MANAGER", active: true },
  { userId: "user-2", familyId: "family-b", role: "FAMILY_MEMBER", active: true },
];

function authenticate(req, res, next) {
  const authorization = req.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({ message: "Missing access token" });
  }

  try {
    const payload = jwt.verify(authorization.slice(7).trim(), accessSecret, {
      algorithms: ["HS256"],
      issuer,
      audience,
    });

    if (
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      !["ADMIN", "STAFF", "USER"].includes(payload.role)
    ) {
      res.set("WWW-Authenticate", "Bearer");
      return res.status(401).json({ message: "Invalid access token" });
    }

    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.set("WWW-Authenticate", "Bearer");
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

function authorizeFamilyRole(...allowedRoles) {
  return (req, res, next) => {
    const membership = familyMemberships.find(
      (item) => item.userId === req.user.id && item.familyId === req.params.familyId && item.active,
    );

    if (!membership || !allowedRoles.includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden for this family" });
    }

    req.membership = membership;
    return next();
  };
}

app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((item) => item.email === email && item.password === password);

  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const accessToken = jwt.sign({ role: user.role }, accessSecret, {
    algorithm: "HS256",
    subject: user.id,
    issuer,
    audience,
    expiresIn: "15m",
  });

  return res.json({ accessToken, role: user.role });
});

app.get("/api/v1/products", authenticate, (req, res) => {
  return res.json({ message: `Products visible to ${req.user.role}` });
});

app.post("/api/v1/products", authenticate, authorize("ADMIN", "STAFF"), (req, res) => {
  return res.status(201).json({ message: `Product created by ${req.user.role}` });
});

app.delete("/api/v1/products/:id", authenticate, authorize("ADMIN"), (req, res) => {
  return res.status(204).end();
});

app.delete(
  "/api/v1/families/:familyId",
  authenticate,
  authorizeFamilyRole("FAMILY_MANAGER"),
  (req, res) => {
    return res.status(204).end();
  },
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
