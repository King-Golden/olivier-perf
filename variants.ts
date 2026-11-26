import { translate } from "./i18n"
import type { CartItem, Concentration, Lang, Product } from "./types"

export const GIFT_BOX_PRICE = 2500

export interface VariantSelection {
  volume?: string
  concentration?: Concentration
  size?: string
  giftBox?: boolean
}

export function defaultSelection(product: Product): VariantSelection {
  return {
    volume: product.volumes?.[0]?.label,
    concentration: product.concentrations?.[0],
    size: product.sizes?.[0],
    giftBox: false,
  }
}

export function unitPrice(product: Product, sel: VariantSelection) {
  let price = product.volumes?.find((v) => v.label === sel.volume)?.price ?? product.price
  if (sel.concentration === "extrait" && product.concentrations?.includes("edp")) {
    price += product.extraitSurcharge ?? 0
  }
  if (sel.giftBox) price += GIFT_BOX_PRICE
  return price
}

export function sizeLabel(size: string, lang: Lang) {
  return size === "adjustable" ? translate(lang, "product.adjustable") : size
}

export function variantLabel(item: Pick<CartItem, "volume" | "concentration" | "size" | "giftBox">, lang: Lang) {
  const parts: string[] = []
  if (item.volume) parts.push(item.volume)
  if (item.concentration) parts.push(item.concentration === "edp" ? "EDP" : "Extrait")
  if (item.size) parts.push(sizeLabel(item.size, lang))
  if (item.giftBox) parts.push(translate(lang, "cart.giftBox"))
  return parts.join(" · ") || "—"
}
