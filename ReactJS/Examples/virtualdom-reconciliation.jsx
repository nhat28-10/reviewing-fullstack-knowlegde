/*
  Virtual DOM and reconciliation in React

  This file demonstrates:
  - State changes make React calculate a new UI.
  - React updates only the necessary real DOM parts.
  - Stable keys help React preserve item identity.
  - Changing a key remounts a component and resets its state.

  Open the browser console to observe render logs.
  You can copy the App component into a React/Vite project to run it.
*/

import { useState } from "react";

const initialUsers = [
  {
    id: 1,
    name: "Nhat",
  },
  {
    id: 2,
    name: "Duy",
  },
  {
    id: 3,
    name: "Giap",
  },
];

function CounterDemo() {
  const [count, setCount] = useState(0);

  console.log("CounterDemo render");

  return (
    <section>
      <h2>Only changed text needs DOM update</h2>

      <h3>This heading stays the same</h3>
      <p>Count: {count}</p>

      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Increase count
      </button>
    </section>
  );
}

function UserItem({ user }) {
  const [note, setNote] = useState("");

  console.log("UserItem render:", user.name);

  return (
    <li>
      <strong>{user.name}</strong>
      <input
        type="text"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={`Note for ${user.name}`}
      />
    </li>
  );
}

function StableKeyListDemo() {
  const [users, setUsers] = useState(initialUsers);

  function reverseUsers() {
    setUsers((currentUsers) => [...currentUsers].reverse());
  }

  function removeFirstUser() {
    setUsers((currentUsers) => currentUsers.slice(1));
  }

  function resetUsers() {
    setUsers(initialUsers);
  }

  return (
    <section>
      <h2>Stable keys preserve item identity</h2>

      <button type="button" onClick={reverseUsers}>
        Reverse list
      </button>

      <button type="button" onClick={removeFirstUser}>
        Remove first user
      </button>

      <button type="button" onClick={resetUsers}>
        Reset list
      </button>

      <ul>
        {users.map((user) => (
          <UserItem key={user.id} user={user} />
        ))}
      </ul>
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
        placeholder="Type something..."
      />

      <p>Value: {name || "Empty"}</p>
    </section>
  );
}

function KeyRemountDemo() {
  const [version, setVersion] = useState(1);

  return (
    <section>
      <h2>Changing key remounts a component</h2>

      <button type="button" onClick={() => setVersion((value) => value + 1)}>
        Change key and reset form
      </button>

      <ProfileForm key={version} />
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>Virtual DOM and Reconciliation Example</h1>
      <CounterDemo />
      <StableKeyListDemo />
      <KeyRemountDemo />
    </main>
  );
}
