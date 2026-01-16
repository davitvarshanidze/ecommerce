import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {fetchOrder, type OrderDetails} from "../api";

function formatPrice(cents: number) {
    return (cents / 100).toFixed(2);
}

export function OrderConfirmationPage() {
    // Support either param name depending on your route definition
    const params = useParams();
    const orderId = (params as any).orderId ?? (params as any).orderNumber;

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        setError(null);
        setOrder(null);

        fetchOrder(orderId)
            .then(setOrder)
            .catch((e) => setError(String(e)));
    }, [orderId]);

    return (
        <div style={{padding: 24, fontFamily: "system-ui", maxWidth: 800}}>
            <h1>Order confirmed</h1>
            <p>
                Order id: <strong>{orderId}</strong>
            </p>

            {error && (
                <p style={{color: "crimson"}}>
                    Could not load order details. Are you logged in? ({error})
                </p>
            )}

            {!error && !order && <p>Loading order details…</p>}

            {order && (
                <>
                    <p>
                        Created: {new Date(order.createdAtUtc).toLocaleString()}
                    </p>
                    <p>
                        Total: <strong>${formatPrice(order.totalCents)}</strong>
                    </p>

                    <h3>Items</h3>
                    <ul>
                        {order.items.map((x) => (
                            <li key={x.productId}>
                                {x.productName} — ${formatPrice(x.unitPriceCents)} × {x.quantity} = ${
                                formatPrice(x.unitPriceCents * x.quantity)
                            }
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <div style={{marginTop: 12, display: "flex", gap: 12}}>
                <Link to="/orders">View my orders</Link>
                <Link to="/">Continue shopping</Link>
            </div>
        </div>
    );
}