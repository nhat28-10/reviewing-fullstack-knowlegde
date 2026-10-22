// Chạy: npm install && npm run app-router-middleware
// Thử các request sau trong PowerShell:
// curl.exe http://localhost:3000/api/v1/users
// curl.exe http://localhost:3000/api/v1/admin/dashboard
// curl.exe -H "x-api-key: admin-secret" http://localhost:3000/api/v1/admin/dashboard

const express = require("express");

const app = express();
const adminRouter = express.Router();
const port = 3000;

// Application-level: chạy cho mọi request đi qua app.
app.use((req, res, next) => {
  console.log(`[App logger] ${req.method} ${req.originalUrl}`);
  next();
});

// Application-level có mount path: chỉ chạy với /api/v1/admin và path con.
app.use("/api/v1/admin", (req, res, next) => {
  console.log("[App admin middleware] Request is under /api/v1/admin");
  next();
});

// Router-level: chỉ chạy khi request đã đi vào adminRouter.
adminRouter.use((req, res, next) => {
  console.log("[Admin router middleware] Checking API key");

  if (req.get("x-api-key") !== "admin-secret") {
    return res.status(403).json({ message: "Forbidden: invalid API key" });
  }

  return next();
});

adminRouter.get("/dashboard", (req, res) => {
  return res.json({ message: "Admin dashboard" });
});

app.get("/api/v1/users", (req, res) => {
  return res.json({ message: "Users endpoint: no admin API key required" });
});

app.use("/api/v1/admin", adminRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
