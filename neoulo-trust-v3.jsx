import { useState, useEffect, useRef } from "react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const G = {
  forest: "#0D3B20", forestLight: "#1A5C34", forestMid: "#145229",
  cream: "#F5F0E8", creamDark: "#EDE7D6", creamMid: "#E0D9C6",
  gold: "#C9A84C", goldLight: "#E8C96A", goldDim: "rgba(201,168,76,0.12)",
  text: "#1A1A1A", textMid: "#4A4A4A", textLight: "#7A7A7A",
  white: "#FFFFFF", success: "#2D7A4F", warn: "#B8860B", danger: "#8B2500",
};

// ─── Responsive ───────────────────────────────────────────────────────────────
const useIsMob = () => {
  const [v, setV] = useState(typeof window !== "undefined" ? window.innerWidth < 720 : false);
  useEffect(() => { const h = () => setV(window.innerWidth < 720); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return v;
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: 'DM Sans', sans-serif; background: ${G.cream}; -webkit-font-smoothing: antialiased; color: ${G.text}; }
    button { cursor: pointer; font-family: inherit; }
    input, select, textarea { font-family: inherit; }
    a { text-decoration: none; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-thumb { background: ${G.creamMid}; border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes slideUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
    @keyframes expand { from { opacity:0; max-height:0; overflow:hidden; } to { opacity:1; max-height:600px; } }
    .fu  { animation: fadeUp 0.32s ease both; }
    .fu2 { animation: fadeUp 0.32s 0.07s ease both; }
    .fu3 { animation: fadeUp 0.32s 0.14s ease both; }
    .lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
    .nbg:hover { background: rgba(255,255,255,0.1) !important; }
    .row-hover:hover { background: ${G.cream}; }
    .expand { animation: expand 0.22s ease both; overflow: hidden; }
    @media (max-width:720px) {
      .g1 { grid-template-columns: 1fr !important; }
      .g2 { grid-template-columns: 1fr 1fr !important; }
      .g4 { grid-template-columns: 1fr 1fr !important; }
      .hide-m { display: none !important; }
    }
  `}</style>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = (n) => "₦" + Number(n).toLocaleString("en-NG");
const pct  = (a, b) => b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100));
const ini  = (name) => name.split(" ").map(w => w[0]).join("").toUpperCase();
const uid  = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// ─── Status colours ───────────────────────────────────────────────────────────
const SC = {
  draft:          { bg: "#232323", fg: "#999" },
  open:           { bg: "#0F2E4A", fg: "#7AC0FF" },
  funded:         { bg: "#0F2E18", fg: "#6AEFAA" },
  forwarded:      { bg: "#2E0F2E", fg: "#D07AFF" },
  reviewing:      { bg: "#2E1F00", fg: "#FFD06A" },
  asset_selected: { bg: "#0F1F2E", fg: "#7ACFFF" },
  deployed:       { bg: "#2E1F00", fg: "#FFD06A" },
  yielding:       { bg: "#0F2E20", fg: "#7AFFCF" },
  settled:        { bg: "#1A1A2E", fg: "#B07AFF" },
  active:         { bg: "#0F2E18", fg: "#6AEFAA" },
  forming:        { bg: "#0F1F2E", fg: "#7AC0FF" },
  harvested:      { bg: "#0F2E20", fg: "#7AFFCF" },
  pending:        { bg: "#2E2000", fg: "#FFAA44" },
  confirmed:      { bg: "#0F2E18", fg: "#6AEFAA" },
};
const sc = (s) => SC[s] || { bg: "#333", fg: "#aaa" };

// ─── Initial data ─────────────────────────────────────────────────────────────
const SEED_CELLS = [
  {
    id: "C001", name: "Umuahia Alpha Cell", location: "Umuahia North", state: "Abia",
    formed: "Aug 2025", status: "active", lat: 5.524, lng: 7.493,
    members: [
      { id: "M001", name: "Emeka Okafor",    role: "lead",   profession: "University Lecturer", joined: "Aug 2025", phone: "+234 803 xxx 0001", email: "emeka@fedpoly.edu.ng" },
      { id: "M002", name: "Ngozi Eze",       role: "member", profession: "Nurse",               joined: "Aug 2025", phone: "+234 807 xxx 0002", email: "ngozi@fmc.gov.ng"      },
      { id: "M003", name: "Chidi Nwachukwu", role: "member", profession: "Civil Servant",       joined: "Sep 2025", phone: "+234 805 xxx 0003", email: "chidi@abia.gov.ng"     },
      { id: "M004", name: "Adaeze Obi",      role: "member", profession: "Teacher",             joined: "Sep 2025", phone: "+234 806 xxx 0004", email: "adaeze@school.edu.ng"  },
      { id: "M005", name: "Ikenna Uche",     role: "member", profession: "Pharmacist",          joined: "Oct 2025", phone: "+234 813 xxx 0005", email: "ikenna@pharma.ng"      },
      { id: "M006", name: "Chioma Nnadi",    role: "member", profession: "Accountant",          joined: "Oct 2025", phone: "+234 809 xxx 0006", email: "chioma@coop.ng"        },
    ],
    rin: {
      id: "RIN-2025-001", target: 2500000, status: "deployed",
      opened: "Aug 10, 2025", deployed: "Sep 1, 2025", expectedReturn: "Feb 28, 2026",
      returnRate: 18, assetNode: "1-Acre Tomato Farm — Plot 4, Umuahia Industrial Farms",
      notes: "Drip-irrigated tomato farm, Umuahia North",
    },
    farm: {
      crop: "Tomatoes", plot: "1 acre", irrigationType: "Drip Irrigation",
      cycles: [{
        id: "FC001", season: "Dry Season 2025", planted: "Sep 5, 2025", status: "harvested",
        yields: [
          { id: "Y1", date: "Nov 15, 2025", qty: "480 kg", value: 240000, marketPrice: "₦500/kg", buyer: "Umuahia Central Market", notes: "First harvest – good quality" },
          { id: "Y2", date: "Nov 28, 2025", qty: "620 kg", value: 310000, marketPrice: "₦500/kg", buyer: "Aba Produce Depot",       notes: "Second harvest – premium grade" },
        ],
        expenses: [
          { id: "E1", date: "Sep 5,  2025", item: "Seedlings",        amount: 45000, vendor: "Abia Agro Supplies", receipt: "RCT-001" },
          { id: "E2", date: "Sep 10, 2025", item: "Fertiliser (1st)", amount: 32000, vendor: "Farm Input Store",   receipt: "RCT-002" },
          { id: "E3", date: "Oct 15, 2025", item: "Pesticide",        amount: 18000, vendor: "Farm Input Store",   receipt: "RCT-003" },
          { id: "E4", date: "Nov 5,  2025", item: "Fertiliser (2nd)", amount: 30000, vendor: "Abia Agro Supplies", receipt: "RCT-004" },
        ],
      }],
    },
  },
  {
    id: "C002", name: "Aba Beta Cell", location: "Aba South", state: "Abia",
    formed: "Oct 2025", status: "forming", lat: 5.107, lng: 7.367,
    members: [
      { id: "M007", name: "Obinna Kalu",     role: "lead",   profession: "Engineer", joined: "Oct 2025", phone: "+234 803 xxx 0007", email: "obinna@eng.ng"   },
      { id: "M008", name: "Ifeoma Okonkwo",  role: "member", profession: "Teacher",  joined: "Nov 2025", phone: "+234 807 xxx 0008", email: "ifeoma@school.ng" },
      { id: "M009", name: "Uche Nwosu",      role: "member", profession: "Nurse",    joined: "Nov 2025", phone: "+234 805 xxx 0009", email: "uche@fmc.ng"      },
    ],
    rin: {
      id: "RIN-2025-002", target: 3000000, status: "forwarded",
      opened: "Nov 1, 2025", deployed: null, expectedReturn: null,
      returnRate: 18, assetNode: null,
      notes: "Pepper & leafy vegetable agribusiness — Aba South",
    },
    farm: null,
  },
  {
    id: "C003", name: "Enugu Gamma Cell", location: "Enugu North", state: "Enugu",
    formed: "Jan 2026", status: "forming", lat: 6.458, lng: 7.546,
    members: [
      { id: "M010", name: "Chukwuemeka Ani", role: "lead",   profession: "Doctor",       joined: "Jan 2026", phone: "+234 803 xxx 0010", email: "emeka.ani@unec.ng" },
      { id: "M011", name: "Amaka Ugwu",      role: "member", profession: "Civil Servant", joined: "Jan 2026", phone: "+234 807 xxx 0011", email: "amaka@enugu.gov.ng" },
    ],
    rin: {
      id: "RIN-2026-001", target: 2500000, status: "open",
      opened: "Jan 15, 2026", deployed: null, expectedReturn: null,
      returnRate: 18, assetNode: null, notes: "Scoping phase — asset TBD",
    },
    farm: null,
  },
];

// Seed contributions keyed by memberId
const SEED_CONTRIBS = {
  M001: [
    { id: "C-M001-1", date: "Aug 15, 2025", amount: 150000, method: "Bank Transfer", ref: "TRF-0815-001", note: "Initial contribution",  status: "confirmed", confirmedBy: "Self (Lead)" },
    { id: "C-M001-2", date: "Sep 5,  2025", amount: 100000, method: "Bank Transfer", ref: "TRF-0905-001", note: "Second instalment",     status: "confirmed", confirmedBy: "Self (Lead)" },
    { id: "C-M001-3", date: "Oct 3,  2025", amount: 100000, method: "Cash",          ref: "CSH-1003-001", note: "Top-up",                status: "confirmed", confirmedBy: "Self (Lead)" },
  ],
  M002: [
    { id: "C-M002-1", date: "Aug 15, 2025", amount: 100000, method: "Bank Transfer", ref: "TRF-0815-002", note: "Initial contribution",  status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" },
    { id: "C-M002-2", date: "Sep 3,  2025", amount: 100000, method: "Bank Transfer", ref: "TRF-0903-001", note: "Second instalment",     status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" },
    { id: "C-M002-3", date: "Oct 1,  2025", amount:  50000, method: "Cash",          ref: "CSH-1001-001", note: "Top-up",                status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" },
  ],
  M003: [
    { id: "C-M003-1", date: "Sep 5,  2025", amount: 200000, method: "Bank Transfer", ref: "TRF-0905-002", note: "Initial contribution",  status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" },
    { id: "C-M003-2", date: "Oct 10, 2025", amount: 100000, method: "Bank Transfer", ref: "TRF-1010-001", note: "Second instalment",     status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" },
  ],
  M004: [{ id: "C-M004-1", date: "Sep 10, 2025", amount: 200000, method: "Bank Transfer", ref: "TRF-0910-001", note: "Initial contribution", status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" }],
  M005: [{ id: "C-M005-1", date: "Oct 5,  2025", amount: 250000, method: "Bank Transfer", ref: "TRF-1005-001", note: "Initial contribution", status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" }],
  M006: [{ id: "C-M006-1", date: "Oct 20, 2025", amount: 150000, method: "Cash",          ref: "CSH-1020-001", note: "Initial contribution", status: "confirmed", confirmedBy: "Emeka Okafor (Lead)" }],
};

const GROWTH_DATA = [
  { m: "Aug", cells: 1, fam: 6 }, { m: "Sep", cells: 1, fam: 6 },
  { m: "Oct", cells: 2, fam: 9 }, { m: "Nov", cells: 2, fam: 9 },
  { m: "Dec", cells: 2, fam: 9 }, { m: "Jan", cells: 3, fam: 11 },
  { m: "Feb", cells: 3, fam: 11 },
];

const YIELD_DATA = [
  { m: "Nov '25", actual: 550000, forecast: 500000 },
  { m: "Dec '25", actual: null,   forecast: 620000 },
  { m: "Jan '26", actual: null,   forecast: 760000 },
  { m: "Feb '26", actual: null,   forecast: 920000 },
  { m: "Mar '26", actual: null,   forecast: 1150000 },
];

const SUGGESTED_NODES = [
  { id: "N1", name: "Tomato Farm Plot A — Umuahia Industrial", type: "Crop Farm",       returnRate: "18%", suitability: 96 },
  { id: "N2", name: "Pepper Greenhouse — Aba East",             type: "Greenhouse",      returnRate: "21%", suitability: 88 },
  { id: "N3", name: "Leafy Greens Hub — Umuahia South",         type: "Mixed Farm",      returnRate: "15%", suitability: 74 },
];

// ─── UI Primitives ────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const c = sc(status);
  return <span style={{ background: c.bg, color: c.fg, fontSize: 10, fontWeight: 700, letterSpacing: 1.1, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", fontFamily: "DM Mono, monospace", whiteSpace: "nowrap", display: "inline-block" }}>{status.replace(/_/g, " ")}</span>;
};

const Card = ({ children, style = {}, onClick, cls = "" }) => (
  <div className={cls} onClick={onClick}
    style={{ background: G.white, borderRadius: 16, padding: 20, border: `1px solid ${G.creamDark}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", ...(onClick ? { cursor: "pointer" } : {}), ...style }}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, accent, onClick, note }) => (
  <Card onClick={onClick} cls="lift" style={{ background: accent ? G.forest : G.white, cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden" }}>
    {onClick && <span style={{ position: "absolute", top: 13, right: 14, fontSize: 14, color: accent ? "rgba(255,255,255,0.2)" : G.creamMid }}>↗</span>}
    {note && <span style={{ position: "absolute", top: 13, right: 14, fontSize: 10, color: accent ? "rgba(255,255,255,0.35)" : G.textLight, fontFamily: "DM Mono" }}>{note}</span>}
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: accent ? "rgba(255,255,255,0.5)" : G.textLight, marginBottom: 8, fontFamily: "DM Mono, monospace" }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 700, color: accent ? G.white : G.forest, fontFamily: "'DM Serif Display', serif", lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.45)" : G.textLight, marginTop: 6 }}>{sub}</div>}
  </Card>
);

const PBar = ({ value, max, color = G.gold, h = 8 }) => (
  <div style={{ background: G.creamDark, borderRadius: 99, height: h, overflow: "hidden" }}>
    <div style={{ width: `${pct(value, max)}%`, background: color, borderRadius: 99, height: "100%", transition: "width 0.6s ease" }} />
  </div>
);

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 4, background: G.creamDark, borderRadius: 12, padding: 4, marginBottom: 20, overflowX: "auto" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ flex: "0 0 auto", padding: "8px 14px", borderRadius: 9, border: "none", background: active === t.id ? G.forest : "transparent", color: active === t.id ? G.white : G.textMid, fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>{t.label}</button>
    ))}
  </div>
);

