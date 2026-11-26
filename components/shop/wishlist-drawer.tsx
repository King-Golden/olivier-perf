"use client"

import { Heart, ShoppingBag, Trash2, X } from "lucide-react"
import { formatFCFA, pick } from "@/lib/format"
import { useShop } from "@/lib/store"
import { defaultSelection, unitPrice } from "@/lib/variants"
import { Overlay } from "./overlay"
import { useStorefrontUI } from "./storefront-ui"

export function WishlistDrawer() {
  const { t, lang, wishlist, getProduct, toggleWishlist, addToCart } = useShop()
  const { wishOpen, setWishOpen, openQuickView, notify } = useStorefrontUI()
  const items = wishlist.map(getProduct).filter((p) => p !== undefined)

  return (
    <Overlay open={wishOpen} onClose={() => setWishOpen(false)} label={t("wish.title")} variant="right">
      <div className="flex items-center justify-between bg-obsidian px-5 py-4 text-ivory">
        <h2 className="font-serif text-2xl">{t("wish.title")}</h2>
        <button
          type="button"
          onClick={() => setWishOpen(false)}
          className="flex size-10 items-center justify-center rounded-full hover:bg-ivory/10"
          aria-label={t("product.close")}
        >
          <X className="size-5" />
        </button>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <Heart className="size-10 text-bronze" strokeWidth={1.25} aria-hidden="true" />
          <p className="font-serif text-2xl">{t("wish.empty")}</p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 py-4">
              <button
                type="button"
                onClick={() => {
                  setWishOpen(false)
                  openQuickView(p.id)
                }}
                className="shrink-0"
                aria-label={`${t("product.quickView")} — ${pick(p, "name", lang)}`}
              >
                <img src={p.images[0] || "/placeholder.svg"} alt="" className="size-20 rounded-md object-cover" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[10px] uppercase tracking-[0.18em] text-bronze">{p.brand}</p>
                <p className="truncate font-serif text-lg font-semibold">{pick(p, "name", lang)}</p>
                <p className="text-sm font-semibold tabular-nums">{formatFCFA(p.price)}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sel = defaultSelection(p)
                      addToCart({ productId: p.id, qty: 1, unitPrice: unitPrice(p, sel), ...sel })
                      notify(`${t("product.added")} — ${pick(p, "name", lang)}`)
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-obsidian px-3 text-xs font-semibold text-ivory"
                  >
                    <ShoppingBag className="size-3.5 text-gold" aria-hidden="true" />
                    {t("product.addToCart")}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(p.id)}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-[#b42318]"
                    aria-label={t("product.removeWishlist")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Overlay>
  )
}
