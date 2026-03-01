"use client"

import { useState } from "react"

interface InputProps {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
  required?: boolean
}

export function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col">
      <label className="font-mono text-[10px] uppercase tracking-[1.4px] text-[#7A7A7A] mb-[5px]">
        {label}
        {required && <span className="text-[#8B2500] ml-[2px]">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-[9px] rounded-[9px] border text-[13px] bg-white outline-none transition-colors font-sans text-[#1A1A1A] placeholder:text-[#7A7A7A]"
        style={{
          borderColor: focused ? "#0D3B20" : "#EDE7D6",
        }}
      />
    </div>
  )
}
