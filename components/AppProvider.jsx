"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import {
  initialBottles,
  initialScannerUsers,
  initialBranchAdmins,
  initialDevices,
  uid,
} from "@/lib/mockData";

const AppCtx = createContext(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}

export function AppProvider({ children }) {
  // Navegación simulada: 'landing' | 'login' | 'admin-app' | 'branch' | 'scanner'
  const [screen, setScreen] = useState("landing");
  const [role, setRole] = useState(null);

  // Estado de datos (en memoria, se reinicia al recargar).
  const [bottles, setBottles] = useState(initialBottles);
  const [scannerUsers, setScannerUsers] = useState(initialScannerUsers);
  const [branchAdmins, setBranchAdmins] = useState(initialBranchAdmins);
  const [devices, setDevices] = useState(initialDevices);

  const navigate = useCallback((s) => setScreen(s), []);

  const login = useCallback((selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "scanner") setScreen("scanner");
    else if (selectedRole === "branch") setScreen("branch");
    else if (selectedRole === "admin-app") setScreen("admin-app");
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setScreen("landing");
  }, []);

  // --- Inventario (Admin de sucursal) ---
  const addBottle = useCallback((bottle) => {
    setBottles((prev) => [{ ...bottle, id: uid() }, ...prev]);
  }, []);

  const updateBottle = useCallback((id, patch) => {
    setBottles((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  // El conteo del scanner ajusta abiertas/vacías/cerradas de una botella.
  const registerScan = useCallback((bottleId, state) => {
    setBottles((prev) =>
      prev.map((b) => {
        if (b.id !== bottleId) return b;
        const next = { ...b };
        if (state === "cerrada") next.sealed += 1;
        if (state === "abierta") next.open += 1;
        if (state === "vacia") next.empty += 1;
        return next;
      })
    );
  }, []);

  // --- Usuarios scanner (Admin de sucursal: modifica / desactiva) ---
  const updateScannerUser = useCallback((id, patch) => {
    setScannerUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  // --- Admin de la App: branch admins ---
  const addBranchAdmin = useCallback((admin) => {
    setBranchAdmins((prev) => [{ ...admin, id: uid() }, ...prev]);
  }, []);
  const updateBranchAdmin = useCallback((id, patch) => {
    setBranchAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  // --- Admin de la App: dispositivos ---
  const addDevice = useCallback((device) => {
    setDevices((prev) => [{ ...device, id: uid() }, ...prev]);
  }, []);
  const updateDevice = useCallback((id, patch) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const value = useMemo(
    () => ({
      screen,
      role,
      navigate,
      login,
      logout,
      bottles,
      addBottle,
      updateBottle,
      registerScan,
      scannerUsers,
      updateScannerUser,
      branchAdmins,
      addBranchAdmin,
      updateBranchAdmin,
      devices,
      addDevice,
      updateDevice,
    }),
    [
      screen,
      role,
      navigate,
      login,
      logout,
      bottles,
      addBottle,
      updateBottle,
      registerScan,
      scannerUsers,
      updateScannerUser,
      branchAdmins,
      addBranchAdmin,
      updateBranchAdmin,
      devices,
      addDevice,
      updateDevice,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
