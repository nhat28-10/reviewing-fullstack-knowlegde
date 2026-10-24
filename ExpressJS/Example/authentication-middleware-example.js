// Chạy trong PowerShell:
// $env:JWT_ACCESS_SECRET = "replace-with-a-long-random-development-secret"
// npm install
// npm run auth
//
// Đăng nhập:
// curl.exe -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"an@example.com","password":"password123"}'
// Dùng token nhận được để gọi GET /api/v1/users/me với header Authorization: Bearer <token>

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ISSUER = "learning-express-api";
const JWT_AUDIENCE = "learning-express-client";

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET must be set before starting this example");
}

app.use(express.json());

// Chỉ để minh hoạ flow; production phải hash password và lấy user từ database.
const demoUser = {
  id: "user-1",
  email: "an@example.com",
  password: "password123",
};

function authenticate(req, res, next) {
  const authorization = req.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== demoUser.email || password !== demoUser.password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const accessToken = jwt.sign({}, JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    subject: demoUser.id,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: "15m",
  });

  return res.status(200).json({ accessToken });
});

app.get("/api/v1/users/me", authenticate, (req, res) => {
  return res.status(200).json({
    message: "Authenticated successfully",
    user: { id: req.user.id, email: demoUser.email },
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
