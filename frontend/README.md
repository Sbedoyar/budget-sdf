# Frontend - Budget SDF

El frontend de **Budget SDF** es una aplicación web de React y Vite para la gestión de inventario de la Tienda El Paraíso. Consume la API REST del backend Spring Boot.

La documentación general, las reglas de negocio, los endpoints y la puesta en marcha del backend están en el [README principal](../README.md).

---

## Tecnologías

- React 19, Vite 8 y JavaScript.
- React Router para navegación y rutas protegidas.
- Axios para las peticiones HTTP.
- Context API y hooks de React para estado de sesión.
- Recharts para gráficas y ExcelJS para exportar reportes.
- Google OAuth para el inicio de sesión con Google.
- CSS y ESLint.
- Vitest, React Testing Library y jsdom para pruebas automatizadas.

---

## Estructura del frontend

```text
frontend/
├── src/
│   ├── api/
│   │   └── apiClient.js
│   ├── components/
│   │   ├── movements/
│   │   │   ├── MovementForm.jsx
│   │   │   └── MovementHistoryTable.jsx
│   │   ├── products/
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductRetireDialog.jsx
│   │   │   └── ProductsTable.jsx
│   │   ├── reports/       # Tablas, filtros, gráficas y exportación
│   │   ├── AppSelect.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── AuthProvider.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── layouts/
│   │   └── MainLayout.jsx
│   ├── pages/             # Login, Dashboard, Categorías, Productos,
│   │                      # Movimientos, Alertas y Reportes
│   ├── reducers/          # Formularios y filtros por módulo
│   ├── services/          # auth, categories, products, movements,
│   │                      # alerts y reports
│   ├── styles/
│   │   ├── global.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   └── pages/
│   ├── utils/
│   │   ├── getErrorMessage.js
│   │   └── reportExcelExporter.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
```

Los archivos `*.test.js` y `*.test.jsx` se mantienen junto al módulo que prueban; la estructura representa los directorios principales y omite algunos archivos para facilitar su lectura.

### Responsabilidades

| Ubicación | Responsabilidad |
| --- | --- |
| `pages/` | Coordina las pantallas, las operaciones y los datos de cada módulo. |
| `components/` | Presenta formularios, tablas, filtros, modales y controles. Los componentes específicos se agrupan por módulo. |
| `services/` | Reúne las peticiones de cada recurso de la API REST. |
| `api/apiClient.js` | Configura Axios y los interceptores de autenticación y respuesta. |
| `contexts/` y `hooks/useAuth.js` | Gestionan y exponen el estado de autenticación. |
| `reducers/` | Centraliza transiciones de estado de formularios y filtros. |
| `hooks/useFetch.js` | Reutiliza lógica de carga, actualización y manejo de errores. |
| `utils/` | Funciones compartidas de errores y exportación a Excel. |
| `styles/` | CSS global, compartido y específico de las páginas. |

---

## Autenticación y navegación

`main.jsx` envuelve la aplicación con `BrowserRouter`, `AuthProvider` y el proveedor de Google OAuth.

El estado de sesión se administra en **`AuthProvider`**, que expone `token`, `username`, `role`, `isAuthenticated`, `login`, `loginWithGoogle` y `logout` a través de Context API. El hook `useAuth()` es la forma de consumirlos desde los componentes.

- Al iniciar la aplicación, `AuthProvider` recupera los datos de sesión persistidos en `localStorage`.
- Al iniciar o cerrar sesión, el proveedor actualiza el contexto y su persistencia. `localStorage` no es una fuente de estado independiente para `apiClient` ni para `authService`.
- El cliente Axios recibe desde `AuthProvider` una función para consultar el token vigente y agrega la cabecera `Authorization: Bearer <token>` a las solicitudes protegidas.
- Ante un `401` que corresponda a la sesión actual, el cliente notifica al proveedor para cerrar sesión; no se cierra una sesión nueva por una respuesta tardía de una sesión anterior.
- `ProtectedRoute` utiliza `useAuth()` y React Router para enviar al usuario no autenticado a `/login`, sin recargar la página mediante `window.location.href`.

El inicio de sesión está disponible con usuario y contraseña y, si se configura OAuth, con Google. En ambos casos, el backend valida las credenciales y emite el JWT que utiliza el frontend.

---

## Estado, hooks y manejo de errores

