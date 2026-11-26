"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, KeyRound } from "lucide-react"
import { LangSwitch } from "@/components/shop/lang-switch"
import { useShop } from "@/lib/store"

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { t, settings } = useShop()
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)

  return (
    <main className="flex min-h-dvh flex-col bg-obsidian text-ivory">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm text-ivory/70 hover:text-gold">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("admin.viewStore")}
        </Link>
        <LangSwitch />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (pin === settings.pin) onSuccess()
            else {
              setError(true)
              setPin("")
            }
          }}
          className="w-full max-w-sm rounded-2xl border border-gold/25 bg-charcoal p-8 text-center"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold/50 text-gold">
            <KeyRound className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-5 font-serif text-3xl text-gold">{settings.storeName}</p>
          <h1 className="mt-1 text-sm font-semibold uppercase tracking-[0.2em]">{t("admin.loginTitle")}</h1>
          <p className="mt-3 text-sm text-ivory/60">{t("admin.loginDesc")}</p>
          <label htmlFor="pin" className="sr-only">
            {t("admin.pin")}
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            autoFocus
            maxLength={8}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""))
              setError(false)
            }}
            placeholder="••••"
            aria-invalid={error}
            aria-describedby="pin-help"
            className="mt-6 h-14 w-full rounded-lg border border-ivory/15 bg-obsidian text-center font-serif text-3xl tracking-[0.5em] text-gold placeholder:text-ivory/20 focus:border-gold focus:outline-none"
          />
          {error && (
            <p className="mt-2 text-sm text-[#f87171]" role="alert">
              {t("admin.pinWrong")}
            </p>
          )}
          <button
            type="submit"
            disabled={pin.length < 4}
            className="mt-5 h-12 w-full rounded-full bg-gold text-sm font-semibold text-obsidian transition-colors hover:bg-gold-deep disabled:opacity-40"
          >
            {t("admin.login")}
          </button>
          <p id="pin-help" className="mt-5 rounded-md border border-dashed border-gold/30 px-3 py-2 text-xs text-ivory/60">
            {t("admin.pinHint")}
          </p>
        </form>
      </div>
    </main>
  )
}
