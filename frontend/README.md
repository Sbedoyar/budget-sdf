# Frontend - Budget SDF

Este directorio contiene el frontend de **Budget SDF**, desarrollado con React y Vite.

La interfaz permite al propietario de la Tienda El Paraíso gestionar el inventario desde el navegador y consumir la API REST del backend desarrollado con Spring Boot.

---

## Tecnologías

- React
- Vite
- JavaScript
- React Router
- Axios
- CSS
- ESLint

---

## Estructura principal

```text
src/
├── api/
│   └── apiClient.js
├── components/
│   └── ProtectedRoute.jsx
├── layouts/
│   └── MainLayout.jsx
├── pages/
│   ├── AlertsPage.jsx
│   ├── CategoriesPage.jsx
│   ├── DashboardPage.jsx
│   ├── LoginPage.jsx
│   ├── MovementsPage.jsx
│   ├── ProductsPage.jsx
│   └── ReportsPage.jsx
├── services/
│   ├── alertService.js
│   ├── authService.js
│   ├── categoryService.js
│   ├── movementService.js
│   ├── productService.js
│   └── reportService.js
├── App.jsx
├── index.css
└── main.jsx
```

---

## Funcionalidades

El frontend permite:

- Iniciar sesión.
- Proteger rutas privadas.
- Gestionar categorías.
- Gestionar productos.
- Registrar entradas y salidas de inventario.
- Consultar el stock actual.
- Visualizar alertas de bajo stock.
- Diferenciar productos sin stock.
- Consultar reportes de inventario.
- Consultar reportes de movimientos.
- Visualizar un dashboard con información general.
- Cerrar sesión.
- Detectar tokens inválidos o expirados.
- Redirigir automáticamente al login cuando el backend responde con `401`.

---

## Variables de entorno

Crear un archivo:

```text
.env
```

dentro de la carpeta `frontend`.

Ejemplo:

```env
VITE_API_URL=http://localhost:8080
```

También se incluye:

```text
.env.example
```

como referencia.

El archivo `.env` no debe subirse al repositorio.

---

## Instalación

Desde esta carpeta ejecutar:

```powershell
npm install
```

---

## Ejecución

Para iniciar el servidor de desarrollo:

```powershell
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

El backend debe estar ejecutándose en:

```text
http://localhost:8080
```

---

## Validación

Para ejecutar ESLint:

```powershell
npm run lint
```

Para generar el build de producción:

```powershell
npm run build
```

Estado actual:

```text
ESLint: sin errores
Build de producción: exitoso
```

---

## Autenticación

El frontend utiliza JWT para acceder a los endpoints protegidos.

El token se almacena localmente y Axios lo agrega automáticamente a las peticiones mediante:

```http
Authorization: Bearer <token>
```

Si el token deja de ser válido y el backend responde con `401`, la sesión se elimina y el usuario es redirigido al login.

---

## Diseño responsive

La interfaz está adaptada para escritorio y dispositivos móviles.

En pantallas pequeñas:

- El menú lateral pasa a la parte superior.
- Los formularios se organizan en una sola columna.
- Las tarjetas se apilan verticalmente.
- Las tablas permiten desplazamiento horizontal.

---

## Backend

El frontend consume la API REST disponible en:

```text
http://localhost:8080
```

La documentación general del proyecto y de los endpoints se encuentra en el `README.md` de la raíz del repositorio.