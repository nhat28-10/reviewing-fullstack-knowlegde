/*
  useContext trong React

  File này minh họa:
  - Tạo Context bằng createContext().
  - Cung cấp dữ liệu bằng Provider.
  - Đọc dữ liệu bằng useContext().
  - Custom hook cho Context.
  - Chia sẻ theme và auth data qua nhiều tầng component.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);
const AuthContext = createContext(null);

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login() {
    setUser({
      id: 1,
      name: "Nhat",
      role: "Frontend Developer",
    });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, login, logout } = useAuth();

  return (
    <header>
      <h2>Header</h2>
      <p>Current theme: {theme}</p>
      <p>{user ? `Logged in as ${user.name}` : "Not logged in"}</p>

      <button type="button" onClick={toggleTheme}>
        Toggle theme
      </button>

      {user ? (
        <button type="button" onClick={logout}>
          Logout
        </button>
      ) : (
        <button type="button" onClick={login}>
          Login
        </button>
      )}
    </header>
  );
}

function Sidebar() {
  return (
    <aside>
      <h2>Sidebar</h2>
      <UserCard />
    </aside>
  );
}

function UserCard() {
  const { user } = useAuth();

  if (!user) {
    return <p>Please login to see your profile.</p>;
  }

  return (
    <article>
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </article>
  );
}

function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <main>
      <h2>Dashboard</h2>
      <p>Theme from context: {theme}</p>
      <p>
        Auth status: {user ? `Welcome back, ${user.name}` : "Guest mode"}
      </p>
    </main>
  );
}

function AppContent() {
  return (
    <>
      <Header />
      <Sidebar />
      <Dashboard />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <h1>useContext Example</h1>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
