import type {Product} from "./api";

export type CartItem = {
    productId: string;
    name: string;
    priceCents: number;
    quantity: number;
};

const KEY = "ecommerce_cart_v1";

export function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
}

export function saveCart(items: CartItem[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(cart: CartItem[], product: Product, qty = 1): CartItem[] {
    const existing = cart.find((x) => x.productId === product.id);
    if (existing) {
        return cart.map((x) =>
            x.productId === product.id ? {...x, quantity: x.quantity + qty} : x
        );
    }
    return [
        ...cart,
        {
            productId: product.id,
            name: product.name,
            priceCents: product.priceCents,
            quantity: qty,
        },
    ];
}

export function updateQty(cart: CartItem[], productId: string, quantity: number): CartItem[] {
    if (quantity <= 0) return cart.filter((x) => x.productId !== productId);
    return cart.map((x) => (x.productId === productId ? {...x, quantity} : x));
}

export function cartTotalCents(cart: CartItem[]): number {
    return cart.reduce((sum, x) => sum + x.priceCents * x.quantity, 0);
}