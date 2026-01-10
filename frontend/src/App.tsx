import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "./api";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function App() {
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts({ page: 1, pageSize: 12 })
      .then((r) => setItems(r.items))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Ecommerce</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul>
        {items.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            <strong>{p.name}</strong> — ${formatPrice(p.priceCents)}
            {p.category ? <span> ({p.category.name})</span> : null}
            {p.description ? <div>{p.description}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}