const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 99, border: `1px solid ${active ? G.forest : G.creamMid}`, background: active ? G.forest : G.white, color: active ? G.white : G.textMid, fontSize: 12, fontWeight: active ? 600 : 400, transition: "all 0.15s", whiteSpace: "nowrap" }}>{label}</button>
);

const Av = ({ name, size = 36, color = G.forest }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: G.white, fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{ini(name)}</div>
);

const SHead = ({ title, sub, right, back }) => (
  <div style={{ marginBottom: 20 }}>
    {back && (
      <button onClick={back} style={{ background: "none", border: "none", padding: "0 0 10px", color: G.textLight, fontSize: 13, display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
        ← Back
      </button>
    )}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: G.forest, fontFamily: "'DM Serif Display', serif" }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: G.textLight, marginTop: 4 }}>{sub}</p>}
      </div>
      {right}
    </div>
  </div>
);

const Divider = ({ my = 14 }) => <div style={{ height: 1, background: G.creamDark, margin: `${my}px 0` }} />;

const Label = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: G.textLight, fontFamily: "DM Mono, monospace", marginBottom: 5 }}>{children}</div>
);

const InfoGrid = ({ rows }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    {rows.map(([l, v]) => (
      <div key={l} style={{ background: G.cream, borderRadius: 10, padding: "10px 12px" }}>
        <Label>{l}</Label>
        <div style={{ fontSize: 13, fontWeight: 600, color: G.text, wordBreak: "break-all" }}>{v}</div>
      </div>
    ))}
  </div>
);

const Input = ({ label, type = "text", placeholder, value, onChange, required }) => (
  <div>
    <Label>{label}{required && <span style={{ color: G.danger }}> *</span>}</Label>
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${G.creamDark}`, fontSize: 13, outline: "none", background: G.white, transition: "border-color 0.15s" }}
      onFocus={e => e.target.style.borderColor = G.forest}
      onBlur={e => e.target.style.borderColor = G.creamDark} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <Label>{label}</Label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${G.creamDark}`, fontSize: 13, outline: "none", background: G.white, appearance: "none" }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const PinDot = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z" fill={G.gold} stroke={G.warn} strokeWidth="0.8"/>
    <circle cx="12" cy="8" r="2.2" fill="white"/>
  </svg>
);

