"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import {
  initialBottles,
  initialScannerUsers,
  initialBranchAdmins,
  initialDevices,
  uid,
} from "@/lib/mockData";
import { StockService } from "@/lib/services/StockService";
import { Product } from "@/lib/domain/Product";
import { Purchase } from "@/lib/domain/Purchase";
import { Transfer } from "@/lib/domain/Transfer";
import { StockItem } from "@/lib/domain/StockItem";

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

  // Estados nuevos de Logística / TDD
  const [purchases, setPurchases] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [movements, setMovements] = useState([]);
  
  // Stock inicial por ubicaciones (depósito y barra) basado en initialBottles con fechas de vencimiento de prueba
  const [stocks, setStocks] = useState(() => {
    const list = [];
    initialBottles.forEach(b => {
      let expDate = null;
      if (b.id === "b1") expDate = "2026-06-15"; // Ya vencido (comparado con Julio 2026)
      if (b.id === "b2") expDate = "2026-07-28"; // Próximo a vencer
      if (b.id === "b3") expDate = "2026-08-10"; // Próximo a vencer
      list.push({ productId: b.id, location: "depósito", quantity: b.sealed, expirationDate: expDate });
      list.push({ productId: b.id, location: "barra", quantity: b.open, expirationDate: null });
    });
    return list;
  });

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
    const newId = uid();
    setBottles((prev) => [{ ...bottle, id: newId }, ...prev]);
    // Inicializar stocks por ubicación para el nuevo producto
    setStocks((prev) => [
      ...prev,
      { productId: newId, location: "depósito", quantity: Number(bottle.sealed || 0) },
      { productId: newId, location: "barra", quantity: Number(bottle.open || 0) }
    ]);
  }, []);

  const updateBottle = useCallback((id, patch) => {
    setBottles((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    // Si se actualiza el stock directamente desde Inventario, reflejarlo en ubicaciones
    if (patch.sealed !== undefined) {
      setStocks((prev) =>
        prev.map((s) => (s.productId === id && s.location === "depósito" ? { ...s, quantity: Number(patch.sealed) } : s))
      );
    }
    if (patch.open !== undefined) {
      setStocks((prev) =>
        prev.map((s) => (s.productId === id && s.location === "barra" ? { ...s, quantity: Number(patch.open) } : s))
      );
    }
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
    // Reflejar conteo en stock de ubicaciones
    if (state === "cerrada") {
      setStocks(prev => prev.map(s => s.productId === bottleId && s.location === "depósito" ? { ...s, quantity: s.quantity + 1 } : s));
    } else if (state === "abierta") {
      setStocks(prev => prev.map(s => s.productId === bottleId && s.location === "barra" ? { ...s, quantity: s.quantity + 1 } : s));
    }
  }, []);

  // --- Implementación de Repositorios para conectar StockService con React State ---
  const productRepository = useMemo(() => ({
    findById: (id) => {
      const b = bottles.find(x => x.id === id);
      if (!b) return null;
      return new Product({
        ...b,
        cost: b.cost !== undefined ? b.cost : Math.round(b.price / 1.20),
        marginPercent: b.marginPercent !== undefined ? b.marginPercent : 20
      });
    },
    save: (updatedProduct) => {
      const plain = {
        ...updatedProduct,
        cost: updatedProduct.cost,
        marginPercent: updatedProduct.marginPercent,
        price: updatedProduct.price
      };
      setBottles(prev => prev.map(b => b.id === plain.id ? plain : b));
      return updatedProduct;
    }
  }), [bottles]);

  const purchaseRepository = useMemo(() => ({
    save: (purchase) => {
      const newPurchase = {
        ...purchase,
        id: purchase.id || `purch-${Date.now()}`
      };
      setPurchases(prev => [newPurchase, ...prev]);
      return new Purchase(newPurchase);
    },
    findAll: () => purchases.map(p => new Purchase(p)),
  }), [purchases]);

  const movementRepository = useMemo(() => ({
    save: (movement) => {
      const newMovement = { ...movement, id: `mov-${Date.now()}-${Math.random()}` };
      setMovements(prev => [newMovement, ...prev]);
      return newMovement;
    }
  }), [movements]);

  const stockRepository = useMemo(() => ({
    getByProductAndLocation: (productId, location) => {
      const s = stocks.find(st => st.productId === productId && st.location === location);
      return s ? new StockItem(s) : new StockItem({ productId, location, quantity: 0 });
    },
    save: (newStock) => {
      const plain = {
        productId: newStock.productId,
        location: newStock.location,
        quantity: newStock.quantity,
        expirationDate: newStock.expirationDate ? newStock.expirationDate.toISOString().split('T')[0] : null
      };
      setStocks(prev => {
        const idx = prev.findIndex(st => st.productId === plain.productId && st.location === plain.location);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = plain;
          return next;
        }
        return [...prev, plain];
      });
      // Sincronizar también con el estado plano de 'bottles' para no romper vistas viejas
      setBottles(prev => prev.map(b => {
        if (b.id === plain.productId) {
          if (plain.location === "depósito") return { ...b, sealed: plain.quantity };
          if (plain.location === "barra") return { ...b, open: plain.quantity };
        }
        return b;
      }));
      return new StockItem(plain);
    },
    findAll: () => stocks.map(s => new StockItem(s)),
  }), [stocks]);

  const transferRepository = useMemo(() => ({
    findById: (id) => {
      const t = transfers.find(x => x.id === id);
      return t ? new Transfer(t) : null;
    },
    save: (transfer) => {
      const newTransfer = {
        ...transfer,
        id: transfer.id || `trans-${Date.now()}`
      };
      setTransfers(prev => {
        const idx = prev.findIndex(t => t.id === newTransfer.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = newTransfer;
          return next;
        }
        return [newTransfer, ...prev];
      });
      return new Transfer(newTransfer);
    }
  }), [transfers]);

  const userRepository = useMemo(() => ({
    findById: (id) => {
      if (id === "Carlos Medina" || id === "a1" || id === "CM") {
        return new User({ id: "a1", name: "Carlos Medina", role: "ADMIN", active: true });
      }
      
      const u = scannerUsers.find(x => x.id === id || x.name === id);
      if (u) {
        let role = "RECEPTOR";
        if (u.id === "s1" || u.id === "s4") role = "DESPACHADOR";
        return new User({ id: u.id, name: u.name, role: role, active: u.active });
      }

      return new User({ id, name: id, role: "ADMIN", active: true });
    }
  }), [scannerUsers]);

  // Instanciar StockService con los repositorios que manejan el estado de React (SOLID & DRY)
  const stockService = useMemo(() => {
    return new StockService(
      productRepository,
      purchaseRepository,
      movementRepository,
      stockRepository,
      transferRepository,
      userRepository
    );
  }, [productRepository, purchaseRepository, movementRepository, stockRepository, transferRepository, userRepository]);

  // Acciones expuestas a la interfaz
  const addPurchase = useCallback((purchaseData) => {
    return stockService.registerPurchase(purchaseData);
  }, [stockService]);

  const sendTransfer = useCallback((transferData) => {
    return stockService.dispatchTransfer(transferData);
  }, [stockService]);

  const receiveTransfer = useCallback((transferId, userId) => {
    return stockService.confirmTransfer(transferId, userId);
  }, [stockService]);

  const markPurchaseAsPaid = useCallback((purchaseId) => {
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, paymentStatus: "pagado" } : p));
  }, []);

  const getExpiredItems = useCallback((date) => {
    return stockService.getExpiredItems(date);
  }, [stockService]);

  const getNearExpirationItems = useCallback((date, days) => {
    return stockService.getNearExpirationItems(date, days);
  }, [stockService]);

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
      // Nuevos valores para Logística / TDD
      purchases,
      transfers,
      movements,
      stocks,
      addPurchase,
      sendTransfer,
      receiveTransfer,
      markPurchaseAsPaid,
      getExpiredItems,
      getNearExpirationItems,
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
      // Dependencias de Logística
      purchases,
      transfers,
      movements,
      stocks,
      addPurchase,
      sendTransfer,
      receiveTransfer,
      markPurchaseAsPaid,
      getExpiredItems,
      getNearExpirationItems,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
