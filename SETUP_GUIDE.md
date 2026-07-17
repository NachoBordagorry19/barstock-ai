# Configuración local

Esta guía levanta Barstock AI con PostgreSQL en Docker y Prisma. No requiere una rama especial ni un cliente gráfico de base de datos.

## Requisitos

- Node.js 20 o superior
- Docker Desktop o Docker Engine con Compose
- Git

## Puesta en marcha

1. Instala las dependencias reproducibles del proyecto:

   ```bash
   npm ci
   ```

2. Crea tu configuración local:

   ```bash
   cp .env.example .env
   ```

   Cambia `POSTGRES_PASSWORD` en `.env` y usa el mismo valor dentro de `DATABASE_URL`. El archivo `.env` está ignorado por Git y no debe subirse.

3. Inicia PostgreSQL:

   ```bash
   docker compose up -d
   ```

4. Genera el cliente, aplica las migraciones y carga los datos de demostración:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Inicia la aplicación:

   ```bash
   npm run dev
   ```

   Abre <http://localhost:3000>.

## Verificación

Las pruebas unitarias no necesitan base de datos:

```bash
npm run test:unit
```

Las pruebas de integración requieren PostgreSQL iniciado y las migraciones aplicadas:

```bash
npm run test:integration
```

Para ejecutar toda la suite y compilar una versión de producción:

```bash
npm test -- --runInBand
npm run build
```

## Apagar el entorno

```bash
docker compose down
```

Usa `docker compose down -v` solamente si también quieres eliminar los datos locales del volumen.
