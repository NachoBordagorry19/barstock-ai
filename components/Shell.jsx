"use client";

import { useApp } from "@/components/AppProvider";
import { Logo, Badge } from "@/components/ui";

export default function Shell({ title, roleLabel, tabs, active, onTab, children }) {
  const { logout } = useApp();

  return (
    <div className="min-h-screen grid-bg">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Logo />
              <span className="hidden h-6 w-px bg-white/10 sm:block" />
              <Badge tone="gold">{roleLabel}</Badge>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-gray-300 transition hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

          {tabs && (
            <nav className="flex gap-1 overflow-x-auto pb-px">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTab(t.id)}
                  className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                    active === t.id ? "text-gold-300" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {t.label}
                  {active === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold-400" />}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {title && <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
