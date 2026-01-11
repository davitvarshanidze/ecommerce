import { Link, useParams } from "react-router-dom";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const raw = localStorage.getItem("ecommerce_last_order_v1");
  const last = raw ? JSON.parse(raw) : null;

  const matches = last && orderNumber && last.orderNumber === orderNumber;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800 }}>
      <h1>Order confirmed</h1>
      <p>
        Order number: <strong>{orderNumber}</strong>
      </p>

      {matches ? (
        <>
          <p>Total: ${formatPrice(last.totalCents)}</p>
          <h3>Items</h3>
          <ul>
            {last.items.map((x: any) => (
              <li key={x.productId}>
                {x.name} × {x.quantity}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>(No stored details for this order in localStorage.)</p>
      )}

      <Link to="/">Continue shopping</Link>
    </div>
  );
}