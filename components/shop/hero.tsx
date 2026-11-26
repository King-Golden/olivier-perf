"use client"

import { ArrowRight, Star } from "lucide-react"
import { formatFCFA, pick } from "@/lib/format"
import { useShop } from "@/lib/store"
import { useStorefrontUI } from "./storefront-ui"

export function Hero() {
  const { t, lang, visibleProducts } = useShop()
  const { goToCatalog, openQuickView } = useStorefrontUI()

  const featured =
    [...visibleProducts].filter((p) => p.featured).sort((a, b) => b.popularity - a.popularity)[0] ??
    visibleProducts[0]

  return (
    <section id="top" className="relative isolate overflow-hidden bg-obsidian text-ivory">
      <img
        src="/images/hero.png"
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover object-right opacity-70"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/20" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-obsidian to-transparent" />

      <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 pt-16 pb-14 sm:pt-24 lg:grid-cols-[1.3fr_1fr] lg:px-8 lg:pt-28 lg:pb-24">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[0.95] font-medium text-balance sm:text-6xl lg:text-7xl">
            {t("hero.title1")}
            <span className="block italic text-gold">{t("hero.title2")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-pretty text-ivory/75 sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => goToCatalog("unisex")}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gold px-8 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-gold-deep"
            >
              {t("hero.ctaPerfume")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToCatalog("jewelry-women")}
              className="inline-flex h-13 items-center justify-center rounded-full border border-gold/60 px-8 text-sm font-semibold tracking-wide text-gold transition-colors hover:bg-gold/10"
            >
              {t("hero.ctaJewelry")}
            </button>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-ivory/10 pt-6">
            {[
              ["2 500+", t("hero.stat1")],
              ["100%", t("hero.stat2")],
              ["4.9/5", t("hero.stat3")],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-serif text-2xl text-gold tabular-nums sm:text-3xl">{value}</dd>
                <dd className="mt-1 text-[11px] leading-tight text-ivory/60 uppercase tracking-wider">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {featured && (
          <button
            type="button"
            onClick={() => openQuickView(featured.id)}
            className="group w-full max-w-sm justify-self-start rounded-2xl border border-gold/30 bg-charcoal/80 p-4 text-left backdrop-blur-md transition-colors hover:border-gold/70 lg:justify-self-end"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              {t("hero.featured")}
              <span className="flex items-center gap-0.5" aria-label="5/5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-gold text-gold" aria-hidden="true" />
                ))}
              </span>
            </div>
            <div className="mt-4 flex gap-4">
              <img
                src={featured.images[0] || "/placeholder.svg"}
                alt={pick(featured, "name", lang)}
                className="size-24 rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="min-w-0">
                <p className="text-xs text-ivory/55">{featured.brand}</p>
                <p className="mt-1 font-serif text-2xl leading-tight">{pick(featured, "name", lang)}</p>
                <p className="mt-2 text-sm font-semibold text-gold tabular-nums">{formatFCFA(featured.price)}</p>
              </div>
            </div>
            <span className="mt-4 flex items-center gap-1.5 text-xs font-medium text-ivory/70 group-hover:text-gold">
              {t("product.quickView")}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
    </section>
  )
}
