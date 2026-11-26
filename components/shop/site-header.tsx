"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Heart, Lock, Search, ShoppingBag, X } from "lucide-react"
import { formatFCFA, pick } from "@/lib/format"
import { matchesQuery } from "@/lib/search"
import { useShop } from "@/lib/store"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"
import { LangSwitch } from "./lang-switch"
import { useStorefrontUI } from "./storefront-ui"

export const CATEGORIES: (Category | "all")[] = [
  "all",
  "men",
  "women",
  "unisex",
  "jewelry-women",
  "jewelry-men",
  "gifts",
]

function SearchBox({ className, id }: { className?: string; id: string }) {
  const { t, lang, visibleProducts } = useShop()
  const { query, setQuery, openQuickView, goToCatalog } = useStorefrontUI()
  const [focused, setFocused] = useState(false)

  const suggestions = useMemo(
    () => (query.trim().length >= 2 ? visibleProducts.filter((p) => matchesQuery(p, query)).slice(0, 5) : []),
    [query, visibleProducts],
  )

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {t("nav.searchShort")}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ivory/50" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            goToCatalog()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        placeholder={t("nav.search")}
        className="h-11 w-full rounded-full border border-ivory/15 bg-ivory/5 pr-10 pl-10 text-sm text-ivory placeholder:text-ivory/45 focus:border-gold/70 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-ivory/60 hover:text-gold"
          aria-label="Clear"
        >
          <X className="size-4" />
        </button>
      )}
      {focused && suggestions.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gold/20 bg-charcoal shadow-2xl">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  openQuickView(p.id)
                  setFocused(false)
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-ivory/5"
              >
                <img src={p.images[0] || "/placeholder.svg"} alt="" className="size-10 rounded object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ivory">{pick(p, "name", lang)}</span>
                  <span className="block text-xs text-ivory/55">{p.brand}</span>
                </span>
                <span className="text-xs font-medium text-gold tabular-nums">{formatFCFA(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SiteHeader() {
  const { t, settings, cartCount, wishlist, hydrated } = useShop()
  const { category, setCartOpen, setWishOpen, goToCatalog } = useStorefrontUI()

  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-obsidian/95 text-ivory backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <a href="#top" className="flex shrink-0 flex-col leading-none" aria-label={settings.storeName}>
          <span className="font-serif text-2xl font-semibold tracking-wide text-gold sm:text-[28px]">
            {settings.storeName}
          </span>
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.32em] text-ivory/60">
            Parfumerie · Bijouterie
          </span>
        </a>

        <SearchBox id="search-desktop" className="mx-auto hidden max-w-lg flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <LangSwitch />
          <Link
            href="/admin"
            className="hidden rounded-full p-2.5 text-ivory/50 transition-colors hover:text-gold sm:inline-flex"
            aria-label={t("nav.admin")}
            title={t("nav.admin")}
          >
            <Lock className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setWishOpen(true)}
            className="relative rounded-full p-2.5 transition-colors hover:text-gold"
            aria-label={`${t("nav.wishlist")} (${wishlist.length})`}
          >
            <Heart className="size-5" />
            {hydrated && wishlist.length > 0 && (
              <span className="absolute top-0.5 right-0.5 flex size-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-obsidian tabular-nums">
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full p-2.5 transition-colors hover:text-gold"
            aria-label={`${t("nav.cart")} (${cartCount})`}
          >
            <ShoppingBag className="size-5" />
            {hydrated && cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex size-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-obsidian tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBox id="search-mobile" />
      </div>

      <nav aria-label={t("nav.shop")} className="border-t border-ivory/10">
        <ul className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 lg:justify-center lg:px-8">
          {CATEGORIES.map((c) => (
            <li key={c} className="shrink-0">
              <button
                type="button"
                onClick={() => goToCatalog(c)}
                aria-current={category === c ? "true" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap transition-colors",
                  category === c ? "bg-gold text-obsidian" : "text-ivory/75 hover:text-gold",
                )}
              >
                {t(`cat.${c}`)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