const GeomBg = ({ op = 0.06 }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <defs><pattern id="gp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      {[0,1,2,3,4,5].map(i => { const a = (i * Math.PI) / 3; return <circle key={i} cx={30 + 20*Math.cos(a)} cy={30 + 20*Math.sin(a)} r="20" fill="none" stroke="white" strokeWidth="0.7"/>; })}
      <circle cx="30" cy="30" r="20" fill="none" stroke="white" strokeWidth="0.7"/>
    </pattern></defs>
    <rect width="100%" height="100%" fill="url(#gp)" opacity={op}/>
  </svg>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, wide = false }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.white, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: wide ? 820 : 540, maxHeight: "88vh", display: "flex", flexDirection: "column", animation: "slideUp 0.28s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 14px", borderBottom: `1px solid ${G.creamDark}`, flexShrink: 0 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: G.forest }}>{title}</h3>
          <button onClick={onClose} style={{ background: G.creamDark, border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 18, color: G.textMid, lineHeight: "28px" }}>×</button>
        </div>
        <div style={{ padding: "18px 22px 24px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── Confirm dialog ───────────────────────────────────────────────────────────
const Confirm = ({ message, onYes, onNo, yesLabel = "Confirm", yesStyle }) => (
  <Card style={{ border: `2px solid ${G.gold}`, marginTop: 14 }}>
    <div style={{ fontWeight: 700, color: G.forest, marginBottom: 8, fontSize: 14 }}>Confirm action</div>
    <p style={{ fontSize: 13, color: G.textMid, marginBottom: 14, lineHeight: 1.6 }}>{message}</p>
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={onYes} style={{ background: yesStyle || G.forest, color: G.white, border: "none", borderRadius: 9, padding: "9px 20px", fontWeight: 600, fontSize: 13 }}>{yesLabel}</button>
      <button onClick={onNo} style={{ background: G.creamDark, border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13 }}>Cancel</button>
    </div>
  </Card>
);

// ─── Mini sparkline ───────────────────────────────────────────────────────────
const Sparkline = ({ data, valueKey, color = G.forest, height = 60 }) => {
  const vals = data.map(d => d[valueKey]);
  const mx = Math.max(...vals); const mn = Math.min(...vals);
  const W = 260; const H = height; const pad = 6;
  const xs = (i) => (i / (vals.length - 1)) * (W - pad * 2) + pad;
  const ys = (v) => H - pad - ((v - mn) / (mx - mn || 1)) * (H - pad * 2);
  const path = vals.map((v, i) => `${i === 0 ? "M" : "L"}${xs(i)},${ys(v)}`).join(" ");
  const fill = path + ` L${xs(vals.length-1)},${H} L${xs(0)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <path d={fill} fill={color} opacity="0.12"/>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>
      {vals.map((v, i) => <circle key={i} cx={xs(i)} cy={ys(v)} r="3" fill={color}/>)}
    </svg>
  );
};

// ─── Yield Forecast chart ─────────────────────────────────────────────────────
const YieldForecastView = ({ onBack }) => (
  <div className="fu">
    <SHead title="Yield Forecast" sub="Actual vs projected yield value — market intelligence base layer" back={onBack} />
    <Card style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, color: G.forest, marginBottom: 4, fontSize: 14 }}>Portfolio Yield Trajectory</div>
      <div style={{ fontSize: 12, color: G.textLight, marginBottom: 16 }}>Actual (solid) vs Forecast (dashed) across active cells</div>
      <Sparkline data={YIELD_DATA} valueKey="forecast" color={G.gold} height={90} />
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        {YIELD_DATA.map(d => (
          <div key={d.m} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: G.textLight, fontFamily: "DM Mono, monospace" }}>{d.m}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: d.actual ? G.success : G.gold }}>{fmt(d.actual || d.forecast)}</div>
            {d.actual && <div style={{ fontSize: 9, color: G.success, fontFamily: "DM Mono" }}>ACTUAL</div>}
          </div>
        ))}
      </div>
    </Card>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="g1">
      <StatCard label="Recorded yield (Nov '25)" value={fmt(550000)} sub="Umuahia Alpha" accent />
      <StatCard label="Mar '26 forecast" value={fmt(1150000)} sub="3-cell projection" />
    </div>
    <Card style={{ marginTop: 14, background: G.cream, border: "none", boxShadow: "none" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: G.forest, marginBottom: 8 }}>Forecast methodology</div>
      <p style={{ fontSize: 13, color: G.textMid, lineHeight: 1.7 }}>
        Projections scale the Umuahia Alpha yield rate (₦550k/cycle) against planned cell expansion. Future versions will incorporate live commodity price feeds from Umuahia Central Market to sharpen accuracy and flag optimal harvest timing.
      </p>
    </Card>
  </div>
);

// ─── Capital breakdown modal content ─────────────────────────────────────────
const CapitalBreakdown = ({ cells, contribs }) => {
  const totalRaised = cells.reduce((a, c) => a + totalRaised_(c, contribs), 0);
  return (
    <div>
      {cells.map(c => {
        const raised = totalRaised_(c, contribs);
        return (
          <div key={c.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${G.creamDark}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: G.forest, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: G.textLight, fontFamily: "DM Mono, monospace", marginTop: 2 }}>{c.rin.id}</div>
                {c.rin.assetNode && <div style={{ fontSize: 12, color: G.warn, marginTop: 4 }}>🌱 {c.rin.assetNode}</div>}
              </div>
              <Badge status={c.rin.status} />
            </div>
            <PBar value={raised} max={c.rin.target} color={c.rin.status === "deployed" ? G.gold : G.forestLight} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, fontFamily: "DM Mono, monospace", color: G.textLight }}>
              <span>{fmt(raised)} raised</span>
              <span>{fmt(c.rin.target)} target</span>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
        <span style={{ fontWeight: 700, color: G.forest }}>Total across all cells</span>
        <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 17, color: G.forest }}>{fmt(totalRaised)}</span>
      </div>
    </div>
  );
};

// helper: sum all confirmed contribs for a cell
const totalRaised_ = (cell, contribs) =>
  cell.members.reduce((s, m) => s + (contribs[m.id] || []).filter(c => c.status === "confirmed").reduce((a, c) => a + c.amount, 0), 0);

const memberTotal = (memberId, contribs) =>
  (contribs[memberId] || []).filter(c => c.status === "confirmed").reduce((a, c) => a + c.amount, 0);

// ─── Growth chart ─────────────────────────────────────────────────────────────
const GrowthChart = () => {
  const maxCells = 4; const W = 100; const H = 56; const pad = 6;
  const pts = GROWTH_DATA.map((d, i) => ({ ...d, x: (i / (GROWTH_DATA.length - 1)) * (W - pad*2) + pad, y: H - pad - (d.cells / maxCells) * (H - pad*2) }));
  const pathS = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fill = pathS + ` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  return (
    <Card style={{ padding: 18 }} cls="fu2">
      <div style={{ fontWeight: 700, color: G.forest, fontSize: 14, marginBottom: 2 }}>Cell Growth</div>
      <div style={{ fontSize: 12, color: G.textLight, marginBottom: 10 }}>Aug 2025 — Feb 2026</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 70 }} preserveAspectRatio="none">
        <path d={fill} fill={G.forest} opacity="0.1"/>
        <path d={pathS} stroke={G.forest} strokeWidth="1.5" fill="none"/>
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="2" fill={G.forest}/>
            <text x={p.x} y={H} textAnchor="middle" style={{ fontSize: "5px", fill: G.textLight, fontFamily: "DM Mono" }}>{p.m}</text>
          </g>
        ))}
      </svg>
    </Card>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN VIEWS
// ══════════════════════════════════════════════════════════════════════════════

const AdminDash = ({ cells, contribs, onNav }) => {
  const [capitalModal, setCapitalModal] = useState(false);
  const [yieldModal,   setYieldModal]   = useState(false);
  const [cellFilter, setCellFilter] = useState("all");

  const totalRaised = cells.reduce((a, c) => a + totalRaised_(c, contribs), 0);
  const totalFams   = cells.reduce((a, c) => a + c.members.length, 0);
  const totYield    = cells[0].farm?.cycles[0].yields.reduce((a, y) => a + y.value, 0) || 0;

  const filterOpts = [
    { v: "all",      l: "All" },
    { v: "active",   l: "Active" },
    { v: "forming",  l: "Forming" },
    { v: "deployed", l: "Deployed Capital" },
    { v: "Abia",     l: "Abia State" },
    { v: "Enugu",    l: "Enugu State" },
  ];
  const filtered = cells.filter(c => {
    if (cellFilter === "all")      return true;
    if (cellFilter === "deployed") return c.rin.status === "deployed";
    if (["active","forming"].includes(cellFilter)) return c.status === cellFilter;
    return c.state === cellFilter;
  });

  return (
    <div className="fu">
      <SHead title="Portfolio Overview" sub="Neoulo Trust · February 2026" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }} className="g4">
        <StatCard label="Total Cells"      value={cells.length}  sub={`${cells.filter(c=>c.status==="active").length} active · ${cells.filter(c=>c.status==="forming").length} forming`} accent onClick={() => onNav("cells")} />
        <StatCard label="Capital Deployed" value={fmt(totalRaised)} sub="tap for breakdown" onClick={() => setCapitalModal(true)} />
        <StatCard label="Total Yield"      value={fmt(totYield)} sub="tap for forecast" onClick={() => setYieldModal(true)} />
        <StatCard label="Families"         value={totalFams}     sub="across all cells" />
      </div>

      <GrowthChart />

      <div style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: G.forest, fontSize: 15 }}>Cell Status</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {filterOpts.map(o => <Pill key={o.v} label={o.l} active={cellFilter === o.v} onClick={() => setCellFilter(o.v)} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(c => {
            const raised = totalRaised_(c, contribs);
            return (
              <Card key={c.id} cls="fu3">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: G.forest, fontSize: 15 }}>{c.name}</span>
                      <Badge status={c.status} />
                      <Badge status={c.rin.status} />
                    </div>
                    <div style={{ fontSize: 12, color: G.textLight }}>
                      <PinDot size={13} /> {c.location}, {c.state} ·{" "}
                      <span onClick={() => onNav("cells")} style={{ color: G.forestLight, fontWeight: 600, cursor: "pointer", textDecoration: "underline dotted" }}>{c.members.length} members</span>
                      {" "}·{" "}
                      <span onClick={() => onNav("rins")} style={{ color: G.gold, fontWeight: 600, fontFamily: "DM Mono, monospace", fontSize: 11, cursor: "pointer", textDecoration: "underline dotted" }}>{c.rin.id}</span>
                    </div>
                  </div>
                </div>
                <PBar value={raised} max={c.rin.target} color={c.status === "active" ? G.gold : G.forestLight} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, fontFamily: "DM Mono, monospace", color: G.textLight }}>
                  <span>{fmt(raised)} raised</span>
                  <span>{pct(raised, c.rin.target)}% of {fmt(c.rin.target)}</span>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 28, color: G.textLight, fontSize: 13 }}>No cells match this filter.</div>}
        </div>
      </div>

      <Modal open={capitalModal} onClose={() => setCapitalModal(false)} title="Capital Breakdown" wide>
        <CapitalBreakdown cells={cells} contribs={contribs} />
      </Modal>
      <Modal open={yieldModal} onClose={() => setYieldModal(false)} title="Yield Forecast">
        <YieldForecastView onBack={() => setYieldModal(false)} />
      </Modal>
    </div>
  );
};

