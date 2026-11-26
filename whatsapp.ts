import { formatFCFA, pick } from "./format"
import { translate } from "./i18n"
import type { Lang, Order, Product } from "./types"

export function waLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function customerWaNumber(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("237") ? digits : `237${digits}`
}

export function openWhatsApp(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

export function buildSingleItemMessage(product: Product, lang: Lang, store: string, variant?: string) {
  const t = (k: Parameters<typeof translate>[1], v?: Record<string, string>) => translate(lang, k, v)
  return [
    t("wa.greeting", { store }),
    "",
    t("wa.single"),
    `🛍️ *${pick(product, "name", lang)}* — ${product.brand}`,
    variant ? `▫️ ${variant}` : null,
    `💰 ${formatFCFA(product.price)}`,
    `🔖 SKU : ${product.sku}`,
    "",
    t("wa.singleAsk"),
  ]
    .filter((l) => l !== null)
    .join("\n")
}

export function buildOrderMessage(order: Order, store: string) {
  const lang = order.lang
  const t = (k: Parameters<typeof translate>[1], v?: Record<string, string>) => translate(lang, k, v)
  const cityLabel = t(`city.${order.customer.city === "other" ? "otherShort" : order.customer.city}` as Parameters<typeof translate>[1])
  const lines = [
    t("wa.greeting", { store }),
    t("wa.newOrder"),
    "",
    `🧾 *${t("wa.order")} #${order.ref}*`,
    "",
    `🛍️ *${t("wa.items")} :*`,
    ...order.items.map(
      (i) =>
        `• ${i.qty} × ${lang === "fr" ? i.name_fr : i.name_en}${i.variant && i.variant !== "—" ? ` (${i.variant})` : ""} — ${formatFCFA(i.unitPrice * i.qty)}`,
    ),
    "",
    `${t("cart.subtotal")} : ${formatFCFA(order.subtotal)}`,
    order.discount > 0 ? `🎁 ${t("cart.discount")} (${order.promoCode}) : -${formatFCFA(order.discount)}` : null,
    `🚚 ${t("cart.delivery")} : ${order.delivery === 0 ? t("cart.free") : formatFCFA(order.delivery)}`,
    `💰 *${t("cart.total")} : ${formatFCFA(order.total)}*`,
    "",
    `👤 *${t("wa.customer")} :* ${order.customer.name}`,
    `📞 ${order.customer.phone}`,
    `📍 *${t("wa.address")} :* ${cityLabel} — ${order.customer.quartier}`,
    `💳 *${t("wa.payment")} :* ${t(`pay.${order.payment}`)}`,
    order.giftNote ? `💌 *${t("wa.giftNote")} :* "${order.giftNote}"` : null,
    "",
    t("wa.thanks"),
  ]
  return lines.filter((l) => l !== null).join("\n")
}

export function buildStatusMessage(order: Order, lang: Lang, store: string) {
  return translate(lang, `ord.msg.${order.status}`, {
    name: order.customer.name.split(" ")[0],
    ref: order.ref,
    store,
    quartier: order.customer.quartier,
    total: formatFCFA(order.total),
  })
}
