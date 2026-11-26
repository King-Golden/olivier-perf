"use client"

import { Heart, House, Search, ShoppingBag } from "lucide-react"
import { formatFCFA } from "@/lib/format"
import { useShop } from "@/lib/store"
import { waLink } from "@/lib/whatsapp"
import { WhatsAppIcon } from "./brand-icons"
import { useStorefrontUI } from "./storefront-ui"

export function WhatsAppConcierge() {
  const { t, settings } = useShop()
  return (
    <a
      href={waLink(settings.whatsapp, t("wa.concierge"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("concierge.label")}
      className="group fixed right-4 bottom-24 z-30 flex items-center gap-2 md:right-6 md:bottom-6"
    >
      <span className="hidden rounded-full border border-gold/30 bg-obsidian px-4 py-2 text-xs font-medium text-ivory opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block">
        {t("concierge.label")}
      </span>
      <span className="relative flex size-14 items-center justify-center rounded-full border border-gold/60 bg-obsidian text-gold shadow-xl transition-transform group-hover:scale-105">
        <WhatsAppIcon className="size-6" />
        <span className="absolute top-0.5 right-0.5 flex size-3.5" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
          <span className="relative inline-flex size-3.5 rounded-full border-2 border-obsidian bg-gold" />
        </span>
      </span>
    </a>
  )
}

export function MobileBar() {
  const { t, cartCount, wishlist, computeTotals, hydrated } = useShop()
  const { setCartOpen, setWishOpen } = useStorefrontUI()
  const { subtotal } = computeTotals("pickup")

  const btn = "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-ivory/75"

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-obsidian/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="flex items-stretch px-2">
        <a href="#top" className={btn}>
          <House className="size-5" aria-hidden="true" />
          {t("nav.home")}
        </a>
        <button
          type="button"
          className={btn}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" })
            setTimeout(() => document.getElementById("search-mobile")?.focus(), 350)
          }}
        >
          <Search className="size-5" aria-hidden="true" />
          {t("nav.searchShort")}
        </button>
        <button type="button" className={btn} onClick={() => setWishOpen(true)}>
          <span className="relative">
            <Heart className="size-5" aria-hidden="true" />
            {hydrated && wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-obsidian">
                {wishlist.length}
              </span>
            )}
          </span>
          {t("nav.wishlist")}
        </button>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="my-2 ml-1 flex flex-[1.6] items-center justify-center gap-2 rounded-full bg-gold px-3 text-xs font-semibold text-obsidian"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          <span className="tabular-nums">
            {hydrated && cartCount > 0 ? `${cartCount} · ${formatFCFA(subtotal)}` : t("nav.cart")}
          </span>
        </button>
      </div>
    </nav>
  )
}
