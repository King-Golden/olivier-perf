"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, MapPin, Phone, Search } from "lucide-react"
import { WhatsAppIcon } from "@/components/shop/brand-icons"
import { formatDate, formatFCFA, normalize } from "@/lib/format"
import { useShop } from "@/lib/store"
import type { Order, OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { buildStatusMessage, customerWaNumber, openWhatsApp, waLink } from "@/lib/whatsapp"
import { Panel, StatusPill, inputCls } from "./ui"

const STATUSES: OrderStatus[] = ["new", "confirmed", "shipping", "delivered", "cancelled"]

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const { t, lang, settings, setOrderStatus } = useShop()
  const cityKey = order.customer.city === "other" ? "city.otherShort" : (`city.${order.customer.city}` as const)

  return (
    <Panel>
      <button type="button" onClick={onBack} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-bronze lg:hidden">
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {t("ord.all")}
      </button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, lang)}</p>
          <h2 className="font-serif text-3xl font-semibold">#{order.ref}</h2>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("ord.customer")}</p>
          <p className="mt-1 font-semibold">{order.customer.name}</p>
          <a href={`tel:+${customerWaNumber(order.customer.phone)}`} className="mt-1 flex items-center gap-1.5 text-sm tabular-nums hover:text-bronze">
            <Phone className="size-3.5" aria-hidden="true" />
            {order.customer.phone}
          </a>
          <p className="mt-1 flex items-start gap-1.5 text-sm">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {t(cityKey)} — {order.customer.quartier}
          </p>
        </div>
        <div className="rounded-lg bg-muted/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("checkout.payment")}</p>
          <p className="mt-1 font-semibold">{t(`pay.${order.payment}`)}</p>
          {order.giftNote && (
            <>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("wa.giftNote")}</p>
              <p className="mt-1 text-sm italic">{`“${order.giftNote}”`}</p>
            </>
          )}
        </div>
      </div>

      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("ord.items")}</h3>
      <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {i.qty} × {lang === "fr" ? i.name_fr : i.name_en}
              </span>
              <span className="block text-xs text-muted-foreground">{i.variant}</span>
            </span>
            <span className="font-semibold tabular-nums">{formatFCFA(i.unitPrice * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 flex flex-col gap-1.5 text-sm tabular-nums">
        <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.subtotal")}</dt><dd>{formatFCFA(order.subtotal)}</dd></div>
        {order.discount > 0 && (
          <div className="flex justify-between text-[#2f6b3a]"><dt>{t("cart.discount")} ({order.promoCode})</dt><dd>-{formatFCFA(order.discount)}</dd></div>
        )}
        <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.delivery")}</dt><dd>{order.delivery ? formatFCFA(order.delivery) : t("cart.free")}</dd></div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>{t("cart.total")}</dt><dd>{formatFCFA(order.total)}</dd></div>
      </dl>

      <fieldset className="mt-6">
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("ord.changeStatus")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={order.status === s}
              onClick={() => setOrderStatus(order.id, s)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                order.status === s ? "border-obsidian bg-obsidian text-ivory" : "border-border bg-card hover:border-obsidian/40",
              )}
            >
              {t(`status.${s}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={() =>
          openWhatsApp(waLink(customerWaNumber(order.customer.phone), buildStatusMessage(order, order.lang, settings.storeName)))
        }
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f8a4c] text-sm font-semibold text-white hover:bg-[#18733f]"
      >
        <WhatsAppIcon className="size-5" />
        {t("ord.whatsapp")}
      </button>
      <p className="mt-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        {buildStatusMessage(order, order.lang, settings.storeName)}
      </p>
    </Panel>
  )
}

export function AdminOrders() {
  const { t, lang, orders } = useShop()
  const [filter, setFilter] = useState<OrderStatus | "all">("all")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length }
    for (const s of STATUSES) c[s] = orders.filter((o) => o.status === s).length
    return c
  }, [orders])

  const rows = useMemo(() => {
    const q = normalize(query)
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        (!q || normalize(`${o.ref} ${o.customer.name} ${o.customer.phone} ${o.customer.quartier}`).includes(q)),
    )
  }, [orders, filter, query])

  const selected = orders.find((o) => o.id === selectedId)

  return (
    <div className="flex flex-col gap-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label={t("ord.status")}>
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap",
              filter === s ? "border-obsidian bg-obsidian text-ivory" : "border-border bg-card",
            )}
          >
            {s === "all" ? t("ord.all") : t(`status.${s}`)}
            <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", filter === s ? "bg-gold text-obsidian" : "bg-muted")}>{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className={cn("flex flex-col gap-3", selected && "hidden lg:flex")}>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="ord-search" className="sr-only">{t("ord.search")}</label>
            <input id="ord-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("ord.search")} className={cn(inputCls, "pl-9")} />
          </div>
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">{t("ord.empty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rows.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    aria-current={selectedId === o.id ? "true" : undefined}
                    className={cn(
                      "w-full rounded-xl border bg-card p-4 text-left transition-colors",
                      selectedId === o.id ? "border-gold ring-2 ring-gold/20" : "border-border hover:border-obsidian/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm font-bold">#{o.ref}</span>
                      <StatusPill status={o.status} />
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{o.customer.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatDate(o.createdAt, lang)} · {o.items.reduce((s, i) => s + i.qty, 0)} art.
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{formatFCFA(o.total)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cn(!selected && "hidden lg:block")}>
          {selected ? (
            <div className="lg:sticky lg:top-24">
              <OrderDetail order={selected} onBack={() => setSelectedId(null)} />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              {t("ord.select")}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
