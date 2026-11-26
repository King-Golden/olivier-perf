/**
 * Service layer for a Cloudflare Worker + Turso (libSQL) REST API.
 *
 * Expected Worker endpoints (JSON):
 *   GET    /api/health                 -> { ok: true }
 *   GET    /api/products               -> Product[]
 *   PUT    /api/products/:id           -> Product        (admin)
 *   DELETE /api/products/:id           -> { ok: true }   (admin)
 *   GET    /api/orders                 -> Order[]        (admin)
 *   POST   /api/orders                 -> Order          (public, storefront checkout)
 *   PATCH  /api/orders/:id             -> Order          (admin)
 *   GET    /api/config                 -> { promos, delivery }
 *   PUT    /api/config                 -> { ok: true }   (admin)
 *
 * Admin requests send `Authorization: Bearer <Admin API Secret Key>`.
 * When no API URL is configured, every call is a no-op and the app runs
 * entirely on the local demo data persisted in localStorage.
 */
import type { DeliverySettings, Order, Product, PromoCode } from "./types"

export interface ApiConfig {
  baseUrl: string
  secret?: string
}

export function resolveBaseUrl(fromSettings?: string) {
  return (fromSettings || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")
}

async function request<T>(
  config: ApiConfig,
  path: string,
  init: RequestInit & { admin?: boolean } = {},
): Promise<T | null> {
  if (!config.baseUrl) return null
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (init.admin && config.secret) headers.Authorization = `Bearer ${config.secret}`
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string>) },
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return (await res.json()) as T
}

export const api = {
  health: (c: ApiConfig) => request<{ ok: boolean }>(c, "/api/health"),

  getProducts: (c: ApiConfig) => request<Product[]>(c, "/api/products"),
  saveProduct: (c: ApiConfig, product: Product) =>
    request<Product>(c, `/api/products/${encodeURIComponent(product.id)}`, {
      method: "PUT",
      body: JSON.stringify(product),
      admin: true,
    }),
  deleteProduct: (c: ApiConfig, id: string) =>
    request<{ ok: boolean }>(c, `/api/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      admin: true,
    }),

  getOrders: (c: ApiConfig) => request<Order[]>(c, "/api/orders", { admin: true }),
  createOrder: (c: ApiConfig, order: Order) =>
    request<Order>(c, "/api/orders", { method: "POST", body: JSON.stringify(order) }),
  updateOrder: (c: ApiConfig, id: string, patch: Partial<Order>) =>
    request<Order>(c, `/api/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
      admin: true,
    }),

  getConfig: (c: ApiConfig) =>
    request<{ promos: PromoCode[]; delivery: DeliverySettings }>(c, "/api/config"),
  saveConfig: (c: ApiConfig, body: { promos: PromoCode[]; delivery: DeliverySettings }) =>
    request<{ ok: boolean }>(c, "/api/config", {
      method: "PUT",
      body: JSON.stringify(body),
      admin: true,
    }),
}

/** Fire-and-forget sync: local state stays the source of truth for the UI. */
export function sync(promise: Promise<unknown>) {
  promise.catch((err) => console.warn("[api] sync failed:", err?.message ?? err))
}
