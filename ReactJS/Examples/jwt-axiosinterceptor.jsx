/*
  JWT va Axios interceptor trong React

  File nay minh hoa:
  - Login va luu token demo.
  - Request interceptor tu gan Authorization header.
  - Response interceptor bat 401, refresh token va retry request ban dau.
  - Logout va xoa token.

  De chay can cai:
  npm install axios

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import axios from "axios";
import { useEffect, useMemo, useState } from "react";

const ACCESS_TOKEN_KEY = "demoAccessToken";
const REFRESH_TOKEN_KEY = "demoRefreshToken";

const mockUser = {
  id: 1,
  name: "Nguyen Nhat",
  email: "nhat@example.com",
  role: "NORMAL_USER",
};

const mockTodos = [
  { id: 1, title: "Review JWT theory", done: true },
  { id: 2, title: "Understand Axios interceptors", done: false },
  { id: 3, title: "Handle 401 and refresh token", done: false },
];

function delay(ms = 500) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function createMockResponse(config, status, data) {
  return {
    data,
    status,
    statusText: String(status),
    headers: {},
    config,
  };
}

function createAxiosError(message, config, response) {
  const error = new Error(message);
  error.config = config;
  error.response = response;
  error.isAxiosError = true;

  return error;
}

function createMockApi() {
  let serverAccessToken = "access-token-initial";
  let serverRefreshToken = "refresh-token-demo";
  let nextAccessTokenVersion = 1;

  const api = axios.create({
    baseURL: "https://api.demo.local",
    timeout: 10000,
    adapter: async (config) => {
      await delay();

      const method = config.method?.toUpperCase() ?? "GET";
      const url = config.url ?? "";
      const authHeader = config.headers?.Authorization;

      if (method === "POST" && url === "/auth/login") {
        return createMockResponse(config, 200, {
          user: mockUser,
          accessToken: serverAccessToken,
          refreshToken: serverRefreshToken,
        });
      }

      if (method === "POST" && url === "/auth/refresh") {
        const payload = JSON.parse(config.data ?? "{}");

        if (payload.refreshToken !== serverRefreshToken) {
          const response = createMockResponse(config, 401, {
            message: "Refresh token is invalid or expired.",
          });

          throw createAxiosError("Unauthorized", config, response);
        }

        nextAccessTokenVersion += 1;
        serverAccessToken = `access-token-${nextAccessTokenVersion}`;

        return createMockResponse(config, 200, {
          accessToken: serverAccessToken,
        });
      }

      if (url === "/me" || url === "/todos") {
        if (authHeader !== `Bearer ${serverAccessToken}`) {
          const response = createMockResponse(config, 401, {
            message: "Access token is missing or expired.",
          });

          throw createAxiosError("Unauthorized", config, response);
        }

        return createMockResponse(
          config,
          200,
          url === "/me" ? mockUser : mockTodos,
        );
      }

      return createMockResponse(config, 404, {
        message: "Route not found.",
      });
    },
  });

  return {
    api,
    expireAccessToken() {
      serverAccessToken = "server-token-after-expire";
    },
  };
}

function saveTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [message, setMessage] = useState("Login to start the JWT demo.");
  const [isLoading, setIsLoading] = useState(false);

  const authClient = useMemo(() => createMockApi(), []);
  const api = authClient.api;

  useEffect(() => {
    const requestInterceptorId = api.interceptors.request.use((config) => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    });

    const responseInterceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = originalRequest.url === "/auth/refresh";

        if (
          error.response?.status !== 401 ||
          originalRequest._retry ||
          isRefreshRequest
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          const response = await api.post("/auth/refresh", { refreshToken });
          const { accessToken } = response.data;

          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          setUser(null);
          setTodos([]);

          return Promise.reject(refreshError);
        }
      },
    );

    return () => {
      api.interceptors.request.eject(requestInterceptorId);
      api.interceptors.response.eject(responseInterceptorId);
    };
  }, [api]);

  async function handleLogin() {
    try {
      setIsLoading(true);
      setMessage("Logging in...");

      const response = await api.post("/auth/login", {
        email: "nhat@example.com",
        password: "demo-password",
      });

      saveTokens(response.data);
      setUser(response.data.user);
      setMessage("Login success. Access token is saved.");
    } catch (error) {
      setMessage(error.response?.data?.message ?? error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProfile() {
    try {
      setIsLoading(true);
      setMessage("Loading profile...");

      const response = await api.get("/me");

      setUser(response.data);
      setMessage("Profile loaded with Authorization header.");
    } catch (error) {
      setMessage(error.response?.data?.message ?? error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTodos() {
    try {
      setIsLoading(true);
      setMessage("Loading todos...");

      const response = await api.get("/todos");

      setTodos(response.data);
      setMessage("Todos loaded. If token expired, interceptor refreshed it.");
    } catch (error) {
      setMessage(error.response?.data?.message ?? error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function expireAccessToken() {
    authClient.expireAccessToken();
    setMessage(
      "Server access token changed. The next protected request returns 401 first.",
    );
  }

  function handleLogout() {
    clearTokens();
    setUser(null);
    setTodos([]);
    setMessage("Logged out and tokens were removed.");
  }

  return (
    <main>
      <h1>JWT and Axios Interceptor Example</h1>

      <section>
        <button type="button" onClick={handleLogin} disabled={isLoading}>
          Login
        </button>
        <button type="button" onClick={loadProfile} disabled={isLoading}>
          Load profile
        </button>
        <button type="button" onClick={loadTodos} disabled={isLoading}>
          Load todos
        </button>
        <button type="button" onClick={expireAccessToken} disabled={isLoading}>
          Expire access token
        </button>
        <button type="button" onClick={handleLogout} disabled={isLoading}>
          Logout
        </button>
      </section>

      <p>{isLoading ? "Working..." : message}</p>

      {user && (
        <section>
          <h2>Current user</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </section>
      )}

      {todos.length > 0 && (
        <section>
          <h2>Protected todos</h2>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                {todo.done ? "[done]" : "[todo]"} {todo.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
