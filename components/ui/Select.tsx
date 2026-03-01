"use client"

import { useState } from "react"

interface SelectProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: string[]
}

export function Select({ label, value, onChange, options }: SelectProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col">
      <label className="font-mono text-[10px] uppercase tracking-[1.4px] text-[#7A7A7A] mb-[5px]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-[9px] rounded-[9px] border text-[13px] bg-white outline-none transition-colors font-sans text-[#1A1A1A] appearance-none"
        style={{
          borderColor: focused ? "#0D3B20" : "#EDE7D6",
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
