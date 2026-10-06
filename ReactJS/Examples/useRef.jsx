/*
  useRef trong React

  File này minh họa:
  - Focus input bằng DOM ref.
  - Lưu timer id bằng ref.
  - Lưu previous value bằng ref.
  - Lưu mutable value không làm component re-render.
  - So sánh ref với state.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

import { useEffect, useRef, useState } from "react";

function FocusInput() {
  const inputRef = useRef(null);

  function handleFocus() {
    inputRef.current?.focus();
  }

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }

  return (
    <section>
      <h2>Focus input</h2>

      <input ref={inputRef} type="text" placeholder="Type something..." />

      <button type="button" onClick={handleFocus}>
        Focus input
      </button>

      <button type="button" onClick={handleClear}>
        Clear input
      </button>
    </section>
  );
}

function TimerWithRef() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  function handleStart() {
    if (timerRef.current !== null) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);
  }

  function handleStop() {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <section>
      <h2>Timer id with ref</h2>
      <p>Seconds: {seconds}</p>

      <button type="button" onClick={handleStart}>
        Start
      </button>

      <button type="button" onClick={handleStop}>
        Stop
      </button>
    </section>
  );
}

function PreviousValue() {
  const [count, setCount] = useState(0);
  const previousCountRef = useRef(0);

  useEffect(() => {
    previousCountRef.current = count;
  }, [count]);

  return (
    <section>
      <h2>Previous value</h2>
      <p>Current count: {count}</p>
      <p>Previous count: {previousCountRef.current}</p>

      <button
        type="button"
        onClick={() => setCount((currentCount) => currentCount + 1)}
      >
        Increase
      </button>
    </section>
  );
}

function RefVsState() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);
  const renderCount = useRef(0);

  renderCount.current += 1;

  function handleIncreaseRef() {
    refCount.current += 1;
    console.log("refCount:", refCount.current);
  }

  return (
    <section>
      <h2>Ref vs state</h2>
      <p>State count: {stateCount}</p>
      <p>Ref count: {refCount.current}</p>
      <p>Render count: {renderCount.current}</p>

      <button
        type="button"
        onClick={() => setStateCount((currentCount) => currentCount + 1)}
      >
        Increase state
      </button>

      <button type="button" onClick={handleIncreaseRef}>
        Increase ref
      </button>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>useRef Example</h1>
      <FocusInput />
      <TimerWithRef />
      <PreviousValue />
      <RefVsState />
    </main>
  );
}
