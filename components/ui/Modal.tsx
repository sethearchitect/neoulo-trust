"use client"

import { useEffect, type ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}

export function Modal({ open, onClose, title, children, wide = false }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/45 z-[1000] flex items-end justify-center"
      style={{ animation: "fadeIn 0.2s ease" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-[20px_20px_0_0] w-full max-h-[88vh] flex flex-col"
        style={{
          maxWidth: wide ? 820 : 540,
          animation: "slideUp 0.28s ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#EDE7D6]">
          <h2 className="font-serif text-[18px] font-bold text-[#0D3B20]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EDE7D6] text-[#4A4A4A] text-[16px] hover:bg-[#E0D9C6] transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 md:p-[18px_22px_24px]">{children}</div>
      </div>
    </div>
  )
}
