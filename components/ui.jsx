"use client";

// Pequeña librería de componentes UI reutilizables (estética premium, dark).

export function Logo({ size = "md" }) {
  const dim = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`${dim} relative grid place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow`}>
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-ink-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2h8" />
          <path d="M9 2v4.5L5.5 12A4 4 0 0 0 9 18h6a4 4 0 0 0 3.5-6L15 6.5V2" />
          <path d="M6.5 10h11" />
        </svg>
      </div>
      <div className={`${text} font-bold tracking-tight leading-none`}>
        Barstock <span className="gold-text">AI</span>
      </div>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm active:scale-[0.98]";
  const variants = {
    primary: "bg-gradient-to-br from-gold-400 to-gold-600 text-ink-900 hover:brightness-110 shadow-glow",
    ghost: "bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10",
    danger: "bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30",
    success: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`glass rounded-2xl ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white/8 text-gray-300 border-white/10",
    gold: "bg-gold-500/15 text-gold-300 border-gold-500/30",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    red: "bg-red-500/15 text-red-300 border-red-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-ink-850 px-3.5 py-2.5 text-sm text-gray-100 outline-none transition focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 placeholder:text-gray-600 ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-ink-850 px-3.5 py-2.5 text-sm text-gray-100 outline-none transition focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 ${props.className || ""}`}
    />
  );
}

export function Stat({ label, value, sub, tone = "neutral" }) {
  const toneText = {
    neutral: "text-gray-100",
    gold: "gold-text",
    green: "text-emerald-400",
    red: "text-red-400",
  };
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${toneText[tone]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </Card>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-emerald-500/80" : "bg-white/15"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}
