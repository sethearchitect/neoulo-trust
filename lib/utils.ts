export const fmt = (n: number): string =>
  "₦" + Number(n).toLocaleString("en-NG")

export const pct = (a: number, b: number): number =>
  b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100))

export const initials = (name: string): string =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
