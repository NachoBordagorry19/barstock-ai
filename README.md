# Barstock AI

Prototipo funcional (maqueta interactiva) del sistema de **gestión de stock para bares** Barstock AI.
Construido con **Next.js 14** + **Tailwind CSS**. Sin backend: los datos están precargados y los cambios viven
en memoria durante la sesión (se reinician al recargar la página).

## Pantallas

- **Landing** — SEO ("gestión de stock para bares", "control de inventario de bebidas", "reducción de mermas"),
  hero, beneficios, cómo funciona y formulario de contacto.
- **Login** — acceso simulado por dropdown de rol (muestra campo de contraseña pero no valida).
- **Administrador de la App** — panel global, alta/gestión de admins de sucursal y dispositivos, reportes globales.
- **Administrador de Sucursal** — dashboard, carga y edición de inventario, alertas de compra, gestión de empleados
  scanner (modificar/desactivar), exportación a Excel y cambio de contraseña.
- **Scanner** — modo código de barras (cámara simulada + botones Cerrada/Abierta/Vacía) y modo Visión Artificial
  (analiza la foto de muestra y detecta cantidad y nivel de contenido).

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## Deploy

Conectado a Vercel: cada `git push` a `main`/`master` dispara un deploy automático.

## Build de producción

```bash
npm run build
npm start
```
