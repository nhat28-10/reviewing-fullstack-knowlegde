/*
  Form validation trong React

  File nay minh hoa:
  - Controlled form voi React state.
  - validateForm tach rieng validation logic.
  - Quan ly errors bang object.
  - Quan ly touched de tranh hien loi qua som.
  - Validate khi submit va cap nhat loi khi user sua input.
  - Disable submit button khi form chua hop le.

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import { useMemo, useState } from "react";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: "",
  acceptedTerms: false,
};

function validateForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Email is invalid.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  const ageNumber = Number(values.age);

  if (!values.age) {
    errors.age = "Age is required.";
  } else if (Number.isNaN(ageNumber)) {
    errors.age = "Age must be a number.";
  } else if (ageNumber < 18) {
    errors.age = "You must be at least 18 years old.";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "You must accept the terms.";
  }

  return errors;
}

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <p>{children}</p>;
}

function SignupForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const liveErrors = useMemo(() => validateForm(form), [form]);
  const isValid = Object.keys(liveErrors).length === 0;
  const shouldDisableSubmit = isSubmitted && !isValid;

  function shouldShowError(fieldName) {
    return Boolean((touched[fieldName] || isSubmitted) && errors[fieldName]);
  }

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    const nextForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    setForm(nextForm);
    setSubmittedData(null);

    if (touched[name] || isSubmitted) {
      setErrors(validateForm(nextForm));
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    const nextTouched = {
      ...touched,
      [name]: true,
    };

    setTouched(nextTouched);
    setErrors(validateForm(form));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setIsSubmitted(true);
    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      age: true,
      acceptedTerms: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setSubmittedData(null);
      return;
    }

    setSubmittedData(form);
    console.log("Submit signup form:", form);
  }

  function handleReset() {
    setForm(initialForm);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setSubmittedData(null);
  }

  return (
    <section>
      <h2>Signup form validation</h2>

      <form noValidate onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your name"
          />
        </label>
        {shouldShowError("name") && <FieldError>{errors.name}</FieldError>}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="your@email.com"
          />
        </label>
        {shouldShowError("email") && <FieldError>{errors.email}</FieldError>}

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="At least 8 characters"
          />
        </label>
        {shouldShowError("password") && (
          <FieldError>{errors.password}</FieldError>
        )}

        <label>
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Repeat password"
          />
        </label>
        {shouldShowError("confirmPassword") && (
          <FieldError>{errors.confirmPassword}</FieldError>
        )}

        <label>
          Age
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="18"
          />
        </label>
        {shouldShowError("age") && <FieldError>{errors.age}</FieldError>}

        <label>
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={form.acceptedTerms}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          Accept terms
        </label>
        {shouldShowError("acceptedTerms") && (
          <FieldError>{errors.acceptedTerms}</FieldError>
        )}

        <button type="submit" disabled={shouldDisableSubmit}>
          Create account
        </button>

        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>

      <p>Form status: {isValid ? "Valid" : "Invalid"}</p>

      {submittedData && (
        <section>
          <h3>Submitted data</h3>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </section>
      )}
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>Form Validation Example</h1>
      <SignupForm />
    </main>
  );
}
