"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { api, resolveBaseUrl, sync, type ApiConfig } from "./api"
import { DEFAULT_DELIVERY, DEFAULT_PROMOS, DEFAULT_SETTINGS, SEED_PRODUCTS, getSeedOrders } from "./data"
import { translate, type TKey } from "./i18n"
import type {
  CartItem,
  City,
  DeliverySettings,
  Lang,
  Order,
  OrderStatus,
  Product,
  PromoCode,
  StoreSettings,
} from "./types"

const KEY = "maison-eclat:v1:"

function load<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY + name)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(name: string, value: unknown) {
  try {
    localStorage.setItem(KEY + name, JSON.stringify(value))
  } catch {
    // storage full or unavailable — app keeps working in memory
  }
}

export interface Totals {
  subtotal: number
  discount: number
  delivery: number
  total: number
  promo: PromoCode | null
  promoError: "invalid" | "min" | null
}

interface ShopContextValue {
  hydrated: boolean
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey, vars?: Record<string, string | number>) => string

  products: Product[]
  visibleProducts: Product[]
  getProduct: (id: string) => Product | undefined
  upsertProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  adjustStock: (id: string, delta: number) => void

  cart: CartItem[]
  cartCount: number
  addToCart: (item: Omit<CartItem, "key">) => void
  updateQty: (key: string, qty: number) => void
  removeFromCart: (key: string) => void
  clearCart: () => void

  wishlist: string[]
  toggleWishlist: (id: string) => void

  promoCode: string
  setPromoCode: (c: string) => void
  computeTotals: (city: City) => Totals

  orders: Order[]
  placeOrder: (o: Order) => void
  setOrderStatus: (id: string, s: OrderStatus) => void

  promos: PromoCode[]
  setPromos: (p: PromoCode[]) => void
  delivery: DeliverySettings
  setDelivery: (d: DeliverySettings) => void
  settings: StoreSettings
  setSettings: (s: StoreSettings) => void

  apiConfig: ApiConfig
  isConnected: boolean
  resetAll: () => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [lang, setLangState] = useState<Lang>("fr")
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [promoCode, setPromoCode] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [promos, setPromos] = useState<PromoCode[]>(DEFAULT_PROMOS)
  const [delivery, setDelivery] = useState<DeliverySettings>(DEFAULT_DELIVERY)
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setLangState(load("lang", "fr"))
    setProducts(load("products", SEED_PRODUCTS))
    setCart(load("cart", []))
    setWishlist(load("wishlist", []))
    setPromoCode(load("promoCode", ""))
    setOrders(load<Order[] | null>("orders", null) ?? getSeedOrders())
    setPromos(load("promos", DEFAULT_PROMOS))
    setDelivery(load("delivery", DEFAULT_DELIVERY))
    setSettings({ ...DEFAULT_SETTINGS, ...load("settings", {}) })
    setHydrated(true)
  }, [])

  const persisted = useRef({ lang, products, cart, wishlist, promoCode, orders, promos, delivery, settings })
  useEffect(() => {
    if (!hydrated) return
    const next = { lang, products, cart, wishlist, promoCode, orders, promos, delivery, settings }
    for (const [k, v] of Object.entries(next)) {
      if (persisted.current[k as keyof typeof next] !== v) save(k, v)
    }
    persisted.current = next
  }, [hydrated, lang, products, cart, wishlist, promoCode, orders, promos, delivery, settings])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const apiConfig = useMemo<ApiConfig>(
    () => ({ baseUrl: resolveBaseUrl(settings.apiUrl), secret: settings.apiSecret }),
    [settings.apiUrl, settings.apiSecret],
  )
  const isConnected = Boolean(apiConfig.baseUrl)

  useSWR(hydrated && isConnected ? ["products", apiConfig.baseUrl] : null, () => api.getProducts(apiConfig), {
    revalidateOnFocus: false,
    onSuccess: (data) => {
      if (Array.isArray(data) && data.length) setProducts(data)
    },
    onError: (err) => console.warn("[api] products:", err?.message),
  })
  useSWR(hydrated && isConnected ? ["config", apiConfig.baseUrl] : null, () => api.getConfig(apiConfig), {
    revalidateOnFocus: false,
    onSuccess: (data) => {
      if (data?.promos) setPromos(data.promos)
      if (data?.delivery) setDelivery(data.delivery)
    },
    onError: (err) => console.warn("[api] config:", err?.message),
  })

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  )

  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products])

  const upsertProduct = useCallback(
    (p: Product) => {
      setProducts((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]))
      sync(api.saveProduct(apiConfig, p))
    },
    [apiConfig],
  )

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setCart((prev) => prev.filter((c) => c.productId !== id))
      sync(api.deleteProduct(apiConfig, id))
    },
    [apiConfig],
  )

  const adjustStock = useCallback(
    (id: string, delta: number) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const updated = { ...p, stock: Math.max(0, p.stock + delta) }
          sync(api.saveProduct(apiConfig, updated))
          return updated
        }),
      )
    },
    [apiConfig],
  )

  const addToCart = useCallback((item: Omit<CartItem, "key">) => {
    const key = [item.productId, item.volume, item.concentration, item.size, item.giftBox ? "gift" : ""].join("|")
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key)
      if (existing) return prev.map((c) => (c.key === key ? { ...c, qty: Math.min(20, c.qty + item.qty) } : c))
      return [...prev, { ...item, key }]
    })
  }, [])

  const updateQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((c) => c.key !== key) : prev.map((c) => (c.key === key ? { ...c, qty: Math.min(20, qty) } : c)),
    )
  }, [])

  const removeFromCart = useCallback((key: string) => setCart((prev) => prev.filter((c) => c.key !== key)), [])
  const clearCart = useCallback(() => {
    setCart([])
    setPromoCode("")
  }, [])

  const toggleWishlist = useCallback(
    (id: string) => setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [],
  )

  const computeTotals = useCallback(
    (city: City): Totals => {
      const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.qty, 0)
      let discount = 0
      let promo: PromoCode | null = null
      let promoError: Totals["promoError"] = null
      if (promoCode) {
        const found = promos.find((p) => p.active && p.code.toUpperCase() === promoCode.toUpperCase())
        if (!found) promoError = "invalid"
        else if (subtotal < found.minOrder) promoError = "min"
        else {
          promo = found
          discount = found.type === "percent" ? Math.round((subtotal * found.value) / 100) : Math.min(found.value, subtotal)
        }
      }
      const afterDiscount = subtotal - discount
      let fee = 0
      if (city === "douala") fee = afterDiscount >= delivery.freeThreshold ? 0 : delivery.douala
      else if (city === "yaounde") fee = afterDiscount >= delivery.freeThreshold ? 0 : delivery.yaounde
      else if (city === "other") fee = delivery.other
      if (cart.length === 0) fee = 0
      return { subtotal, discount, delivery: fee, total: afterDiscount + fee, promo, promoError }
    },
    [cart, promoCode, promos, delivery],
  )

  const placeOrder = useCallback(
    (o: Order) => {
      setOrders((prev) => [o, ...prev])
      setProducts((prev) =>
        prev.map((p) => {
          const qty = o.items.filter((i) => i.productId === p.id).reduce((s, i) => s + i.qty, 0)
          return qty ? { ...p, stock: Math.max(0, p.stock - qty), popularity: p.popularity + qty } : p
        }),
      )
      sync(api.createOrder(apiConfig, o))
    },
    [apiConfig],
  )

  const setOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      sync(api.updateOrder(apiConfig, id, { status }))
    },
    [apiConfig],
  )

  const setPromosSynced = useCallback(
    (p: PromoCode[]) => {
      setPromos(p)
      sync(api.saveConfig(apiConfig, { promos: p, delivery }))
    },
    [apiConfig, delivery],
  )

  const setDeliverySynced = useCallback(
    (d: DeliverySettings) => {
      setDelivery(d)
      sync(api.saveConfig(apiConfig, { promos, delivery: d }))
    },
    [apiConfig, promos],
  )

  const resetAll = useCallback(() => {
    setProducts(SEED_PRODUCTS)
    setCart([])
    setWishlist([])
    setPromoCode("")
    setOrders(getSeedOrders())
    setPromos(DEFAULT_PROMOS)
    setDelivery(DEFAULT_DELIVERY)
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const value = useMemo<ShopContextValue>(
    () => ({
      hydrated,
      lang,
      setLang: setLangState,
      t,
      products,
      visibleProducts: products.filter((p) => p.visible),
      getProduct,
      upsertProduct,
      deleteProduct,
      adjustStock,
      cart,
      cartCount: cart.reduce((s, c) => s + c.qty, 0),
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      promoCode,
      setPromoCode,
      computeTotals,
      orders,
      placeOrder,
      setOrderStatus,
      promos,
      setPromos: setPromosSynced,
      delivery,
      setDelivery: setDeliverySynced,
      settings,
      setSettings,
      apiConfig,
      isConnected,
      resetAll,
    }),
    [
      hydrated, lang, t, products, getProduct, upsertProduct, deleteProduct, adjustStock, cart, addToCart,
      updateQty, removeFromCart, clearCart, wishlist, toggleWishlist, promoCode, computeTotals, orders,
      placeOrder, setOrderStatus, promos, setPromosSynced, delivery, setDeliverySynced, settings, apiConfig,
      isConnected, resetAll,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error("useShop must be used within ShopProvider")
  return ctx
}
