// Chạy trong PowerShell:
// $env:JWT_ACCESS_SECRET = "replace-with-a-long-random-access-secret"
// $env:JWT_REFRESH_SECRET = "replace-with-a-different-long-random-refresh-secret"
// npm install
// npm run token-flow
//
// Login và lưu cookie: curl.exe -i -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"an@example.com","password":"password123"}'
// Refresh: curl.exe -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/v1/auth/refresh
// Logout: curl.exe -i -b cookies.txt -X POST http://localhost:3000/api/v1/auth/logout

const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const issuer = "learning-express-api";
const audience = "learning-express-client";
const refreshCookieName = "refresh_token";

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set before starting this example");
}

app.use(express.json());

// Chỉ để minh hoạ. Production: hash password và dùng database/session store bền vững.
const demoUser = { id: "user-1", email: "an@example.com", password: "password123" };
const refreshSessions = new Map();
const sessionState = new Map();

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(userId) {
  return jwt.sign({}, accessSecret, {
    algorithm: "HS256",
    subject: userId,
    issuer,
    audience,
    expiresIn: "15m",
  });
}

function createRefreshToken(userId, sessionId) {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign({ type: "refresh", sid: sessionId }, refreshSecret, {
    algorithm: "HS256",
    subject: userId,
    jwtid: tokenId,
    issuer,
    audience,
    expiresIn: "7d",
  });

  refreshSessions.set(tokenId, {
    userId,
    sessionId,
    tokenHash: hashToken(token),
    used: false,
  });

  return token;
}

function revokeSession(sessionId) {
  const state = sessionState.get(sessionId);
  if (state) state.revoked = true;
}

function setRefreshCookie(res, token) {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(refreshCookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth",
  });
}

function getCookie(req, name) {
  const pairs = (req.headers.cookie ?? "").split(";");

  for (const pair of pairs) {
    const index = pair.indexOf("=");
    if (index === -1) continue;

    if (pair.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(pair.slice(index + 1).trim());
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

function authenticate(req, res, next) {
  const authorization = req.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing access token" });
  }

  try {
    const payload = jwt.verify(authorization.slice(7).trim(), accessSecret, {
      algorithms: ["HS256"],
      issuer,
      audience,
    });

    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid access token" });
    }

    req.user = { id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== demoUser.email || password !== demoUser.password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const sessionId = crypto.randomUUID();
  sessionState.set(sessionId, { revoked: false });

  const accessToken = createAccessToken(demoUser.id);
  const refreshToken = createRefreshToken(demoUser.id, sessionId);
  setRefreshCookie(res, refreshToken);

  return res.json({ accessToken });
});

app.post("/api/v1/auth/refresh", (req, res) => {
  const refreshToken = getCookie(req, refreshCookieName);

  if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });

  try {
    const payload = jwt.verify(refreshToken, refreshSecret, {
      algorithms: ["HS256"],
      issuer,
      audience,
    });

    if (
      typeof payload !== "object" ||
      payload.type !== "refresh" ||
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string" ||
      typeof payload.sid !== "string"
    ) {
      throw new Error("Invalid refresh token payload");
    }

    const tokenRecord = refreshSessions.get(payload.jti);
    const state = sessionState.get(payload.sid);
    const isInvalid =
      !tokenRecord ||
      tokenRecord.userId !== payload.sub ||
      tokenRecord.sessionId !== payload.sid ||
      tokenRecord.tokenHash !== hashToken(refreshToken) ||
      tokenRecord.used ||
      !state ||
      state.revoked;

    if (isInvalid) {
      // Reuse của token đã rotate là dấu hiệu replay: revoke toàn bộ session family.
      if (typeof payload.sid === "string") revokeSession(payload.sid);
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid or reused refresh token" });
    }

    tokenRecord.used = true;

    const accessToken = createAccessToken(payload.sub);
    const nextRefreshToken = createRefreshToken(payload.sub, payload.sid);
    setRefreshCookie(res, nextRefreshToken);

    return res.json({ accessToken });
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

app.post("/api/v1/auth/logout", (req, res) => {
  const refreshToken = getCookie(req, refreshCookieName);

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, refreshSecret, { algorithms: ["HS256"], issuer, audience });
      if (typeof payload === "object" && typeof payload.sid === "string") revokeSession(payload.sid);
    } catch {
      // Dù token lỗi, vẫn xoá cookie ở client.
    }
  }

  clearRefreshCookie(res);
  return res.status(204).end();
});

app.get("/api/v1/users/me", authenticate, (req, res) => {
  return res.json({ data: { id: req.user.id, email: demoUser.email } });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
