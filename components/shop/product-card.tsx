"use client"

import { Heart, ShoppingBag } from "lucide-react"
import { discountPercent, formatFCFA, pick } from "@/lib/format"
import { useShop } from "@/lib/store"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { defaultSelection, unitPrice, variantLabel } from "@/lib/variants"
import { buildSingleItemMessage, openWhatsApp, waLink } from "@/lib/whatsapp"
import { WhatsAppIcon } from "./brand-icons"
import { useStorefrontUI } from "./storefront-ui"

export function StockBadge({ product, className }: { product: Product; className?: string }) {
  const { t } = useShop()
  const out = product.stock <= 0
  const low = !out && product.stock <= 3
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium",
        out ? "text-muted-foreground" : low ? "text-[#a14d0b]" : "text-[#2f6b3a]",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", out ? "bg-muted-foreground" : low ? "bg-[#d97706]" : "bg-[#3f8f4f]")}
        aria-hidden="true"
      />
      {out ? t("stock.out") : low ? t("stock.low", { n: product.stock }) : t("stock.in")}
    </span>
  )
}

export function ProductBadges({ product }: { product: Product }) {
  const { t } = useShop()
  const pct = discountPercent(product)
  return (
    <div className="flex flex-col items-start gap-1.5">
      {pct > 0 && (
        <span className="rounded-sm bg-obsidian px-2 py-1 text-[10px] font-bold tracking-wider text-gold tabular-nums">
          -{pct}%
        </span>
      )}
      {product.badge && (
        <span
          className={cn(
            "rounded-sm px-2 py-1 text-[10px] font-bold tracking-wider",
            product.badge === "new" ? "bg-ivory text-obsidian" : "bg-gold text-obsidian",
          )}
        >
          {t(`badge.${product.badge}`)}
        </span>
      )}
    </div>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const { t, lang, addToCart, wishlist, toggleWishlist, settings } = useShop()
  const { openQuickView, notify } = useStorefrontUI()
  const name = pick(product, "name", lang)
  const wished = wishlist.includes(product.id)
  const material = pick(product, "material", lang)

  const quickAdd = () => {
    const sel = defaultSelection(product)
    addToCart({ productId: product.id, qty: 1, unitPrice: unitPrice(product, sel), ...sel })
    notify(`${t("product.added")} — ${name}`)
  }

  const orderWhatsApp = () => {
    const sel = defaultSelection(product)
    openWhatsApp(
      waLink(settings.whatsapp, buildSingleItemMessage(product, lang, settings.storeName, variantLabel(sel, lang))),
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(10,10,10,0.35)]">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <button
          type="button"
          onClick={() => openQuickView(product.id)}
          className="block size-full"
          aria-label={`${t("product.quickView")} — ${name}`}
        >
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </button>
        <div className="pointer-events-none absolute top-3 left-3">
          <ProductBadges product={product} />
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={wished}
          aria-label={wished ? t("product.removeWishlist") : t("product.addWishlist")}
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-ivory/90 text-obsidian shadow-sm backdrop-blur transition-colors hover:text-[#b42318]"
        >
          <Heart className={cn("size-4", wished && "fill-[#b42318] text-[#b42318]")} />
        </button>
        <span className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-obsidian/85 py-2 text-center text-xs font-medium text-ivory opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 md:block">
          {t("product.quickView")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bronze">
            {product.type === "perfume" ? product.brand : material.split("—")[0].trim() || product.brand}
          </span>
          <StockBadge product={product} />
        </div>
        <h3 className="mt-1.5 font-serif text-lg leading-tight font-semibold text-balance sm:text-xl">
          <button type="button" onClick={() => openQuickView(product.id)} className="text-left hover:text-bronze">
            {name}
          </button>
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 tabular-nums">
          <span className="text-base font-semibold">{formatFCFA(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatFCFA(product.oldPrice)}</span>
          )}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <button
            type="button"
            onClick={quickAdd}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-obsidian px-4 text-xs font-semibold tracking-wide text-ivory transition-colors hover:bg-graphite"
          >
            <ShoppingBag className="size-4 text-gold" aria-hidden="true" />
            {t("product.addToCart")}
          </button>
          <button
            type="button"
            onClick={orderWhatsApp}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#1f8a4c]/30 bg-[#1f8a4c]/5 px-4 text-xs font-semibold tracking-wide text-[#14663a] transition-colors hover:bg-[#1f8a4c]/10"
          >
            <WhatsAppIcon className="size-4" />
            <span className="truncate">{t("product.orderWhatsApp")}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
