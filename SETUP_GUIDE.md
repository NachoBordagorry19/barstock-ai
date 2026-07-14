# 🚀 Guía de Configuración del Entorno Local para el Equipo

Esta guía detalla los pasos necesarios para que cualquier integrante del equipo configure y ejecute el proyecto **Barstock AI** con persistencia en la base de datos local PostgreSQL utilizando Docker y Prisma 7.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:
1. **Node.js** (Versión 18 o superior).
2. **Git** para el control de versiones.
3. **Docker Desktop** (Asegúrate de tenerlo abierto y ejecutándose).
4. **DBeaver** (Cliente de base de datos universal).

---

## ⚙️ Paso a Paso para la Configuración

### 1. Clonar el repositorio y cambiar a la rama de base de datos
Si aún no estás en la rama correspondiente, clona el proyecto y muévete a la rama `feature/IntentoConectarBaseDatos`:
```bash
git checkout feature/IntentoConectarBaseDatos
```

### 2. Instalar dependencias del proyecto
Ejecuta el siguiente comando en la raíz del proyecto para instalar todas las librerías necesarias, incluyendo Prisma, Postgres drivers y de testing:
```bash
npm install
```

### 3. Configurar las Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`). Agrega el siguiente contenido:

```env
# URL de conexión a la base de datos de Docker
DATABASE_URL="postgresql://barstock_user:barstock_secure_password@localhost:5432/barstock_db?schema=public"
```

> [!WARNING]
> No subas este archivo `.env` al repositorio Git. Está configurado por defecto en `.gitignore` para proteger las credenciales.

### 4. Levantar la Base de Datos con Docker
Con Docker Desktop ejecutándose en segundo plano, abre una terminal en la raíz del proyecto y levanta el contenedor de PostgreSQL con:
```bash
docker compose up -d
```
*Este comando descargará la imagen oficial de PostgreSQL e iniciará la base de datos en segundo plano.*

### 5. Sincronizar la Base de Datos (Migraciones)
Aplica la estructura de tablas al contenedor de base de datos recién creado corriendo:
```bash
npx prisma migrate dev
```
*Esto creará la estructura de base de datos e instalará el Prisma Client.*

### 6. Cargar los Datos de Prueba (Seeding)
Para poblar la base de datos con los productos iniciales y usuarios de prueba (admins y scanners), ejecuta:
```bash
node prisma/seed.js
```
*Deberías ver un mensaje en consola que dice: `Seeding completed successfully!`*

---

## 🔌 Conectar DBeaver a la Base de Datos

Para visualizar y editar los datos directamente desde tu cliente visual:

1. Abre **DBeaver**.
2. Haz clic en **Nueva conexión** (ícono de enchufe con un "+").
3. Selecciona **PostgreSQL** y haz clic en *Next*.
4. Rellena los datos de configuración exactamente como sigue:
   * **Host:** `localhost`
   * **Port:** `5432`
   * **Database:** `barstock_db`
   * **Username:** `barstock_user`
   * **Password:** `barstock_secure_password`
5. Haz clic en **Test Connection** (Probar conexión). DBeaver te pedirá descargar el controlador JDBC de Postgres si es la primera vez (haz clic en *Download*).
6. Si la prueba es exitosa, haz clic en **Finish**.

> [!TIP]
> Si DBeaver te muestra una advertencia sobre `pgAgent`, es totalmente inofensivo. Puedes ignorarlo. Tus tablas se encuentran navegando en el menú de la izquierda:
> `barstock_db` ➔ `Schemas` ➔ `public` ➔ `Tables`.

---

## 🏃 Ejecutar la Aplicación y Correr Pruebas

### Ejecutar en Desarrollo
Para encender el servidor local de Next.js, ejecuta:
```bash
npm run dev
```
Abre http://localhost:3000 en tu navegador. Toda acción de la UI ahora impactará directamente en la base de datos de Docker.

### Ejecutar Pruebas (Jest)
Para asegurarte de que todo funciona y no hay regresiones, corre las pruebas unitarias y de integración:
```bash
npm run test
```
