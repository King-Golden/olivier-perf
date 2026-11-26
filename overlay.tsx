"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface OverlayProps {
  open: boolean
  onClose: () => void
  label: string
  variant?: "right" | "center"
  className?: string
  children: React.ReactNode
}

export function Overlay({ open, onClose, label, variant = "center", className, children }: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
      prevFocus?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex",
        variant === "right" ? "justify-end" : "items-end justify-center sm:items-center sm:p-6",
      )}
    >
      <div
        className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-full flex-col overflow-hidden bg-ivory text-obsidian shadow-2xl outline-none",
          variant === "right"
            ? "h-full w-full max-w-md animate-in slide-in-from-right duration-300"
            : "max-h-[92dvh] w-full max-w-4xl rounded-t-2xl animate-in slide-in-from-bottom-8 fade-in duration-300 sm:rounded-xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
