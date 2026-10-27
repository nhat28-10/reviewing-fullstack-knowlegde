require("dotenv").config();

const express = require("express");
const cors = require("cors");

function readPort(value) {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function readAllowedOrigins(value) {
  const origins = (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CLIENT_ORIGINS is required");
  }

  return new Set(origins);
}

const port = readPort(process.env.PORT);
const allowedOrigins = readAllowedOrigins(process.env.CLIENT_ORIGINS);
const app = express();

app.use(
  cors({
    origin(origin, callback) {
      // curl, Postman and same-origin requests normally have no Origin header.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV ?? "development",
  });
});

app.post("/api/products", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  return res.status(201).json({
    message: "Product created",
    product: { id: 1, name },
  });
});

app.use((error, req, res, next) => {
  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: error.message });
  }

  return next(error);
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
  console.log(`Allowed browser origins: ${[...allowedOrigins].join(", ")}`);
});
