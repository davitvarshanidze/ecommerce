import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {fetchMyOrders, type OrderSummary} from "../api";
import {getToken} from "../auth";

function formatPrice(cents: number) {
    return (cents / 100).toFixed(2);
}

export function OrdersPage() {
    const [items, setItems] = useState<OrderSummary[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!getToken()) {
            setError("Please log in to view orders.");
            return;
        }

        fetchMyOrders()
            .then(setItems)
            .catch((e) => setError(String(e)));
    }, []);

    return (
        <div style={{padding: 24, fontFamily: "system-ui"}}>
            <h1>My Orders</h1>

            {error && <p style={{color: "crimson"}}>{error}</p>}

            {!error && items.length === 0 && <p>No orders yet.</p>}

            <ul>
                {items.map((o) => (
                    <li key={o.id} style={{marginBottom: 12}}>
                        <Link to={`/orders/${o.id}`}><strong>{o.id}</strong></Link>
                        <div>Total: ${formatPrice(o.totalCents)}</div>
                        <div>Items: {o.itemCount}</div>
                        <div>Created: {new Date(o.createdAtUtc).toLocaleString()}</div>
                    </li>
                ))}
            </ul>

            <Link to="/">Back to shop</Link>
        </div>
    );
}