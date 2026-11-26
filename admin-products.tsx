"use client"

import { useMemo, useState } from "react"
import { Minus, Pencil, Plus, Search, Star, Trash2 } from "lucide-react"
import { formatFCFA, normalize } from "@/lib/format"
import { useShop } from "@/lib/store"
import type { Category, Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ProductForm } from "./product-form"
import { Toggle, btnPrimary, inputCls } from "./ui"

function StockControl({ product }: { product: Product }) {
  const { adjustStock } = useShop()
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-ivory">
      <button
        type="button"
        onClick={() => adjustStock(product.id, -1)}
        disabled={product.stock <= 0}
        className="flex size-9 items-center justify-center disabled:opacity-30"
        aria-label={`-1 stock ${product.name_fr}`}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn(
          "w-8 text-center text-sm font-bold tabular-nums",
          product.stock === 0 ? "text-[#b42318]" : product.stock <= 3 ? "text-[#a14d0b]" : "",
        )}
        aria-live="polite"
      >
        {product.stock}
      </span>
      <button
        type="button"
        onClick={() => adjustStock(product.id, 1)}
        className="flex size-9 items-center justify-center"
        aria-label={`+1 stock ${product.name_fr}`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

function RowActions({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const { t, deleteProduct } = useShop()
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onEdit} className="flex size-9 items-center justify-center rounded-full hover:bg-muted" aria-label={`${t("prod.edit")} ${product.name_fr}`}>
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`${t("prod.deleteConfirm")}\n\n${product.name_fr}`)) deleteProduct(product.id)
        }}
        className="flex size-9 items-center justify-center rounded-full text-[#b42318] hover:bg-[#fde8e8]"
        aria-label={`${t("prod.delete")} ${product.name_fr}`}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

export function AdminProducts() {
  const { t, lang, products, upsertProduct } = useShop()
  const [query, setQuery] = useState("")
  const [cat, setCat] = useState<Category | "all">("all")
  const [editing, setEditing] = useState<Product | "new" | null>(null)

  const rows = useMemo(() => {
    const q = normalize(query)
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!q || normalize(`${p.name_fr} ${p.name_en} ${p.sku} ${p.brand}`).includes(q)),
    )
  }, [products, query, cat])

  const name = (p: Product) => (lang === "fr" ? p.name_fr : p.name_en)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="prod-search" className="sr-only">{t("prod.search")}</label>
          <input id="prod-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("prod.search")} className={cn(inputCls, "pl-9")} />
        </div>
        <label htmlFor="prod-cat" className="sr-only">{t("prod.category")}</label>
        <select id="prod-cat" value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} className={cn(inputCls, "sm:w-56")}>
          {(["all", "men", "women", "unisex", "jewelry-women", "jewelry-men", "gifts"] as const).map((c) => (
            <option key={c} value={c}>{t(`cat.${c}`)}</option>
          ))}
        </select>
        <button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
          <Plus className="size-4 text-gold" aria-hidden="true" />
          {t("prod.add")}
        </button>
      </div>

      {rows.length === 0 && <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">{t("prod.noResults")}</p>}

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((p) => (
          <li key={p.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex gap-3">
              <img src={p.images[0] || "/placeholder.svg"} alt="" className="size-16 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name(p)}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{p.sku}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatFCFA(p.price)}
                  {p.oldPrice ? <span className="ml-2 text-xs font-normal text-muted-foreground line-through">{formatFCFA(p.oldPrice)}</span> : null}
                </p>
              </div>
              <RowActions product={p} onEdit={() => setEditing(p)} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
              <StockControl product={p} />
              <div className="flex items-center gap-2">
                <Toggle checked={p.visible} onChange={(v) => upsertProduct({ ...p, visible: v })} label={t("prod.online")} />
                <span className="text-xs">{p.visible ? t("prod.online") : t("prod.hidden")}</span>
                <button
                  type="button"
                  onClick={() => upsertProduct({ ...p, featured: !p.featured })}
                  aria-pressed={p.featured}
                  aria-label={t("prod.featured")}
                  className="ml-1 flex size-9 items-center justify-center rounded-full border border-border"
                >
                  <Star className={cn("size-4", p.featured ? "fill-gold text-gold-deep" : "text-muted-foreground")} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {rows.length > 0 && (
        <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">{t("prod.name")}</th>
                <th scope="col" className="px-4 py-3">{t("prod.category")}</th>
                <th scope="col" className="px-4 py-3 text-right">{t("prod.price")}</th>
                <th scope="col" className="px-4 py-3 text-right">{t("prod.promoPrice")}</th>
                <th scope="col" className="px-4 py-3 text-center">{t("prod.stock")}</th>
                <th scope="col" className="px-4 py-3">{t("prod.status")}</th>
                <th scope="col" className="px-4 py-3 text-center">{t("prod.featured")}</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">{t("prod.actions")}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id} className={cn("align-middle", !p.visible && "opacity-60")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0] || "/placeholder.svg"} alt="" className="size-11 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-semibold">{name(p)}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{t(`cat.${p.category}`)}</td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">{formatFCFA(p.price)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-muted-foreground tabular-nums">{p.oldPrice ? formatFCFA(p.oldPrice) : "—"}</td>
                  <td className="px-4 py-3 text-center"><StockControl product={p} /></td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Toggle checked={p.visible} onChange={(v) => upsertProduct({ ...p, visible: v })} label={`${t("prod.online")} ${p.name_fr}`} />
                      <span className="text-xs whitespace-nowrap">{p.visible ? t("prod.online") : t("prod.hidden")}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => upsertProduct({ ...p, featured: !p.featured })}
                      aria-pressed={p.featured}
                      aria-label={`${t("prod.featured")} ${p.name_fr}`}
                      className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
                    >
                      <Star className={cn("size-4", p.featured ? "fill-gold text-gold-deep" : "text-muted-foreground")} />
                    </button>
                  </td>
                  <td className="px-4 py-3"><RowActions product={p} onEdit={() => setEditing(p)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ProductForm key={editing === "new" ? "new" : editing.id} product={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