const AdminCells = ({ cells, contribs, onBack }) => (
  <div className="fu">
    <SHead title="All Cells" sub="Manage and inspect every cooperative cell" back={onBack} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="g1">
      {cells.map(c => {
        const raised = totalRaised_(c, contribs);
        return (
          <Card key={c.id} cls="lift" style={{ cursor: "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: G.forest, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: G.textLight, display: "flex", gap: 4, alignItems: "center" }}><PinDot size={13}/> {c.location}, {c.state}</div>
              </div>
              <Badge status={c.status} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[["Members", c.members.length], ["Formed", c.formed], ["RIN Status", ""]].map(([l, v], idx) => (
                <div key={l} style={{ background: G.cream, borderRadius: 9, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: G.textLight, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 3 }}>{l}</div>
                  {idx === 2 ? <Badge status={c.rin.status}/> : <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{v}</div>}
                </div>
              ))}
            </div>
            <PBar value={raised} max={c.rin.target} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, fontFamily: "DM Mono, monospace", color: G.textLight }}>
              <span>{fmt(raised)}</span><span>{fmt(c.rin.target)} target</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, color: G.forest, fontSize: 13, marginBottom: 8 }}>Members</div>
              {c.members.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${G.creamDark}` }}>
                  <Av name={m.name} size={28} color={m.role === "lead" ? G.gold : G.forestLight}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: G.textLight }}>{m.profession}</div>
                  </div>
                  <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: G.forest, fontWeight: 600 }}>{fmt(memberTotal(m.id, contribs))}</div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  </div>
);

const AdminRins = ({ cells, contribs, onBack }) => {
  const [fs, setFs] = useState("all");
  const statuses = ["all","draft","open","funded","forwarded","deployed","settled"];
  const filtered = cells.filter(c => fs === "all" || c.rin.status === fs);
  return (
    <div className="fu">
      <SHead title="RIN Ledger" sub="All Revolving Impact Notes" back={onBack} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {statuses.map(s => <Pill key={s} label={s === "all" ? "All RINs" : s} active={fs === s} onClick={() => setFs(s)}/>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(c => {
          const r = c.rin;
          const raised = totalRaised_(c, contribs);
          return (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: G.gold, fontWeight: 600, marginBottom: 4 }}>{r.id}</div>
                  <div style={{ fontWeight: 700, color: G.forest, fontSize: 16 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: G.textLight, marginTop: 2 }}>{r.notes}</div>
                  {r.assetNode && <div style={{ fontSize: 12, color: G.warn, marginTop: 4 }}>🌱 {r.assetNode}</div>}
                  <a href={`https://maps.google.com/?q=${c.lat},${c.lng}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: G.warn, fontWeight: 600, marginTop: 6 }}>
                    <PinDot size={14}/> View location on map
                  </a>
                </div>
                <Badge status={r.status}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }} className="g2">
                {[["Target",fmt(r.target)],["Raised",fmt(raised)],["Return",`${r.returnRate}% p.a.`],["Opened",r.opened||"—"]].map(([l,v]) => (
                  <div key={l} style={{ background: G.cream, borderRadius: 9, padding: "9px 10px" }}>
                    <div style={{ fontSize: 9, color: G.textLight, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <PBar value={raised} max={r.target} color={r.status === "deployed" ? G.gold : G.forestLight}/>
              <div style={{ textAlign: "right", marginTop: 4, fontSize: 11, color: G.textLight, fontFamily: "DM Mono, monospace" }}>{pct(raised, r.target)}% funded</div>
            </Card>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 28, color: G.textLight, fontSize: 13 }}>No RINs with this status.</div>}
      </div>
    </div>
  );
};

const AdminFarms = ({ cells, onBack }) => {
  const farm = cells[0].farm;
  const cycle = farm.cycles[0];
  const [expY, setExpY] = useState(null);
  const totY = cycle.yields.reduce((a, y) => a + y.value, 0);
  const totE = cycle.expenses.reduce((a, e) => a + e.amount, 0);
  return (
    <div className="fu">
      <SHead title="Farm Overview" sub="Yield and expense data across active farms" back={onBack} />
      <div style={{ background: G.creamDark, borderRadius: 12, padding: 14, marginBottom: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <PinDot size={22}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: G.forest }}>Umuahia Alpha — Active Farm</div>
          <div style={{ fontSize: 12, color: G.textLight }}>{farm.crop} · {farm.plot} · {farm.irrigationType}</div>
        </div>
        <Badge status="active"/>
        <a href={`https://maps.google.com/?q=${cells[0].lat},${cells[0].lng}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: G.warn, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><PinDot size={14}/> View location</a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }} className="g2">
        <StatCard label="Gross Yield"    value={fmt(totY)} accent/>
        <StatCard label="Total Expenses" value={fmt(totE)}/>
        <StatCard label="Net Position"   value={fmt(totY - totE)}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="g1">
        <Card>
          <div style={{ fontWeight: 700, color: G.forest, marginBottom: 4, fontSize: 14 }}>Yield Log</div>
          <div style={{ fontSize: 11, color: G.textLight, marginBottom: 14 }}>Tap any entry for granular details</div>
          {cycle.yields.map((y, i) => (
            <div key={y.id}>
              <div onClick={() => setExpY(expY === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: expY !== i ? `1px solid ${G.creamDark}` : "none", cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{y.qty}</div>
                  <div style={{ fontSize: 11, color: G.textLight }}>{y.date}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: G.success, fontWeight: 600 }}>{fmt(y.value)}</span>
                  <span style={{ fontSize: 10, color: G.textLight }}>{expY === i ? "▲" : "▼"}</span>
                </div>
              </div>
              {expY === i && (
                <div className="expand" style={{ background: G.cream, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 12 }}>
                  {[["Market Price",y.marketPrice],["Buyer / Channel",y.buyer],["Notes",y.notes]].map(([l,v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${G.creamMid}` }}>
                      <span style={{ color: G.textLight }}>{l}</span>
                      <span style={{ fontWeight: 600, color: G.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: G.forest, marginBottom: 14, fontSize: 14 }}>Expense Log</div>
          {cycle.expenses.map((e, i) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < cycle.expenses.length-1 ? `1px solid ${G.creamDark}` : "none" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{e.item}</div>
                <div style={{ fontSize: 11, color: G.textLight }}>{e.date} · {e.vendor} · {e.receipt}</div>
              </div>
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: G.danger, fontWeight: 600 }}>−{fmt(e.amount)}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// Capital Desk (admin) — handles forwarded RINs
const AdminCapital = ({ cells, contribs, onBack }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [deployed, setDeployed] = useState(false);
  const forwarded = cells.filter(c => c.rin.status === "forwarded");
  const deployedCells = cells.filter(c => c.rin.status === "deployed");

  return (
    <div className="fu">
      <SHead title="Capital Desk" sub="Review forwarded RINs and manage deployment" back={onBack} />

      {forwarded.length === 0 && (
        <Card style={{ textAlign: "center", padding: 36 }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>◉</div>
          <div style={{ fontWeight: 700, color: G.forest, fontSize: 15, marginBottom: 6 }}>No pending RINs</div>
          <div style={{ fontSize: 13, color: G.textLight }}>When a cell lead forwards a funded RIN, it will appear here for your review and deployment.</div>
        </Card>
      )}

      {forwarded.map(c => {
        const raised = totalRaised_(c, contribs);
        return (
          <Card key={c.id} style={{ marginBottom: 16, border: `2px solid ${G.gold}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: G.gold, marginBottom: 4 }}>{c.rin.id}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: G.forest }}>{c.name}</div>
                <div style={{ fontSize: 12, color: G.textLight }}>{c.location} · {fmt(raised)} available</div>
              </div>
              <Badge status="forwarded"/>
            </div>
            <div style={{ background: G.creamDark, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: G.textMid, marginBottom: 14, lineHeight: 1.6 }}>
              System analysis complete. Based on {c.name}'s profile (formed {c.formed}, {c.members.length} members, {c.state} State), {SUGGESTED_NODES.length} asset nodes have been ranked by suitability.
            </div>
            <div style={{ fontWeight: 700, color: G.forest, fontSize: 13, marginBottom: 10 }}>Suggested Asset Nodes</div>
            {SUGGESTED_NODES.map(n => (
              <div key={n.id} onClick={() => setSelectedNode(selectedNode === n.id ? null : n.id)}
                style={{ border: `1.5px solid ${selectedNode === n.id ? G.forest : G.creamDark}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, background: selectedNode === n.id ? "rgba(13,59,32,0.05)" : G.white, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: G.text }}>{n.name}</div>
                    <div style={{ fontSize: 11, color: G.textLight, marginTop: 2 }}>{n.type} · {n.returnRate} est. return</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: G.textLight, fontFamily: "DM Mono", letterSpacing: 1 }}>SUITABILITY</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: n.suitability > 90 ? G.success : n.suitability > 75 ? G.warn : G.danger }}>{n.suitability}%</div>
                  </div>
                </div>
              </div>
            ))}
            {selectedNode && !deployed && (
              <button onClick={() => setDeployed(true)}
                style={{ marginTop: 6, background: G.forest, color: G.white, border: "none", borderRadius: 11, padding: "12px 24px", fontWeight: 700, fontSize: 14 }}>
                Deploy Capital to Selected Node →
              </button>
            )}
            {deployed && (
              <div style={{ background: "rgba(45,122,79,0.1)", border: `1px solid ${G.success}`, borderRadius: 12, padding: "12px 16px", marginTop: 8 }}>
                <div style={{ fontWeight: 700, color: G.success, fontSize: 14 }}>✓ Capital deployed</div>
                <div style={{ fontSize: 12, color: G.textMid, marginTop: 4 }}>Member notification emails have been queued. The RIN status will update to <Badge status="deployed"/> shortly.</div>
              </div>
            )}
          </Card>
        );
      })}

      {deployedCells.length > 0 && (
        <>
          <Divider my={20}/>
          <div style={{ fontWeight: 700, color: G.forest, fontSize: 15, marginBottom: 12 }}>Deployed Capital</div>
          {deployedCells.map(c => (
            <Card key={c.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: G.gold }}>{c.rin.id}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: G.forest, marginTop: 4 }}>{c.name}</div>
                {c.rin.assetNode && <div style={{ fontSize: 12, color: G.warn, marginTop: 2 }}>🌱 {c.rin.assetNode}</div>}
              </div>
              <Badge status="deployed"/>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTRIBUTION LOGGING (used by Lead's Members page)
// ══════════════════════════════════════════════════════════════════════════════

const ContribForm = ({ member, onSave, onCancel }) => {
  const [amount,  setAmount]  = useState("");
  const [date,    setDate]    = useState(today());
  const [method,  setMethod]  = useState("Bank Transfer");
  const [ref,     setRef]     = useState("");
  const [note,    setNote]    = useState("");
  const [err,     setErr]     = useState("");

  const submit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setErr("Please enter a valid amount."); return; }
    if (!date) { setErr("Please enter a date."); return; }
    const entry = {
      id: `C-${member.id}-${uid()}`,
      date,
      amount: Number(amount),
      method,
      ref: ref || `REF-${uid()}`,
      note: note || "Contribution logged by lead",
      status: "confirmed",
      confirmedBy: "Emeka Okafor (Lead)",
    };
    onSave(entry);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Av name={member.name} size={42} color={G.forestLight}/>
        <div>
          <div style={{ fontWeight: 700, color: G.forest }}>{member.name}</div>
          <div style={{ fontSize: 12, color: G.textLight }}>{member.profession}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Input label="Amount (₦) *" type="number" placeholder="e.g. 100000" value={amount} onChange={setAmount} required/>
        <Input label="Date *" placeholder={today()} value={date} onChange={setDate} required/>
        <Select label="Payment Method" value={method} onChange={setMethod} options={["Bank Transfer","Cash","USSD Transfer","Mobile Money"]}/>
        <Input label="Reference / Receipt No." placeholder="e.g. TRF-1234" value={ref} onChange={setRef}/>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Input label="Note (optional)" placeholder="e.g. Second instalment" value={note} onChange={setNote}/>
      </div>
      {err && <div style={{ background: "rgba(139,37,0,0.08)", border: `1px solid ${G.danger}`, borderRadius: 9, padding: "8px 12px", fontSize: 12, color: G.danger, marginBottom: 12 }}>{err}</div>}
      <div style={{ background: G.creamDark, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: G.textMid, marginBottom: 14, lineHeight: 1.6 }}>
        <strong>How contributions enter the platform:</strong> You, as Cell Lead, are the data entry point for all cash and bank contributions. Once you log and save here, the amount is immediately added to {member.name}'s total and to the cell's RIN pool. Members can then see their confirmed contribution history in their own dashboard.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={submit} style={{ background: G.forest, color: G.white, border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13 }}>Save Contribution</button>
        <button onClick={onCancel} style={{ background: G.creamDark, border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LEAD VIEWS
// ══════════════════════════════════════════════════════════════════════════════

const LeadCell = ({ cell, contribs, onNav }) => {
  const raised = totalRaised_(cell, contribs);
  return (
    <div className="fu">
      <SHead title={cell.name} sub={`${cell.location}, ${cell.state} · Formed ${cell.formed}`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }} className="g2">
        <StatCard label="Members" value={cell.members.length} sub="families" accent onClick={() => onNav("members")}/>
        <StatCard label="Capital Raised" value={fmt(raised)} sub={`${pct(raised, cell.rin.target)}% of target`} onClick={() => onNav("rin")}/>
        <StatCard label="RIN Status" value={cell.rin.status.toUpperCase()} sub={cell.rin.id} onClick={() => onNav("rin")}/>
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: G.forest, fontSize: 15 }}>Member Contributions</div>
          <button onClick={() => onNav("members")} style={{ background: "none", border: `1px solid ${G.creamMid}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: G.textMid, cursor: "pointer" }}>Manage →</button>
        </div>
        {cell.members.map((m, i) => {
          const total = memberTotal(m.id, contribs);
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < cell.members.length-1 ? `1px solid ${G.creamDark}` : "none" }}>
              <Av name={m.name} color={m.role === "lead" ? G.gold : G.forestLight}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: G.textLight }}>{m.profession}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 14, color: G.forest }}>{fmt(total)}</div>
                <div style={{ fontSize: 10, color: G.textLight }}>{pct(total, cell.rin.target)}% of target</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

const RIN_FLOW = ["draft","open","funded","forwarded","reviewing","deployed","yielding","settled"];
const NEXT_ACTION = {
  draft:   { next: "open",      label: "Open for Contributions" },
  open:    { next: "funded",    label: "Mark as Funded" },
  funded:  { next: "forwarded", label: "Forward RIN to Neoulo" },
  deployed:{ next: "yielding",  label: "Begin Yield Phase" },
  yielding:{ next: "settled",   label: "Settle RIN" },
};

const LeadRIN = ({ cell, contribs, onBack }) => {
  const [status, setStatus] = useState(cell.rin.status);
  const [confirm, setConfirm] = useState(false);
  const rin = cell.rin;
  const raised = totalRaised_(cell, contribs);
  const na = NEXT_ACTION[status];

  const forwardMsg = `This gives Neoulo access to ${fmt(raised)} from your cell's pool. Neoulo will review your cell profile, suggest the best asset node, and notify all members by email before deploying.`;
  const genericMsg = `Move RIN from "${status}" to "${na?.next}"? This action will be recorded.`;

  return (
    <div className="fu">
      <SHead title="RIN Manager" sub={`${rin.id} · ${cell.name}`} back={onBack} />

      {/* Lifecycle stepper */}
      <Card style={{ marginBottom: 18, overflowX: "auto" }}>
        <div style={{ fontWeight: 700, color: G.forest, marginBottom: 14, fontSize: 13 }}>RIN Lifecycle</div>
        <div style={{ display: "flex", alignItems: "center", minWidth: 480 }}>
          {RIN_FLOW.map((s, i) => {
            const idx = RIN_FLOW.indexOf(status);
            const done = i < idx; const active = i === idx;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? G.gold : active ? G.forest : G.creamDark, display: "flex", alignItems: "center", justifyContent: "center", color: done || active ? G.white : G.textLight, fontSize: 9, fontWeight: 700 }}>{done ? "✓" : i+1}</div>
                  <div style={{ fontSize: 7, color: active ? G.forest : G.textLight, fontWeight: active ? 700 : 400, textAlign: "center", textTransform: "uppercase", fontFamily: "DM Mono, monospace", width: 42 }}>{s.replace(/_/g," ")}</div>
                </div>
                {i < RIN_FLOW.length-1 && <div style={{ flex: 1, height: 2, background: done ? G.gold : G.creamDark, margin: "0 2px", marginBottom: 18 }}/>}
              </div>
            );
          })}
        </div>
      </Card>

      {status === "reviewing" && (
        <div style={{ background: "linear-gradient(135deg,#2E0F2E,#3E1A3E)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: G.white, fontSize: 14, marginBottom: 6 }}>⏳ Awaiting Neoulo Review</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>Neoulo is reviewing your cell and will suggest the optimal asset node. All members will receive a detailed report by email once complete.</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }} className="g2">
        <Card><Label>RIN ID</Label><div style={{ fontFamily: "DM Mono, monospace", fontSize: 14, fontWeight: 700, color: G.gold }}>{rin.id}</div></Card>
        <Card><Label>Status</Label><Badge status={status}/></Card>
        <Card><Label>Return Rate</Label><div style={{ fontSize: 17, fontWeight: 700, color: G.forest }}>{rin.returnRate}% p.a.</div></Card>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: G.forest, marginBottom: 12, fontSize: 14 }}>Funding Progress</div>
        <PBar value={raised} max={rin.target} color={G.gold} h={10}/>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: G.success, fontFamily: "DM Mono, monospace" }}>{fmt(raised)} raised</span>
          <span style={{ fontSize: 13, color: G.textLight, fontFamily: "DM Mono, monospace" }}>{pct(raised, rin.target)}% of {fmt(rin.target)}</span>
        </div>
      </Card>

      {na && !confirm && (
        <button onClick={() => setConfirm(true)}
          style={{ background: status === "funded" ? "linear-gradient(135deg,#3A1060,#5A1E9A)" : G.forest, color: G.white, border: "none", borderRadius: 12, padding: "13px 26px", fontSize: 14, fontWeight: 700 }}>
          {status === "funded" ? "◈ " : "→ "}{na.label}
        </button>
      )}
      {confirm && (
        <Confirm
          message={status === "funded" ? forwardMsg : genericMsg}
          yesLabel={na.label}
          yesStyle={status === "funded" ? "linear-gradient(135deg,#3A1060,#5A1E9A)" : G.forest}
          onYes={() => { setStatus(na.next); setConfirm(false); }}
          onNo={() => setConfirm(false)}
        />
      )}

      {status === "forwarded" && (
        <div style={{ background: G.goldDim, border: `1px solid ${G.gold}`, borderRadius: 12, padding: "14px 16px", marginTop: 14 }}>
          <div style={{ fontWeight: 700, color: G.warn, fontSize: 14 }}>◈ RIN Forwarded to Neoulo</div>
          <div style={{ fontSize: 12, color: G.textMid, marginTop: 4, lineHeight: 1.6 }}>Neoulo now has authorised access to {fmt(raised)} from your pool. They are reviewing your cell profile. All {cell.members.length} members will receive an email report before deployment proceeds.</div>
        </div>
      )}
    </div>
  );
};

const LeadFarm = ({ cell, onBack }) => {
  const farm = cell.farm;
  const [tab, setTab] = useState("yields");
  const [yields,   setYields]   = useState(farm.cycles[0].yields);
  const [expenses, setExpenses] = useState(farm.cycles[0].expenses);
  const [showYF, setShowYF] = useState(false);
  const [showEF, setShowEF] = useState(false);
  const [ny, setNy] = useState({ date: today(), qty: "", value: "", marketPrice: "", buyer: "", notes: "" });
  const [ne, setNe] = useState({ date: today(), item: "", amount: "", vendor: "", receipt: "" });
  const [yErr, setYErr] = useState(""); const [eErr, setEErr] = useState("");

  const totY = yields.reduce((a,y) => a + y.value, 0);
  const totE = expenses.reduce((a,e) => a + e.amount, 0);

  const saveYield = () => {
    if (!ny.date || !ny.qty || !ny.value) { setYErr("Date, quantity and value are required."); return; }
    setYields([{ ...ny, id: `Y-${uid()}`, value: Number(ny.value) }, ...yields]);
    setNy({ date: today(), qty: "", value: "", marketPrice: "", buyer: "", notes: "" });
    setShowYF(false); setYErr("");
  };
  const saveExpense = () => {
    if (!ne.date || !ne.item || !ne.amount) { setEErr("Date, item and amount are required."); return; }
    setExpenses([{ ...ne, id: `E-${uid()}`, amount: Number(ne.amount) }, ...expenses]);
    setNe({ date: today(), item: "", amount: "", vendor: "", receipt: "" });
    setShowEF(false); setEErr("");
  };

  return (
    <div className="fu">
      <SHead title="Farm Log" sub={`${farm.crop} · ${farm.plot} · ${farm.irrigationType}`} back={onBack}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 22 }} className="g2">
        <StatCard label="Gross Yield"    value={fmt(totY)} accent/>
        <StatCard label="Expenses"       value={fmt(totE)}/>
        <StatCard label="Net Position"   value={fmt(totY - totE)}/>
      </div>
      <Tabs tabs={[{id:"yields",label:"Yield Records"},{id:"expenses",label:"Expense Records"}]} active={tab} onChange={setTab}/>

      {tab === "yields" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: G.textLight }}>{yields.length} records</div>
            <button onClick={() => { setShowYF(!showYF); setYErr(""); }} style={{ background: G.forest, color: G.white, border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 12, fontWeight: 600 }}>+ Log Yield</button>
          </div>
          {showYF && (
            <Card style={{ marginBottom: 14, border: `2px solid ${G.gold}` }} cls="fu">
              <div style={{ fontWeight: 700, color: G.forest, marginBottom: 14, fontSize: 14 }}>New Yield Entry</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }} className="g1">
                <Input label="Date *"          placeholder={today()} value={ny.date}        onChange={v => setNy({...ny, date:v})}/>
                <Input label="Quantity *"      placeholder="e.g. 500 kg" value={ny.qty}     onChange={v => setNy({...ny, qty:v})}/>
                <Input label="Gross Value (₦) *" type="number" placeholder="e.g. 250000" value={ny.value} onChange={v => setNy({...ny, value:v})}/>
                <Input label="Market Price"    placeholder="e.g. ₦500/kg" value={ny.marketPrice} onChange={v => setNy({...ny, marketPrice:v})}/>
                <Input label="Buyer / Channel" placeholder="e.g. Umuahia Market" value={ny.buyer} onChange={v => setNy({...ny, buyer:v})}/>
                <Input label="Notes"           placeholder="Optional" value={ny.notes}      onChange={v => setNy({...ny, notes:v})}/>
              </div>
              {yErr && <div style={{ color: G.danger, fontSize: 12, marginBottom: 10 }}>{yErr}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveYield} style={{ background: G.forest, color: G.white, border: "none", borderRadius: 9, padding: "9px 20px", fontWeight: 600, fontSize: 13 }}>Save</button>
                <button onClick={() => { setShowYF(false); setYErr(""); }} style={{ background: G.creamDark, border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </Card>
          )}
          <Card>
            {yields.length === 0 && <div style={{ textAlign: "center", padding: 24, color: G.textLight, fontSize: 13 }}>No yield records yet. Use the button above to log your first harvest.</div>}
            {yields.map((y, i) => (
              <div key={y.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < yields.length-1 ? `1px solid ${G.creamDark}` : "none" }}>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{y.qty}</div><div style={{ fontSize: 11, color: G.textLight }}>{y.date}</div></div>
                <div style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 13, color: G.success }}>{fmt(y.value)}</div>
              </div>
            ))}
          </Card>
        </>
      )}

      {tab === "expenses" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: G.textLight }}>{expenses.length} records</div>
            <button onClick={() => { setShowEF(!showEF); setEErr(""); }} style={{ background: G.forest, color: G.white, border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 12, fontWeight: 600 }}>+ Log Expense</button>
          </div>
          {showEF && (
            <Card style={{ marginBottom: 14, border: `2px solid ${G.gold}` }} cls="fu">
              <div style={{ fontWeight: 700, color: G.forest, marginBottom: 14, fontSize: 14 }}>New Expense</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }} className="g1">
                <Input label="Date *"          placeholder={today()} value={ne.date}    onChange={v => setNe({...ne, date:v})}/>
                <Input label="Item *"          placeholder="e.g. Seedlings" value={ne.item} onChange={v => setNe({...ne, item:v})}/>
                <Input label="Amount (₦) *"    type="number" placeholder="e.g. 30000" value={ne.amount} onChange={v => setNe({...ne, amount:v})}/>
                <Input label="Vendor"          placeholder="Supplier name" value={ne.vendor}  onChange={v => setNe({...ne, vendor:v})}/>
                <Input label="Receipt No."     placeholder="Optional" value={ne.receipt} onChange={v => setNe({...ne, receipt:v})}/>
              </div>
              {eErr && <div style={{ color: G.danger, fontSize: 12, marginBottom: 10 }}>{eErr}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveExpense} style={{ background: G.forest, color: G.white, border: "none", borderRadius: 9, padding: "9px 20px", fontWeight: 600, fontSize: 13 }}>Save</button>
                <button onClick={() => { setShowEF(false); setEErr(""); }} style={{ background: G.creamDark, border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </Card>
          )}
          <Card>
            {expenses.length === 0 && <div style={{ textAlign: "center", padding: 24, color: G.textLight, fontSize: 13 }}>No expense records yet.</div>}
            {expenses.map((e, i) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < expenses.length-1 ? `1px solid ${G.creamDark}` : "none" }}>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{e.item}</div><div style={{ fontSize: 11, color: G.textLight }}>{e.date}{e.vendor ? ` · ${e.vendor}` : ""}</div></div>
                <div style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 13, color: G.danger }}>−{fmt(e.amount)}</div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
};

