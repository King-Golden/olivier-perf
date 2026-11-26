"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Overlay } from "@/components/shop/overlay"
import { useShop } from "@/lib/store"
import type { Badge, Category, Concentration, Facet, Product, ProductType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Field, Toggle, btnGhost, btnPrimary, inputCls } from "./ui"

const CATS: Category[] = ["men", "women", "unisex", "jewelry-women", "jewelry-men", "gifts"]
const FACETS: Facet[] = ["oud", "floral", "boise", "ambre", "or18k", "argent925", "acier", "perle"]

const list = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)

function emptyProduct(): Product {
  return {
    id: `p-${Date.now().toString(36)}`,
    sku: "",
    type: "perfume",
    category: "unisex",
    brand: "",
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    facets: [],
    price: 0,
    stock: 0,
    images: [],
    badge: null,
    visible: true,
    featured: false,
    popularity: 50,
    createdAt: new Date().toISOString().slice(0, 10),
    concentrations: ["edp"],
  }
}

export function ProductForm({ product, onClose }: { product: Product | "new"; onClose: () => void }) {
  const { t, upsertProduct } = useShop()
  const initial = product === "new" ? emptyProduct() : product
  const [p, setP] = useState<Product>(initial)
  const [image, setImage] = useState(initial.images[0] ?? "")
  const [notes, setNotes] = useState({
    fr: { top: initial.notes_fr?.top.join(", ") ?? "", heart: initial.notes_fr?.heart.join(", ") ?? "", base: initial.notes_fr?.base.join(", ") ?? "" },
    en: { top: initial.notes_en?.top.join(", ") ?? "", heart: initial.notes_en?.heart.join(", ") ?? "", base: initial.notes_en?.base.join(", ") ?? "" },
  })
  const [volumes, setVolumes] = useState(initial.volumes?.map((v) => `${v.label}:${v.price}`).join(", ") ?? "")
  const [sizes, setSizes] = useState(initial.sizes?.join(", ") ?? "")
  const [error, setError] = useState("")

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!p.name_fr.trim() || !p.name_en.trim() || p.price <= 0) {
      setError(`${t("prod.nameFr")}, ${t("prod.nameEn")}, ${t("prod.price")} — ${t("checkout.required")}`)
      return
    }
    const parsedVolumes = list(volumes)
      .map((v) => {
        const [label, price] = v.split(":").map((x) => x.trim())
        return { label, price: Number(price) }
      })
      .filter((v) => v.label && v.price > 0)
    const images = [image.trim(), ...p.images.slice(1)].filter(Boolean)
    const out: Product = {
      ...p,
      sku: p.sku.trim() || `SKU-${p.id.toUpperCase()}`,
      images: images.length ? images : ["/placeholder.svg"],
      price: parsedVolumes[0]?.price ?? p.price,
    }
    if (p.type === "perfume") {
      out.notes_fr = { top: list(notes.fr.top), heart: list(notes.fr.heart), base: list(notes.fr.base) }
      out.notes_en = { top: list(notes.en.top), heart: list(notes.en.heart), base: list(notes.en.base) }
      out.volumes = parsedVolumes.length ? parsedVolumes : undefined
      out.sizes = undefined
    } else {
      out.sizes = list(sizes).length ? list(sizes) : undefined
      out.volumes = undefined
      out.concentrations = undefined
      out.notes_fr = undefined
      out.notes_en = undefined
    }
    upsertProduct(out)
    onClose()
  }

  return (
    <Overlay open onClose={onClose} label={product === "new" ? t("prod.newTitle") : t("prod.editTitle")}>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-2xl font-semibold">{product === "new" ? t("prod.newTitle") : t("prod.editTitle")}</h2>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full hover:bg-muted" aria-label={t("product.close")}>
            <X className="size-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
          <Field label={`${t("prod.nameFr")} *`} htmlFor="f-nfr">
            <input id="f-nfr" className={inputCls} value={p.name_fr} onChange={(e) => set("name_fr", e.target.value)} />
          </Field>
          <Field label={`${t("prod.nameEn")} *`} htmlFor="f-nen">
            <input id="f-nen" className={inputCls} value={p.name_en} onChange={(e) => set("name_en", e.target.value)} />
          </Field>
          <Field label={t("prod.descFr")} htmlFor="f-dfr">
            <textarea id="f-dfr" rows={3} className={cn(inputCls, "h-auto py-2")} value={p.description_fr} onChange={(e) => set("description_fr", e.target.value)} />
          </Field>
          <Field label={t("prod.descEn")} htmlFor="f-den">
            <textarea id="f-den" rows={3} className={cn(inputCls, "h-auto py-2")} value={p.description_en} onChange={(e) => set("description_en", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-4">
            <Field label={t("prod.type")} htmlFor="f-type">
              <select id="f-type" className={inputCls} value={p.type} onChange={(e) => set("type", e.target.value as ProductType)}>
                {(["perfume", "jewelry", "gift"] as const).map((x) => (
                  <option key={x} value={x}>{t(`type.${x}`)}</option>
                ))}
              </select>
            </Field>
            <Field label={t("prod.category")} htmlFor="f-cat">
              <select id="f-cat" className={inputCls} value={p.category} onChange={(e) => set("category", e.target.value as Category)}>
                {CATS.map((c) => (
                  <option key={c} value={c}>{t(`cat.${c}`)}</option>
                ))}
              </select>
            </Field>
            <Field label={t("prod.brand")} htmlFor="f-brand">
              <input id="f-brand" className={inputCls} value={p.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label={t("prod.sku")} htmlFor="f-sku">
              <input id="f-sku" className={cn(inputCls, "font-mono uppercase")} value={p.sku} onChange={(e) => set("sku", e.target.value)} />
            </Field>
            <Field label={`${t("prod.price")} (FCFA) *`} htmlFor="f-price">
              <input id="f-price" type="number" min={0} step={500} className={cn(inputCls, "tabular-nums")} value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} />
            </Field>
            <Field label={`${t("prod.promoPrice")} (FCFA)`} htmlFor="f-old">
              <input id="f-old" type="number" min={0} step={500} className={cn(inputCls, "tabular-nums")} value={p.oldPrice ?? ""} onChange={(e) => set("oldPrice", e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
            <Field label={t("prod.stock")} htmlFor="f-stock">
              <input id="f-stock" type="number" min={0} className={cn(inputCls, "tabular-nums")} value={p.stock} onChange={(e) => set("stock", Math.max(0, Number(e.target.value)))} />
            </Field>
            <Field label={t("prod.badge")} htmlFor="f-badge">
              <select id="f-badge" className={inputCls} value={p.badge ?? ""} onChange={(e) => set("badge", (e.target.value || null) as Badge)}>
                <option value="">{t("prod.none")}</option>
                <option value="new">{t("badge.new")}</option>
                <option value="bestseller">{t("badge.bestseller")}</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-4 md:col-span-2">
            <div className="flex-1">
              <Field label={t("prod.imageUrl")} htmlFor="f-img">
                <input id="f-img" className={inputCls} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/… ou /images/products/…" />
              </Field>
            </div>
            <img src={image || "/placeholder.svg"} alt="" className="size-20 shrink-0 rounded-md border border-border object-cover" />
          </div>

          <fieldset className="md:col-span-2">
            <legend className="text-xs font-semibold">{t("prod.facets")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {FACETS.map((f) => {
                const on = p.facets.includes(f)
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set("facets", on ? p.facets.filter((x) => x !== f) : [...p.facets, f])}
                    className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", on ? "border-gold bg-gold/15" : "border-border")}
                  >
                    {t(`facet.${f}`)}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {p.type === "perfume" ? (
            <>
              {(["fr", "en"] as const).map((l) => (
                <fieldset key={l} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                  <legend className="px-1 text-xs font-semibold">{t(l === "fr" ? "prod.notesFr" : "prod.notesEn")}</legend>
                  {(["top", "heart", "base"] as const).map((tier) => (
                    <Field key={tier} label={t(`product.${tier}`)} htmlFor={`f-n-${l}-${tier}`}>
                      <input
                        id={`f-n-${l}-${tier}`}
                        className={inputCls}
                        value={notes[l][tier]}
                        onChange={(e) => setNotes((n) => ({ ...n, [l]: { ...n[l], [tier]: e.target.value } }))}
                      />
                    </Field>
                  ))}
                </fieldset>
              ))}
              <div className="md:col-span-2">
                <Field label={t("prod.volumes")} htmlFor="f-vol">
                  <input id="f-vol" className={cn(inputCls, "font-mono")} value={volumes} onChange={(e) => setVolumes(e.target.value)} />
                </Field>
              </div>
              <fieldset className="flex flex-wrap items-end gap-4 md:col-span-2">
                <legend className="mb-2 text-xs font-semibold">{t("product.concentration")}</legend>
                {(["edp", "extrait"] as Concentration[]).map((c) => {
                  const on = p.concentrations?.includes(c) ?? false
                  return (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={on}
                        className="size-4 accent-[#c5a028]"
                        onChange={() =>
                          set("concentrations", on ? (p.concentrations ?? []).filter((x) => x !== c) : [...(p.concentrations ?? []), c])
                        }
                      />
                      {t(`product.${c}`)}
                    </label>
                  )
                })}
                <div className="w-48">
                  <Field label="Extrait + (FCFA)" htmlFor="f-ext">
                    <input id="f-ext" type="number" min={0} step={500} className={cn(inputCls, "tabular-nums")} value={p.extraitSurcharge ?? ""} onChange={(e) => set("extraitSurcharge", e.target.value ? Number(e.target.value) : undefined)} />
                  </Field>
                </div>
              </fieldset>
            </>
          ) : (
            <>
              <Field label={t("prod.materialFr")} htmlFor="f-mfr">
                <input id="f-mfr" className={inputCls} value={p.material_fr ?? ""} onChange={(e) => set("material_fr", e.target.value)} placeholder="Plaqué Or 18K" />
              </Field>
              <Field label={t("prod.materialEn")} htmlFor="f-men">
                <input id="f-men" className={inputCls} value={p.material_en ?? ""} onChange={(e) => set("material_en", e.target.value)} placeholder="18K Gold Plated" />
              </Field>
              <div className="md:col-span-2">
                <Field label={t("prod.sizes")} htmlFor="f-sizes">
                  <input id="f-sizes" className={inputCls} value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="45cm, 50cm, adjustable" />
                </Field>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-6 md:col-span-2">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Toggle checked={p.visible} onChange={(v) => set("visible", v)} label={t("prod.online")} />
              {p.visible ? t("prod.online") : t("prod.hidden")}
            </span>
            <span className="flex items-center gap-3 text-sm font-medium">
              <Toggle checked={p.featured} onChange={(v) => set("featured", v)} label={t("prod.featured")} />
              {t("prod.featured")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-card px-5 py-4">
          {error && <p className="mr-auto text-xs text-[#b42318]" role="alert">{error}</p>}
          <button type="button" onClick={onClose} className={btnGhost}>
            {t("prod.cancel")}
          </button>
          <button type="submit" className={btnPrimary}>
            {t("prod.save")}
          </button>
        </div>
      </form>
    </Overlay>
  )
}
