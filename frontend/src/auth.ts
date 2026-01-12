const KEY = "ecommerce_token_v1";

export function getToken(): string | null {
  return localStorage.getItem(KEY);
}
export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}
export function clearToken() {
  localStorage.removeItem(KEY);
}