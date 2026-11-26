"use client"

import { useState } from "react"
import { ArrowLeft, CircleCheck, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react"
import { formatFCFA, pick } from "@/lib/format"
import { useShop, type Totals } from "@/lib/store"
import type { City, Order, PaymentMethod } from "@/lib/types"
import { cn } from "@/lib/utils"
import { variantLabel } from "@/lib/variants"
import { buildOrderMessage, openWhatsApp, waLink } from "@/lib/whatsapp"
import { WhatsAppIcon } from "./brand-icons"
import { Overlay } from "./overlay"
import { useStorefrontUI } from "./storefront-ui"

type Step = "cart" | "checkout" | "done"

function SummaryLines({ totals }: { totals: Totals }) {
  const { t } = useShop()
  return (
    <dl className="flex flex-col gap-2 text-sm tabular-nums">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
        <dd>{formatFCFA(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-[#2f6b3a]">
          <dt>
            {t("cart.discount")} ({totals.promo?.code})
          </dt>
          <dd>-{formatFCFA(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{t("cart.delivery")}</dt>
        <dd>{totals.delivery === 0 ? t("cart.free") : formatFCFA(totals.delivery)}</dd>
      </div>
      <div className="mt-1 flex justify-between border-t border-border pt-3 text-base font-semibold">
        <dt>{t("cart.total")}</dt>
        <dd>{formatFCFA(totals.total)}</dd>
      </div>
    </dl>
  )
}

function CartStep({ onCheckout, city }: { onCheckout: () => void; city: City }) {
  const { t, lang, cart, getProduct, updateQty, removeFromCart, promoCode, setPromoCode, computeTotals, delivery } = useShop()
  const { setCartOpen, goToCatalog } = useStorefrontUI()
  const [code, setCode] = useState(promoCode)
  const totals = computeTotals(city)

  if (cart.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-bronze" aria-hidden="true" />
        </span>
        <p className="font-serif text-2xl">{t("cart.empty")}</p>
        <button
          type="button"
          onClick={() => {
            setCartOpen(false)
            goToCatalog()
          }}
          className="rounded-full bg-obsidian px-6 py-3 text-sm font-semibold text-ivory"
        >
          {t("cart.emptyCta")}
        </button>
      </div>
    )
  }

  const left = delivery.freeThreshold - (totals.subtotal - totals.discount)

  return (
    <>
      <div className="border-b border-border bg-muted/60 px-5 py-3 text-xs">
        {left > 0 ? (
          <p>{t("cart.freeShippingLeft", { n: formatFCFA(left) })}</p>
        ) : (
          <p className="font-semibold text-[#2f6b3a]">{t("cart.freeShippingOk")}</p>
        )}
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gold transition-all"
            style={{ width: `${Math.min(100, ((totals.subtotal - totals.discount) / delivery.freeThreshold) * 100)}%` }}
          />
        </div>
      </div>

      <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
        {cart.map((item) => {
          const p = getProduct(item.productId)
          if (!p) return null
          return (
            <li key={item.key} className="flex gap-4 py-4">
              <img src={p.images[0] || "/placeholder.svg"} alt="" className="size-20 shrink-0 rounded-md object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg leading-tight font-semibold">{pick(p, "name", lang)}</p>
                    <p className="text-xs text-muted-foreground">{variantLabel(item, lang)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    className="rounded p-1 text-muted-foreground hover:text-[#b42318]"
                    aria-label={`${t("cart.remove")} ${pick(p, "name", lang)}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-border bg-card">
                    <button
                      type="button"
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="flex size-9 items-center justify-center"
                      aria-label="-1"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="flex size-9 items-center justify-center"
                      aria-label="+1"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatFCFA(item.unitPrice * item.qty)}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-border bg-card px-5 pt-4 pb-5">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPromoCode(code.trim().toUpperCase())
          }}
        >
          <label htmlFor="promo" className="sr-only">
            {t("cart.promo")}
          </label>
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="promo"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("cart.promo")}
              className="h-11 w-full rounded-full border border-input bg-ivory pr-3 pl-9 text-sm uppercase placeholder:normal-case focus:border-gold focus:outline-none"
            />
          </div>
          <button type="submit" className="h-11 rounded-full border border-obsidian px-4 text-xs font-semibold hover:bg-obsidian hover:text-ivory">
            {t("cart.apply")}
          </button>
        </form>
        <p className="mt-2 min-h-4 text-xs" aria-live="polite">
          {totals.promo ? (
            <span className="font-semibold text-[#2f6b3a]">
              {t("cart.promoApplied")} : {totals.promo.code}
            </span>
          ) : totals.promoError === "invalid" ? (
            <span className="text-[#b42318]">{t("cart.promoInvalid")}</span>
          ) : totals.promoError === "min" ? (
            <span className="text-[#b42318]">{t("cart.promoMin")}</span>
          ) : (
            <span className="text-muted-foreground">{t("cart.promoHint")}</span>
          )}
        </p>

        <div className="mt-3">
          <SummaryLines totals={totals} />
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="mt-4 h-13 w-full rounded-full bg-obsidian text-sm font-semibold text-ivory transition-colors hover:bg-graphite"
        >
          {t("cart.checkout")}
        </button>
      </div>
    </>
  )
}

interface FormState {
  name: string
  phone: string
  city: City
  quartier: string
  payment: PaymentMethod
  giftNote: string
}

function CheckoutStep({
  form,
  setForm,
  onBack,
  onDone,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onBack: () => void
  onDone: (o: Order) => void
}) {
  const { t, lang, cart, getProduct, computeTotals, delivery, settings, placeOrder, clearCart, orders } = useShop()
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const totals = computeTotals(form.city)

  const cityOptions: { value: City; label: string; fee: string }[] = [
    { value: "douala", label: t("city.douala"), fee: `${formatFCFA(delivery.douala)} — ${t("city.freeFrom")} ${formatFCFA(delivery.freeThreshold)}` },
    { value: "yaounde", label: t("city.yaounde"), fee: `${formatFCFA(delivery.yaounde)} — ${t("city.freeFrom")} ${formatFCFA(delivery.freeThreshold)}` },
    { value: "other", label: t("city.other"), fee: formatFCFA(delivery.other) },
    { value: "pickup", label: t("city.pickup"), fee: t("cart.free") },
  ]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = t("checkout.required")
    const digits = form.phone.replace(/\D/g, "").replace(/^237/, "")
    if (!/^6\d{8}$/.test(digits)) next.phone = t("checkout.phoneInvalid")
    if (form.city !== "pickup" && !form.quartier.trim()) next.quartier = t("checkout.required")
    setErrors(next)
    if (Object.keys(next).length) return

    const existing = new Set(orders.map((o) => o.ref))
    let ref = ""
    do ref = `CMD-${Math.floor(1000 + Math.random() * 9000)}`
    while (existing.has(ref))

    const order: Order = {
      id: crypto.randomUUID(),
      ref,
      createdAt: new Date().toISOString(),
      lang,
      customer: {
        name: form.name.trim(),
        phone: digits.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, "$1$2 $3 $4 $5"),
        city: form.city,
        quartier: form.city === "pickup" ? form.quartier.trim() || t("city.pickup") : form.quartier.trim(),
      },
      payment: form.payment,
      giftNote: form.giftNote.trim() || undefined,
      items: cart.map((c) => {
        const p = getProduct(c.productId)
        return {
          productId: c.productId,
          name_fr: p?.name_fr ?? c.productId,
          name_en: p?.name_en ?? c.productId,
          variant: variantLabel(c, lang),
          qty: c.qty,
          unitPrice: c.unitPrice,
        }
      }),
      subtotal: totals.subtotal,
      discount: totals.discount,
      promoCode: totals.promo?.code,
      delivery: totals.delivery,
      total: totals.total,
      status: "new",
    }
    placeOrder(order)
    openWhatsApp(waLink(settings.whatsapp, buildOrderMessage(order, settings.storeName)))
    clearCart()
    onDone(order)
  }

  const field = "h-12 w-full rounded-md border border-input bg-card px-3.5 text-sm focus:border-gold focus:outline-none"
  const err = (k: keyof FormState) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-1 text-xs text-[#b42318]">
        {errors[k]}
      </p>
    ) : null

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-bronze">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {t("checkout.back")}
        </button>

        <div>
          <label htmlFor="co-name" className="text-xs font-semibold">
            {t("checkout.name")} *
          </label>
          <input
            id="co-name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={cn(field, "mt-1.5", errors.name && "border-[#b42318]")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "err-name" : undefined}
          />
          {err("name")}
        </div>

        <div>
          <label htmlFor="co-phone" className="text-xs font-semibold">
            {t("checkout.phone")} *
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground">+237</span>
            <input
              id="co-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder={t("checkout.phonePh")}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={cn(field, "pl-14 tabular-nums", errors.phone && "border-[#b42318]")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "err-phone" : undefined}
            />
          </div>
          {err("phone")}
        </div>

        <fieldset>
          <legend className="text-xs font-semibold">{t("checkout.city")} *</legend>
          <div className="mt-1.5 flex flex-col gap-2">
            {cityOptions.map((c) => (
              <label
                key={c.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border px-3.5 py-3 transition-colors",
                  form.city === c.value ? "border-obsidian bg-card" : "border-input bg-card/60",
                )}
              >
                <input
                  type="radio"
                  name="city"
                  value={c.value}
                  checked={form.city === c.value}
                  onChange={() => setForm((f) => ({ ...f, city: c.value }))}
                  className="mt-0.5 size-4 accent-[#0a0a0a]"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{c.label}</span>
                  <span className="block text-xs text-muted-foreground tabular-nums">{c.fee}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="co-quartier" className="text-xs font-semibold">
            {t("checkout.quartier")} {form.city !== "pickup" && "*"}
          </label>
          <input
            id="co-quartier"
            autoComplete="address-line1"
            placeholder={t("checkout.quartierPh")}
            value={form.quartier}
            onChange={(e) => setForm((f) => ({ ...f, quartier: e.target.value }))}
            className={cn(field, "mt-1.5", errors.quartier && "border-[#b42318]")}
            aria-invalid={Boolean(errors.quartier)}
            aria-describedby={errors.quartier ? "err-quartier" : undefined}
          />
          {err("quartier")}
        </div>

        <fieldset>
          <legend className="text-xs font-semibold">{t("checkout.payment")} *</legend>
          <div className="mt-1.5 grid gap-2">
            {(["cash", "momo", "om"] as const).map((m) => (
              <label
                key={m}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 transition-colors",
                  form.payment === m ? "border-obsidian bg-card" : "border-input bg-card/60",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={m}
                  checked={form.payment === m}
                  onChange={() => setForm((f) => ({ ...f, payment: m }))}
                  className="size-4 accent-[#0a0a0a]"
                />
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded text-[9px] font-black",
                    m === "momo" ? "bg-[#ffcc00] text-[#003c71]" : m === "om" ? "bg-[#ff7900] text-white" : "bg-obsidian text-gold",
                  )}
                  aria-hidden="true"
                >
                  {m === "momo" ? "MoMo" : m === "om" ? "OM" : "CFA"}
                </span>
                <span className="text-sm font-medium">{t(`pay.${m}`)}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {form.payment === "cash" ? (
              t("checkout.cashInfo")
            ) : (
              <>
                {t(form.payment === "momo" ? "checkout.momoInfo" : "checkout.omInfo")}{" "}
                <strong className="text-foreground tabular-nums">
                  {form.payment === "momo" ? settings.momoNumber : settings.omNumber}
                </strong>
              </>
            )}
          </p>
        </fieldset>

        <div>
          <label htmlFor="co-note" className="text-xs font-semibold">
            {t("checkout.giftNote")}
          </label>
          <textarea
            id="co-note"
            rows={2}
            maxLength={200}
            value={form.giftNote}
            onChange={(e) => setForm((f) => ({ ...f, giftNote: e.target.value }))}
            className="mt-1.5 w-full rounded-md border border-input bg-card px-3.5 py-3 text-sm focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-border bg-card px-5 pt-4 pb-5">
        <SummaryLines totals={totals} />
        <button
          type="submit"
          disabled={cart.length === 0}
          className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#1f8a4c] text-sm font-semibold text-white transition-colors hover:bg-[#18733f] disabled:opacity-50"
        >
          <WhatsAppIcon className="size-5" />
          {t("checkout.submit")}
        </button>
      </div>
    </form>
  )
}

function DoneStep({ order, onClose }: { order: Order; onClose: () => void }) {
  const { t, settings } = useShop()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto p-8 text-center">
      <CircleCheck className="size-16 text-gold" strokeWidth={1.25} aria-hidden="true" />
      <h3 className="font-serif text-3xl leading-tight">{t("confirm.title")}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("confirm.desc")}</p>
      <div className="w-full rounded-lg border border-gold/40 bg-obsidian p-5 text-ivory">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/60">{t("confirm.ref")}</p>
        <p className="mt-1 font-serif text-4xl text-gold tabular-nums">#{order.ref}</p>
        <p className="mt-2 text-sm tabular-nums">{formatFCFA(order.total)}</p>
      </div>
      <button
        type="button"
        onClick={() => openWhatsApp(waLink(settings.whatsapp, buildOrderMessage(order, settings.storeName)))}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f8a4c] text-sm font-semibold text-white hover:bg-[#18733f]"
      >
        <WhatsAppIcon className="size-5" />
        {t("confirm.reopen")}
      </button>
      <button type="button" onClick={onClose} className="text-sm font-semibold text-bronze underline underline-offset-4">
        {t("confirm.done")}
      </button>
    </div>
  )
}

export function CartDrawer() {
  const { t, cartCount } = useShop()
  const { cartOpen, setCartOpen } = useStorefrontUI()
  const [step, setStep] = useState<Step>("cart")
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    city: "douala",
    quartier: "",
    payment: "cash",
    giftNote: "",
  })

  const close = () => {
    setCartOpen(false)
    if (step === "done") setStep("cart")
  }

  const title = step === "checkout" ? t("checkout.title") : step === "done" ? `#${lastOrder?.ref}` : t("cart.title")

  return (
    <Overlay open={cartOpen} onClose={close} label={title} variant="right">
      <div className="flex items-center justify-between border-b border-border bg-obsidian px-5 py-4 text-ivory">
        <h2 className="font-serif text-2xl">
          {title}
          {step === "cart" && cartCount > 0 && <span className="ml-2 text-base text-gold tabular-nums">({cartCount})</span>}
        </h2>
        <button
          type="button"
          onClick={close}
          className="flex size-10 items-center justify-center rounded-full hover:bg-ivory/10"
          aria-label={t("product.close")}
        >
          <X className="size-5" />
        </button>
      </div>
      {step === "cart" && <CartStep city={form.city} onCheckout={() => setStep("checkout")} />}
      {step === "checkout" && (
        <CheckoutStep
          form={form}
          setForm={setForm}
          onBack={() => setStep("cart")}
          onDone={(o) => {
            setLastOrder(o)
            setStep("done")
          }}
        />
      )}
      {step === "done" && lastOrder && <DoneStep order={lastOrder} onClose={close} />}
    </Overlay>
  )
}
