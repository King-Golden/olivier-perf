"use client"

import { useShop } from "@/lib/store"

export function AnnouncementBar() {
  const { t } = useShop()
  const messages = [t("announce.1"), t("announce.2"), t("announce.3")]
  const loop = [...messages, ...messages]

  return (
    <div className="overflow-hidden border-b border-gold/20 bg-charcoal text-[11px] font-medium uppercase tracking-[0.18em] text-ivory/85 sm:text-xs">
      <p className="sr-only">{messages.join(" • ")}</p>
      <div className="flex w-max animate-marquee py-2.5" aria-hidden="true">
        {loop.map((m, i) => (
          <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
            {m}
            <span className="size-1 rounded-full bg-gold" />
          </span>
        ))}
      </div>
    </div>
  )
}
