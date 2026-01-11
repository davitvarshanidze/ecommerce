import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartTotalCents, loadCart, saveCart, type CartItem } from "../cart";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

type Address = {
  fullName: string;
  email: string;
  line1: string;
  city: string;
  country: string;
};

function generateOrderNumber() {
  // simple readable mock id
  return "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function CheckoutPage() {
  const navigate = useNavigate();

  const [cart] = useState<CartItem[]>(() => loadCart());
  const total = useMemo(() => cartTotalCents(cart), [cart]);

  const [address, setAddress] = useState<Address>({
    fullName: "",
    email: "",
    line1: "",
    city: "",
    country: "Georgia",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/">Go shopping</Link>
      </div>
    );
  }

  async function placeOrder() {
    setError(null);

    if (!address.fullName.trim()) return setError("Full name is required.");
    if (!address.email.trim()) return setError("Email is required.");
    if (!address.line1.trim()) return setError("Address line is required.");
    if (!address.city.trim()) return setError("City is required.");
    if (!address.country.trim()) return setError("Country is required.");

    setSubmitting(true);
    try {
      // Mock "payment + order creation"
      await new Promise((r) => setTimeout(r, 600));

      const orderNumber = generateOrderNumber();

      // Save last order confirmation info (optional)
      localStorage.setItem(
        "ecommerce_last_order_v1",
        JSON.stringify({
          orderNumber,
          createdAt: new Date().toISOString(),
          totalCents: total,
          items: cart,
          address,
        })
      );

      // Clear cart
      saveCart([]);

      navigate(`/order-confirmation/${orderNumber}`);
    } catch (e) {
      setError(String(e));
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800 }}>
      <h1>Checkout</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label>
            Full name
            <input
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>
            Email
            <input
              value={address.email}
              onChange={(e) => setAddress({ ...address, email: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>
            Address line
            <input
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div>
          <label>
            City
            <input
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div>
          <label>
            Country
            <input
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Order summary</h3>
      <ul>
        {cart.map((x) => (
          <li key={x.productId}>
            {x.name} × {x.quantity} — ${formatPrice(x.priceCents * x.quantity)}
          </li>
        ))}
      </ul>

      <h2>Total: ${formatPrice(total)}</h2>

      <button
        onClick={placeOrder}
        disabled={submitting}
        style={{ padding: "10px 14px", marginRight: 12 }}
      >
        {submitting ? "Placing order…" : "Place order"}
      </button>

      <Link to="/cart">Back to cart</Link>
    </div>
  );
}