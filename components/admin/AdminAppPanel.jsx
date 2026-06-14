"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import Shell from "@/components/Shell";
import { Button, Card, Badge, Stat, Field, Input, Select, Toggle } from "@/components/ui";
import { branchMetrics, formatARS } from "@/lib/mockData";

const TABS = [
  { id: "global", label: "Panel global" },
  { id: "admins", label: "Admins de sucursal" },
  { id: "dispositivos", label: "Dispositivos" },
  { id: "reportes", label: "Reportes globales" },
];

export default function AdminAppPanel() {
  const [tab, setTab] = useState("global");
  return (
    <Shell roleLabel="Administrador de la App · Control maestro" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "global" && <GlobalPanel />}
      {tab === "admins" && <Admins />}
      {tab === "dispositivos" && <Devices />}
      {tab === "reportes" && <GlobalReports />}
    </Shell>
  );
}

function GlobalPanel() {
  const { branchAdmins, devices } = useApp();
  const totalBottles = branchMetrics.reduce((a, b) => a + b.botellas, 0);
  const totalValue = branchMetrics.reduce((a, b) => a + b.valorStock, 0);
  const avgMerma = (branchMetrics.reduce((a, b) => a + b.mermas, 0) / branchMetrics.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sucursales activas" value={branchMetrics.length} tone="gold" />
        <Stat label="Botellas en red" value={totalBottles} sub="Todas las sucursales" />
        <Stat label="Valor total stock" value={formatARS(totalValue)} tone="green" />
        <Stat label="Merma promedio" value={`${avgMerma}%`} tone={avgMerma > 5 ? "red" : "green"} />
      </div>

      <Card className="p-6">
        <h3 className="mb-5 font-semibold">Desempeño por sucursal</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-3 pr-4">Sucursal</th>
                <th className="py-3 pr-4">Botellas</th>
                <th className="py-3 pr-4">Merma</th>
                <th className="py-3 pr-4">Valor stock</th>
                <th className="py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {branchMetrics.map((m) => (
                <tr key={m.branch} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-200">{m.branch}</td>
                  <td className="py-3 pr-4 text-gray-400">{m.botellas}</td>
                  <td className="py-3 pr-4 text-gray-400">{m.mermas}%</td>
                  <td className="py-3 pr-4 text-gray-400">{formatARS(m.valorStock)}</td>
                  <td className="py-3"><Badge tone={m.estado === "Óptimo" ? "green" : "amber"}>{m.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Administradores de sucursal</h3>
            <Badge tone="gold">{branchAdmins.filter((a) => a.active).length} activos</Badge>
          </div>
          <p className="mt-2 text-sm text-gray-400">Gestión de altas, modificación y desactivación de cuentas de encargados.</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Dispositivos de escaneo</h3>
            <Badge tone="gold">{devices.filter((d) => d.active).length} en línea</Badge>
          </div>
          <p className="mt-2 text-sm text-gray-400">Alta y configuración de nuevos scanners en cada sucursal.</p>
        </Card>
      </div>
    </div>
  );
}

function Admins() {
  const { branchAdmins, addBranchAdmin, updateBranchAdmin } = useApp();
  const [form, setForm] = useState({ name: "", branch: "", email: "", active: true });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.branch) return;
    addBranchAdmin(form);
    setForm({ name: "", branch: "", email: "", active: true });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="p-6 lg:col-span-2">
        <h3 className="mb-1 font-semibold">Crear administrador de sucursal</h3>
        <p className="mb-5 text-sm text-gray-400">Alta de un nuevo encargado con acceso a su inventario local.</p>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nombre completo"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Ana Torres" /></Field>
          <Field label="Sucursal"><Input required value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Ej: Belgrano" /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ana@barstock.ai" /></Field>
          <Button type="submit" className="w-full">Crear administrador</Button>
        </form>
      </Card>

      <Card className="p-6 lg:col-span-3">
        <h3 className="mb-4 font-semibold">Administradores existentes</h3>
        <div className="space-y-2.5">
          {branchAdmins.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-ink-850 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-500/15 font-semibold text-gold-300">
                  {a.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-medium text-gray-200">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.branch}{a.email ? ` · ${a.email}` : ""}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={a.active ? "green" : "neutral"}>{a.active ? "Activo" : "Desactivado"}</Badge>
                <Toggle checked={a.active} onChange={(v) => updateBranchAdmin(a.id, { active: v })} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Devices() {
  const { devices, addDevice } = useApp();
  const { updateDevice } = useApp();
  const [form, setForm] = useState({ name: "", branch: "", model: "BS-Scan X1", active: true });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.branch) return;
    addDevice(form);
    setForm({ name: "", branch: "", model: "BS-Scan X1", active: true });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="p-6 lg:col-span-2">
        <h3 className="mb-1 font-semibold">Dar de alta dispositivo</h3>
        <p className="mb-5 text-sm text-gray-400">Configurá un nuevo scanner para una sucursal.</p>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nombre del dispositivo"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Scanner Barra 2" /></Field>
          <Field label="Sucursal"><Input required value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Ej: Palermo Soho" /></Field>
          <Field label="Modelo">
            <Select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
              <option>BS-Scan X1</option><option>BS-Scan Pro</option><option>BS-Scan Lite</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full">Registrar dispositivo</Button>
        </form>
      </Card>

      <Card className="p-6 lg:col-span-3">
        <h3 className="mb-4 font-semibold">Dispositivos registrados</h3>
        <div className="space-y-2.5">
          {devices.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-ink-850 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-700 text-gold-300">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14" /></svg>
                </div>
                <div>
                  <div className="font-medium text-gray-200">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.branch} · {d.model}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={d.active ? "green" : "neutral"}>{d.active ? "En línea" : "Inactivo"}</Badge>
                <Toggle checked={d.active} onChange={(v) => updateDevice(d.id, { active: v })} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GlobalReports() {
  return (
    <Card className="p-6">
      <h3 className="mb-5 font-semibold">Reportes globales</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {branchMetrics.map((m) => (
          <div key={m.branch} className="rounded-xl border border-white/5 bg-ink-850 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium text-gray-200">{m.branch}</span>
              <Badge tone={m.estado === "Óptimo" ? "green" : "amber"}>{m.estado}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Botellas" value={m.botellas} />
              <Row label="Merma" value={`${m.mermas}%`} />
              <Row label="Valor stock" value={formatARS(m.valorStock)} />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
              <div className={`h-full rounded-full ${m.mermas > 5 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(m.mermas * 12, 100)}%` }} />
            </div>
            <div className="mt-1 text-xs text-gray-500">Índice de merma</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}
