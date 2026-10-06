/*
  useEffect trong React

  File này minh họa:
  - Cập nhật document.title khi state thay đổi.
  - Timer với cleanup.
  - Window resize listener với cleanup.
  - Fake API với loading/error/data.
  - Dependency array chạy lại khi query thay đổi.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

import { useEffect, useState } from "react";

const allUsers = [
  {
    id: 1,
    name: "Nhat",
    role: "Frontend Developer",
  },
  {
    id: 2,
    name: "Duy",
    role: "Backend Developer",
  },
  {
    id: 3,
    name: "Giap",
    role: "Fullstack Developer",
  },
];

function fetchUsersByQuery(query) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (query.toLowerCase() === "error") {
        reject(new Error("Cannot load users"));
        return;
      }

      const users = allUsers.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );

      resolve(users);
    }, 600);
  });
}

function CounterWithTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <section>
      <h2>Document title</h2>
      <p>Count: {count}</p>

      <button
        type="button"
        onClick={() => setCount((currentCount) => currentCount + 1)}
      >
        Increase
      </button>
    </section>
  );
}

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  return (
    <section>
      <h2>Timer with cleanup</h2>
      <p>Seconds: {seconds}</p>
    </section>
  );
}

function WindowSize() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section>
      <h2>Resize listener</h2>
      <p>Window width: {width}px</p>
    </section>
  );
}

function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let shouldIgnore = false;

    async function loadUsers() {
      try {
        setIsLoading(true);
        setError("");

        const data = await fetchUsersByQuery(query);

        if (!shouldIgnore) {
          setUsers(data);
        }
      } catch (error) {
        if (!shouldIgnore) {
          setError(error.message);
          setUsers([]);
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      shouldIgnore = true;
    };
  }, [query]);

  return (
    <section>
      <h2>Fake API search</h2>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search user or type error..."
      />

      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!isLoading && !error && users.length === 0 && <p>No users found.</p>}

      {!isLoading && !error && users.length > 0 && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.role}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  const [showTimer, setShowTimer] = useState(true);

  return (
    <main>
      <h1>useEffect Example</h1>

      <CounterWithTitle />

      <button type="button" onClick={() => setShowTimer((show) => !show)}>
        {showTimer ? "Hide timer" : "Show timer"}
      </button>

      {showTimer && <Timer />}

      <WindowSize />
      <UserSearch />
    </main>
  );
}
