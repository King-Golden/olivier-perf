"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { formatFCFA } from "@/lib/format"
import { matchesQuery } from "@/lib/search"
import { useShop } from "@/lib/store"
import type { Facet } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ProductCard } from "./product-card"
import { CATEGORIES } from "./site-header"
import { useStorefrontUI } from "./storefront-ui"

type Sort = "popular" | "new" | "priceAsc" | "priceDesc"
type Availability = "any" | "in" | "order"

const FACETS: Facet[] = ["oud", "floral", "boise", "ambre", "or18k", "argent925", "acier", "perle"]

export function Catalog() {
  const { t, visibleProducts } = useShop()
  const { query, setQuery, category, setCategory } = useStorefrontUI()

  const ceiling = useMemo(
    () => Math.ceil(Math.max(50000, ...visibleProducts.map((p) => p.price)) / 5000) * 5000,
    [visibleProducts],
  )
  const [priceMax, setPriceMax] = useState<number | null>(null)
  const [availability, setAvailability] = useState<Availability>("any")
  const [facets, setFacets] = useState<Facet[]>([])
  const [sort, setSort] = useState<Sort>("popular")
  const [showFilters, setShowFilters] = useState(false)

  const effectiveMax = priceMax ?? ceiling
  const filtersActive = priceMax !== null || availability !== "any" || facets.length > 0

  const results = useMemo(() => {
    const list = visibleProducts.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        matchesQuery(p, query) &&
        p.price <= effectiveMax &&
        (availability === "any" || (availability === "in" ? p.stock > 0 : p.stock <= 0)) &&
        (facets.length === 0 || facets.some((f) => p.facets.includes(f))),
    )
    const sorters: Record<Sort, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      popular: (a, b) => b.popularity - a.popularity,
      new: (a, b) => b.createdAt.localeCompare(a.createdAt),
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
    }
    return list.sort(sorters[sort])
  }, [visibleProducts, category, query, effectiveMax, availability, facets, sort])

  const reset = () => {
    setPriceMax(null)
    setAvailability("any")
    setFacets([])
  }

  const filters = (
    <div className="flex flex-col gap-7">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.18em]">{t("catalog.price")}</legend>
        <input
          type="range"
          min={20000}
          max={ceiling}
          step={5000}
          value={effectiveMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="mt-4 w-full accent-[#c5a028]"
          aria-label={t("catalog.priceMax")}
        />
        <p className="mt-2 text-sm text-muted-foreground tabular-nums">
          {t("catalog.priceMax")} <span className="font-semibold text-foreground">{formatFCFA(effectiveMax)}</span>
        </p>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.18em]">{t("catalog.availability")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["any", t("catalog.any")],
              ["in", t("catalog.inStock")],
              ["order", t("catalog.onOrder")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAvailability(value)}
              aria-pressed={availability === value}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                availability === value
                  ? "border-obsidian bg-obsidian text-ivory"
                  : "border-border bg-card hover:border-obsidian/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.18em]">{t("catalog.facets")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {FACETS.map((f) => {
            const active = facets.includes(f)
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFacets((prev) => (active ? prev.filter((x) => x !== f) : [...prev, f]))}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                  active ? "border-gold bg-gold/15 text-obsidian" : "border-border bg-card hover:border-gold/60",
                )}
              >
                {t(`facet.${f}`)}
              </button>
            )
          })}
        </div>
      </fieldset>

      {filtersActive && (
        <button type="button" onClick={reset} className="self-start text-xs font-semibold text-bronze underline underline-offset-4">
          {t("catalog.reset")}
        </button>
      )}
    </div>
  )

  return (
    <section id="collection" className="scroll-mt-40 bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bronze">{t("catalog.eyebrow")}</p>
          <h2 className="font-serif text-4xl font-medium text-balance sm:text-5xl">{t("catalog.title")}</h2>
        </div>

        <div role="tablist" aria-label={t("nav.shop")} className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-2 lg:justify-center">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              type="button"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors",
                category === c
                  ? "border-obsidian bg-obsidian text-gold"
                  : "border-border bg-card text-foreground hover:border-obsidian/40",
              )}
            >
              {t(`cat.${c}`)}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-semibold lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {showFilters ? t("catalog.hideFilters") : t("catalog.showFilters")}
              {filtersActive && <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />}
            </button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground tabular-nums">{results.length}</span> {t("catalog.results")}
              {query && (
                <>
                  {" "}
                  · {t("catalog.searchFor")} <q className="font-medium text-foreground">{query}</q>
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="ml-1 inline-flex align-middle text-muted-foreground hover:text-foreground"
                    aria-label={t("catalog.reset")}
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              )}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <span className="text-muted-foreground">{t("catalog.sort")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 rounded-full border border-border bg-card px-3 text-xs font-semibold focus:border-gold focus:outline-none"
            >
              <option value="popular">{t("sort.popular")}</option>
              <option value="new">{t("sort.new")}</option>
              <option value="priceAsc">{t("sort.priceAsc")}</option>
              <option value="priceDesc">{t("sort.priceDesc")}</option>
            </select>
          </label>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside
            aria-label={t("catalog.filters")}
            className={cn("rounded-lg border border-border bg-card p-5 lg:block lg:h-fit lg:sticky lg:top-40", showFilters ? "block" : "hidden")}
          >
            {filters}
          </aside>

          <div>
            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-20 text-center">
                <p className="text-muted-foreground">{t("catalog.empty")}</p>
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setQuery("")
                    setCategory("all")
                  }}
                  className="rounded-full bg-obsidian px-5 py-2.5 text-xs font-semibold text-ivory"
                >
                  {t("catalog.reset")}
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {results.map((p) => (
                  <li key={p.id} className="flex">
                    <div className="w-full">
                      <ProductCard product={p} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
