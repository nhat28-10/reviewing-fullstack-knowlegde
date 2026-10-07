/*
  useMemo va useCallback trong React

  File nay minh hoa:
  - useMemo de tinh danh sach da filter va tong tien.
  - useCallback de giu function reference on dinh.
  - React.memo de tranh render lai component con khi props khong doi.
  - Dependency array dung cho useMemo va useCallback.

  Co the copy component App vao mot project React/Vite de chay thu.
*/

import { memo, useCallback, useMemo, useState } from "react";

const initialProducts = [
  {
    id: 1,
    name: "Keyboard",
    category: "accessory",
    price: 120,
    inStock: true,
  },
  {
    id: 2,
    name: "Mouse",
    category: "accessory",
    price: 60,
    inStock: true,
  },
  {
    id: 3,
    name: "Monitor",
    category: "screen",
    price: 320,
    inStock: false,
  },
  {
    id: 4,
    name: "Laptop",
    category: "computer",
    price: 1200,
    inStock: true,
  },
  {
    id: 5,
    name: "USB-C Hub",
    category: "accessory",
    price: 85,
    inStock: false,
  },
];

const ProductList = memo(function ProductList({ products, onToggleStock }) {
  console.log("ProductList render");

  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <strong>{product.name}</strong> - ${product.price} -{" "}
          {product.inStock ? "In stock" : "Out of stock"}
          <button type="button" onClick={() => onToggleStock(product.id)}>
            Toggle stock
          </button>
        </li>
      ))}
    </ul>
  );
});

function ProductDashboard() {
  const [products, setProducts] = useState(initialProducts);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [counter, setCounter] = useState(0);

  const visibleProducts = useMemo(() => {
    console.log("Filtering products");

    return products.filter((product) => {
      const matchesKeyword = product.name
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesCategory =
        category === "all" || product.category === category;
      const matchesStock = !onlyInStock || product.inStock;

      return matchesKeyword && matchesCategory && matchesStock;
    });
  }, [products, keyword, category, onlyInStock]);

  const totalPrice = useMemo(() => {
    console.log("Calculating total price");

    return visibleProducts.reduce((sum, product) => sum + product.price, 0);
  }, [visibleProducts]);

  const handleToggleStock = useCallback((productId) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, inStock: !product.inStock }
          : product
      )
    );
  }, []);

  return (
    <section>
      <h2>Product dashboard</h2>

      <div>
        <label>
          Search
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search product..."
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All</option>
            <option value="accessory">Accessory</option>
            <option value="screen">Screen</option>
            <option value="computer">Computer</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(event) => setOnlyInStock(event.target.checked)}
          />
          Only in stock
        </label>
      </div>

      <p>Visible products: {visibleProducts.length}</p>
      <p>Total price: ${totalPrice}</p>

      <button type="button" onClick={() => setCounter((count) => count + 1)}>
        Re-render parent: {counter}
      </button>

      <ProductList
        products={visibleProducts}
        onToggleStock={handleToggleStock}
      />
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>useMemo and useCallback Example</h1>
      <ProductDashboard />
    </main>
  );
}
