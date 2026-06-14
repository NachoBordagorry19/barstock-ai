"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import Shell from "@/components/Shell";
import { Button, Card, Badge, Stat, Field, Input, Select, Toggle } from "@/components/ui";
import { formatARS } from "@/lib/mockData";
import { exportToExcel } from "@/lib/exportExcel";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "inventario", label: "Inventario" },
  { id: "alertas", label: "Alertas" },
  { id: "empleados", label: "Empleados" },
  { id: "reportes", label: "Reportes" },
  { id: "perfil", label: "Mi perfil" },
];

export default function BranchAdmin() {
  const [tab, setTab] = useState("dashboard");
  return (
    <Shell roleLabel="Admin de Sucursal · Palermo Soho" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "dashboard" && <Dashboard onGo={setTab} />}
      {tab === "inventario" && <Inventario />}
      {tab === "alertas" && <Alertas />}
      {tab === "empleados" && <Empleados />}
      {tab === "reportes" && <Reportes />}
      {tab === "perfil" && <Perfil />}
    </Shell>
  );
}

function totals(bottles) {
  return bottles.reduce(
    (acc, b) => {
      acc.sealed += b.sealed;
      acc.open += b.open;
      acc.empty += b.empty;
      acc.value += b.sealed * b.price;
      return acc;
    },
    { sealed: 0, open: 0, empty: 0, value: 0 }
  );
}

function lowStock(bottles) {
  return bottles.filter((b) => b.sealed <= b.threshold);
}

