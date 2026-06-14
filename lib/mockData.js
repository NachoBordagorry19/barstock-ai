// Datos de prueba precargados. No hay backend: los cambios viven solo en memoria
// durante la sesión y se reinician al recargar la página.

let _id = 100;
export const uid = () => `id_${++_id}`;

// Inventario inicial del bar (Administrador de sucursal).
// sealed = botellas cerradas sin abrir, open = abiertas en uso, empty = vacías.
export const initialBottles = [
  {
    id: "b1",
    name: "Johnnie Walker Red Label",
    category: "Whisky",
    barcode: "5000267023656",
    sealed: 2,
    open: 1,
    empty: 0,
    threshold: 3,
    price: 18900,
  },
  {
    id: "b2",
    name: "Johnnie Walker Black Label",
    category: "Whisky",
    barcode: "5000267034706",
    sealed: 1,
    open: 1,
    empty: 1,
    threshold: 2,
    price: 32500,
  },
  {
    id: "b3",
    name: "Smirnoff Vodka",
    category: "Vodka",
    barcode: "5410316950107",
    sealed: 5,
    open: 2,
    empty: 1,
    threshold: 4,
    price: 9800,
  },
  {
    id: "b4",
    name: "Skyy Vodka",
    category: "Vodka",
    barcode: "0080686847908",
    sealed: 3,
    open: 1,
    empty: 0,
    threshold: 3,
    price: 12400,
  },
  {
    id: "b5",
    name: "Bacardí Carta Blanca",
    category: "Ron",
    barcode: "7501035010994",
    sealed: 4,
    open: 1,
    empty: 2,
    threshold: 3,
    price: 11200,
  },
  {
    id: "b6",
    name: "Fernet Branca",
    category: "Amargo",
    barcode: "7790140001017",
    sealed: 6,
    open: 2,
    empty: 1,
    threshold: 5,
    price: 14700,
  },
  {
    id: "b7",
    name: "José Cuervo Especial",
    category: "Tequila",
    barcode: "7501035042032",
    sealed: 2,
    open: 1,
    empty: 0,
    threshold: 3,
    price: 16800,
  },
  {
    id: "b8",
    name: "Vat 69",
    category: "Whisky",
    barcode: "5000289110105",
    sealed: 1,
    open: 0,
    empty: 1,
    threshold: 2,
    price: 9600,
  },
  {
    id: "b9",
    name: "Campari",
    category: "Aperitivo",
    barcode: "8000400000018",
    sealed: 3,
    open: 1,
    empty: 0,
    threshold: 2,
    price: 13900,
  },
];

// Empleados que usan el escáner (gestionados por el Admin de sucursal:
// puede modificarlos y desactivarlos, pero NO crearlos ni borrarlos).
export const initialScannerUsers = [
  { id: "s1", name: "Martín Gómez", code: "SC-001", shift: "Noche", active: true },
  { id: "s2", name: "Lucía Fernández", code: "SC-002", shift: "Noche", active: true },
  { id: "s3", name: "Diego Sosa", code: "SC-003", shift: "Tarde", active: false },
  { id: "s4", name: "Valentina Ruiz", code: "SC-004", shift: "Noche", active: true },
];

// Administradores de sucursal (gestionados por el Admin de la App).
export const initialBranchAdmins = [
  { id: "a1", name: "Carlos Medina", branch: "Palermo Soho", email: "carlos@barstock.ai", active: true },
  { id: "a2", name: "Sofía Álvarez", branch: "Recoleta", email: "sofia@barstock.ai", active: true },
  { id: "a3", name: "Javier Paredes", branch: "Puerto Madero", email: "javier@barstock.ai", active: false },
];

// Dispositivos de escaneo dados de alta (Admin de la App).
export const initialDevices = [
  { id: "d1", name: "Scanner Barra Principal", branch: "Palermo Soho", model: "BS-Scan X1", active: true },
  { id: "d2", name: "Scanner Depósito", branch: "Palermo Soho", model: "BS-Scan X1", active: true },
  { id: "d3", name: "Scanner Barra VIP", branch: "Recoleta", model: "BS-Scan Pro", active: true },
  { id: "d4", name: "Scanner Móvil", branch: "Puerto Madero", model: "BS-Scan Lite", active: false },
];

// Métricas globales por sucursal (Admin de la App).
export const branchMetrics = [
  { branch: "Palermo Soho", botellas: 412, mermas: 3.2, valorStock: 4820000, estado: "Óptimo" },
  { branch: "Recoleta", botellas: 286, mermas: 5.8, valorStock: 3110000, estado: "Atención" },
  { branch: "Puerto Madero", botellas: 198, mermas: 2.1, valorStock: 2540000, estado: "Óptimo" },
];

// Resultado simulado del análisis de Visión Artificial sobre la foto de muestra.
export const aiDetectionResult = {
  total: 12,
  llenas: 5,
  parciales: 5,
  vacias: 2,
  bottles: [
    { name: "Fernet Branca", level: "Llena", confidence: 0.97 },
    { name: "Bacardí Carta Blanca", level: "Parcial", confidence: 0.94 },
    { name: "Johnnie Walker Red Label", level: "Parcial", confidence: 0.96 },
    { name: "Johnnie Walker Black Label", level: "Parcial", confidence: 0.91 },
    { name: "Smirnoff Vodka", level: "Llena", confidence: 0.98 },
    { name: "Skyy Vodka", level: "Llena", confidence: 0.95 },
    { name: "Vat 69", level: "Parcial", confidence: 0.89 },
    { name: "Sandy Macnab Whisky", level: "Llena", confidence: 0.88 },
    { name: "José Cuervo Especial", level: "Parcial", confidence: 0.9 },
    { name: "Campari", level: "Llena", confidence: 0.93 },
    { name: "Botella sin etiqueta", level: "Vacía", confidence: 0.82 },
    { name: "Botella sin etiqueta", level: "Vacía", confidence: 0.79 },
  ],
};

export const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
