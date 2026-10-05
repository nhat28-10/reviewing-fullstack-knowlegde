/*
  Props & State trong React

  File này minh họa:
  - Props truyền dữ liệu từ parent xuống child.
  - State lưu dữ liệu thay đổi bên trong component.
  - Callback props giúp child báo ngược hành động lên parent.
  - Controlled input dùng state để quản lý value.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

import { useState } from "react";

const initialProducts = [
  {
    id: 1,
    name: "Laptop",
    price: 2000,
  },
  {
    id: 2,
    name: "Keyboard",
    price: 120,
  },
  {
    id: 3,
    name: "Mouse",
    price: 60,
  },
];

function ProductCard({ product, isFavorite, onToggleFavorite }) {
  return (
    <article className="product-card">
      <div>
        <h2>{product.name}</h2>
        <p>${product.price}</p>
      </div>

      <button type="button" onClick={() => onToggleFavorite(product.id)}>
        {isFavorite ? "Remove favorite" : "Add favorite"}
      </button>
    </article>
  );
}

function ProductList({ products, favoriteIds, onToggleFavorite }) {
  return (
    <section>
      <h2>Products</h2>

      <div className="product-list">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favoriteIds.includes(product.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label>
      Search product
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type product name..."
      />
    </label>
  );
}

function Summary({ totalProducts, totalFavorites }) {
  return (
    <p>
      Showing {totalProducts} products. Favorite products: {totalFavorites}.
    </p>
  );
}

export default function App() {
  const [searchText, setSearchText] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);

  const filteredProducts = initialProducts.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  function handleToggleFavorite(productId) {
    setFavoriteIds((currentFavoriteIds) => {
      if (currentFavoriteIds.includes(productId)) {
        return currentFavoriteIds.filter((id) => id !== productId);
      }

      return [...currentFavoriteIds, productId];
    });
  }

  return (
    <main>
      <h1>Props & State Example</h1>

      <SearchBox value={searchText} onChange={setSearchText} />

      <Summary
        totalProducts={filteredProducts.length}
        totalFavorites={favoriteIds.length}
      />

      <ProductList
        products={filteredProducts}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />
    </main>
  );
}
