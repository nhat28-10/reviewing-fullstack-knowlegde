/*
  Controlled va uncontrolled component trong React

  File nay minh hoa:
  - Controlled input dung value va onChange.
  - Controlled checkbox dung checked va onChange.
  - Uncontrolled form dung defaultValue va FormData.
  - Uncontrolled input dung ref de focus va doc value khi can.

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import { useRef, useState } from "react";

function ControlledSignupForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    acceptedTerms: false,
  });

  const isValidEmail = form.email.includes("@");
  const canSubmit =
    form.name.trim() !== "" && isValidEmail && form.acceptedTerms;

  function handleChange(event) {
    const { name, type, checked, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Controlled form:", form);
  }

  return (
    <section>
      <h2>Controlled form</h2>

      <form onSubmit={handleSubmit}>
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

        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={form.acceptedTerms}
            onChange={handleChange}
          />
          Accept terms
        </label>

        <button type="submit" disabled={!canSubmit}>
          Submit controlled form
        </button>
      </form>

      <p>
        Preview: {form.name || "No name"} - {form.email || "No email"} -{" "}
        {form.role}
      </p>

      {!isValidEmail && form.email !== "" && <p>Email must include @.</p>}
    </section>
  );
}

function UncontrolledContactForm() {
  const noteRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());

    console.log("Uncontrolled form:", values);
    console.log("Note from ref:", noteRef.current?.value);
  }

  function handleFocusNote() {
    noteRef.current?.focus();
  }

  return (
    <section>
      <h2>Uncontrolled form</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            defaultValue="nhat@example.com"
            placeholder="your@email.com"
          />
        </label>

        <label>
          Topic
          <select name="topic" defaultValue="react">
            <option value="react">React</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
        </label>

        <label>
          <input type="checkbox" name="subscribe" defaultChecked={true} />
          Subscribe to newsletter
        </label>

        <label>
          Note
          <textarea
            ref={noteRef}
            name="note"
            defaultValue="I want to learn React forms."
          />
        </label>

        <button type="button" onClick={handleFocusNote}>
          Focus note
        </button>

        <button type="submit">Submit uncontrolled form</button>
      </form>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>Controlled vs Uncontrolled Component Example</h1>
      <ControlledSignupForm />
      <UncontrolledContactForm />
    </main>
  );
}
