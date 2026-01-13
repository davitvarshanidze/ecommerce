import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {cartTotalCents, loadCart, saveCart, updateQty, type CartItem} from "../cart";

function formatPrice(cents: number) {
    return (cents / 100).toFixed(2);
}

export function CartPage() {
    const [cart, setCart] = useState<CartItem[]>(() => loadCart());

    useEffect(() => {
        setCart(loadCart());
    }, []);

    useEffect(() => {
        saveCart(cart);
    }, [cart]);

    const total = useMemo(() => cartTotalCents(cart), [cart]);

    return (
        <div style={{padding: 24, fontFamily: "system-ui"}}>
            <h1>Cart</h1>

            {cart.length === 0 ? (
                <>
                    <p>Your cart is empty.</p>
                    <Link to="/">Go shopping</Link>
                </>
            ) : (
                <>
                    <ul>
                        {cart.map((x) => (
                            <li key={x.productId} style={{marginBottom: 12}}>
                                <strong>{x.name}</strong> — ${formatPrice(x.priceCents)}
                                <div style={{marginTop: 6}}>
                                    Qty:{" "}
                                    <input
                                        type="number"
                                        min={0}
                                        value={x.quantity}
                                        onChange={(e) =>
                                            setCart(updateQty(cart, x.productId, Number(e.target.value)))
                                        }
                                        style={{width: 80}}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <h3>Total: ${formatPrice(total)}</h3>
                    <Link to="/checkout">Proceed to checkout</Link>
                    <Link to="/">← Continue shopping</Link>
                </>
            )}
        </div>
    );
}