"use client"

import { useShop } from "@/lib/store"
import { cn } from "@/lib/utils"

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useShop()
  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={cn("flex items-center rounded-full border border-gold/40 p-0.5 text-xs font-semibold", className)}
    >
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase tracking-wider transition-colors",
            lang === l ? "bg-gold text-obsidian" : "text-ivory/70 hover:text-gold",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
