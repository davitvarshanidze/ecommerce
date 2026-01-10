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