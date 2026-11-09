# Budget SDF

Budget SDF es un sistema de gestión de inventario desarrollado para la **Tienda El Paraíso**, ubicada en el barrio París de Medellín.

El proyecto tiene como objetivo facilitar el control de productos, entradas y salidas de inventario, alertas de stock y generación de reportes, reemplazando el manejo manual de la información por una solución web organizada y centralizada.

El sistema está compuesto por un backend desarrollado con Spring Boot, una base de datos MySQL y un frontend desarrollado con React.

---

## Tecnologías

### Backend

- Java 17
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- Bean Validation
- Lombok
- Maven

### Base de datos

- MySQL 8

### Frontend

- React 19 y Vite 8
- JavaScript
- React Router
- Axios
- Recharts (gráficas del dashboard y reportes)
- ExcelJS (exportación de reportes a Excel)
- Google OAuth (inicio de sesión con Google)
- CSS y ESLint
- Vitest y React Testing Library (pruebas automatizadas)

---

## Estructura del proyecto

```text
budget-sdf/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

El proyecto está dividido en dos aplicaciones principales:

- `backend`: API REST, reglas de negocio, seguridad y persistencia.
- `frontend`: interfaz web utilizada por el propietario de la tienda.

---

## Arquitectura del backend

El backend utiliza una arquitectura por capas:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL
```

La lógica de negocio se encuentra principalmente en la capa `Service`.

Los paquetes están organizados por funcionalidad:

```text
com.budgetsdf
├── alert
├── category
├── common
├── movement
├── product
├── report
└── user
```

---

## Arquitectura del frontend

El frontend separa páginas, componentes, estado compartido y acceso a datos. La estructura actual (resumida) es:

```text
frontend/src/
├── api/
│   └── apiClient.js
├── components/
│   ├── movements/       # Formularios y tablas de movimientos
│   ├── products/        # Formularios, tablas y diálogo de retiro
│   ├── reports/         # Filtros, tablas, gráficas y exportación
│   ├── AppSelect.jsx
│   └── ProtectedRoute.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── AuthProvider.jsx
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
├── layouts/
│   └── MainLayout.jsx
├── pages/               # Login, dashboard y módulos de inventario
├── reducers/            # Estado de formularios y filtros
├── services/            # Servicios para cada recurso de la API
├── styles/              # Estilos globales, compartidos y por página
├── utils/               # Errores y generación de archivos Excel
├── App.jsx
└── main.jsx
```

`pages/` coordina la presentación y las operaciones de cada pantalla; los componentes de `products/`, `movements/` y `reports/` separan partes reutilizables. Los servicios consumen la API REST a través de `apiClient`, el cliente Axios centralizado.

### Estado, autenticación y carga de datos

- `AuthProvider` mantiene la sesión activa y expone `login`, `loginWithGoogle` y `logout`; `useAuth()` permite acceder a ella desde los componentes. `localStorage` conserva los datos entre recargas, pero la gestión de la sesión está centralizada en el contexto.
- `apiClient` obtiene el token de la sesión proporcionada por `AuthProvider`, incorpora `Authorization: Bearer` y notifica al proveedor los errores `401` que corresponden a la sesión vigente; no administra directamente `localStorage`.
- `ProtectedRoute` utiliza `useAuth()` para proteger las rutas y React Router para redirigir al inicio de sesión, sin recargar la página.
- Productos, Movimientos y Reportes utilizan `useReducer` para agrupar el estado de formularios y filtros.
- `useFetch` reutiliza el control de carga, actualización y errores en las consultas que lo necesitan; `getErrorMessage` obtiene mensajes legibles de los errores de la API.
- Los archivos de prueba `*.test.js` y `*.test.jsx` se ubican junto a los módulos que verifican.

Los detalles de implementación, ejecución de pruebas y estructura de componentes están en [`frontend/README.md`](frontend/README.md).

---

## Funcionalidades

### Autenticación

El sistema permite:

- Iniciar sesión mediante usuario y contraseña, o mediante Google OAuth cuando está configurado.
- Almacenar las contraseñas utilizando BCrypt.
- Generar tokens JWT.
- Proteger las rutas y endpoints principales.
- Enviar automáticamente el token desde el frontend mediante `apiClient`.
- Centralizar el estado de sesión en `AuthProvider`, con persistencia en `localStorage`.
- Detectar tokens inválidos o expirados.
- Cerrar automáticamente la sesión cuando el backend responde con código `401`.
- Cerrar sesión manualmente desde la interfaz.