function Dashboard({ onGo }) {
  const { bottles } = useApp();
  const t = totals(bottles);
  const low = lowStock(bottles);
  const maxStock = Math.max(...bottles.map((b) => b.sealed + b.open), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Botellas cerradas" value={t.sealed} sub="Listas para usar" tone="gold" />
        <Stat label="Botellas abiertas" value={t.open} sub="En servicio" />
        <Stat label="Valor del stock" value={formatARS(t.value)} sub="Botellas cerradas" tone="green" />
        <Stat label="Alertas de compra" value={low.length} sub="Bajo el mínimo" tone={low.length ? "red" : "green"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Stock por producto</h3>
            <Badge tone="gold">En tiempo real</Badge>
          </div>
          <div className="space-y-3.5">
            {bottles.map((b) => {
              const total = b.sealed + b.open;
              return (
                <div key={b.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-300">{b.name}</span>
                    <span className="text-gray-500">{b.sealed} cerradas · {b.open} abiertas</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${b.sealed <= b.threshold ? "bg-gradient-to-r from-red-500 to-amber-500" : "bg-gradient-to-r from-gold-400 to-gold-600"}`}
                      style={{ width: `${(total / maxStock) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Necesitás comprar</h3>
          {low.length === 0 ? (
            <p className="text-sm text-gray-400">Todo el stock está por encima del mínimo. 👌</p>
          ) : (
            <div className="space-y-3">
              {low.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <div>
                    <div className="text-sm font-medium text-gray-200">{b.name}</div>
                    <div className="text-xs text-gray-500">Quedan {b.sealed} · mínimo {b.threshold}</div>
                  </div>
                  <Badge tone="red">Reponer</Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full" onClick={() => onGo("alertas")}>Ver todas las alertas</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Inventario() {
  const { bottles, addBottle, updateBottle } = useApp();
  const [editing, setEditing] = useState(null);
  const empty = { name: "", category: "Whisky", barcode: "", sealed: 0, open: 0, empty: 0, threshold: 2, price: 0 };
  const [form, setForm] = useState(empty);
  const [scanning, setScanning] = useState(false);

  const categories = ["Whisky", "Vodka", "Ron", "Gin", "Tequila", "Amargo", "Aperitivo", "Otro"];

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      // Simula la lectura del código de barras al dar de alta un producto.
      const code = "779" + Math.floor(1000000000 + Math.random() * 8999999999);
      setForm((f) => ({ ...f, barcode: code }));
      setScanning(false);
    }, 1400);
  };

  const save = (e) => {
    e.preventDefault();
    addBottle({
      ...form,
      sealed: Number(form.sealed),
      open: Number(form.open),
      empty: Number(form.empty),
      threshold: Number(form.threshold),
      price: Number(form.price),
    });
    setForm(empty);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form alta */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="mb-1 font-semibold">Cargar stock previo</h3>
        <p className="mb-5 text-sm text-gray-400">
          Registrá cuántas botellas tenés y escaneá el producto una sola vez. El código de barras queda guardado.
        </p>
        <form onSubmit={save} className="space-y-4">
          <Field label="Producto">
            <Input required placeholder="Ej: Gin Beefeater" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Precio unitario (ARS)">
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
          </div>

          <Field label="Código de barras" hint="Se escanea una única vez por producto.">
            <div className="flex gap-2">
              <Input placeholder="Escaneá o ingresá el código" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              <Button type="button" variant="ghost" onClick={simulateScan} disabled={scanning}>
                {scanning ? "Leyendo…" : "Escanear"}
              </Button>
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Cerradas">
              <Input type="number" min="0" value={form.sealed} onChange={(e) => setForm({ ...form, sealed: e.target.value })} />
            </Field>
            <Field label="Abiertas">
              <Input type="number" min="0" value={form.open} onChange={(e) => setForm({ ...form, open: e.target.value })} />
            </Field>
            <Field label="Mínimo (alerta)">
              <Input type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
            </Field>
          </div>

          <Button type="submit" className="w-full">Agregar al inventario</Button>
        </form>
      </Card>

      {/* Lista */}
      <Card className="p-6 lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Inventario actual</h3>
          <Badge>{bottles.length} productos</Badge>
        </div>
        <div className="space-y-2.5">
          {bottles.map((b) => (
            <div key={b.id} className="rounded-xl border border-white/5 bg-ink-850 p-4">
              {editing === b.id ? (
                <EditRow bottle={b} onCancel={() => setEditing(null)} onSave={(patch) => { updateBottle(b.id, patch); setEditing(null); }} categories={categories} />
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-gray-200">{b.name}</span>
                      <Badge tone="gold">{b.category}</Badge>
                      {b.sealed <= b.threshold && <Badge tone="red">Bajo</Badge>}
                    </div>
                    <div className="mt-1 font-mono text-xs text-gray-500">cod: {b.barcode || "—"}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-center text-xs">
                    <Counter label="Cerr." value={b.sealed} tone="gold" />
                    <Counter label="Abie." value={b.open} />
                    <Counter label="Vac." value={b.empty} tone="muted" />
                    <Button variant="ghost" onClick={() => setEditing(b.id)} className="px-3 py-2">Editar</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          El stock de abiertas/vacías refleja el recuento del scanner. El admin corrige registros, pero el estado de
          apertura lo define el operario.
        </p>
      </Card>
    </div>
  );
}

function Counter({ label, value, tone }) {
  const c = tone === "gold" ? "text-gold-300" : tone === "muted" ? "text-gray-500" : "text-gray-200";
  return (
    <div>
      <div className={`text-lg font-bold ${c}`}>{value}</div>
      <div className="text-[10px] uppercase text-gray-500">{label}</div>
    </div>
  );
}

function EditRow({ bottle, onCancel, onSave, categories }) {
  const [f, setF] = useState({ ...bottle });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Producto">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Categoría">
          <Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Field label="Cerradas"><Input type="number" min="0" value={f.sealed} onChange={(e) => setF({ ...f, sealed: Number(e.target.value) })} /></Field>
        <Field label="Abiertas"><Input type="number" min="0" value={f.open} onChange={(e) => setF({ ...f, open: Number(e.target.value) })} /></Field>
        <Field label="Vacías"><Input type="number" min="0" value={f.empty} onChange={(e) => setF({ ...f, empty: Number(e.target.value) })} /></Field>
        <Field label="Mínimo"><Input type="number" min="0" value={f.threshold} onChange={(e) => setF({ ...f, threshold: Number(e.target.value) })} /></Field>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave(f)}>Guardar cambios</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

function Alertas() {
  const { bottles } = useApp();
  const low = lowStock(bottles);
  const suggestion = (b) => Math.max(b.threshold * 2 - b.sealed, 1);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Alertas de reposición</h3>
          <p className="text-sm text-gray-400">Productos que alcanzaron o bajaron del stock mínimo.</p>
        </div>
        <Badge tone={low.length ? "red" : "green"}>{low.length} alertas</Badge>
      </div>

      {low.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-emerald-300">
          Todo en orden: ningún producto está por debajo del mínimo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-3 pr-4">Producto</th>
                <th className="py-3 pr-4">Cerradas</th>
                <th className="py-3 pr-4">Mínimo</th>
                <th className="py-3 pr-4">Sugerido a comprar</th>
                <th className="py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {low.map((b) => (
                <tr key={b.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-200">{b.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{b.sealed}</td>
                  <td className="py-3 pr-4 text-gray-400">{b.threshold}</td>
                  <td className="py-3 pr-4"><span className="font-semibold gold-text">{suggestion(b)} u.</span></td>
                  <td className="py-3"><Badge tone={b.sealed === 0 ? "red" : "amber"}>{b.sealed === 0 ? "Sin stock" : "Stock bajo"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Empleados() {
  const { scannerUsers, updateScannerUser } = useApp();
  const [editing, setEditing] = useState(null);

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-semibold">Empleados (usuarios Scanner)</h3>
        <Badge>{scannerUsers.filter((u) => u.active).length} activos</Badge>
      </div>
      <p className="mb-5 text-sm text-gray-400">
        Podés modificar o desactivar a tus operarios. La creación y eliminación de usuarios la gestiona el Admin de la App.
      </p>

      <div className="space-y-2.5">
        {scannerUsers.map((u) => (
          <div key={u.id} className="rounded-xl border border-white/5 bg-ink-850 p-4">
            {editing === u.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre"><Input value={u.name} onChange={(e) => updateScannerUser(u.id, { name: e.target.value })} /></Field>
                  <Field label="Turno">
                    <Select value={u.shift} onChange={(e) => updateScannerUser(u.id, { shift: e.target.value })}>
                      <option>Mañana</option><option>Tarde</option><option>Noche</option>
                    </Select>
                  </Field>
                </div>
                <Button onClick={() => setEditing(null)}>Listo</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-500/15 font-semibold text-gold-300">
                    {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="font-medium text-gray-200">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.code} · Turno {u.shift}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge tone={u.active ? "green" : "neutral"}>{u.active ? "Activo" : "Inactivo"}</Badge>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Activo</span>
                    <Toggle checked={u.active} onChange={(v) => updateScannerUser(u.id, { active: v })} />
                  </div>
                  <Button variant="ghost" onClick={() => setEditing(u.id)} className="px-3 py-2">Editar</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function Reportes() {
  const { bottles } = useApp();
  const t = totals(bottles);

  const exportInventory = () => {
    exportToExcel(
      "barstock_inventario_palermo",
      ["Producto", "Categoría", "Código de barras", "Cerradas", "Abiertas", "Vacías", "Mínimo", "Precio unit.", "Valor stock"],
      bottles.map((b) => [b.name, b.category, b.barcode, b.sealed, b.open, b.empty, b.threshold, b.price, b.sealed * b.price])
    );
  };

  const exportLow = () => {
    const low = lowStock(bottles);
    exportToExcel(
      "barstock_reposicion_palermo",
      ["Producto", "Cerradas", "Mínimo", "Sugerido a comprar"],
      low.map((b) => [b.name, b.sealed, b.threshold, Math.max(b.threshold * 2 - b.sealed, 1)])
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Productos" value={bottles.length} />
        <Stat label="Botellas totales" value={t.sealed + t.open + t.empty} />
        <Stat label="Valor inventario" value={formatARS(t.value)} tone="green" />
      </div>

      <Card className="p-6">
        <h3 className="mb-1 font-semibold">Exportar reportes</h3>
        <p className="mb-5 text-sm text-gray-400">Descargá los datos en formato Excel para auditoría.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button onClick={exportInventory} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-ink-850 p-5 text-left transition hover:border-gold-500/40">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <ExcelIcon />
            </div>
            <div>
              <div className="font-semibold text-gray-100">Inventario completo</div>
              <div className="text-sm text-gray-400">Todos los productos con stock y valores</div>
            </div>
          </button>
          <button onClick={exportLow} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-ink-850 p-5 text-left transition hover:border-gold-500/40">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
              <ExcelIcon />
            </div>
            <div>
              <div className="font-semibold text-gray-100">Lista de reposición</div>
              <div className="text-sm text-gray-400">Solo productos bajo el mínimo</div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}

function ExcelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13l6 6M15 13l-6 6" />
    </svg>
  );
}

function Perfil() {
  const [pwd, setPwd] = useState({ actual: "", nueva: "", repetir: "" });
  const [msg, setMsg] = useState("");

  const save = (e) => {
    e.preventDefault();
    if (pwd.nueva && pwd.nueva === pwd.repetir) {
      setMsg("Contraseña actualizada correctamente (demo).");
      setPwd({ actual: "", nueva: "", repetir: "" });
    } else {
      setMsg("Las contraseñas nuevas no coinciden.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-5 font-semibold">Mi perfil</h3>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-2xl font-bold text-ink-900">CM</div>
          <div>
            <div className="text-lg font-semibold">Carlos Medina</div>
            <div className="text-sm text-gray-400">Sucursal Palermo Soho</div>
            <div className="text-sm text-gray-500">carlos@barstock.ai</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-5 font-semibold">Cambiar contraseña</h3>
        <form onSubmit={save} className="space-y-4">
          <Field label="Contraseña actual"><Input type="password" value={pwd.actual} onChange={(e) => setPwd({ ...pwd, actual: e.target.value })} /></Field>
          <Field label="Nueva contraseña"><Input type="password" value={pwd.nueva} onChange={(e) => setPwd({ ...pwd, nueva: e.target.value })} /></Field>
          <Field label="Repetir nueva contraseña"><Input type="password" value={pwd.repetir} onChange={(e) => setPwd({ ...pwd, repetir: e.target.value })} /></Field>
          <Button type="submit">Actualizar contraseña</Button>
          {msg && <p className="text-sm text-gold-300">{msg}</p>}
        </form>
      </Card>
    </div>
  );
}
