"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Logo, Button, Card, Badge, Input, Field } from "@/components/ui";

const benefits = [
  {
    title: "Control en tiempo real",
    desc: "Visualizá el stock de bebidas de todas tus barras al instante. Cada botella, cerrada, abierta o vacía, siempre contabilizada.",
    icon: "M3 12h18M3 6h18M3 18h18",
  },
  {
    title: "Optimización de compras",
    desc: "Recibí alertas automáticas cuando un producto baja del mínimo. Comprá lo justo y nunca te quedes sin tus tragos estrella.",
    icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  },
  {
    title: "Reducción de mermas",
    desc: "Detectá pérdidas operativas y faltantes comparando el conteo de fin de noche contra lo cargado. Menos mermas, más margen.",
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    title: "Conteo con visión artificial",
    desc: "Tomá una foto de la barra y la IA identifica cantidad de botellas y nivel de contenido automáticamente. Inventario en segundos.",
    icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  },
];

export default function Landing() {
  const { navigate } = useApp();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", bar: "", email: "" });

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
            <a href="#beneficios" className="hover:text-gold-300 transition">Beneficios</a>
            <a href="#como-funciona" className="hover:text-gold-300 transition">Cómo funciona</a>
            <a href="#contacto" className="hover:text-gold-300 transition">Contacto</a>
          </nav>
          <Button onClick={() => navigate("login")}>Ingresar</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="animate-fade-up">
            <Badge tone="gold">Gestión automatizada de inventario para bares</Badge>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              El <span className="gold-text">control de inventario de bebidas</span> que tu bar necesita
            </h1>
            <p className="mt-5 max-w-lg text-lg text-gray-400">
              Barstock AI es el sistema de <strong className="text-gray-200">gestión de stock para bares</strong> que
              automatiza el conteo de botellas con visión artificial, optimiza tus compras y reduce las mermas
              operativas. Control total, en tiempo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => navigate("login")} className="px-6 py-3 text-base">
                Probar la demo
              </Button>
              <a href="#contacto">
                <Button variant="ghost" className="px-6 py-3 text-base">Solicitar información</Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2"><Dot /> Sin instalación</span>
              <span className="flex items-center gap-2"><Dot /> Multisucursal</span>
              <span className="flex items-center gap-2"><Dot /> IA integrada</span>
            </div>
          </div>

          {/* Visual mockup */}
          <div className="animate-fade-up">
            <Card className="overflow-hidden p-0 shadow-glow">
              <div className="flex items-center gap-2 border-b border-white/5 bg-ink-850 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-gray-500">barstock.ai / dashboard</span>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat label="Botellas" value="412" tone="gold" />
                  <MiniStat label="Mermas" value="3.2%" tone="green" />
                  <MiniStat label="A comprar" value="6" tone="amber" />
                </div>
                <div className="rounded-xl border border-white/5 bg-ink-850 p-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
                    <span>Stock por categoría</span>
                    <span className="text-gold-300">En vivo</span>
                  </div>
                  {[
                    ["Whisky", 78],
                    ["Vodka", 62],
                    ["Ron", 45],
                    ["Fernet", 88],
                  ].map(([k, v]) => (
                    <div key={k} className="mb-2.5 last:mb-0">
                      <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>{k}</span>
                        <span>{v}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="border-t border-white/5 bg-ink-900/40 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <Badge tone="gold">Beneficios</Badge>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Todo lo que tu operación necesita</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Diseñado para encargados de bar que quieren dejar de contar botellas a mano y empezar a tomar
              decisiones con datos.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <Card key={b.title} className="p-6 transition hover:border-gold-500/30">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gold-500/15 text-gold-300">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={b.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <Badge tone="gold">Cómo funciona</Badge>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">De la carga al recuento, en 3 pasos</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["01", "Cargá tu stock", "El encargado registra cuántas botellas tiene y escanea cada producto una sola vez. El código de barras queda guardado."],
              ["02", "Operá la noche", "Tu equipo trabaja normalmente. El stock se actualiza cuando comprás reposición o se abren botellas."],
              ["03", "Recuento con IA", "Al cierre, el scanner cuenta las botellas por código o con una foto. La IA detecta cantidad y nivel de contenido."],
            ].map(([n, t, d]) => (
              <Card key={n} className="relative p-6">
                <div className="mb-3 text-4xl font-bold text-white/10">{n}</div>
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-gray-400">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="border-t border-white/5 bg-ink-900/40 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2">
          <div>
            <Badge tone="gold">Contacto</Badge>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">¿Listo para reducir tus mermas?</h2>
            <p className="mt-3 max-w-md text-gray-400">
              Dejanos tus datos y te mostramos cómo Barstock AI puede optimizar el inventario de tu bar. Sin
              compromiso.
            </p>
            <div className="mt-8 space-y-4 text-sm text-gray-400">
              <p className="flex items-center gap-3"><Dot /> Implementación en menos de 48 horas</p>
              <p className="flex items-center gap-3"><Dot /> Soporte dedicado para tu equipo</p>
              <p className="flex items-center gap-3"><Dot /> Reportes exportables a Excel</p>
            </div>
          </div>
          <Card className="p-6">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center animate-fade-up">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 className="text-xl font-semibold">¡Gracias{form.name ? `, ${form.name}` : ""}!</h3>
                <p className="mt-2 text-sm text-gray-400">Recibimos tu consulta. Te contactamos a la brevedad.</p>
                <Button variant="ghost" className="mt-6" onClick={() => { setSent(false); setForm({ name: "", bar: "", email: "" }); }}>
                  Enviar otra consulta
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <Field label="Nombre">
                  <Input required placeholder="Tu nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Nombre del bar">
                  <Input required placeholder="Ej: La Birra Bar" value={form.bar} onChange={(e) => setForm({ ...form, bar: e.target.value })} />
                </Field>
                <Field label="Email">
                  <Input required type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Button type="submit" className="w-full py-3 text-base">Quiero una demo</Button>
                <p className="text-center text-xs text-gray-500">Al enviar aceptás ser contactado por el equipo de Barstock AI.</p>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-gray-500 md:flex-row">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} Barstock AI. Gestión de stock para bares.</p>
          <button onClick={() => navigate("login")} className="hover:text-gold-300 transition">Acceso al sistema →</button>
        </div>
      </footer>
    </div>
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />;
}

function MiniStat({ label, value, tone }) {
  const toneText = { gold: "gold-text", green: "text-emerald-400", amber: "text-amber-400" };
  return (
    <div className="rounded-xl border border-white/5 bg-ink-850 p-3">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-bold ${toneText[tone]}`}>{value}</div>
    </div>
  );
}
