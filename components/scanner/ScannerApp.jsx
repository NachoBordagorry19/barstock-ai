"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import Shell from "@/components/Shell";
import { Button, Card, Badge } from "@/components/ui";
import { aiDetectionResult } from "@/lib/mockData";

const TABS = [
  { id: "barcode", label: "Código de barras" },
  { id: "ai", label: "Visión Artificial (IA)" },
];

export default function ScannerApp() {
  const [tab, setTab] = useState("barcode");
  // Sesión de conteo de la noche (tally en memoria).
  const [session, setSession] = useState({ cerrada: 0, abierta: 0, vacia: 0, log: [] });

  const addCount = (state, productName) => {
    setSession((s) => ({
      ...s,
      [state]: s[state] + 1,
      log: [{ id: Date.now(), state, productName, time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }, ...s.log].slice(0, 12),
    }));
  };

  return (
    <Shell roleLabel="Scanner · Operario de inventario" tabs={TABS} active={tab} onTab={setTab}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {tab === "barcode" && <BarcodeMode onCount={addCount} />}
          {tab === "ai" && <AIMode />}
        </div>
        <SessionPanel session={session} />
      </div>
    </Shell>
  );
}

const SAMPLE_PRODUCTS = [
  { name: "Johnnie Walker Red Label", category: "Whisky", barcode: "5000267023656" },
  { name: "Smirnoff Vodka", category: "Vodka", barcode: "5410316950107" },
  { name: "Fernet Branca", category: "Amargo", barcode: "7790140001017" },
  { name: "Bacardí Carta Blanca", category: "Ron", barcode: "7501035010994" },
];

