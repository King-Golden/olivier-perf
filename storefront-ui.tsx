"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { Check } from "lucide-react"
import type { Category } from "@/lib/types"

interface StorefrontUI {
  query: string
  setQuery: (q: string) => void
  category: Category | "all"
  setCategory: (c: Category | "all") => void
  quickViewId: string | null
  openQuickView: (id: string | null) => void
  cartOpen: boolean
  setCartOpen: (o: boolean) => void
  wishOpen: boolean
  setWishOpen: (o: boolean) => void
  notify: (msg: string) => void
  goToCatalog: (c?: Category | "all") => void
}

const Ctx = createContext<StorefrontUI | null>(null)

export function StorefrontUIProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category | "all">("all")
  const [quickViewId, openQuickView] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishOpen, setWishOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  const goToCatalog = useCallback((c?: Category | "all") => {
    if (c) setCategory(c)
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const value = useMemo(
    () => ({
      query,
      setQuery,
      category,
      setCategory,
      quickViewId,
      openQuickView,
      cartOpen,
      setCartOpen,
      wishOpen,
      setWishOpen,
      notify,
      goToCatalog,
    }),
    [query, category, quickViewId, cartOpen, wishOpen, notify, goToCatalog],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4">
        {toast && (
          <div className="flex items-center gap-2 rounded-full border border-gold/40 bg-obsidian px-5 py-3 text-sm text-ivory shadow-xl animate-in fade-in slide-in-from-top-2">
            <Check className="size-4 text-gold" aria-hidden="true" />
            {toast}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}

export function useStorefrontUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useStorefrontUI must be used within StorefrontUIProvider")
  return ctx
}
