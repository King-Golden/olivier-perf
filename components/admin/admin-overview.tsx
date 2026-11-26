"use client"

import { useMemo } from "react"
import { AlertTriangle, Receipt, ShoppingBag, TrendingUp, Wallet } from "lucide-react"
import { formatDate, formatFCFA } from "@/lib/format"
import { useShop } from "@/lib/store"
import type { ProductType } from "@/lib/types"
import type { AdminTab } from "./admin-app"
import { Panel, StatusPill } from "./ui"

export function AdminOverview({ onNavigate }: { onNavigate: (t: AdminTab) => void }) {
  const { t, lang, orders, products } = useShop()

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled")
    const revenue = valid.reduce((s, o) => s + o.total, 0)
    const now = new Date()
    const month = orders.filter((o) => {
      const d = new Date(o.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const pending = orders.filter((o) => o.status === "new").length
    const lowStock = products.filter((p) => p.stock <= 3)
    const aov = valid.length ? revenue / valid.length : 0

    const byType: Record<ProductType, number> = { perfume: 0, jewelry: 0, gift: 0 }
    const byProduct = new Map<string, { name: string; units: number; revenue: number; image?: string }>()
    for (const o of valid) {
      for (const i of o.items) {
        const p = products.find((x) => x.id === i.productId)
        const type = p?.type ?? "perfume"
        byType[type] += i.unitPrice * i.qty
        const entry = byProduct.get(i.productId) ?? {
          name: lang === "fr" ? i.name_fr : i.name_en,
          units: 0,
          revenue: 0,
          image: p?.images[0],
        }
        entry.units += i.qty
        entry.revenue += i.unitPrice * i.qty
        byProduct.set(i.productId, entry)
      }
    }
    const top = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    return { revenue, month, pending, lowStock, aov, byType, top }
  }, [orders, products, lang])

  const kpis = [
    { label: t("kpi.revenue"), value: formatFCFA(stats.revenue), desc: t("kpi.revenueDesc"), icon: Wallet },
    { label: t("kpi.month"), value: String(stats.month), icon: Receipt },
    { label: t("kpi.pending"), value: String(stats.pending), desc: t("kpi.pendingDesc"), icon: ShoppingBag, highlight: stats.pending > 0 },
    { label: t("kpi.lowStock"), value: String(stats.lowStock.length), desc: t("kpi.lowStockDesc"), icon: AlertTriangle, warn: stats.lowStock.length > 0 },
    { label: t("kpi.aov"), value: formatFCFA(stats.aov), icon: TrendingUp },
  ]

  const totalCat = Object.values(stats.byType).reduce((a, b) => a + b, 0) || 1
  const catRows: { key: ProductType; label: string; color: string }[] = [
    { key: "perfume", label: t("group.perfume"), color: "bg-obsidian" },
    { key: "jewelry", label: t("group.jewelry"), color: "bg-gold" },
    { key: "gift", label: t("group.gift"), color: "bg-bronze" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map(({ label, value, desc, icon: Icon, highlight, warn }, i) => (
          <li
            key={label}
            className={`rounded-xl border p-4 ${i === 0 ? "col-span-2 border-gold/30 bg-obsidian text-ivory lg:col-span-1" : "border-border bg-card"}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-xs font-medium ${i === 0 ? "text-ivory/70" : "text-muted-foreground"}`}>{label}</p>
              <Icon className={`size-4 ${i === 0 ? "text-gold" : warn ? "text-[#d97706]" : highlight ? "text-bronze" : "text-muted-foreground"}`} aria-hidden="true" />
            </div>
            <p className={`mt-3 font-serif text-2xl font-semibold tabular-nums sm:text-3xl ${i === 0 ? "text-gold" : ""}`}>{value}</p>
            {desc && <p className={`mt-1 text-[11px] ${i === 0 ? "text-ivory/55" : "text-muted-foreground"}`}>{desc}</p>}
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={t("admin.salesByCat")}>
          <div className="flex h-4 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            {catRows.map((c) => (
              <div key={c.key} className={c.color} style={{ width: `${(stats.byType[c.key] / totalCat) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-5 flex flex-col gap-4">
            {catRows.map((c) => {
              const pct = Math.round((stats.byType[c.key] / totalCat) * 100)
              return (
                <li key={c.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className={`size-2.5 rounded-sm ${c.color}`} aria-hidden="true" />
                      {c.label}
                    </span>
                    <span className="tabular-nums">
                      {formatFCFA(stats.byType[c.key])} <span className="text-muted-foreground">· {pct}%</span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel title={t("admin.topProducts")}>
          <ol className="flex flex-col gap-3">
            {stats.top.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="w-5 font-serif text-lg text-bronze tabular-nums">{i + 1}</span>
                <img src={p.image || "/placeholder.svg"} alt="" className="size-10 rounded object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {p.units} {t("admin.units")}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{formatFCFA(p.revenue)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title={t("admin.recentOrders")}
          action={
            <button type="button" onClick={() => onNavigate("orders")} className="text-xs font-semibold text-bronze underline underline-offset-4">
              {t("admin.viewAll")}
            </button>
          }
        >
          <ul className="divide-y divide-border">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="font-mono text-xs font-semibold">#{o.ref}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{o.customer.name}</span>
                <span className="text-xs text-muted-foreground">{formatDate(o.createdAt, lang)}</span>
                <span className="text-sm font-semibold tabular-nums">{formatFCFA(o.total)}</span>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={t("kpi.lowStock")}
          action={
            <button type="button" onClick={() => onNavigate("products")} className="text-xs font-semibold text-bronze underline underline-offset-4">
              {t("admin.viewAll")}
            </button>
          }
        >
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <img src={p.images[0] || "/placeholder.svg"} alt="" className="size-10 rounded object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{lang === "fr" ? p.name_fr : p.name_en}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${p.stock === 0 ? "bg-[#fde8e8] text-[#b42318]" : "bg-[#fff3e0] text-[#a14d0b]"}`}>
                    {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
