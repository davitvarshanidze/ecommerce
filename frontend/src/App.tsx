import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { useEffect, useState } from "react";
import { fetchMe } from "./api";
import { clearToken, getToken } from "./auth";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    if (!getToken()) return;

    fetchMe()
      .then(setMe)
      .catch(() => {
        clearToken();
        setMe(null);
      });
  }, []);
  return (
    <BrowserRouter>
      <div style={{ padding: 12, fontFamily: "system-ui" }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/cart" style={{ marginRight: 12 }}>Cart</Link>

        {me ? (
          <>
            <span style={{ marginRight: 12 }}>Logged in as {me.email}</span>
            <button
              onClick={() => {
                clearToken();
                setMe(null);
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>

      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}