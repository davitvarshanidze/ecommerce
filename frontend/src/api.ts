import {getToken} from "./auth";

export type Category = { id: string; name: string; slug: string };

export type Product = {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    category: Category | null;
};

export type PagedResult<T> = {
    totalCount: number;
    page: number;
    pageSize: number;
    items: T[];
};

const API_BASE = "http://localhost:5076";

export async function fetchProducts(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
}): Promise<PagedResult<Product>> {
    const url = new URL(`${API_BASE}/products`);
    if (params.page) url.searchParams.set("page", String(params.page));
    if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));
    if (params.search) url.searchParams.set("search", params.search);
    if (params.category) url.searchParams.set("category", params.category);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.json();
}

export async function fetchProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.json();
}

function authHeaders(): HeadersInit {
    const t = getToken();
    return t ? {Authorization: `Bearer ${t}`} : {};
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
    });

    if (!res.ok) throw new Error("Invalid credentials");
    return res.json();
}

export async function fetchMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
            ...authHeaders(),
        },
    });

    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
}

export type OrderSummary = {
    id: string;
    totalCents: number;
    createdAtUtc: string;
    itemCount: number;
};

export async function createOrder(items: { productId: string; quantity: number }[]) {
    const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify({items}),
    });

    if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);
    return res.json();
}

export async function fetchMyOrders(): Promise<OrderSummary[]> {
    const res = await fetch(`${API_BASE}/orders/my`, {
        headers: {...authHeaders()},
    });

    if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
    return res.json();
}

export type OrderDetails = {
    id: string;
    totalCents: number;
    createdAtUtc: string;
    items: {
        productId: string;
        productName: string;
        unitPriceCents: number;
        quantity: number;
    }[];
};

export async function fetchOrder(id: string): Promise<OrderDetails> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
        headers: {...authHeaders()},
    });

    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
    return res.json();
}