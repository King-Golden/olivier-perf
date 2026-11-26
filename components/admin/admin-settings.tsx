"use client"

import { useState } from "react"
import { Database, Download, PlugZap, RotateCcw } from "lucide-react"
import { api, resolveBaseUrl } from "@/lib/api"
import { useShop } from "@/lib/store"
import type { StoreSettings } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Field, Panel, btnGhost, btnPrimary, inputCls } from "./ui"

type TestState = "idle" | "testing" | "ok" | "fail"

export function AdminSettings() {
  const { t, settings, setSettings, products, orders, promos, delivery, isConnected, resetAll } = useShop()
  const [form, setForm] = useState<StoreSettings>(settings)
  const [newPin, setNewPin] = useState("")
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [test, setTest] = useState<TestState>("idle")
  const [testDetail, setTestDetail] = useState("")

  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPin && !/^\d{4,8}$/.test(newPin)) {
      setMsg({ ok: false, text: t("set.pinInvalid") })
      return
    }
    setSettings({ ...form, whatsapp: form.whatsapp.replace(/\D/g, ""), pin: newPin || form.pin })
    setNewPin("")
    setMsg({ ok: true, text: t("set.saved") })
    setTimeout(() => setMsg(null), 2500)
  }

  const testConnection = async () => {
    const baseUrl = resolveBaseUrl(form.apiUrl)
    if (!baseUrl) {
      setTest("fail")
      setTestDetail(t("admin.demoMode"))
      return
    }
    setTest("testing")
    try {
      const res = await api.health({ baseUrl, secret: form.apiSecret })
      setTest(res?.ok === false ? "fail" : "ok")
      setTestDetail(baseUrl)
    } catch (err) {
      setTest("fail")
      setTestDetail(err instanceof Error ? err.message : String(err))
    }
  }

  const exportBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      store: { ...settings, pin: undefined, apiSecret: undefined },
      products,
      orders,
      promos,
      delivery,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `backup-${settings.storeName.toLowerCase().replace(/\W+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const text = (k: keyof StoreSettings, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <Field label={label} htmlFor={`s-${k}`}>
      <input id={`s-${k}`} className={inputCls} value={String(form[k] ?? "")} onChange={(e) => set(k, e.target.value)} {...extra} />
    </Field>
  )

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <form onSubmit={save} className="flex flex-col gap-6">
        <Panel title={t("set.store")}>
          <div className="grid gap-4 md:grid-cols-2">
            {text("storeName", t("set.storeName"))}
            {text("whatsapp", t("set.whatsapp"), { inputMode: "tel" })}
            {text("momoNumber", t("set.momo"), { inputMode: "tel" })}
            {text("omNumber", t("set.om"), { inputMode: "tel" })}
            <div className="md:col-span-2">{text("address", t("set.address"))}</div>
            {text("hours_fr", t("set.hoursFr"))}
            {text("hours_en", t("set.hoursEn"))}
          </div>
        </Panel>
        <Panel title={t("set.social")}>
          <div className="grid gap-4 md:grid-cols-3">
            {text("instagram", "Instagram", { type: "url" })}
            {text("tiktok", "TikTok", { type: "url" })}
            {text("facebook", "Facebook", { type: "url" })}
          </div>
        </Panel>
        <Panel title={t("set.security")}>
          <Field label={t("set.newPin")} htmlFor="s-pin">
            <input
              id="s-pin"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={8}
              className={cn(inputCls, "max-w-xs tracking-[0.4em]")}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
        </Panel>
        <div className="flex items-center gap-3">
          <button type="submit" className={btnPrimary}>{t("set.save")}</button>
          {msg && (
            <span role="status" className={cn("text-sm font-semibold", msg.ok ? "text-[#2f6b3a]" : "text-[#b42318]")}>
              {msg.text}
            </span>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-gold/30 bg-obsidian p-5 text-ivory">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full border border-gold/50 text-gold">
              <Database className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold">{t("set.api")}</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ivory/65">{t("set.apiDesc")}</p>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-ivory/10 bg-charcoal px-3 py-2.5 text-sm">
            <span className="text-ivory/60">{t("set.status")} :</span>
            <span className={cn("size-2 rounded-full", isConnected ? "bg-[#4ade80]" : "bg-gold")} aria-hidden="true" />
            <span className="font-semibold">{isConnected ? t("admin.connected") : t("admin.demoMode")}</span>
          </div>

          <div className="mt-4 flex flex-col gap-4 [&_label]:text-ivory">
            <Field label={t("set.apiUrl")} htmlFor="s-api">
              <input
                id="s-api"
                type="url"
                placeholder="https://boutique-api.votre-compte.workers.dev"
                className={cn(inputCls, "border-ivory/15 bg-charcoal font-mono text-ivory placeholder:text-ivory/30")}
                value={form.apiUrl}
                onChange={(e) => set("apiUrl", e.target.value)}
              />
            </Field>
            <Field label={t("set.apiSecret")} htmlFor="s-secret">
              <input
                id="s-secret"
                type="password"
                autoComplete="off"
                className={cn(inputCls, "border-ivory/15 bg-charcoal font-mono text-ivory")}
                value={form.apiSecret}
                onChange={(e) => set("apiSecret", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={testConnection}
              disabled={test === "testing"}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-obsidian hover:bg-gold-deep disabled:opacity-60"
            >
              <PlugZap className="size-4" aria-hidden="true" />
              {test === "testing" ? t("set.testing") : t("set.test")}
            </button>
            <button
              type="button"
              onClick={() => {
                setSettings({ ...settings, apiUrl: form.apiUrl.trim(), apiSecret: form.apiSecret })
                setMsg({ ok: true, text: t("set.saved") })
                setTimeout(() => setMsg(null), 2500)
              }}
              className="inline-flex h-11 items-center rounded-full border border-gold/50 px-5 text-sm font-semibold text-gold hover:bg-gold/10"
            >
              {t("prod.save")}
            </button>
          </div>
          {test !== "idle" && test !== "testing" && (
            <p role="status" className={cn("mt-3 text-sm font-medium", test === "ok" ? "text-[#86efac]" : "text-[#fca5a5]")}>
              {test === "ok" ? t("set.testOk") : t("set.testFail")}
              {testDetail && <span className="block truncate text-xs font-normal text-ivory/50">{testDetail}</span>}
            </p>
          )}
        </section>

        <Panel title={t("set.export")}>
          <p className="text-sm text-muted-foreground">{t("set.exportDesc")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={exportBackup} className={btnPrimary}>
              <Download className="size-4 text-gold" aria-hidden="true" />
              {t("set.export")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t("set.resetConfirm"))) {
                  resetAll()
                  setForm((f) => ({ ...f, pin: "2026" }))
                }
              }}
              className={btnGhost}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("set.reset")}
            </button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
