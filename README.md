# Barstock AI

MVP colaborativo para gestionar inventario, compras, movimientos y transferencias de stock en bares y locales gastronómicos.

> Este proyecto fue construido mediante un flujo de **desarrollo asistido por agentes de IA**. La IA se utilizó para acelerar la implementación; el trabajo humano se centró en definir requisitos, dividir tareas, dirigir iteraciones, integrar resultados y validar el funcionamiento del MVP.

## Objetivo

Centralizar el control de bebidas y productos para reducir faltantes, vencimientos y diferencias entre depósito y barra. El MVP explora una experiencia completa para administradores, encargados y operadores de escáner.

## Funcionalidades implementadas

- Panel global y panel por sucursal.
- Catálogo, inventario y stock por ubicación.
- Registro de compras y estado de pago.
- Transferencias entre depósito y barra.
- Movimientos y trazabilidad básica de stock.
- Costos, márgenes y cálculo de precios de venta.
- Alertas de reposición y vencimiento.
- Exportación de información a Excel.
- Flujos diferenciados según el rol del usuario.
- Escaneo de códigos y visión artificial presentados como simulaciones de interfaz.

## Tecnologías

- Next.js 14
- React 18
- Tailwind CSS
- API Routes de Next.js
- Prisma ORM
- PostgreSQL
- Jest y Testing Library
- Vercel

## Alcance del MVP

Barstock AI es un prototipo funcional y no un producto listo para producción. La autenticación, el escaneo por cámara y el análisis visual incluyen comportamientos simulados. El repositorio sí contiene una capa de persistencia experimental con Prisma/PostgreSQL y rutas API; por eso algunas pantallas pueden seguir usando datos de demostración mientras avanza la integración.

## Desarrollo asistido por IA

El proyecto también funciona como evidencia de una habilidad complementaria al desarrollo tradicional:

- Convertir una necesidad de negocio en requisitos y tareas técnicas.
- Orquestar agentes de programación y trabajar por iteraciones.
- Revisar e integrar cambios producidos por IA.
- Utilizar pruebas para detectar regresiones y validar reglas.
- Reconocer qué partes siguen siendo simuladas o requieren endurecimiento antes de producción.

El uso de IA se declara de forma explícita; no se atribuye autoría manual a cada línea generada.

## Ejecución local

### Requisitos

- Node.js 20 o posterior
- PostgreSQL accesible localmente o mediante un proveedor externo

### Instalación

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

Abra `http://localhost:3000`.

La variable `DATABASE_URL` debe apuntar a una base PostgreSQL de desarrollo. No guarde credenciales reales en el repositorio.

## Pruebas y build

```bash
npm test
npm run build
npm start
```

## Estado

MVP en evolución. Su objetivo es validar la propuesta, los flujos principales y la arquitectura antes de abordar autenticación real, permisos reforzados, observabilidad y operación en producción.
