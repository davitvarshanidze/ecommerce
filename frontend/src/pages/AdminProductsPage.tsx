import {useEffect, useState} from "react";
import {
    adminCreateProduct,
    adminDeleteProduct,
    adminFetchProducts,
    type AdminProduct,
} from "../api";

export function AdminProductsPage() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(4999);
    const [categorySlug, setCategorySlug] = useState("toys");
    const [isActive, setIsActive] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);
    const [items, setItems] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(false);

    async function onCreate() {
        setMsg(null);
        try {
            const res = await adminCreateProduct({
                name,
                priceCents: price,
                categorySlug,
                isActive,
            });
            setMsg(`Created: ${res.id ?? res.Id ?? res.pId ?? res?.id ?? JSON.stringify(res)}`);
            setName("");
            await load();
        } catch (e) {
            setMsg(String(e));
        }
    }

    async function load() {
        setLoading(true);
        setMsg(null);
        try {
            const res = await adminFetchProducts();
            setItems(res);
        } catch (e) {
            setMsg(String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onDelete(id: string) {
        if (!confirm("Delete this product?")) return;
        setMsg(null);
        try {
            await adminDeleteProduct(id);
            setMsg("Deleted.");
            await load();
        } catch (e) {
            setMsg(String(e));
        }
    }

    return (
        <div style={{padding: 24, fontFamily: "system-ui", maxWidth: 600}}>
            <h1>Admin: Products</h1>

            {msg && <p>{msg}</p>}

            <div style={{display: "grid", gap: 10}}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{padding: 8}}/>
                <input value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number"
                       placeholder="Price cents" style={{padding: 8}}/>
                <input value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}
                       placeholder="Category slug (e.g. toys)" style={{padding: 8}}/>

                <label style={{display: "flex", gap: 8, alignItems: "center"}}>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}/>
                    Active
                </label>

                <button onClick={onCreate}>Create product</button>
            </div>

            <hr style={{margin: "24px 0"}}/>

            <h2>All products</h2>

            {loading && <p>Loading…</p>}

            {!loading && items.length === 0 && <p>No products found.</p>}

            <ul style={{display: "grid", gap: 10, paddingLeft: 18}}>
                {items.map((p) => (
                    <li key={p.id}>
                        <div style={{display: "flex", justifyContent: "space-between", gap: 12}}>
                            <div>
                                <div>
                                    <strong>{p.name}</strong>
                                    {!p.isActive && <span> (inactive)</span>}
                                </div>
                                <div>${(p.priceCents / 100).toFixed(2)}</div>
                                <div style={{opacity: 0.8}}>
                                    category: {p.category?.slug ?? "(none)"}
                                </div>
                                <div style={{opacity: 0.7, fontSize: 12}}>{p.id}</div>
                            </div>

                            <button onClick={() => onDelete(p.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}