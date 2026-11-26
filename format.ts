import type { Lang, Product } from "./types"

export function formatFCFA(n: number) {
  const rounded = Math.round(n)
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${rounded < 0 ? "-" : ""}${digits} FCFA`
}

export function pick<K extends "name" | "description" | "material">(
  product: Product,
  field: K,
  lang: Lang,
): string {
  const key = `${field}_${lang}` as const
  return (product[key as keyof Product] as string | undefined) ?? ""
}

export function discountPercent(product: Product) {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
}

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}
