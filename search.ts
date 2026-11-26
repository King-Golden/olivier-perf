import { normalize } from "./format"
import { translate } from "./i18n"
import type { Product } from "./types"

export function matchesQuery(p: Product, query: string) {
  const q = normalize(query.trim())
  if (!q) return true
  const haystack = normalize(
    [
      p.name_fr,
      p.name_en,
      p.brand,
      p.sku,
      p.material_fr,
      p.material_en,
      ...(p.notes_fr ? [...p.notes_fr.top, ...p.notes_fr.heart, ...p.notes_fr.base] : []),
      ...(p.notes_en ? [...p.notes_en.top, ...p.notes_en.heart, ...p.notes_en.base] : []),
      ...p.facets.flatMap((f) => [translate("fr", `facet.${f}`), translate("en", `facet.${f}`)]),
    ]
      .filter(Boolean)
      .join(" "),
  )
  return q.split(/\s+/).every((word) => haystack.includes(word))
}
