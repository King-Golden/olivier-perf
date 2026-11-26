"use client"

import { useState } from "react"
import { Gem, Gift, Heart, Minus, Plus, ShieldCheck, ShoppingBag, X } from "lucide-react"
import { formatFCFA, pick } from "@/lib/format"
import { useShop } from "@/lib/store"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { GIFT_BOX_PRICE, defaultSelection, sizeLabel, unitPrice, variantLabel, type VariantSelection } from "@/lib/variants"
import { buildSingleItemMessage, openWhatsApp, waLink } from "@/lib/whatsapp"
import { WhatsAppIcon } from "./brand-icons"
import { Overlay } from "./overlay"
import { ProductBadges, StockBadge } from "./product-card"
import { useStorefrontUI } from "./storefront-ui"

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
}: {
  label: string
  options: T[]
  value?: T
  onChange: (v: T) => void
  render: (v: T) => React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "min-h-11 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
              value === o ? "border-obsidian bg-obsidian text-ivory" : "border-border bg-card hover:border-obsidian/50",
            )}
          >
            {render(o)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function ProductDetail({ product }: { product: Product }) {
  const { t, lang, addToCart, wishlist, toggleWishlist, settings } = useShop()
  const { openQuickView, notify, setCartOpen } = useStorefrontUI()
  const [activeImage, setActiveImage] = useState(0)
  const [sel, setSel] = useState<VariantSelection>(() => defaultSelection(product))
  const [qty, setQty] = useState(1)

  const name = pick(product, "name", lang)
  const price = unitPrice(product, sel)
  const notes = lang === "fr" ? product.notes_fr : product.notes_en
  const material = pick(product, "material", lang)
  const wished = wishlist.includes(product.id)

  const add = () => {
    addToCart({ productId: product.id, qty, unitPrice: price, ...sel })
    notify(`${t("product.added")} — ${name}`)
    openQuickView(null)
    setCartOpen(true)
  }

  const whatsapp = () => {
    const msg = buildSingleItemMessage({ ...product, price }, lang, settings.storeName, `${qty} × ${variantLabel(sel, lang)}`)
    openWhatsApp(waLink(settings.whatsapp, msg))
  }

  return (
    <div className="grid overflow-y-auto md:grid-cols-2">
      <div className="bg-muted p-3 sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <img
            src={product.images[activeImage] || "/placeholder.svg"}
            alt={name}
            className="size-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <ProductBadges product={product} />
          </div>
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`${name} ${i + 1}`}
                aria-pressed={activeImage === i}
                className={cn(
                  "size-16 overflow-hidden rounded-md border-2 transition-colors",
                  activeImage === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img src={src || "/placeholder.svg"} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bronze">{product.brand}</p>
            <StockBadge product={product} />
          </div>
          <h2 className="mt-2 font-serif text-3xl leading-tight font-semibold text-balance sm:text-4xl">{name}</h2>
          <p className="mt-3 flex items-baseline gap-3 tabular-nums">
            <span className="text-2xl font-semibold">{formatFCFA(price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatFCFA(product.oldPrice)}</span>
            )}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-pretty text-muted-foreground">
            {pick(product, "description", lang)}
          </p>
        </div>

        {product.type === "perfume" && (
          <>
            {product.concentrations && product.concentrations.length > 0 && (
              <OptionGroup
                label={t("product.concentration")}
                options={product.concentrations}
                value={sel.concentration}
                onChange={(v) => setSel((s) => ({ ...s, concentration: v }))}
                render={(v) => (
                  <span>
                    {t(`product.${v}`)}
                    {v === "extrait" && product.concentrations!.includes("edp") && product.extraitSurcharge ? (
                      <span className="ml-1 text-xs opacity-70 tabular-nums">+{formatFCFA(product.extraitSurcharge)}</span>
                    ) : null}
                  </span>
                )}
              />
            )}
            {product.volumes && product.volumes.length > 0 && (
              <OptionGroup
                label={t("product.volume")}
                options={product.volumes.map((v) => v.label)}
                value={sel.volume}
                onChange={(v) => setSel((s) => ({ ...s, volume: v }))}
                render={(v) => v}
              />
            )}
            {notes && (
              <div className="rounded-lg border border-gold/30 bg-obsidian p-5 text-ivory">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{t("product.pyramid")}</p>
                <dl className="mt-4 flex flex-col gap-3">
                  {(["top", "heart", "base"] as const).map((tier, i) => (
                    <div key={tier} className="flex items-start gap-3">
                      <span
                        className="mt-1 h-px shrink-0 bg-gold"
                        style={{ width: `${12 + i * 10}px` }}
                        aria-hidden="true"
                      />
                      <div>
                        <dt className="text-xs font-semibold text-gold">{t(`product.${tier}`)}</dt>
                        <dd className="text-sm text-ivory/80">{notes[tier].join(" · ")}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </>
        )}

        {product.type !== "perfume" && (
          <>
            {material && (
              <div className="flex items-center gap-3 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
                <Gem className="size-5 shrink-0 text-bronze" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("product.material")}
                  </p>
                  <p className="text-sm font-semibold">{material}</p>
                </div>
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <OptionGroup
                label={t("product.size")}
                options={product.sizes}
                value={sel.size}
                onChange={(v) => setSel((s) => ({ ...s, size: v }))}
                render={(v) => sizeLabel(v, lang)}
              />
            )}
          </>
        )}

        {product.type !== "gift" && (
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <input
              type="checkbox"
              checked={Boolean(sel.giftBox)}
              onChange={(e) => setSel((s) => ({ ...s, giftBox: e.target.checked }))}
              className="size-4 accent-[#c5a028]"
            />
            <Gift className="size-4 text-bronze" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">{t("product.giftBox")}</span>
            <span className="text-sm text-muted-foreground tabular-nums">+{formatFCFA(GIFT_BOX_PRICE)}</span>
          </label>
        )}

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("product.quantity")}
          </span>
          <div className="flex items-center rounded-full border border-border bg-card">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-11 items-center justify-center"
              aria-label="-1"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              className="flex size-11 items-center justify-center"
              aria-label="+1"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-pressed={wished}
            aria-label={wished ? t("product.removeWishlist") : t("product.addWishlist")}
            className="ml-auto flex size-11 items-center justify-center rounded-full border border-border bg-card"
          >
            <Heart className={cn("size-5", wished && "fill-[#b42318] text-[#b42318]")} />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={add}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-obsidian px-6 text-sm font-semibold text-ivory transition-colors hover:bg-graphite"
          >
            <ShoppingBag className="size-4 text-gold" aria-hidden="true" />
            {t("product.addToCart")} · <span className="tabular-nums">{formatFCFA(price * qty)}</span>
          </button>
          <button
            type="button"
            onClick={whatsapp}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#1f8a4c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#18733f]"
          >
            <WhatsAppIcon className="size-5" />
            {t("product.orderWhatsApp")}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-bronze" aria-hidden="true" />
            {t("product.authentic")}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ProductModal() {
  const { t, getProduct, lang } = useShop()
  const { quickViewId, openQuickView } = useStorefrontUI()
  const product = quickViewId ? getProduct(quickViewId) : undefined

  return (
    <Overlay
      open={Boolean(product)}
      onClose={() => openQuickView(null)}
      label={product ? pick(product, "name", lang) : ""}
    >
      <button
        type="button"
        onClick={() => openQuickView(null)}
        className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-ivory/90 shadow-md backdrop-blur hover:bg-ivory"
        aria-label={t("product.close")}
      >
        <X className="size-5" />
      </button>
      {product && <ProductDetail key={product.id} product={product} />}
    </Overlay>
  )
}
