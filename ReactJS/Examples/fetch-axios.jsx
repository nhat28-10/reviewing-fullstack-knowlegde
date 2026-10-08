/*
  fetch va Axios trong React

  File nay minh hoa:
  - Goi API bang fetch.
  - Goi API bang Axios.
  - Quan ly loading, error va data.
  - Retry request.
  - POST du lieu demo.

  De chay phan Axios, can cai:
  npm install axios

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 10000,
});

async function getUsersWithFetch(signal) {
  const response = await fetch(API_URL, { signal });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  return response.json();
}

async function getUsersWithAxios() {
  const response = await api.get("/users");

  return response.data;
}

async function createPostWithFetch(title) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body: "This post was created from a fetch example.",
      userId: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Create post failed with status ${response.status}`);
  }

  return response.json();
}

function UserList({ title, users }) {
  return (
    <section>
      <h2>{title}</h2>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FetchUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getUsersWithFetch(controller.signal);
        setUsers(data);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  return (
    <section>
      <h2>Fetch users</h2>

      <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
        Retry fetch request
      </button>

      {isLoading && <p>Loading fetch users...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && (
        <UserList title="Users from fetch" users={users} />
      )}
    </section>
  );
}

function AxiosUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async function loadUsers() {
    try {
      setIsLoading(true);
      setError("");

      const data = await getUsersWithAxios();
      setUsers(data);
    } catch (error) {
      if (error.response) {
        setError(`Axios failed with status ${error.response.status}`);
      } else if (error.request) {
        setError("Axios request was sent but no response was received.");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <section>
      <h2>Axios users</h2>

      <button type="button" onClick={loadUsers}>
        Retry axios request
      </button>

      {isLoading && <p>Loading axios users...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && (
        <UserList title="Users from Axios" users={users} />
      )}
    </section>
  );
}

function CreatePostDemo() {
  const [title, setTitle] = useState("");
  const [createdPost, setCreatedPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const data = await createPostWithFetch(title.trim());
      setCreatedPost(data);
      setTitle("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Create post with fetch</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Post title"
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create post"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {createdPost && (
        <section>
          <h3>Created post</h3>
          <pre>{JSON.stringify(createdPost, null, 2)}</pre>
        </section>
      )}
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>fetch and Axios Example</h1>
      <FetchUsers />
      <AxiosUsers />
      <CreatePostDemo />
    </main>
  );
}
