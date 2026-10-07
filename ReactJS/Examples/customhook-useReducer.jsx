/*
  Custom Hook and useReducer in React

  This file demonstrates:
  - useToggle custom hook.
  - useCart custom hook with useReducer.
  - Reducer actions for add, increase, decrease, remove, and clear.
  - Returning new state instead of mutating old state.

  You can copy the App component into a React/Vite project to run it.
*/

import { useMemo, useReducer, useState } from "react";

const products = [
  {
    id: 1,
    name: "Keyboard",
    price: 120,
  },
  {
    id: 2,
    name: "Mouse",
    price: 60,
  },
  {
    id: 3,
    name: "Monitor",
    price: 320,
  },
];

const initialCartState = {
  items: [],
};

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  function toggle() {
    setValue((currentValue) => !currentValue);
  }

  function open() {
    setValue(true);
  }

  function close() {
    setValue(false);
  }

  return {
    value,
    toggle,
    open,
    close,
  };
}

function cartReducer(state, action) {
  switch (action.type) {
    case "add_item": {
      const product = action.payload.product;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            ...product,
            quantity: 1,
          },
        ],
      };
    }

    case "increase_quantity": {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }

    case "decrease_quantity": {
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    }

    case "remove_item": {
      return {
        ...state,
        items: state.items.filter(
          (item) => item.id !== action.payload.productId
        ),
      };
    }

    case "clear_cart": {
      return initialCartState;
    }

    default: {
      return state;
    }
  }
}

function useCart() {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const totalQuantity = useMemo(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  const totalPrice = useMemo(() => {
    return state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [state.items]);

  function addItem(product) {
    dispatch({
      type: "add_item",
      payload: {
        product,
      },
    });
  }

  function increaseQuantity(productId) {
    dispatch({
      type: "increase_quantity",
      payload: {
        productId,
      },
    });
  }

  function decreaseQuantity(productId) {
    dispatch({
      type: "decrease_quantity",
      payload: {
        productId,
      },
    });
  }

  function removeItem(productId) {
    dispatch({
      type: "remove_item",
      payload: {
        productId,
      },
    });
  }

  function clearCart() {
    dispatch({
      type: "clear_cart",
    });
  }

  return {
    items: state.items,
    totalQuantity,
    totalPrice,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  };
}

function ProductList({ onAddItem }) {
  return (
    <section>
      <h2>Products</h2>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <strong>{product.name}</strong> - ${product.price}
            <button type="button" onClick={() => onAddItem(product)}>
              Add to cart
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CartSummary({
  items,
  totalQuantity,
  totalPrice,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
}) {
  return (
    <section>
      <h2>Cart</h2>

      <p>Total quantity: {totalQuantity}</p>
      <p>Total price: ${totalPrice}</p>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong> - ${item.price} x {item.quantity}
                <button type="button" onClick={() => onDecrease(item.id)}>
                  -
                </button>
                <button type="button" onClick={() => onIncrease(item.id)}>
                  +
                </button>
                <button type="button" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button type="button" onClick={onClear}>
            Clear cart
          </button>
        </>
      )}
    </section>
  );
}

function CartPage() {
  const cart = useCart();
  const cartModal = useToggle(false);

  return (
    <>
      <ProductList onAddItem={cart.addItem} />

      <button type="button" onClick={cartModal.toggle}>
        {cartModal.value ? "Hide cart" : "Show cart"} ({cart.totalQuantity})
      </button>

      {cartModal.value && (
        <CartSummary
          items={cart.items}
          totalQuantity={cart.totalQuantity}
          totalPrice={cart.totalPrice}
          onIncrease={cart.increaseQuantity}
          onDecrease={cart.decreaseQuantity}
          onRemove={cart.removeItem}
          onClear={cart.clearCart}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <main>
      <h1>Custom Hook and useReducer Example</h1>
      <CartPage />
    </main>
  );
}
