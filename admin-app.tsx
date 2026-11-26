"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { LayoutDashboard, LogOut, Package, Receipt, Settings, Store, Tag } from "lucide-react"
import { LangSwitch } from "@/components/shop/lang-switch"
import { useShop } from "@/lib/store"
import { cn } from "@/lib/utils"
import { AdminLogin } from "./admin-login"
import { AdminOrders } from "./admin-orders"
import { AdminOverview } from "./admin-overview"
import { AdminProducts } from "./admin-products"
import { AdminPromos } from "./admin-promos"
import { AdminSettings } from "./admin-settings"

export type AdminTab = "overview" | "products" | "orders" | "promos" | "settings"

const SESSION_KEY = "maison-eclat:admin-session"

export function AdminApp() {
  const { t, settings, orders, isConnected, hydrated } = useShop()
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<AdminTab>("overview")

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1")
  }, [])

  if (!hydrated) return <div className="min-h-dvh bg-obsidian" />

  if (!authed) {
    return (
      <AdminLogin
        onSuccess={() => {
          sessionStorage.setItem(SESSION_KEY, "1")
          setAuthed(true)
        }}
      />
    )
  }

  const pending = orders.filter((o) => o.status === "new").length
  const tabs: { id: AdminTab; icon: typeof Package; badge?: number }[] = [
    { id: "overview", icon: LayoutDashboard },
    { id: "products", icon: Package },
    { id: "orders", icon: Receipt, badge: pending },
    { id: "promos", icon: Tag },
    { id: "settings", icon: Settings },
  ]

  return (
    <div className="min-h-dvh bg-ivory">
      <header className="sticky top-0 z-30 border-b border-gold/15 bg-obsidian text-ivory">
        <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
          <div className="min-w-0">
            <p className="truncate font-serif text-xl font-semibold text-gold">{settings.storeName}</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-ivory/55">{t("admin.title")}</p>
          </div>
          <span
            className={cn(
              "ml-2 hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex",
              isConnected ? "border-[#3f8f4f]/50 text-[#86efac]" : "border-gold/40 text-gold",
            )}
          >
            <span className={cn("size-1.5 rounded-full", isConnected ? "bg-[#4ade80]" : "bg-gold")} aria-hidden="true" />
            {isConnected ? t("admin.connected") : t("admin.demoMode")}
          </span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LangSwitch />
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ivory/75 hover:text-gold"
            >
              <Store className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("admin.viewStore")}</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY)
                setAuthed(false)
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ivory/75 hover:text-gold"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("admin.logout")}</span>
            </button>
          </div>
        </div>
        <nav aria-label={t("admin.title")} className="border-t border-ivory/10 lg:hidden">
          <ul className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
            {tabs.map(({ id, icon: Icon, badge }) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={tab === id ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium whitespace-nowrap",
                    tab === id ? "bg-gold text-obsidian" : "text-ivory/75",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {t(`tab.${id}`)}
                  {badge ? <span className="rounded-full bg-obsidian px-1.5 text-[10px] text-gold">{badge}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="flex">
        <aside className="sticky top-[61px] hidden h-[calc(100dvh-61px)] w-60 shrink-0 border-r border-gold/10 bg-charcoal p-3 lg:block">
          <nav aria-label={t("admin.title")}>
            <ul className="flex flex-col gap-1">
              {tabs.map(({ id, icon: Icon, badge }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={tab === id ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      tab === id ? "bg-gold text-obsidian" : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="flex-1 text-left">{t(`tab.${id}`)}</span>
                    {badge ? (
                      <span className={cn("rounded-full px-2 text-[11px] font-bold", tab === id ? "bg-obsidian text-gold" : "bg-gold text-obsidian")}>
                        {badge}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <h1 className="mb-6 font-serif text-3xl font-semibold sm:text-4xl">{t(`tab.${tab}`)}</h1>
          {tab === "overview" && <AdminOverview onNavigate={setTab} />}
          {tab === "products" && <AdminProducts />}
          {tab === "orders" && <AdminOrders />}
          {tab === "promos" && <AdminPromos />}
          {tab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  )
}
