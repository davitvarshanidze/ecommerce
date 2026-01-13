import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {fetchProduct, type Product} from "../api";
import {addToCart, loadCart, saveCart} from "../cart";

function formatPrice(cents: number) {
    return (cents / 100).toFixed(2);
}

export function ProductDetailPage() {
    const {id} = useParams<{ id: string }>();
    const [item, setItem] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchProduct(id)
            .then(setItem)
            .catch((e) => setError(String(e)));
    }, [id]);

    return (
        <div style={{padding: 24, fontFamily: "system-ui"}}>
            <p>
                <Link to="/">← Back</Link>
            </p>

            {error && <p style={{color: "crimson"}}>{error}</p>}
            {!error && !item && <p>Loading…</p>}

            {item && (
                <>
                    <h1>{item.name}</h1>
                    <p>${formatPrice(item.priceCents)}</p>
                    {item.category ? <p>Category: {item.category.name}</p> : null}
                    {item.description ? <p>{item.description}</p> : null}
                    <button
                        onClick={() => {
                            const cart = loadCart();
                            const next = addToCart(cart, item, 1);
                            saveCart(next);
                            alert("Added to cart");
                        }}
                    >
                        Add to cart
                    </button>
                </>
            )}
        </div>
    );
}