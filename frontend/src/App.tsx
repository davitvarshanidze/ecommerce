import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 12, fontFamily: "system-ui" }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/cart">Cart</Link>
      </div>

      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}