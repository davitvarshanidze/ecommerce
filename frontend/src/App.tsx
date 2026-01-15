import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import {ProductListPage} from "./pages/ProductListPage";
import {ProductDetailPage} from "./pages/ProductDetailPage";
import {CartPage} from "./pages/CartPage";
import {CheckoutPage} from "./pages/CheckoutPage";
import {OrderConfirmationPage} from "./pages/OrderConfirmationPage";
import {useEffect, useState} from "react";
import {fetchMe} from "./api";
import {clearToken, getToken} from "./auth";
import {LoginPage} from "./pages/LoginPage";
import {OrdersPage} from "./pages/OrdersPage";
import {OrderDetailsPage} from "./pages/OrderDetailsPage";
import {AdminProductsPage} from "./pages/AdminProductsPage.tsx";

export default function App() {
    const [me, setMe] = useState<any | null>(null);

    useEffect(() => {
        function loadMe() {
            if (!getToken()) {
                setMe(null);
                return;
            }

            fetchMe()
                .then(setMe)
                .catch(() => {
                    clearToken();
                    setMe(null);
                });
        }

        loadMe(); // run once at startup

        window.addEventListener("auth-changed", loadMe);
        return () => window.removeEventListener("auth-changed", loadMe);
    }, []);
    return (
        <BrowserRouter>
            <div style={{padding: 12, fontFamily: "system-ui"}}>
                <Link to="/" style={{marginRight: 12}}>Home</Link>
                <Link to="/cart" style={{marginRight: 12}}>Cart</Link>
                <Link to="/orders" style={{marginRight: 12}}>Orders</Link>

                {me?.role === "Admin" && (
                    <Link to="/admin/products" style={{marginRight: 12}}>
                        Admin
                    </Link>
                )}

                {me ? (
                    <>
                        <span style={{marginRight: 12}}>Logged in as {me.email}</span>
                        <button
                            onClick={() => {
                                clearToken();
                                setMe(null);
                                window.dispatchEvent(new Event("auth-changed"));
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
                <Route path="/" element={<ProductListPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/products/:id" element={<ProductDetailPage/>}/>
                <Route path="/cart" element={<CartPage/>}/>
                <Route path="/checkout" element={<CheckoutPage/>}/>
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage/>}/>
                <Route path="/orders" element={<OrdersPage/>}/>
                <Route path="/orders/:id" element={<OrderDetailsPage/>}/>
                <Route
                    path="/admin/products"
                    element={
                        me?.role === "Admin" ? (
                            <AdminProductsPage/>
                        ) : (
                            <div style={{padding: 24, fontFamily: "system-ui"}}>
                                <h2>Forbidden</h2>
                                <p>You must be an admin to view this page.</p>
                                <Link to="/">Go home</Link>
                            </div>
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}