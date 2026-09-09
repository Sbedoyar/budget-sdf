# Budget SDF

Budget SDF es un sistema de gestión de inventario desarrollado para la **Tienda El Paraíso**, ubicada en el barrio París de Medellín.

El proyecto busca facilitar el control de productos, entradas y salidas de inventario, alertas de bajo stock y generación de reportes básicos, reemplazando el manejo manual de la información.

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

El frontend se encuentra pendiente de desarrollo.

---

## Arquitectura

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

La lógica de negocio se encuentra principalmente en la capa `Service`.

---

## Funcionalidades

### Autenticación

- Inicio de sesión mediante usuario y contraseña.
- Contraseñas almacenadas utilizando BCrypt.
- Autenticación mediante JWT.
- Acceso protegido a los endpoints del sistema.

### Categorías

- Registrar categorías.
- Consultar categorías.
- Actualizar categorías.
- Eliminar categorías sin productos asociados.
- Validar nombres duplicados.

### Productos

- Registrar productos.
- Consultar productos.
- Actualizar información del producto.
- Eliminar productos sin movimientos asociados.
- Asignar una categoría.
- Definir unidad de medida.
- Definir stock mínimo.
- Consultar stock actual.

El stock actual no se modifica directamente desde el módulo de productos. Su valor cambia únicamente mediante movimientos de inventario.

### Movimientos de inventario

El sistema maneja dos tipos de movimiento:

- `ENTRADA`
- `SALIDA`

Una entrada aumenta el stock actual del producto.

Una salida disminuye el stock y valida previamente que exista suficiente inventario.

Cada movimiento conserva información como:

- Producto.
- Tipo de movimiento.
- Cantidad.
- Stock resultante.
- Fecha.
- Observación.

Los movimientos forman parte del historial y no se modifican ni eliminan.

### Alertas de bajo stock

El sistema identifica automáticamente productos cuyo stock actual sea menor o igual al stock mínimo definido.

Las alertas se calculan a partir del inventario actual y no requieren una tabla independiente.

### Reportes

El sistema genera:

- Reporte general de inventario.
- Resumen de productos.
- Estado de stock.
- Reporte de movimientos.
- Totales de entradas y salidas.
- Historial detallado de movimientos.
- Resumen de movimientos por producto.

Los estados de inventario utilizados en los reportes son:

- `OUT_OF_STOCK`
- `LOW_STOCK`
- `NORMAL`

---

## Base de datos

La base de datos utilizada es:

```text
budget_sdf
```

Tablas principales:

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

Esto permite mantener compatibilidad con la base de datos existente sin realizar una migración completa del esquema.

---

## API REST

URL base:

```text
http://localhost:8080
```

### Autenticación

```http
POST /api/auth/login
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
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
```

### Movimientos

```http
GET  /api/movements
GET  /api/movements/product/{productId}
POST /api/movements
```

También se puede consultar el historial de movimientos de un producto mediante el endpoint definido en el controlador de movimientos.

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

El inventario aumenta o disminuye posteriormente mediante movimientos.

---

## Seguridad

Todos los endpoints principales requieren autenticación mediante JWT, excepto:

```http
POST /api/auth/login
```

El token debe enviarse en las peticiones protegidas utilizando:

```http
Authorization: Bearer <token>
```

El rol actualmente utilizado es:

```text
PROPIETARIO
```

---

## Variables de entorno

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

Opcionalmente:

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

No se deben almacenar contraseñas reales ni secretos directamente en el repositorio.

---

## Ejecución

Desde la carpeta del backend:

```powershell
cd backend
```

Ejecutar:

```powershell
.\mvnw.cmd spring-boot:run
```

El servidor inicia por defecto en:

```text
http://localhost:8080
```

---

## Pruebas

Para ejecutar todas las pruebas:

```powershell
.\mvnw.cmd test
```

Estado actual:

```text
Tests run: 18
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Las pruebas incluyen servicios y endpoints de integración para validar las principales reglas de negocio.

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
- No se puede eliminar un producto que tenga movimientos registrados.
- Los movimientos se conservan como historial.
- Las alertas de bajo stock se generan dinámicamente.
- Los reportes se generan a partir de la información actual del sistema.

---

## Estado del proyecto

Actualmente el backend de Budget SDF cuenta con:

- Gestión de categorías.
- Gestión de productos.
- Gestión de movimientos.
- Control de stock.
- Alertas de bajo stock.
- Reportes de inventario.
- Reportes de movimientos.
- Autenticación con JWT.
- Persistencia en MySQL.
- Validaciones de negocio.
- Manejo global de errores.
- Pruebas unitarias y de integración.

El frontend se encuentra pendiente de implementación.

