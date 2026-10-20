/**
 * Cài dependency (chỉ cần làm lại sau khi xoá node_modules):
 *   cd NodeJS
 *   npm install
 *
 * Chạy ví dụ:
 *   npm run start:api-security
 *
 * Frontend được cho phép trong ví dụ: http://localhost:5173
 */

const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const { z } = require("zod");

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = new Set(["http://localhost:5173"]);

app.use(
  cors({
    origin(origin, callback) {
      // Request không có Origin (ví dụ curl/Postman) không chịu sự kiểm soát của CORS.
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);

      return callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  }),
);

app.use(express.json({ limit: "10kb" }));

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

const credentialsSchema = z
  .object({
    email: z.string().trim().email("Email is invalid"),
    password: z.string().min(8, "Password must have at least 8 characters").max(128),
  })
  .strict();

function validateCredentials(req, res, next) {
  const result = credentialsSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.validatedBody = result.data;
  return next();
}

app.get("/health", (req, res) => {
  res.json({ message: "API is healthy" });
});

app.post("/register", validateCredentials, (req, res) => {
  // Production: kiểm tra trùng email, hash password và lưu database ở đây.
  res.status(201).json({
    message: "Input is valid. A user would be registered here.",
    email: req.validatedBody.email,
  });
});

app.post("/login", loginLimiter, validateCredentials, (req, res) => {
  // Production: tìm user, bcrypt.compare() và trả token/session nếu hợp lệ.
  res.json({
    message: "Input is valid. Authentication would run here.",
    email: req.validatedBody.email,
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Malformed JSON" });
  }

  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: "Origin is not allowed" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API security example is running at http://localhost:${port}`);
  console.log("Allowed browser origin: http://localhost:5173");
  console.log("POST /register validates the request body.");
  console.log("POST /login validates input and allows only 5 requests/minute per client.");
});