const LeadMembers = ({ cell, contribs, setContribs, onBack }) => {
  const [members, setMembers] = useState(cell.members);
  const [selMember, setSelMember] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [logFor, setLogFor] = useState(null); // member to log contribution for
  const [newM, setNewM] = useState({ name: "", profession: "", phone: "", email: "" });
  const [mErr, setMErr] = useState("");

  const addMember = () => {
    if (!newM.name || !newM.profession) { setMErr("Name and profession are required."); return; }
    const m = { id: `M-${uid()}`, role: "member", joined: today(), ...newM };
    setMembers([m, ...members]);
    setContribs({ ...contribs, [m.id]: [] });
    setNewM({ name: "", profession: "", phone: "", email: "" });
    setShowAdd(false); setMErr("");
  };

  const logContrib = (entry) => {
    const updated = { ...contribs, [logFor.id]: [entry, ...(contribs[logFor.id] || [])] };
    setContribs(updated);
    setLogFor(null);
    setSelMember(null);
  };

  const selectedMemberContribs = selMember ? (contribs[selMember.id] || []) : [];
  const [expC, setExpC] = useState(null);

  return (
    <div className="fu">
      <SHead
        title="Members"
        sub={`${members.length} / 6 seats — tap a member to view details or log contributions`}
        back={onBack}
        right={
          <button onClick={() => { setShowAdd(!showAdd); setMErr(""); }}
            style={{ background: G.forest, color: G.white, border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
            + Invite Member
          </button>
        }
      />

      {showAdd && (
        <Card style={{ marginBottom: 16, border: `2px solid ${G.gold}` }} cls="fu">
          <div style={{ fontWeight: 700, color: G.forest, marginBottom: 14, fontSize: 14 }}>Invite New Member</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }} className="g1">
            <Input label="Full Name *"    placeholder="e.g. Ada Okafor"   value={newM.name}       onChange={v => setNewM({...newM, name:v})}       required/>
            <Input label="Profession *"  placeholder="e.g. Teacher"      value={newM.profession} onChange={v => setNewM({...newM, profession:v})} required/>
            <Input label="Phone Number"  placeholder="+234..."            value={newM.phone}      onChange={v => setNewM({...newM, phone:v})}/>
            <Input label="Email"         placeholder="email@address.com" value={newM.email}      onChange={v => setNewM({...newM, email:v})}/>
          </div>
          {mErr && <div style={{ color: G.danger, fontSize: 12, marginBottom: 10 }}>{mErr}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={addMember} style={{ background: G.forest, color: G.white, border: "none", borderRadius: 9, padding: "9px 20px", fontWeight: 700, fontSize: 13 }}>Add Member</button>
            <button onClick={() => { setShowAdd(false); setMErr(""); }} style={{ background: G.creamDark, border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13 }}>Cancel</button>
          </div>
        </Card>
      )}

      <Card>
        {members.map((m, i) => {
          const total = memberTotal(m.id, contribs);
          return (
            <div key={m.id} className="row-hover" onClick={() => { setSelMember(m); setExpC(null); }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 8px", borderRadius: 10, borderBottom: i < members.length-1 ? `1px solid ${G.creamDark}` : "none", cursor: "pointer", transition: "background 0.12s" }}>
              <Av name={m.name} color={m.role === "lead" ? G.gold : G.forestLight}/>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                  {m.role === "lead" && <span style={{ fontSize: 9, background: G.gold, color: G.white, padding: "2px 7px", borderRadius: 20, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Lead</span>}
                </div>
                <div style={{ fontSize: 12, color: G.textLight }}>{m.profession} · Joined {m.joined}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 14, color: G.forest }}>{fmt(total)}</div>
                <div style={{ fontSize: 10, color: G.textLight }}>{(contribs[m.id]||[]).length} entries</div>
              </div>
              <span style={{ color: G.textLight, fontSize: 16 }}>›</span>
            </div>
          );
        })}
      </Card>

      {/* Member detail modal */}
      <Modal open={!!selMember && !logFor} onClose={() => setSelMember(null)} title={selMember?.name || ""}>
        {selMember && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <Av name={selMember.name} size={52} color={selMember.role === "lead" ? G.gold : G.forest}/>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: G.forest }}>{selMember.name}</div>
                <div style={{ fontSize: 13, color: G.textLight }}>{selMember.profession}</div>
                {selMember.role === "lead" && <Badge status="active" />}
              </div>
            </div>
            <InfoGrid rows={[
              ["Phone",       selMember.phone || "—"],
              ["Email",       selMember.email || "—"],
              ["Member Since", selMember.joined],
              ["Contributions", (selectedMemberContribs).length + " entries"],
            ]}/>
            <Divider my={16}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: G.forest, fontSize: 14 }}>Contribution History</div>
              <button onClick={() => setLogFor(selMember)}
                style={{ background: G.forest, color: G.white, border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 12, fontWeight: 700 }}>+ Log Contribution</button>
            </div>
            {selectedMemberContribs.length === 0 && <div style={{ textAlign: "center", padding: 18, color: G.textLight, fontSize: 13 }}>No contributions logged yet.</div>}
            {selectedMemberContribs.map((c, i) => (
              <div key={c.id}>
                <div onClick={() => setExpC(expC === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: expC !== i ? `1px solid ${G.creamDark}` : "none", cursor: "pointer" }}>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{c.note}</div><div style={{ fontSize: 11, color: G.textLight }}>{c.date}</div></div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, color: G.success }}>+{fmt(c.amount)}</span>
                    <span style={{ fontSize: 10, color: G.textLight }}>{expC === i ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expC === i && (
                  <div className="expand" style={{ background: G.cream, borderRadius: 9, padding: 12, marginBottom: 8, fontSize: 12 }}>
                    {[["Method",c.method],["Reference",c.ref],["Status",c.status],["Confirmed By",c.confirmedBy]].map(([l,v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${G.creamMid}` }}>
                        <span style={{ color: G.textLight }}>{l}</span>
                        <span style={{ fontWeight: 600, color: G.text }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Divider my={14}/>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: G.forest }}>Total</span>
              <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 16, color: G.forest }}>{fmt(memberTotal(selMember.id, contribs))}</span>
            </div>
          </>
        )}
      </Modal>

      {/* Contribution log modal */}
      <Modal open={!!logFor} onClose={() => setLogFor(null)} title={`Log Contribution — ${logFor?.name || ""}`}>
        {logFor && <ContribForm member={logFor} onSave={logContrib} onCancel={() => setLogFor(null)}/>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MEMBER VIEWS
// ══════════════════════════════════════════════════════════════════════════════

const MemberHome = ({ cell, member, contribs, onNav }) => {
  const myContribs = contribs[member.id] || [];
  const total      = myContribs.filter(c => c.status === "confirmed").reduce((a, c) => a + c.amount, 0);
  const raised     = totalRaised_(cell, contribs);
  const share      = raised > 0 ? pct(total, raised) : 0;
  const projected  = Math.round(total * (1 + cell.rin.returnRate / 100));
  const [rinExp, setRinExp] = useState(false);
  const rinIdx = RIN_FLOW.indexOf(cell.rin.status);

  return (
    <div className="fu">
      <SHead title={`Hello, ${member.name.split(" ")[0]}`} sub={`${cell.name} · ${member.profession}`}/>

      {/* Hero card */}
      <Card style={{ background: G.forest, marginBottom: 18, position: "relative", overflow: "hidden" }}>
        <GeomBg op={0.06}/>
        <div style={{ position: "relative" }}>
          <Label>Your Total Contribution</Label>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: G.white, lineHeight: 1.1, margin: "6px 0" }}>{fmt(total)}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{share}% of pool · Projected settlement: {fmt(projected)}</div>
          <PBar value={raised} max={cell.rin.target} color={G.gold} h={6}/>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "DM Mono, monospace" }}>
            <span>Cell raised {fmt(raised)}</span><span>Target {fmt(cell.rin.target)}</span>
          </div>
        </div>
      </Card>

      {/* Expandable RIN status */}
      <Card onClick={() => setRinExp(!rinExp)} style={{ marginBottom: 14, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Label>RIN Status</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge status={cell.rin.status}/>
              <span style={{ fontSize: 12, color: G.textLight }}>{cell.rin.notes}</span>
            </div>
          </div>
          <span style={{ fontSize: 16, color: G.textLight, transition: "transform 0.2s", display: "inline-block", transform: rinExp ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
        {rinExp && (
          <div className="expand" style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${G.creamDark}` }}>
            <div style={{ fontWeight: 700, color: G.forest, fontSize: 13, marginBottom: 12 }}>Project Progress</div>
            {RIN_FLOW.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: i <= rinIdx ? G.gold : G.creamDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: i <= rinIdx ? G.white : G.textLight, fontSize: 9 }}>{i <= rinIdx ? "✓" : i+1}</span>
                </div>
                <div style={{ fontSize: 12, color: i <= rinIdx ? G.text : G.textLight, fontWeight: i <= rinIdx ? 600 : 400, textTransform: "capitalize" }}>{s.replace(/_/g, " ")}</div>
                {i === rinIdx && <span style={{ fontSize: 9, background: G.gold, color: G.white, padding: "1px 8px", borderRadius: 10, fontWeight: 700, fontFamily: "DM Mono" }}>NOW</span>}
              </div>
            ))}
            <PBar value={rinIdx + 1} max={RIN_FLOW.length} color={G.gold} h={6}/>
            <div style={{ textAlign: "right", marginTop: 4, fontSize: 10, color: G.textLight, fontFamily: "DM Mono" }}>{Math.round(((rinIdx+1)/RIN_FLOW.length)*100)}% through lifecycle</div>
          </div>
        )}
      </Card>

      {/* Settlement card */}
      <Card>
        <Label>Settlement Due</Label>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: G.forest, margin: "6px 0 4px" }}>Feb 28, 2026</div>
        <div style={{ fontSize: 12, color: G.textLight }}>Expected payout: <strong style={{ color: G.forest }}>{fmt(projected)}</strong></div>
      </Card>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button onClick={() => onNav("contributions")} style={{ background: G.forest, color: G.white, border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 600, fontSize: 13 }}>My Contributions →</button>
        <button onClick={() => onNav("farm")} style={{ background: G.white, color: G.forest, border: `1.5px solid ${G.creamMid}`, borderRadius: 12, padding: "13px 0", fontWeight: 600, fontSize: 13 }}>Farm Updates →</button>
      </div>
    </div>
  );
};

