"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Logo, Button, Card, Field, Input, Select } from "@/components/ui";

const roles = [
  { value: "scanner", label: "Scanner (Operario de inventario)" },
  { value: "branch", label: "Administrador de sucursal" },
  { value: "admin-app", label: "Administrador de la App" },
];

export default function Login() {
  const { login, navigate } = useApp();
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!role) return;
    // Acceso simulado: no se valida la contraseña.
    login(role);
  };

  const isAdminApp = role === "admin-app";

  return (
    <div className="grid min-h-screen grid-bg place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <button onClick={() => navigate("landing")} className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-gold-300">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Volver al inicio
        </button>

        <Card className="p-8 shadow-glow animate-fade-up">
          <div className="mb-7 flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="mt-5 text-2xl font-bold">Acceso al sistema</h1>
            <p className="mt-1 text-sm text-gray-400">Seleccioná tu rol para ingresar</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field label="Tipo de usuario">
              <Select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="" disabled>Seleccionar rol…</option>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Contraseña" hint={isAdminApp ? "El Admin de la App requiere clave secreta (demo: cualquier valor)." : "Demo: no se valida, ingresá cualquier valor."}>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button type="submit" disabled={!role} className="w-full py-3 text-base">
              Ingresar
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-white/5 bg-ink-850 p-3 text-center text-xs text-gray-500">
            Modo demostración · acceso sin autenticación real
          </div>
        </Card>
      </div>
    </div>
  );
}
