"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react"
import { formatFCFA, pick } from "@/lib/format"
import { useShop } from "@/lib/store"
import type { Category, Facet, Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useStorefrontUI } from "./storefront-ui"

type Who = "him" | "her" | "couple"
type Occasion = "evening" | "daily" | "prestige"
type Budget = "b1" | "b2" | "b3"

const WHO_CATS: Record<Who, Category[]> = {
  him: ["men", "jewelry-men", "unisex"],
  her: ["women", "jewelry-women", "unisex"],
  couple: ["gifts", "unisex"],
}
const OCCASION_FACETS: Record<Occasion, Facet[]> = {
  evening: ["oud", "ambre", "boise", "or18k"],
  daily: ["floral", "argent925", "acier", "perle"],
  prestige: ["oud", "or18k", "ambre"],
}
const BUDGET: Record<Budget, [number, number]> = {
  b1: [0, 35000],
  b2: [35000, 75000],
  b3: [75000, Infinity],
}

function recommend(products: Product[], who: Who, occasion: Occasion, budget: Budget) {
  const [min, max] = BUDGET[budget]
  const scored = products
    .map((p) => {
      let score = 0
      if (WHO_CATS[who].includes(p.category)) score += 3
      if (p.facets.some((f) => OCCASION_FACETS[occasion].includes(f))) score += 2
      if (occasion === "prestige" && (p.category === "gifts" || p.featured)) score += 2
      if (p.price >= min && p.price < max) score += 4
      if (p.stock > 0) score += 1
      return { p, score: score + p.popularity / 100 }
    })
    .sort((a, b) => b.score - a.score)
  const exact = scored.filter(({ p, score }) => score >= 7 && p.price >= min && p.price < max)
  return { list: (exact.length ? exact : scored).slice(0, 3).map((s) => s.p), exact: exact.length > 0 }
}

export function GiftFinder() {
  const { t, lang, visibleProducts } = useShop()
  const { openQuickView } = useStorefrontUI()
  const [who, setWho] = useState<Who | null>(null)
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)

  const step = !who ? 1 : !occasion ? 2 : !budget ? 3 : 4
  const result = useMemo(
    () => (who && occasion && budget ? recommend(visibleProducts, who, occasion, budget) : null),
    [visibleProducts, who, occasion, budget],
  )

  const restart = () => {
    setWho(null)
    setOccasion(null)
    setBudget(null)
  }
  const back = () => {
    if (budget) setBudget(null)
    else if (occasion) setOccasion(null)
    else setWho(null)
  }

  const questions = {
    1: { title: t("quiz.q1"), options: [["him", t("quiz.him")], ["her", t("quiz.her")], ["couple", t("quiz.couple")]] as const, set: (v: string) => setWho(v as Who) },
    2: { title: t("quiz.q2"), options: [["evening", t("quiz.evening")], ["daily", t("quiz.daily")], ["prestige", t("quiz.prestige")]] as const, set: (v: string) => setOccasion(v as Occasion) },
    3: { title: t("quiz.q3"), options: [["b1", t("quiz.b1")], ["b2", t("quiz.b2")], ["b3", t("quiz.b3")]] as const, set: (v: string) => setBudget(v as Budget) },
  }
  const q = step <= 3 ? questions[step as 1 | 2 | 3] : null

  return (
    <section aria-labelledby="quiz-title" className="bg-obsidian py-16 text-ivory lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:px-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            <Sparkles className="size-4" aria-hidden="true" />
            {t("quiz.eyebrow")}
          </p>
          <h2 id="quiz-title" className="mt-4 font-serif text-4xl font-medium text-balance sm:text-5xl">
            {t("quiz.title")}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-pretty text-ivory/70">{t("quiz.subtitle")}</p>
          <ol className="mt-8 flex gap-2" aria-label={t("quiz.step")}>
            {[1, 2, 3].map((n) => (
              <li
                key={n}
                className={cn("h-1 flex-1 rounded-full transition-colors", step > n ? "bg-gold" : step === n ? "bg-gold/60" : "bg-ivory/15")}
              >
                <span className="sr-only">
                  {t("quiz.step")} {n}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-h-72 rounded-2xl border border-gold/25 bg-charcoal p-5 sm:p-8">
          {q ? (
            <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ivory/55">
                  {t("quiz.step")} {step}/3
                </p>
                {step > 1 && (
                  <button type="button" onClick={back} className="flex items-center gap-1 text-xs font-medium text-ivory/70 hover:text-gold">
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    {t("quiz.back")}
                  </button>
                )}
              </div>
              <h3 className="mt-3 font-serif text-3xl">{q.title}</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {q.options.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => q.set(value)}
                    className="flex min-h-20 items-center justify-center rounded-xl border border-ivory/15 bg-ivory/5 px-4 py-5 text-center font-serif text-xl transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            result && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl text-gold sm:text-3xl">{t("quiz.results")}</h3>
                  <button
                    type="button"
                    onClick={restart}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-ivory/20 px-3 py-2 text-xs font-medium hover:border-gold hover:text-gold"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    {t("quiz.restart")}
                  </button>
                </div>
                {!result.exact && <p className="mt-2 text-sm text-ivory/60">{t("quiz.none")}</p>}
                <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                  {result.list.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => openQuickView(p.id)}
                        className="group flex w-full gap-3 rounded-xl border border-ivory/10 bg-obsidian p-3 text-left transition-colors hover:border-gold/60 sm:flex-col"
                      >
                        <img
                          src={p.images[0] || "/placeholder.svg"}
                          alt={pick(p, "name", lang)}
                          loading="lazy"
                          className="size-20 shrink-0 rounded-lg object-cover sm:aspect-square sm:size-auto sm:w-full"
                        />
                        <span className="flex min-w-0 flex-col justify-center">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/50">{p.brand}</span>
                          <span className="mt-1 font-serif text-lg leading-tight group-hover:text-gold">{pick(p, "name", lang)}</span>
                          <span className="mt-1 text-sm font-semibold text-gold tabular-nums">{formatFCFA(p.price)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
