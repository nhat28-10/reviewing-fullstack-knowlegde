/*
  Render List & Key trong React

  File này minh họa:
  - Render list bằng map().
  - Dùng id ổn định làm key.
  - Filter, sort, add và delete item.
  - Empty state khi list rỗng.
  - Truyền id riêng vì key không phải props bình thường.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

import { useMemo, useState } from "react";

const initialProducts = [
  {
    id: 1,
    name: "Laptop",
    category: "Electronics",
    price: 2000,
  },
  {
    id: 2,
    name: "Keyboard",
    category: "Accessories",
    price: 120,
  },
  {
    id: 3,
    name: "Mouse",
    category: "Accessories",
    price: 60,
  },
];

function ProductCard({ product, onDelete }) {
  return (
    <article className="product-card">
      <div>
        <h2>{product.name}</h2>
        <p>{product.category}</p>
        <p>${product.price}</p>
      </div>

      <button type="button" onClick={() => onDelete(product.id)}>
        Delete
      </button>
    </article>
  );
}

function ProductList({ products, onDelete }) {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <section>
      <h2>Products</h2>

      <div className="product-list">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [searchText, setSearchText] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return a.price - b.price;
        }

        return b.price - a.price;
      });
  }, [products, searchText, sortDirection]);

  function handleAddProduct() {
    const nextId = Date.now();

    const newProduct = {
      id: nextId,
      name: `Product ${products.length + 1}`,
      category: "New",
      price: 100 + products.length * 25,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);
  }

  function handleDeleteProduct(productId) {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId)
    );
  }

  return (
    <main>
      <h1>Render List & Key Example</h1>

      <div>
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search product..."
        />

        <button
          type="button"
          onClick={() =>
            setSortDirection((currentDirection) =>
              currentDirection === "asc" ? "desc" : "asc"
            )
          }
        >
          Sort by price: {sortDirection}
        </button>

        <button type="button" onClick={handleAddProduct}>
          Add product
        </button>
      </div>

      <ProductList products={visibleProducts} onDelete={handleDeleteProduct} />
    </main>
  );
}
