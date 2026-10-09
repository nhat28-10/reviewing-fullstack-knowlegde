/*
  Context API va Redux Toolkit trong React

  File nay minh hoa:
  - Context API quan ly theme.
  - Redux Toolkit quan ly shopping cart.
  - useContext doc state tu Context Provider.
  - useSelector doc state tu Redux store.
  - useDispatch dispatch action de cap nhat Redux state.

  De chay can cai:
  npm install @reduxjs/toolkit react-redux

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import { configureStore, createSlice } from "@reduxjs/toolkit";
import { createContext, useContext, useMemo, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";

const products = [
  { id: 1, name: "Keyboard", price: 120 },
  { id: 2, name: "Mouse", price: 60 },
  { id: 3, name: "Monitor", price: 320 },
];

const ThemeContext = createContext(null);

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const value = useMemo(() => {
    function toggleTheme() {
      setTheme((currentTheme) =>
        currentTheme === "light" ? "dark" : "light",
      );
    }

    return {
      theme,
      toggleTheme,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    addItem(state, action) {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      state.items.push({
        ...product,
        quantity: 1,
      });
    },
    increaseQuantity(state, action) {
      const item = state.items.find(
        (cartItem) => cartItem.id === action.payload,
      );

      if (item) {
        item.quantity += 1;
      }
    },
    decreaseQuantity(state, action) {
      const item = state.items.find(
        (cartItem) => cartItem.id === action.payload,
      );

      if (!item) {
        return;
      }

      item.quantity -= 1;

      if (item.quantity <= 0) {
        state.items = state.items.filter(
          (cartItem) => cartItem.id !== action.payload,
        );
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter(
        (cartItem) => cartItem.id !== action.payload,
      );
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

const {
  addItem,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
} = cartSlice.actions;

const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

function Header() {
  const { theme, toggleTheme } = useTheme();
  const totalQuantity = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <header>
      <h1>Context API and Redux Toolkit Example</h1>
      <p>Theme from Context: {theme}</p>
      <p>Total cart quantity from Redux: {totalQuantity}</p>

      <button type="button" onClick={toggleTheme}>
        Toggle theme
      </button>
    </header>
  );
}

function ProductList() {
  const dispatch = useDispatch();

  return (
    <section>
      <h2>Products</h2>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <strong>{product.name}</strong> - ${product.price}
            <button type="button" onClick={() => dispatch(addItem(product))}>
              Add to cart
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) =>
    state.cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
  );

  return (
    <section>
      <h2>Cart</h2>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong> - ${item.price} x {item.quantity}
                <button
                  type="button"
                  onClick={() => dispatch(decreaseQuantity(item.id))}
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(increaseQuantity(item.id))}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(removeItem(item.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <p>Total price: ${totalPrice}</p>

          <button type="button" onClick={() => dispatch(clearCart())}>
            Clear cart
          </button>
        </>
      )}
    </section>
  );
}

function AppContent() {
  return (
    <main>
      <Header />
      <ProductList />
      <Cart />
    </main>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}
