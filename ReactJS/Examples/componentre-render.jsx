/*
  Component re-render in React

  This file demonstrates:
  - State changes trigger re-render.
  - Parent re-render can call child again.
  - React.memo can skip child re-render when props are stable.
  - useRef changes do not trigger re-render.
  - Changing key remounts a component and resets its state.

  Open the browser console to observe render logs.
  You can copy the App component into a React/Vite project to run it.
*/

import { memo, useRef, useState } from "react";

function NormalChild() {
  console.log("NormalChild render");

  return <p>Normal child renders whenever parent renders.</p>;
}

const MemoChild = memo(function MemoChild({ label }) {
  console.log("MemoChild render");

  return <p>Memo child label: {label}</p>;
});

function ParentRenderDemo() {
  const [count, setCount] = useState(0);

  console.log("ParentRenderDemo render");

  return (
    <section>
      <h2>Parent and child render</h2>
      <p>Parent count: {count}</p>

      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Re-render parent
      </button>

      <NormalChild />
      <MemoChild label="Stable label" />
    </section>
  );
}

function RefDemo() {
  const renderCountRef = useRef(0);
  const clickCountRef = useRef(0);
  const [visibleCount, setVisibleCount] = useState(0);

  renderCountRef.current += 1;

  function increaseRefOnly() {
    clickCountRef.current += 1;
    console.log("Ref click count:", clickCountRef.current);
  }

  return (
    <section>
      <h2>useRef does not trigger re-render</h2>
      <p>Render count: {renderCountRef.current}</p>
      <p>Visible state count: {visibleCount}</p>
      <p>Ref click count in UI: {clickCountRef.current}</p>

      <button type="button" onClick={increaseRefOnly}>
        Increase ref only
      </button>

      <button
        type="button"
        onClick={() => setVisibleCount((count) => count + 1)}
      >
        Increase state
      </button>
    </section>
  );
}

function ProfileForm() {
  const [name, setName] = useState("");

  console.log("ProfileForm render");

  return (
    <section>
      <h3>Profile form</h3>

      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Type a name..."
      />

      <p>Name: {name || "Empty"}</p>
    </section>
  );
}

function KeyRemountDemo() {
  const [version, setVersion] = useState(1);

  return (
    <section>
      <h2>Changing key remounts component</h2>

      <button type="button" onClick={() => setVersion((value) => value + 1)}>
        Reset form by changing key
      </button>

      <ProfileForm key={version} />
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>Component Re-render Example</h1>
      <ParentRenderDemo />
      <RefDemo />
      <KeyRemountDemo />
    </main>
  );
}
