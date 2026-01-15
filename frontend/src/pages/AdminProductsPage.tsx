import {useEffect, useState} from "react";
import {
    adminCreateProduct,
    adminFetchProducts,
    adminUpdateProduct,
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

    // inline edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState(0);
    const [editCategorySlug, setEditCategorySlug] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);

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

    function startEdit(p: AdminProduct) {
        setEditingId(p.id);
        setEditName(p.name);
        setEditPrice(p.priceCents);
        setEditCategorySlug(p.category?.slug ?? "");
        setEditIsActive(p.isActive);
    }

    function cancelEdit() {
        setEditingId(null);
    }

    async function saveEdit(id: string) {
        setMsg(null);
        try {
            await adminUpdateProduct(id, {
                name: editName,
                priceCents: editPrice,
                categorySlug: editCategorySlug || null,
                isActive: editIsActive,
            });
            setMsg("Saved.");
            setEditingId(null);
            await load();
        } catch (e) {
            setMsg(String(e));
        }
    }

    async function toggleActive(p: AdminProduct) {
        setMsg(null);
        try {
            await adminUpdateProduct(p.id, {
                name: p.name,
                priceCents: p.priceCents,
                categorySlug: p.category?.slug ?? null,
                isActive: !p.isActive,
            });
            setMsg(!p.isActive ? "Activated." : "Deactivated.");
            await load();
        } catch (e) {
            setMsg(String(e));
        }
    }

    return (
        <div style={{padding: 24, fontFamily: "system-ui", maxWidth: 800}}>
            <h1>Admin: Products</h1>

            {msg && <p>{msg}</p>}

            <div style={{display: "grid", gap: 10, maxWidth: 600}}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    style={{padding: 8}}
                />
                <input
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    type="number"
                    placeholder="Price cents"
                    style={{padding: 8}}
                />
                <input
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="Category slug (e.g. toys)"
                    style={{padding: 8}}
                />

                <label style={{display: "flex", gap: 8, alignItems: "center"}}>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Active
                </label>

                <button onClick={onCreate}>Create product</button>
            </div>

            <hr style={{margin: "24px 0"}}/>

            <h2>All products</h2>

            {loading && <p>Loading…</p>}
            {!loading && items.length === 0 && <p>No products found.</p>}

            <ul style={{display: "grid", gap: 12, paddingLeft: 18}}>
                {items.map((p) => {
                    const isEditing = editingId === p.id;

                    return (
                        <li key={p.id}>
                            <div style={{display: "flex", justifyContent: "space-between", gap: 16}}>
                                <div style={{flex: 1}}>
                                    {!isEditing ? (
                                        <>
                                            <div>
                                                <strong>{p.name}</strong>
                                                {!p.isActive && <span> (inactive)</span>}
                                            </div>
                                            <div>${(p.priceCents / 100).toFixed(2)}</div>
                                            <div style={{opacity: 0.8}}>
                                                category: {p.category?.slug ?? "(none)"}
                                            </div>
                                            <div style={{opacity: 0.7, fontSize: 12}}>{p.id}</div>
                                        </>
                                    ) : (
                                        <div style={{display: "grid", gap: 8, maxWidth: 520}}>
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                style={{padding: 8}}
                                            />
                                            <input
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                                type="number"
                                                style={{padding: 8}}
                                            />
                                            <input
                                                value={editCategorySlug}
                                                onChange={(e) => setEditCategorySlug(e.target.value)}
                                                placeholder="category slug"
                                                style={{padding: 8}}
                                            />
                                            <label style={{display: "flex", gap: 8, alignItems: "center"}}>
                                                <input
                                                    type="checkbox"
                                                    checked={editIsActive}
                                                    onChange={(e) => setEditIsActive(e.target.checked)}
                                                />
                                                Active
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div style={{display: "grid", gap: 8, alignContent: "start"}}>
                                    {!isEditing ? (
                                        <>
                                            <button onClick={() => startEdit(p)}>Edit</button>
                                            <button onClick={() => toggleActive(p)}>
                                                {p.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => saveEdit(p.id)}>Save</button>
                                            <button onClick={cancelEdit}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}