function BarcodeMode({ onCount }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | found
  const [product, setProduct] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const scan = () => {
    setPhase("scanning");
    setConfirmed(null);
    setTimeout(() => {
      // Demo: reconoce un producto específico (Johnnie Walker Red en la primera).
      const p = product ? SAMPLE_PRODUCTS[Math.floor(Math.random() * SAMPLE_PRODUCTS.length)] : SAMPLE_PRODUCTS[0];
      setProduct(p);
      setPhase("found");
    }, 1800);
  };

  const choose = (state, label) => {
    onCount(state, product.name);
    setConfirmed(label);
    setPhase("idle");
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Visor de cámara simulado */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-800/40 via-transparent to-ink-900/60" />
        {/* retícula */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative h-2/3 w-2/3 rounded-2xl border-2 border-gold-400/40">
            <Corner className="-left-px -top-px rotate-0" />
            <Corner className="-right-px -top-px rotate-90" />
            <Corner className="-bottom-px -right-px rotate-180" />
            <Corner className="-bottom-px -left-px -rotate-90" />
            {phase === "scanning" && (
              <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
                <div className="animate-scan h-0.5 w-full bg-gold-400 shadow-[0_0_12px_2px_rgba(212,160,23,0.8)]" />
              </div>
            )}
          </div>
        </div>

        {phase === "idle" && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="relative mx-auto mb-3 grid h-16 w-16 place-items-center">
                <span className="animate-ring absolute inset-0 rounded-full bg-gold-400/30" />
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-500/20 text-gold-300">
                  <BarcodeIcon />
                </span>
              </div>
              <p className="text-sm text-gray-300">Apuntá la cámara al código de barras</p>
            </div>
          </div>
        )}

        {phase === "found" && product && (
          <div className="absolute bottom-4 left-4 right-4 animate-fade-up rounded-xl border border-gold-500/30 bg-ink-900/90 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Badge tone="green">Producto reconocido</Badge>
              <span className="font-mono text-xs text-gray-500">{product.barcode}</span>
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-100">{product.name}</div>
            <div className="text-sm text-gray-400">{product.category}</div>
          </div>
        )}

        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-gray-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC · Barra Principal
        </div>
      </div>

      {/* Controles */}
      <div className="p-5">
        {confirmed && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-300 animate-fade-up">
            Registrado: <strong>{confirmed}</strong>. Escaneá la siguiente botella.
          </div>
        )}

        {phase !== "found" ? (
          <Button onClick={scan} disabled={phase === "scanning"} className="w-full py-4 text-base">
            {phase === "scanning" ? "Escaneando…" : "Escanear botella"}
          </Button>
        ) : (
          <div>
            <p className="mb-3 text-center text-sm text-gray-400">¿En qué estado está la botella?</p>
            <div className="grid grid-cols-3 gap-3">
              <BigBtn color="emerald" label="Cerrada" sub="Sin abrir" onClick={() => choose("cerrada", "Cerrada")} />
              <BigBtn color="amber" label="Abierta" sub="En uso" onClick={() => choose("abierta", "Abierta")} />
              <BigBtn color="red" label="Vacía" sub="Descartar" onClick={() => choose("vacia", "Vacía")} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function BigBtn({ color, label, sub, onClick }) {
  const colors = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300",
    amber: "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300",
    red: "border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300",
  };
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-6 transition active:scale-95 ${colors[color]}`}>
      <span className="text-xl font-bold">{label}</span>
      <span className="text-xs opacity-70">{sub}</span>
    </button>
  );
}

function AIMode() {
  const [phase, setPhase] = useState("idle"); // idle | analyzing | done
  const r = aiDetectionResult;

  const analyze = () => {
    setPhase("analyzing");
    setTimeout(() => setPhase("done"), 2600);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        {phase === "idle" ? (
          <div className="absolute inset-0 grid place-items-center bg-ink-850">
            <div className="text-center">
              <div className="relative mx-auto mb-4 grid h-20 w-20 place-items-center">
                <span className="animate-ring absolute inset-0 rounded-full bg-gold-400/30" />
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gold-500/20 text-gold-300"><CameraIcon /></span>
              </div>
              <p className="text-gray-300">Encuadrá toda la barra en la foto</p>
              <p className="mt-1 text-sm text-gray-500">La IA cuenta las botellas y su nivel de contenido</p>
            </div>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ai-sample.png" alt="Análisis de inventario con visión artificial" className="h-full w-full object-cover" />
            {phase === "analyzing" && (
              <div className="absolute inset-0 bg-ink-900/40">
                <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
                  <div className="animate-scan h-1 w-full bg-gold-400/90 shadow-[0_0_20px_4px_rgba(212,160,23,0.9)]" />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink-900/90 px-5 py-2 text-sm text-gold-300 backdrop-blur">
                  Analizando imagen con IA…
                </div>
              </div>
            )}
            {phase === "done" && <DetectionOverlay />}
          </>
        )}

        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-gray-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Modo IA
        </div>
      </div>

      <div className="p-5">
        {phase !== "done" ? (
          <Button onClick={analyze} disabled={phase === "analyzing"} className="w-full py-4 text-base">
            {phase === "analyzing" ? "Procesando…" : phase === "idle" ? "Tomar fotografía" : "Reintentar"}
          </Button>
        ) : (
          <div className="animate-fade-up">
            <div className="mb-4 grid grid-cols-4 gap-3 text-center">
              <ResultStat value={r.total} label="Botellas" tone="gold" />
              <ResultStat value={r.llenas} label="Llenas" tone="green" />
              <ResultStat value={r.parciales} label="Parciales" tone="amber" />
              <ResultStat value={r.vacias} label="Vacías" tone="red" />
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {r.bottles.map((b, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-850 px-3 py-2 text-sm">
                  <span className="text-gray-300">{b.name}</span>
                  <div className="flex items-center gap-2">
                    <LevelBadge level={b.level} />
                    <span className="font-mono text-xs text-gray-500">{Math.round(b.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="success" className="mt-4 w-full">Confirmar y guardar conteo</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function DetectionOverlay() {
  // Cajas de detección simuladas sobre la imagen de muestra.
  const boxes = [
    { l: "8%", t: "30%", w: "9%", h: "52%" },
    { l: "19%", t: "38%", w: "8%", h: "44%" },
    { l: "29%", t: "22%", w: "8%", h: "60%" },
    { l: "39%", t: "34%", w: "8%", h: "48%" },
    { l: "49%", t: "28%", w: "8%", h: "54%" },
    { l: "59%", t: "20%", w: "8%", h: "62%" },
    { l: "69%", t: "32%", w: "8%", h: "50%" },
    { l: "79%", t: "26%", w: "8%", h: "56%" },
  ];
  return (
    <div className="absolute inset-0">
      {boxes.map((b, i) => (
        <div key={i} className="absolute rounded border-2 border-gold-400/80 animate-fade-up" style={{ left: b.l, top: b.t, width: b.w, height: b.h, animationDelay: `${i * 80}ms` }}>
          <span className="absolute -top-5 left-0 rounded bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-ink-900">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function ResultStat({ value, label, tone }) {
  const t = { gold: "gold-text", green: "text-emerald-400", amber: "text-amber-400", red: "text-red-400" };
  return (
    <div className="rounded-xl border border-white/5 bg-ink-850 py-3">
      <div className={`text-2xl font-bold ${t[tone]}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}

function LevelBadge({ level }) {
  const tone = level === "Llena" ? "green" : level === "Parcial" ? "amber" : "red";
  return <Badge tone={tone}>{level}</Badge>;
}

function SessionPanel({ session }) {
  const total = session.cerrada + session.abierta + session.vacia;
  return (
    <Card className="h-fit p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Recuento de la noche</h3>
        <Badge tone="gold">{total} contadas</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <ResultStat value={session.cerrada} label="Cerradas" tone="green" />
        <ResultStat value={session.abierta} label="Abiertas" tone="amber" />
        <ResultStat value={session.vacia} label="Vacías" tone="red" />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Actividad reciente</div>
        {session.log.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no escaneaste ninguna botella.</p>
        ) : (
          <div className="space-y-1.5">
            {session.log.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg bg-ink-850 px-3 py-2 text-sm animate-fade-up">
                <span className="truncate text-gray-300">{l.productName}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <LevelBadge level={l.state === "cerrada" ? "Llena" : l.state === "abierta" ? "Parcial" : "Vacía"} />
                  <span className="text-[10px] text-gray-500">{l.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-gray-500">Solo el operario define si una botella está abierta o vacía. El admin no edita este dato.</p>
    </Card>
  );
}

function Corner({ className }) {
  return <span className={`absolute h-5 w-5 border-l-2 border-t-2 border-gold-400 ${className}`} />;
}
function BarcodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v14" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