**`useReducer`:** `ProductsPage`, `MovementsPage` y `ReportsPage` tienen reducers dedicados para formularios o filtros. Esto concentra las transiciones de estado relacionadas, mientras las páginas siguen coordinando servicios y reglas de interacción.

**`useFetch`:** encapsula `data`, `loading`, `refreshing`, `error` y `refetch` para las consultas que lo usan. Controla las respuestas desactualizadas y evita actualizar el estado después de desmontar el componente. No todas las páginas están obligadas a utilizarlo.

**`getErrorMessage`:** recupera mensajes útiles de la respuesta del backend, detecta ciertos errores de red y utiliza un mensaje alternativo cuando corresponde.

Los componentes específicos de Productos y Movimientos están agrupados en `components/products/` y `components/movements/`. Los componentes de Reportes permanecen en `components/reports/` para reducir el tamaño de la página principal y separar sus tablas, filtros, gráficas y exportación.

---

## Funcionalidades

- Inicio de sesión local y mediante Google OAuth.
- Rutas protegidas, cierre de sesión y tratamiento de tokens expirados.
- Dashboard con indicadores y gráficas del inventario.
- Gestión de categorías y productos, incluyendo desactivación y reactivación de productos cuando corresponde.
- Registro de entradas y salidas de inventario e historial de movimientos.
- Alertas de stock bajo y productos sin stock.
- Reportes de inventario y movimientos con filtros.
- Exportación a Excel de la vista filtrada o del reporte completo.
- Manejo de carga y errores y adaptación a pantallas móviles.

---

## Configuración local

Crear `frontend/.env` a partir de `frontend/.env.example` y ajustar los valores:

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=tu-cliente-google.apps.googleusercontent.com
```

`VITE_API_URL` indica la dirección del backend. `VITE_GOOGLE_CLIENT_ID` corresponde al cliente OAuth utilizado por el navegador. El backend utiliza su propia variable `GOOGLE_CLIENT_ID` para validar las credenciales de Google.

No incluir secretos, contraseñas o valores sensibles en el repositorio. El archivo `.env` debe mantenerse fuera del control de versiones. El ID de cliente OAuth no sustituye a un secreto de servidor.

---

## Instalación y ejecución

Se requiere Node.js compatible con Vite 8 y npm. GitHub Actions utiliza Node.js 24.

Desde la carpeta `frontend`:

```powershell
npm install
npm run dev
```

La aplicación suele estar disponible en `http://localhost:5173`, mientras que el backend se ejecuta normalmente en `http://localhost:8080`. Para utilizar las funcionalidades de inventario, también debe estar disponible MySQL.

Para generar una compilación de producción:

```powershell
npm run build
npm run preview
```

---

## Pruebas y validaciones

Desde `frontend/`:

```powershell
npm test            # Ejecuta las pruebas una vez
npm run test:watch  # Modo de observación durante el desarrollo
npm run lint        # Reglas de ESLint
npm run build       # Compilación de producción
```

Las pruebas se ejecutan con **Vitest**, **React Testing Library** y **jsdom**. Se organizan junto al código y cubren autenticación, `apiClient`, servicios, hooks, reducers, componentes y flujos integrados de páginas.

En las últimas verificaciones compartidas se aprobaron **116 pruebas distribuidas en 19 archivos de prueba**. La cantidad se incluye como referencia de esa ejecución, no como un número fijo.

### Integración continua

El archivo [`.github/workflows/frontend-ci.yml`](../.github/workflows/frontend-ci.yml) configura el workflow **Frontend CI** para los Pull Requests hacia `develop` y `main`.

El job **Frontend checks** utiliza Node.js 24 y ejecuta, desde `frontend/`, los comandos `npm ci`, `npm test`, `npm run lint` y `npm run build`.

Un resultado verde indica que esas comprobaciones finalizaron correctamente; la revisión del código en el Pull Request sigue siendo responsabilidad de quien integra los cambios.

---

## Diseño responsive

La interfaz se adapta a escritorio y dispositivos móviles. El menú cambia de disposición en pantallas pequeñas, los formularios pueden pasar a una columna y las tablas permiten desplazamiento horizontal cuando el ancho es limitado.

---

## Backend y documentación general

La API REST, el modelo de datos, las reglas de inventario, las variables del backend y la ejecución de Spring Boot están documentados en el [README principal](../README.md).
