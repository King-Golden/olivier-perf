"use client"

import { useShop } from "@/lib/store"
import type { OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export const inputCls =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-gold-deep" : "bg-input",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-gold/20 text-bronze border-gold/40",
  confirmed: "bg-[#e6eefb] text-[#1d4ed8] border-[#bfd3f5]",
  shipping: "bg-[#fff3e0] text-[#a14d0b] border-[#f6d6a8]",
  delivered: "bg-[#e7f3ea] text-[#2f6b3a] border-[#bfdcc6]",
  cancelled: "bg-muted text-muted-foreground border-border",
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useShop()
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", STATUS_STYLES[status])}>
      {t(`status.${status}`)}
    </span>
  )
}

export const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-obsidian px-5 text-sm font-semibold text-ivory transition-colors hover:bg-graphite disabled:opacity-50"
export const btnGhost =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold transition-colors hover:border-obsidian/40"
