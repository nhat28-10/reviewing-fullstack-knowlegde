/*
  Event Handling & Conditional Rendering trong React

  File này minh họa:
  - onClick, onChange, onSubmit.
  - Truyền tham số cho event handler.
  - event.preventDefault() khi submit form.
  - Conditional rendering với if, ternary, && và return null.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

import { useState } from "react";

const initialTasks = [
  {
    id: 1,
    title: "Review JSX",
    isDone: true,
  },
  {
    id: 2,
    title: "Practice props and state",
    isDone: false,
  },
];

function AlertMessage({ message }) {
  if (!message) {
    return null;
  }

  return <p className="alert">{message}</p>;
}

function LoginPanel({ isLoggedIn, isAdmin, onLogin, onLogout }) {
  if (!isLoggedIn) {
    return (
      <section>
        <p>Please login to manage tasks.</p>
        <button type="button" onClick={onLogin}>
          Login
        </button>
      </section>
    );
  }

  return (
    <section>
      <p>{isAdmin ? "Welcome admin" : "Welcome user"}</p>

      {isAdmin && (
        <button type="button" onClick={() => console.log("Open admin page")}>
          Open admin page
        </button>
      )}

      <button type="button" onClick={onLogout}>
        Logout
      </button>
    </section>
  );
}

function TaskForm({ onAddTask }) {
  const [taskTitle, setTaskTitle] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!taskTitle.trim()) {
      return;
    }

    onAddTask(taskTitle.trim());
    setTaskTitle("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={taskTitle}
        onChange={(event) => setTaskTitle(event.target.value)}
        placeholder="New task..."
      />

      <button type="submit">Add task</button>
    </form>
  );
}

function TaskList({ tasks, onToggleTask, onDeleteTask }) {
  if (tasks.length === 0) {
    return <p>No tasks found.</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <label>
            <input
              type="checkbox"
              checked={task.isDone}
              onChange={() => onToggleTask(task.id)}
            />
            {task.isDone ? <s>{task.title}</s> : task.title}
          </label>

          <button type="button" onClick={() => onDeleteTask(task.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [message, setMessage] = useState("");

  function handleLogin() {
    setIsLoggedIn(true);
    setMessage("Login successfully.");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setMessage("Logout successfully.");
  }

  function handleAddTask(title) {
    const newTask = {
      id: Date.now(),
      title,
      isDone: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setMessage(`Added task: ${title}`);
  }

  function handleToggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, isDone: !task.isDone } : task
      )
    );
  }

  function handleDeleteTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
    setMessage("Deleted task.");
  }

  return (
    <main>
      <h1>Event Handling & Conditional Rendering</h1>

      <AlertMessage message={message} />

      <LoginPanel
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {isLoggedIn && (
        <>
          <label>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(event) => setIsAdmin(event.target.checked)}
            />
            Admin mode
          </label>

          <TaskForm onAddTask={handleAddTask} />

          <TaskList
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </>
      )}
    </main>
  );
}