El rol utilizado actualmente es:

```text
PROPIETARIO
```

---

## Dashboard

El dashboard presenta un resumen general del estado del inventario.

Permite visualizar:

- Total de productos.
- Total de unidades disponibles.
- Productos con stock bajo.
- Productos sin stock.
- Total de movimientos.
- Total de entradas.
- Total de salidas.
- Balance de unidades.
- Movimientos recientes.

La información se obtiene directamente de los reportes generados por el backend.

---

## Categorías

El sistema permite:

- Registrar categorías.
- Consultar categorías.
- Actualizar categorías.
- Eliminar categorías sin productos asociados.
- Validar nombres duplicados.

No se permite eliminar una categoría que tenga productos asociados.

---

## Productos

El sistema permite:

- Registrar productos.
- Consultar productos.
- Actualizar información de productos.
- Eliminar físicamente productos sin movimientos asociados.
- Desactivar productos con movimientos, conservando el historial.
- Consultar productos inactivos y reactivarlos.
- Asignar una categoría.
- Definir unidad de medida.
- Definir stock mínimo.
- Consultar stock actual.

Cada producto comienza con:

```text
currentStock = 0
```

El stock actual no se modifica directamente desde el módulo de productos.

Su valor cambia únicamente mediante movimientos de inventario. Al retirar un producto con movimientos, se desactiva en lugar de borrar su historial.

---

## Movimientos de inventario

El sistema maneja dos tipos de movimiento:

```text
ENTRADA
SALIDA
```

Una `ENTRADA` aumenta el stock actual del producto.

Una `SALIDA` disminuye el stock y valida previamente que exista suficiente inventario.

No se permite registrar una salida superior al stock disponible.

Cada movimiento conserva información como:

- Producto.
- Tipo de movimiento.
- Cantidad.
- Stock resultante.
- Fecha.
- Observación.

Los movimientos forman parte del historial del inventario y no se modifican ni eliminan.

---

## Alertas de stock

El sistema identifica automáticamente productos cuyo stock actual sea menor o igual al stock mínimo definido.

Las alertas se calculan dinámicamente a partir del inventario actual y no requieren una tabla independiente.

En la interfaz se diferencian visualmente dos situaciones:

- **Bajo stock:** el producto todavía tiene unidades disponibles, pero alcanzó o está por debajo de su stock mínimo.
- **Sin stock:** el producto tiene un stock actual igual a `0`.

---

## Reportes

El sistema genera dos reportes principales.

### Reporte de inventario

Incluye:

- Total de productos.
- Total de unidades disponibles.
- Productos con stock bajo.
- Productos sin stock.
- Productos con stock normal.
- Estado individual de cada producto.

Los estados utilizados son:

```text
OUT_OF_STOCK
LOW_STOCK
NORMAL
```

### Reporte de movimientos

Incluye:

- Total de movimientos.
- Total de entradas.
- Total de salidas.
- Unidades ingresadas.
- Unidades retiradas.
- Balance de unidades.
- Resumen de movimientos por producto.
- Historial detallado de movimientos.

Desde la interfaz se pueden consultar y filtrar los reportes, así como **exportar a Excel** la vista filtrada o el reporte completo.

---

## Base de datos

La base de datos utilizada es:

```text
budget_sdf
```

Las tablas principales son:

```text
usuarios
categorias
productos
movimientos
```

Aunque el código Java utiliza nombres en inglés, los nombres físicos existentes de las tablas y columnas de MySQL se mantienen en español mediante los mappings de JPA.

Ejemplo:

```java
@Table(name = "productos")
```

Esto permite mantener compatibilidad con la estructura existente de la base de datos.

---

## API REST

La URL base del backend es:

```text
http://localhost:8080
```

### Autenticación

```http
POST /api/auth/login
POST /api/auth/google
```

### Categorías

