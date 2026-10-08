/*
  React.memo va toi uu render trong React

  File nay minh hoa:
  - Parent re-render khong nhat thiet lam memoized child re-render.
  - useCallback giu function prop on dinh.
  - useMemo giu object prop on dinh.
  - State ben trong component memoized van lam component do re-render.

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import { memo, useCallback, useMemo, useState } from "react";

const RenderNote = memo(function RenderNote({ title, user, onReset }) {
  console.log("RenderNote render:", title);

  return (
    <section>
      <h2>{title}</h2>
      <p>
        Owner: {user.name} - {user.role}
      </p>
      <button type="button" onClick={onReset}>
        Reset parent counter
      </button>
    </section>
  );
});

const LocalCounter = memo(function LocalCounter() {
  const [count, setCount] = useState(0);

  console.log("LocalCounter render");

  return (
    <section>
      <h2>Memoized component with its own state</h2>
      <p>Local count: {count}</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Increase local count
      </button>
    </section>
  );
});

export default function App() {
  const [parentCount, setParentCount] = useState(0);
  const [name, setName] = useState("Nhat");

  const user = useMemo(() => {
    return {
      name,
      role: "Frontend Developer",
    };
  }, [name]);

  const handleResetCounter = useCallback(() => {
    setParentCount(0);
  }, []);

  return (
    <main>
      <h1>React.memo Example</h1>

      <section>
        <h2>Parent component</h2>
        <p>Parent count: {parentCount}</p>

        <button
          type="button"
          onClick={() => setParentCount((value) => value + 1)}
        >
          Re-render parent
        </button>

        <button
          type="button"
          onClick={() =>
            setName((currentName) =>
              currentName === "Nhat" ? "David" : "Nhat"
            )
          }
        >
          Change user name
        </button>
      </section>

      <RenderNote
        title="Memoized child"
        user={user}
        onReset={handleResetCounter}
      />

      <LocalCounter />
    </main>
  );
}
