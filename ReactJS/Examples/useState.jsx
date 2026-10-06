/*
  useState trong React

  File này minh họa:
  - Counter state với callback updater.
  - Controlled input.
  - Object state cho form.
  - Array state để thêm, toggle và xóa item.
  - Không mutate trực tiếp object/array state.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

import { useState } from "react";

const initialTodos = [
  {
    id: 1,
    title: "Learn JSX",
    isDone: true,
  },
  {
    id: 2,
    title: "Practice useState",
    isDone: false,
  },
];

function Counter() {
  const [count, setCount] = useState(0);

  function handleIncrease() {
    setCount((prevCount) => prevCount + 1);
  }

  function handleIncreaseThreeTimes() {
    setCount((prevCount) => prevCount + 1);
    setCount((prevCount) => prevCount + 1);
    setCount((prevCount) => prevCount + 1);
  }

  return (
    <section>
      <h2>Counter</h2>
      <p>Count: {count}</p>

      <button type="button" onClick={handleIncrease}>
        Increase
      </button>

      <button type="button" onClick={handleIncreaseThreeTimes}>
        Increase 3 times
      </button>
    </section>
  );
}

function ProfileForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  return (
    <section>
      <h2>Profile form</h2>

      <label>
        Name
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
        />
      </label>

      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com"
        />
      </label>

      <p>
        Preview: {form.name || "No name"} - {form.email || "No email"}
      </p>
    </section>
  );
}

function TodoList() {
  const [todos, setTodos] = useState(initialTodos);
  const [todoTitle, setTodoTitle] = useState("");

  function handleAddTodo(event) {
    event.preventDefault();

    if (!todoTitle.trim()) {
      return;
    }

    const newTodo = {
      id: Date.now(),
      title: todoTitle.trim(),
      isDone: false,
    };

    setTodos((currentTodos) => [...currentTodos, newTodo]);
    setTodoTitle("");
  }

  function handleToggleTodo(todoId) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  }

  function handleDeleteTodo(todoId) {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== todoId)
    );
  }

  return (
    <section>
      <h2>Todo list</h2>

      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={todoTitle}
          onChange={(event) => setTodoTitle(event.target.value)}
          placeholder="New todo..."
        />

        <button type="submit">Add todo</button>
      </form>

      {todos.length === 0 ? (
        <p>No todos found.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  onChange={() => handleToggleTodo(todo.id)}
                />
                {todo.isDone ? <s>{todo.title}</s> : todo.title}
              </label>

              <button type="button" onClick={() => handleDeleteTodo(todo.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>useState Example</h1>
      <Counter />
      <ProfileForm />
      <TodoList />
    </main>
  );
}
