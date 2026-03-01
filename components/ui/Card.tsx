"use client"

import type { CSSProperties, ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  style?: CSSProperties
}

export function Card({ children, className = "", onClick, style }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-2xl border border-[#EDE7D6] shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
        onClick ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
