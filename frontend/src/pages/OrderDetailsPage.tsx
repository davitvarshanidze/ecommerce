import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrder, type OrderDetails } from "../api";

function formatPrice(cents: number) {
    return (cents / 100).toFixed(2);
}

export function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchOrder(id)
            .then(setOrder)
            .catch((e) => setError(String(e)));
    }, [id]);

    return (
        <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900 }}>
            <h1>Order Details</h1>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {!error && !order && <p>Loading…</p>}

            {order && (
                <>
                    <p>
                        <strong>Order:</strong> {order.id}
                    </p>
                    <p>
                        <strong>Created:</strong> {new Date(order.createdAtUtc).toLocaleString()}
                    </p>
                    <p>
                        <strong>Total:</strong> ${formatPrice(order.totalCents)}
                    </p>

                    <h3>Items</h3>
                    <ul>
                        {order.items.map((it) => (
                            <li key={it.productId} style={{ marginBottom: 8 }}>
                                {it.productName} — ${formatPrice(it.unitPriceCents)} × {it.quantity} = $
                                {formatPrice(it.unitPriceCents * it.quantity)}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <div style={{ marginTop: 12 }}>
                <Link to="/orders">← Back to orders</Link>
            </div>
        </div>
    );
}