```http
GET    /api/categories
GET    /api/categories/{id}
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

### Productos

```http
GET    /api/products                  # Por defecto, productos activos
GET    /api/products?includeInactive=true
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}             # Elimina o desactiva según historial
PATCH  /api/products/{id}/reactivate
```

### Movimientos

```http
GET  /api/movements
GET  /api/movements/product/{productId}
POST /api/movements
```

### Alertas

```http
GET /api/alerts/low-stock
```

### Reportes

```http
GET /api/reports/inventory
GET /api/reports/movements
```

---

## Ejemplo de producto

```json
{
  "code": "P001",
  "name": "Coca Cola 1.5L",
  "categoryId": 2,
  "unitOfMeasure": "Unidad",
  "minimumStock": 5
}
```

El sistema asigna inicialmente:

```text
currentStock = 0
```

Posteriormente, el inventario aumenta o disminuye mediante movimientos.

---

## Seguridad

Todos los endpoints principales requieren autenticación mediante JWT, excepto:

```http
POST /api/auth/login
```

El token debe enviarse en las peticiones protegidas mediante:

```http
Authorization: Bearer <token>
```

El frontend realiza este proceso automáticamente mediante un interceptor de Axios.

Si el backend responde con código `401` por un token inválido o expirado, el frontend:

1. Notifica al `AuthProvider` solo si el `401` corresponde a la sesión vigente (no a un inicio de sesión fallido ni a una sesión anterior).
2. El proveedor limpia el estado de sesión y los datos persistidos en `localStorage`.
3. Las rutas protegidas redirigen a `/login` mediante React Router, sin usar una recarga forzada.

---

## Variables de entorno del backend

Para ejecutar el backend se deben configurar las siguientes variables:

```text
DB_PASSWORD
APP_JWT_SECRET
```

Para crear el usuario propietario inicial también pueden utilizarse:

```text
APP_ADMIN_USERNAME
APP_ADMIN_PASSWORD
```

Opcionalmente se pueden configurar:

```text
DB_URL
DB_USERNAME
APP_JWT_EXPIRATION_MS
APP_CORS_ALLOWED_ORIGINS
```

Ejemplo en PowerShell:

```powershell
$env:DB_PASSWORD="tu_contraseña_mysql"
$env:APP_JWT_SECRET="tu_clave_jwt"
$env:APP_ADMIN_USERNAME="propietario"
$env:APP_ADMIN_PASSWORD="tu_contraseña"
```

Para la integración con Google también se configura `GOOGLE_CLIENT_ID` con el identificador de cliente OAuth esperado por el backend (`app.google.client-id`). La configuración actual del backend referencia esa variable.

No se deben almacenar contraseñas reales ni secretos directamente en el repositorio.

---

## Variables de entorno del frontend

El frontend utiliza `VITE_API_URL` para la dirección del backend y `VITE_GOOGLE_CLIENT_ID` para el proveedor de Google OAuth.

El archivo local:

```text
frontend/.env
```

puede contener:

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=tu-cliente-google.apps.googleusercontent.com
```

El archivo `.env` no debe subirse al repositorio.

El proyecto incluye:

```text
frontend/.env.example
```

como referencia para la configuración necesaria.

---

## Requisitos para ejecutar el proyecto

Se requiere tener instalado:

- Java 17.
- MySQL 8.
- Node.js compatible con Vite 8 (el CI utiliza Node.js 24).
- npm.

El proyecto también incluye Maven Wrapper, por lo que no es obligatorio instalar Maven globalmente.

---

## Ejecución del backend

Desde la raíz del proyecto:

```powershell
cd backend
```

Configurar las variables de entorno necesarias:

```powershell
$env:DB_PASSWORD="tu_contraseña_mysql"
$env:APP_JWT_SECRET="tu_clave_jwt"
```

Ejecutar:

```powershell
.\mvnw.cmd spring-boot:run
```

El backend inicia por defecto en:

```text
http://localhost:8080
```

---

## Ejecución del frontend

En otra terminal, desde la raíz del proyecto:

```powershell
cd frontend
```

Instalar las dependencias si es la primera ejecución:

```powershell
npm install
```

Ejecutar el servidor de desarrollo:

