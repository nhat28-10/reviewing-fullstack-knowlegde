/*
  React Router trong React

  File nay minh hoa:
  - BrowserRouter, Routes va Route.
  - Link va NavLink.
  - Dynamic route voi useParams.
  - Nested routes voi Outlet.
  - Dieu huong bang useNavigate.
  - Protected route voi Navigate.
  - Route 404 bang path="*".

  De chay can cai:
  npm install react-router-dom

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import { createContext, useContext, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const users = [
  { id: "1", name: "Nhat", role: "Frontend Developer" },
  { id: "2", name: "Linh", role: "Backend Developer" },
  { id: "3", name: "Minh", role: "Fullstack Developer" },
];

const AuthContext = createContext(null);

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  function login() {
    setCurrentUser({
      id: "1",
      name: "Nhat",
      role: "Frontend Developer",
    });
  }

  function logout() {
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function AppLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header>
        <h1>React Router Example</h1>

        <nav>
          <NavLink to="/">Home</NavLink>{" "}
          <NavLink to="/users">Users</NavLink>{" "}
          <NavLink to="/dashboard">Dashboard</NavLink>{" "}
          <NavLink to="/dashboard/settings">Settings</NavLink>{" "}
          <NavLink to="/login">Login</NavLink>
        </nav>

        <p>
          Auth status:{" "}
          {currentUser ? `Logged in as ${currentUser.name}` : "Guest"}
        </p>

        {currentUser && (
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      <Outlet />
    </>
  );
}

function Home() {
  return (
    <main>
      <h2>Home</h2>
      <p>This page is public.</p>
      <p>
        Try visiting <Link to="/users/1">/users/1</Link> or{" "}
        <Link to="/dashboard">/dashboard</Link>.
      </p>
    </main>
  );
}

function UsersLayout() {
  return (
    <main>
      <h2>Users</h2>
      <Outlet />
    </main>
  );
}

function UserList() {
  return (
    <section>
      <p>Select a user to see useParams in action.</p>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function UserDetail() {
  const { userId } = useParams();
  const user = users.find((item) => item.id === userId);

  if (!user) {
    return (
      <section>
        <p>User with id "{userId}" was not found.</p>
        <Link to="/users">Back to users</Link>
      </section>
    );
  }

  return (
    <section>
      <h3>{user.name}</h3>
      <p>Route param userId: {userId}</p>
      <p>Role: {user.role}</p>
      <Link to="/users">Back to users</Link>
    </section>
  );
}

function Login() {
  const { currentUser, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from ?? "/dashboard";

  function handleLogin() {
    login();
    navigate(redirectTo, { replace: true });
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main>
      <h2>Login</h2>
      <p>Login is simulated with local React state.</p>

      <button type="button" onClick={handleLogin}>
        Login and go to dashboard
      </button>
    </main>
  );
}

function ProtectedRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

function DashboardLayout() {
  return (
    <main>
      <h2>Dashboard</h2>
      <nav>
        <NavLink to="/dashboard" end>
          Overview
        </NavLink>{" "}
        <NavLink to="/dashboard/settings">Settings</NavLink>
      </nav>

      <Outlet />
    </main>
  );
}

function DashboardHome() {
  const { currentUser } = useAuth();

  return (
    <section>
      <h3>Overview</h3>
      <p>Welcome back, {currentUser.name}.</p>
    </section>
  );
}

function DashboardSettings() {
  const navigate = useNavigate();

  return (
    <section>
      <h3>Settings</h3>
      <p>This is a protected nested route.</p>

      <button type="button" onClick={() => navigate(-1)}>
        Go back
      </button>
    </section>
  );
}

function NotFound() {
  return (
    <main>
      <h2>404</h2>
      <p>This route does not exist.</p>
      <Link to="/">Back home</Link>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />

        <Route path="users" element={<UsersLayout />}>
          <Route index element={<UserList />} />
          <Route path=":userId" element={<UserDetail />} />
        </Route>

        <Route path="login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
