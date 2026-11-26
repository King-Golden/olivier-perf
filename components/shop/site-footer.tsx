"use client"

import Link from "next/link"
import { useState } from "react"
import { Clock, Lock, MapPin, Phone } from "lucide-react"
import { useShop } from "@/lib/store"
import { waLink } from "@/lib/whatsapp"
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./brand-icons"

export function SiteFooter() {
  const { t, lang, settings } = useShop()
  const [vip, setVip] = useState("")
  const [joined, setJoined] = useState(false)
  const phoneDisplay = settings.whatsapp.replace(/^(\d{3})(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "+$1 $2$3 $4 $5 $6")

  return (
    <footer className="bg-obsidian pb-28 text-ivory md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-serif text-3xl font-semibold text-gold">{settings.storeName}</p>
          <p className="mt-4 text-sm leading-relaxed text-ivory/65">{t("footer.tagline")}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("footer.follow")}</p>
          <div className="mt-3 flex gap-2">
            {[
              { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
              { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon },
              { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/80 transition-colors hover:border-gold hover:text-gold"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t("footer.boutiques")}</h2>
          <p className="mt-4 flex gap-2.5 text-sm leading-relaxed text-ivory/75">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            {settings.address}
          </p>
          <h2 className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t("footer.hours")}</h2>
          <p className="mt-4 flex gap-2.5 text-sm leading-relaxed text-ivory/75">
            <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            {lang === "fr" ? settings.hours_fr : settings.hours_en}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t("footer.contact")}</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            <li>
              <a href={`tel:+${settings.whatsapp.replace(/\D/g, "")}`} className="flex items-center gap-2.5 text-ivory/75 hover:text-gold">
                <Phone className="size-4 text-gold" aria-hidden="true" />
                <span className="tabular-nums">{phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                href={waLink(settings.whatsapp, t("wa.concierge"))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-ivory/75 hover:text-gold"
              >
                <WhatsAppIcon className="size-4 text-gold" />
                WhatsApp
              </a>
            </li>
            <li>
              <Link href="/admin" className="flex items-center gap-2.5 text-ivory/50 hover:text-gold">
                <Lock className="size-4" aria-hidden="true" />
                {t("nav.admin")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t("footer.vip")}</h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory/65">{t("footer.vipDesc")}</p>
          {joined ? (
            <p className="mt-4 rounded-md border border-gold/40 px-4 py-3 text-sm text-gold" role="status">
              {t("footer.vipOk")}
            </p>
          ) : (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (vip.replace(/\D/g, "").length < 9) return
                window.open(
                  waLink(settings.whatsapp, `VIP ✨ ${t("footer.vip")} — ${vip}`),
                  "_blank",
                  "noopener,noreferrer",
                )
                setJoined(true)
              }}
            >
              <label htmlFor="vip-phone" className="sr-only">
                {t("footer.vipPh")}
              </label>
              <input
                id="vip-phone"
                type="tel"
                inputMode="tel"
                value={vip}
                onChange={(e) => setVip(e.target.value)}
                placeholder={t("footer.vipPh")}
                className="h-11 min-w-0 flex-1 rounded-full border border-ivory/15 bg-ivory/5 px-4 text-sm placeholder:text-ivory/40 focus:border-gold focus:outline-none"
              />
              <button type="submit" className="h-11 rounded-full bg-gold px-4 text-xs font-semibold text-obsidian hover:bg-gold-deep">
                {t("footer.vipCta")}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-ivory/50 sm:flex-row lg:px-8">
          <p>
            © 2026 {settings.storeName}. {t("footer.rights")}
          </p>
          <p className="flex items-center gap-3">
            <span>Cash</span>·<span>MTN MoMo</span>·<span>Orange Money</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
