"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { formatFCFA } from "@/lib/format"
import { useShop } from "@/lib/store"
import type { DeliverySettings, PromoCode } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Field, Panel, Toggle, btnPrimary, inputCls } from "./ui"

export function AdminPromos() {
  const { t, promos, setPromos, delivery, setDelivery } = useShop()
  const [draft, setDraft] = useState<PromoCode>({ code: "", type: "percent", value: 10, minOrder: 0, active: true })
  const [error, setError] = useState("")
  const [fees, setFees] = useState<DeliverySettings>(delivery)
  const [saved, setSaved] = useState(false)

  const addPromo = (e: React.FormEvent) => {
    e.preventDefault()
    const code = draft.code.trim().toUpperCase().replace(/\s+/g, "")
    if (!code || draft.value <= 0) return setError(t("checkout.required"))
    if (promos.some((p) => p.code === code)) return setError(t("promo.exists"))
    setPromos([...promos, { ...draft, code, value: draft.type === "percent" ? Math.min(100, draft.value) : draft.value }])
    setDraft({ code: "", type: "percent", value: 10, minOrder: 0, active: true })
    setError("")
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Panel title={t("promo.title")}>
        <ul className="flex flex-col divide-y divide-border">
          {promos.map((p) => (
            <li key={p.code} className="flex flex-wrap items-center gap-3 py-3">
              <span className="rounded-md bg-obsidian px-2.5 py-1 font-mono text-sm font-bold text-gold">{p.code}</span>
              <span className="text-sm font-semibold tabular-nums">
                {p.type === "percent" ? `-${p.value}%` : `-${formatFCFA(p.value)}`}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {t("promo.min")} {p.minOrder ? formatFCFA(p.minOrder) : "—"}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <Toggle
                  checked={p.active}
                  onChange={(v) => setPromos(promos.map((x) => (x.code === p.code ? { ...x, active: v } : x)))}
                  label={`${t("promo.active")} ${p.code}`}
                />
                <span className={cn("w-12 text-xs", p.active ? "font-semibold" : "text-muted-foreground")}>
                  {p.active ? t("promo.active") : "Off"}
                </span>
                <button
                  type="button"
                  onClick={() => setPromos(promos.filter((x) => x.code !== p.code))}
                  className="flex size-9 items-center justify-center rounded-full text-[#b42318] hover:bg-[#fde8e8]"
                  aria-label={`${t("prod.delete")} ${p.code}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>

        <form onSubmit={addPromo} className="mt-5 grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t("promo.code")} htmlFor="pr-code">
            <input id="pr-code" className={cn(inputCls, "font-mono uppercase")} value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} placeholder="TABASKI15" />
          </Field>
          <Field label={t("promo.type")} htmlFor="pr-type">
            <select id="pr-type" className={inputCls} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as PromoCode["type"] })}>
              <option value="percent">{t("promo.percent")}</option>
              <option value="fixed">{t("promo.fixed")}</option>
            </select>
          </Field>
          <Field label={t("promo.value")} htmlFor="pr-val">
            <input id="pr-val" type="number" min={1} className={cn(inputCls, "tabular-nums")} value={draft.value || ""} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} />
          </Field>
          <Field label={`${t("promo.min")} (FCFA)`} htmlFor="pr-min">
            <input id="pr-min" type="number" min={0} step={1000} className={cn(inputCls, "tabular-nums")} value={draft.minOrder || ""} onChange={(e) => setDraft({ ...draft, minOrder: Number(e.target.value) })} />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
            <button type="submit" className={btnPrimary}>
              <Plus className="size-4 text-gold" aria-hidden="true" />
              {t("promo.add")}
            </button>
            {error && <p className="text-xs text-[#b42318]" role="alert">{error}</p>}
          </div>
        </form>
      </Panel>

      <Panel title={t("delivery.title")}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            setDelivery(fees)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
          }}
        >
          {(
            [
              ["douala", t("city.douala")],
              ["yaounde", t("city.yaounde")],
              ["other", t("city.otherShort")],
              ["freeThreshold", t("delivery.threshold")],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={`${label} (FCFA)`} htmlFor={`fee-${key}`}>
              <input
                id={`fee-${key}`}
                type="number"
                min={0}
                step={500}
                className={cn(inputCls, "tabular-nums")}
                value={fees[key]}
                onChange={(e) => setFees({ ...fees, [key]: Math.max(0, Number(e.target.value)) })}
              />
            </Field>
          ))}
          <p className="text-xs text-muted-foreground">
            {t("city.pickup")} : {t("cart.free")}
          </p>
          <div className="flex items-center gap-3">
            <button type="submit" className={btnPrimary}>{t("prod.save")}</button>
            {saved && <span className="text-xs font-semibold text-[#2f6b3a]" role="status">{t("delivery.saved")}</span>}
          </div>
        </form>
      </Panel>
    </div>
  )
}
