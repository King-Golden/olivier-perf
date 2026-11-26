"use client"

import { CreditCard, ShieldCheck, Truck } from "lucide-react"
import { useShop } from "@/lib/store"
import { WhatsAppIcon } from "./brand-icons"

export function TrustStrip() {
  const { t } = useShop()
  const items = [
    { icon: ShieldCheck, title: t("trust.auth.title"), desc: t("trust.auth.desc") },
    { icon: Truck, title: t("trust.delivery.title"), desc: t("trust.delivery.desc") },
    { icon: CreditCard, title: t("trust.pay.title"), desc: t("trust.pay.desc") },
    { icon: WhatsAppIcon, title: t("trust.vip.title"), desc: t("trust.vip.desc") },
  ]

  return (
    <section aria-label="Garanties" className="border-y border-gold/15 bg-charcoal text-ivory">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-ivory/5 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex flex-col gap-3 bg-charcoal px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:py-8">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-snug">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ivory/60">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
