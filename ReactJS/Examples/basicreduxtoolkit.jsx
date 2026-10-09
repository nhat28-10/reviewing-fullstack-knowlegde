/*
  Redux Toolkit co ban trong React

  File nay minh hoa:
  - Tao store bang configureStore.
  - Tao slice bang createSlice.
  - Boc app bang Provider.
  - Doc state bang useSelector.
  - Gui action bang useDispatch.
  - Truyen du lieu qua action.payload.

  De chay can cai:
  npm install @reduxjs/toolkit react-redux

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";

const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
    step: 5,
  },
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    increaseByAmount(state, action) {
      state.value += action.payload;
    },
    reset(state) {
      state.value = 0;
    },
    setStep(state, action) {
      state.step = action.payload;
    },
  },
});

const {
  decrement,
  increaseByAmount,
  increment,
  reset,
  setStep,
} = counterSlice.actions;

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const step = useSelector((state) => state.counter.step);
  const dispatch = useDispatch();

  function handleStepChange(event) {
    dispatch(setStep(Number(event.target.value)));
  }

  return (
    <section>
      <h2>Counter</h2>

      <p>Current count: {count}</p>

      <button type="button" onClick={() => dispatch(decrement())}>
        -1
      </button>
      <button type="button" onClick={() => dispatch(increment())}>
        +1
      </button>
      <button type="button" onClick={() => dispatch(increaseByAmount(step))}>
        +{step}
      </button>
      <button type="button" onClick={() => dispatch(reset())}>
        Reset
      </button>

      <label>
        Step:
        <input
          type="number"
          min="1"
          value={step}
          onChange={handleStepChange}
        />
      </label>
    </section>
  );
}

function StorePreview() {
  const counterState = useSelector((state) => state.counter);

  return (
    <section>
      <h2>Redux state preview</h2>
      <pre>{JSON.stringify(counterState, null, 2)}</pre>
    </section>
  );
}

function AppContent() {
  return (
    <main>
      <h1>Basic Redux Toolkit Example</h1>
      <Counter />
      <StorePreview />
    </main>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