const MemberContributions = ({ member, contribs, onBack }) => {
  const myContribs = contribs[member.id] || [];
  const total = myContribs.filter(c => c.status === "confirmed").reduce((a, c) => a + c.amount, 0);
  const [expC, setExpC] = useState(null);

  return (
    <div className="fu">
      <SHead title="My Contributions" sub={`Contribution history — confirmed by Cell Lead`} back={onBack}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
        <StatCard label="Total Contributed" value={fmt(total)} accent/>
        <StatCard label="No. of Entries"    value={myContribs.length} sub="all confirmed"/>
      </div>

      {/* How contributions work info box */}
      <Card style={{ background: G.cream, border: "none", boxShadow: "none", marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: G.forest, marginBottom: 6 }}>How contributions work</div>
        <p style={{ fontSize: 12, color: G.textMid, lineHeight: 1.7 }}>
          Your Cell Lead logs every contribution on your behalf — whether cash or bank transfer — after receiving payment. Once logged, it appears here as a confirmed record. Your total directly affects your share of the RIN pool and your projected settlement amount.
        </p>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, color: G.forest, marginBottom: 4, fontSize: 14 }}>Contribution History</div>
        <div style={{ fontSize: 12, color: G.textLight, marginBottom: 14 }}>Tap any entry for full details</div>
        {myContribs.length === 0 && <div style={{ textAlign: "center", padding: 24, color: G.textLight, fontSize: 13 }}>No contributions recorded yet. Your Cell Lead will add them after receiving payment.</div>}
        {myContribs.map((c, i) => (
          <div key={c.id}>
            <div onClick={() => setExpC(expC === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: expC !== i ? `1px solid ${G.creamDark}` : "none", cursor: "pointer" }}>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{c.note}</div><div style={{ fontSize: 11, color: G.textLight }}>{c.date}</div></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 15, color: G.success }}>+{fmt(c.amount)}</span>
                <span style={{ fontSize: 10, color: G.textLight }}>{expC === i ? "▲" : "▼"}</span>
              </div>
            </div>
            {expC === i && (
              <div className="expand" style={{ background: G.cream, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 12 }}>
                {[["Payment Date",c.date],["Payment Method",c.method],["Reference / Receipt",c.ref],["Confirmed By",c.confirmedBy],["Status",c.status.toUpperCase()],["Amount",fmt(c.amount)]].map(([l,v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${G.creamMid}` }}>
                    <span style={{ color: G.textLight }}>{l}</span>
                    <span style={{ fontWeight: 600, color: l==="Status" ? G.success : G.text }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {myContribs.length > 0 && (
          <>
            <Divider/>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
              <span style={{ fontWeight: 700, color: G.forest }}>Total</span>
              <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 16, color: G.forest }}>{fmt(total)}</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

const MemberFarm = ({ cell, member, contribs, onBack }) => {
  const farm = cell.farm;
  if (!farm) return (
    <div className="fu">
      <SHead title="Farm Updates" sub="No active farm yet" back={onBack}/>
      <Card style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>⊛</div>
        <div style={{ fontWeight: 700, color: G.forest, marginBottom: 6 }}>No farm yet</div>
        <div style={{ fontSize: 13, color: G.textLight }}>Once your RIN is deployed and an asset node is selected, farm updates will appear here.</div>
      </Card>
    </div>
  );

  const cycle   = farm.cycles[0];
  const totY    = cycle.yields.reduce((a, y) => a + y.value, 0);
  const raised  = totalRaised_(cell, contribs);
  const myTotal = memberTotal(member.id, contribs);
  const ratio   = raised > 0 ? myTotal / raised : 0;

  return (
    <div className="fu">
      <SHead title="Farm Updates" sub={`${farm.crop} · ${farm.plot} · your cell's asset`} back={onBack}/>
      <Card style={{ background: `linear-gradient(140deg,${G.forestMid},${G.forest})`, marginBottom: 18, position: "relative", overflow: "hidden" }}>
        <GeomBg op={0.07}/>
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>Active Crop</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: G.white }}>{farm.crop}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{farm.plot} · {farm.irrigationType}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <Badge status={cycle.status}/>
            <a href={`https://maps.google.com/?q=${cell.lat},${cell.lng}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: G.goldLight, fontWeight: 600 }}><PinDot size={14}/> View farm</a>
          </div>
        </div>
        <div style={{ marginTop: 14, background: "rgba(0,0,0,0.18)", borderRadius: 9, padding: 12, position: "relative" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Season: {cycle.season} · Planted: {cycle.planted}</div>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <StatCard label="Cell Total Yield" value={fmt(totY)}/>
        <StatCard label="Your Share"       value={fmt(Math.round(totY * ratio))} sub={`${Math.round(ratio * 100)}% contribution ratio`} accent/>
      </div>
      <Card>
        <div style={{ fontWeight: 700, color: G.forest, marginBottom: 14, fontSize: 14 }}>Harvest Records</div>
        {cycle.yields.map((y, i) => (
          <div key={y.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < cycle.yields.length-1 ? `1px solid ${G.creamDark}` : "none" }}>
            <div><div style={{ fontWeight: 600, fontSize: 14 }}>{y.qty} harvested</div><div style={{ fontSize: 11, color: G.textLight }}>{y.date}</div></div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, color: G.success }}>{fmt(y.value)}</div>
              <div style={{ fontSize: 11, color: G.textLight }}>Your: {fmt(Math.round(y.value * ratio))}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = {
  admin:  [{id:"dashboard",label:"Dashboard",icon:"▦"},{id:"cells",label:"All Cells",icon:"⬡"},{id:"rins",label:"RIN Ledger",icon:"◈"},{id:"farms",label:"Farm Overview",icon:"⊛"},{id:"capital",label:"Capital Desk",icon:"◉"}],
  lead:   [{id:"cell",label:"My Cell",icon:"⬡"},{id:"rin",label:"RIN Manager",icon:"◈"},{id:"farm",label:"Farm Log",icon:"⊛"},{id:"members",label:"Members",icon:"◇"}],
  member: [{id:"home",label:"My Overview",icon:"▦"},{id:"contributions",label:"Contributions",icon:"◈"},{id:"farm",label:"Farm Updates",icon:"⊛"}],
};

const Sidebar = ({ role, active, onNav, onLogout, open, onClose }) => {
  const mob = useIsMob();
  const cell = SEED_CELLS[0];
  const roleLabel = { admin: "Neoulo Admin", lead: "Cell Lead", member: "Cell Member" }[role];
  const roleSub   = { admin: "Full Access",  lead: cell.members[0].name, member: cell.members[1].name }[role];

  return (
    <>
      {mob && open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 499 }}/>}
      <div style={{ width: 220, minHeight: "100vh", background: G.forest, display: "flex", flexDirection: "column", flexShrink: 0, ...(mob ? { position: "fixed", top: 0, left: open ? 0 : -224, height: "100vh", zIndex: 500, transition: "left 0.26s ease", boxShadow: open ? "4px 0 24px rgba(0,0,0,0.3)" : "none" } : {}) }}>
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: G.white }}>Neoulo Trust</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.8, textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginTop: 2 }}>Cooperative Platform</div>
        </div>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 3 }}>{roleLabel}</div>
          <div style={{ fontSize: 13, color: G.white, fontWeight: 600 }}>{roleSub}</div>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {NAV[role].map(n => (
            <button key={n.id} className="nbg" onClick={() => { onNav(n.id); if(mob) onClose(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: active === n.id ? "rgba(255,255,255,0.12)" : "transparent", color: active === n.id ? G.white : "rgba(255,255,255,0.5)", fontWeight: active === n.id ? 600 : 400, fontSize: 13, textAlign: "left", marginBottom: 2, transition: "all 0.15s" }}>
              <span style={{ fontSize: 13 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={onLogout} className="nbg" style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "left" }}>← Switch role</button>
        </div>
      </div>
    </>
  );
};

// ─── LANDING ──────────────────────────────────────────────────────────────────
const Landing = ({ onSelect }) => (
  <div style={{ minHeight: "100vh", background: G.forest, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: 20 }}>
    <GeomBg op={0.07}/>
    <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 380 }}>
      <div className="fu" style={{ marginBottom: 32 }}>
        <div style={{ width: 62, height: 62, margin: "0 auto 14px", background: "rgba(255,255,255,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M18 3L31 10.5L31 25.5L18 33L5 25.5L5 10.5Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M18 3L18 33 M5 10.5L31 25.5 M31 10.5L5 25.5" stroke="white" strokeWidth="0.7" opacity="0.3"/>
            <circle cx="18" cy="18" r="5" stroke="white" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, color: G.white, fontWeight: 400, letterSpacing: -0.8 }}>Neoulo Trust</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 6 }}>Cooperative Ecosystem Platform</p>
      </div>
      <div className="fu2" style={{ marginBottom: 28 }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 14 }}>Sign in as</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[{role:"admin",label:"Neoulo Admin",sub:"Full portfolio visibility",icon:"◈"},{role:"lead",label:"Cell Lead",sub:"Emeka Okafor · Umuahia Alpha",icon:"◆"},{role:"member",label:"Cell Member",sub:"Ngozi Eze · Umuahia Alpha",icon:"◇"}].map(({role,label,sub,icon}) => (
            <button key={role} onClick={() => onSelect(role)}
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, color: G.white, textAlign: "left", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.13)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}>
              <span style={{ fontSize: 18, opacity: 0.55 }}>{icon}</span>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{sub}</div></div>
            </button>
          ))}
        </div>
      </div>
      <p className="fu3" style={{ color: "rgba(255,255,255,0.18)", fontSize: 10, fontFamily: "DM Mono, monospace", letterSpacing: 1.2 }}>MVP PROTOTYPE · FEB 2026</p>
    </div>
  </div>
);

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function NeoApp() {
  const mob = useIsMob();
  const [role,      setRole]      = useState(null);
  const [view,      setView]      = useState(null);
  const [sideOpen,  setSideOpen]  = useState(false);
  // Lifted state — shared between lead and member roles
  const [cells,     setCells]     = useState(SEED_CELLS);
  const [contribs,  setContribs]  = useState(SEED_CONTRIBS);

  const myCell   = cells[0];
  const myLead   = myCell.members[0];
  const myMember = myCell.members[1];

  const login = (r) => { setRole(r); setView({ admin: "dashboard", lead: "cell", member: "home" }[r]); };
  const logout = () => { setRole(null); setView(null); };
  const toBack = (fallback) => () => setView(fallback);

  const renderContent = () => {
    if (!role) return null;

    if (role === "admin") {
      if (view === "dashboard")      return <AdminDash    cells={cells} contribs={contribs} onNav={setView}/>;
      if (view === "cells")          return <AdminCells   cells={cells} contribs={contribs} onBack={toBack("dashboard")}/>;
      if (view === "rins")           return <AdminRins    cells={cells} contribs={contribs} onBack={toBack("dashboard")}/>;
      if (view === "farms")          return <AdminFarms   cells={cells} onBack={toBack("dashboard")}/>;
      if (view === "capital")        return <AdminCapital cells={cells} contribs={contribs} onBack={toBack("dashboard")}/>;
      if (view === "yieldForecast")  return <YieldForecastView onBack={toBack("dashboard")}/>;
    }

    if (role === "lead") {
      if (view === "cell")    return <LeadCell    cell={myCell} contribs={contribs} onNav={setView}/>;
      if (view === "rin")     return <LeadRIN     cell={myCell} contribs={contribs} onBack={toBack("cell")}/>;
      if (view === "farm")    return <LeadFarm    cell={myCell} onBack={toBack("cell")}/>;
      if (view === "members") return <LeadMembers cell={myCell} contribs={contribs} setContribs={setContribs} onBack={toBack("cell")}/>;
    }

    if (role === "member") {
      if (view === "home")          return <MemberHome          cell={myCell} member={myMember} contribs={contribs} onNav={setView}/>;
      if (view === "contributions") return <MemberContributions member={myMember} contribs={contribs} onBack={toBack("home")}/>;
      if (view === "farm")          return <MemberFarm          cell={myCell} member={myMember} contribs={contribs} onBack={toBack("home")}/>;
    }

    return null;
  };

  return (
    <>
      <GS/>
      {!role ? (
        <Landing onSelect={login}/>
      ) : (
        <div style={{ display: "flex", minHeight: "100vh", background: G.cream }}>
          <Sidebar role={role} active={view} onNav={setView} onLogout={logout} open={sideOpen} onClose={() => setSideOpen(false)}/>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {mob && (
              <div style={{ background: G.forest, padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: G.white }}>Neoulo Trust</div>
                <button onClick={() => setSideOpen(true)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "7px 12px", color: G.white, fontSize: 17 }}>☰</button>
              </div>
            )}
            <main style={{ flex: 1, padding: mob ? "18px 14px 36px" : "28px 32px", overflowY: "auto" }}>
              {renderContent()}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