```powershell
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

Para utilizar correctamente el sistema deben estar ejecutándose simultáneamente:

```text
MySQL
Backend Spring Boot
Frontend React
```

---

## Validación y pruebas del frontend

Desde la carpeta `frontend`, ejecutar:

```powershell
npm test          # Pruebas automatizadas, ejecución única
npm run lint      # ESLint
npm run build     # Build de producción
```

Para ejecutar las pruebas durante el desarrollo:

```powershell
npm run test:watch
```

Las pruebas se implementan con Vitest, React Testing Library y jsdom, junto a los archivos del código. Cubren autenticación, cliente HTTP, servicios, hooks, reducers, componentes y flujos de páginas.

En la última validación compartida del proyecto se aprobaron **116 pruebas en 19 archivos de prueba**. Esta cifra corresponde a esa ejecución y puede cambiar conforme evolucione el código.

### Integración continua con GitHub Actions

El workflow [`.github/workflows/frontend-ci.yml`](.github/workflows/frontend-ci.yml) se ejecuta automáticamente en los Pull Requests dirigidos a `develop` y `main`.

El job `Frontend checks` utiliza Node.js 24 y ejecuta `npm ci`, `npm test`, `npm run lint` y `npm run build` desde `frontend/`.

Las comprobaciones automatizadas complementan la revisión de los cambios del Pull Request; no la sustituyen.

---

## Pruebas del backend

Desde la carpeta `backend`:

```powershell
.\mvnw.cmd test
```

El backend incluye pruebas de servicios y endpoints de integración para validar las principales reglas de negocio. Los resultados concretos dependen de cada ejecución.

---

## Migración de categorías

Durante el desarrollo se normalizó la categoría de los productos mediante una tabla independiente.

La migración utilizada se conserva en:

```text
backend/database/migrations/001_normalizar_categorias.sql
```

Este archivo representa una migración histórica y no debe ejecutarse nuevamente sobre una base de datos que ya tenga aplicada la estructura actual.

---

## Reglas importantes del sistema

- No se permite registrar dos categorías con el mismo nombre.
- No se permite registrar dos productos con el mismo código.
- No se puede registrar un producto con una categoría inexistente.
- El stock actual comienza en cero.
- El stock solo cambia mediante entradas y salidas.
- No se permite una salida superior al stock disponible.
- No se puede eliminar una categoría que tenga productos asociados.
- Si se retira un producto con movimientos registrados, se desactiva y se conserva su historial; un producto sin movimientos se puede eliminar físicamente.
- Un producto inactivo puede reactivarse.
- Los movimientos se conservan como historial.
- Las alertas de stock se generan dinámicamente.
- Los productos sin existencias se identifican como `OUT_OF_STOCK`.
- Los reportes se generan a partir de la información actual almacenada en el sistema.

---

## Flujo básico de uso

El flujo principal del sistema es:

```text
Iniciar sesión
      ↓
Consultar Dashboard
      ↓
Gestionar categorías
      ↓
Gestionar productos
      ↓
Registrar entradas y salidas
      ↓
Consultar alertas
      ↓
Consultar reportes
```

Un producto nuevo comienza con stock `0`.

Para aumentar su inventario se debe registrar una `ENTRADA`.

Cuando se registra una `SALIDA`, el sistema valida que exista stock suficiente antes de realizar el movimiento.

---

## Diseño responsive

La interfaz está adaptada para diferentes tamaños de pantalla.

En dispositivos móviles:

- La navegación se ubica en la parte superior.
- Los formularios utilizan una sola columna.
- Las tarjetas se reorganizan verticalmente.
- Las tablas permiten desplazamiento horizontal cuando es necesario.

---

## Estado del proyecto

Actualmente Budget SDF cuenta con:

### Backend

- Gestión de categorías.
- Gestión de productos.
- Gestión de movimientos.
- Control de stock.
- Alertas de stock.
- Reportes de inventario.
- Reportes de movimientos.
- Autenticación con JWT.
- Persistencia en MySQL.
- Validaciones de negocio.
- Manejo global de errores.
- Pruebas unitarias y de integración.

### Frontend

- Inicio de sesión con contraseña o Google OAuth.
- Rutas protegidas mediante `useAuth` y React Router.
- Gestión centralizada de sesión con `AuthProvider` y envío automático del JWT.
- Cierre automático de sesión ante respuestas `401`.
- Dashboard con información real del inventario.
- Gestión visual de categorías.
- Gestión visual de productos.
- Registro de entradas y salidas.
- Visualización del stock actual.
- Alertas de bajo stock y productos sin stock.
- Reportes de inventario.
- Reportes de movimientos.
- Filtros y exportación de reportes a Excel.
- Componentes separados por módulos de Productos, Movimientos y Reportes.
- Reducers para formularios y filtros, hooks compartidos y manejo centralizado de errores.
- Pruebas automatizadas con Vitest y React Testing Library.
- GitHub Actions para verificar los Pull Requests.
- Manejo de errores y estados de carga.
- Diseño responsive.
- Integración completa con la API REST.

El sistema se encuentra funcional e integrado entre frontend, backend y base de datos.
