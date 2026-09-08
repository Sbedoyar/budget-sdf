# Budget SDF

Budget SDF es un sistema de gestión de inventarios desarrollado para la **Tienda El Paraíso**, ubicada en el barrio París de Medellín.

El proyecto hace parte de un Proyecto Pedagógico Integrador (PPI) y busca facilitar el control de productos, entradas y salidas, existencias, alertas de bajo stock y reportes.

Actualmente el **backend está implementado** y el frontend está pendiente de desarrollo.

---

## Tecnologías

- Java 17
- Spring Boot 4.1.1
- Spring Data JPA
- Spring Security
- JWT
- Jakarta Validation
- MySQL 8
- Maven
- Lombok

---

## Arquitectura

Budget SDF utiliza una arquitectura **cliente-servidor** con una API REST.

El backend está organizado como un **monolito modular** y utiliza arquitectura por capas:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL
```

Las reglas de negocio se encuentran principalmente en los `Service`.

---

## Módulos principales

```text
categoria
producto
movimiento
alerta
reporte
usuario
common
```

Cada módulo contiene las capas necesarias como:

```text
controller
service
repository
entity
dto
```

---

## Funcionalidades

El backend permite:

- Iniciar sesión.
- Gestionar categorías.
- Crear, consultar, actualizar y eliminar productos.
- Registrar entradas de inventario.
- Registrar salidas de inventario.
- Evitar salidas superiores al stock disponible.
- Consultar el stock actual.
- Consultar historial de movimientos.
- Visualizar alertas de bajo stock.
- Generar reportes de inventario.
- Generar reportes de movimientos.
- Proteger endpoints mediante JWT.

---

## Base de datos

El sistema utiliza MySQL.

Actualmente existen cuatro tablas principales:

```text
usuarios
categorias
productos
movimientos
```

Relaciones principales:

```text
Categoria 1 ───── N Producto

Producto 1 ───── N Movimiento
```

Cada producto pertenece a una categoría y cada movimiento pertenece a un producto.

Las alertas y reportes se calculan dinámicamente y no necesitan tablas propias.

---

## Categorías

Las categorías se almacenan en una tabla independiente.

Ejemplo:

```text
Bebidas
Granos
Lácteos
```

Al crear un producto, la API recibe `categoriaId`.

Ejemplo:

```json
{
  "codigo": "P001",
  "nombre": "Coca Cola 1.5L",
  "categoriaId": 2,
  "unidadMedida": "Unidad",
  "stockMinimo": 5
}
```

---

## Movimientos de inventario

Existen dos tipos:

```text
ENTRADA
SALIDA
```

Una entrada aumenta el stock:

```text
stockActual = stockActual + cantidad
```

Una salida disminuye el stock:

```text
stockActual = stockActual - cantidad
```

El sistema no permite una salida superior al stock disponible.

Cada movimiento también almacena el `stockResultante` para conservar la trazabilidad.

---

## Alertas de bajo stock

Un producto se considera en bajo stock cuando:

```text
stockActual <= stockMinimo
```

Endpoint:

```text
GET /api/alertas/bajo-stock
```

---

## Reportes

### Inventario

```text
GET /api/reportes/inventario
```

Incluye:

- Total de productos.
- Total de unidades.
- Productos sin stock.
- Productos con bajo stock.
- Productos con stock normal.
- Detalle de cada producto.

### Movimientos

```text
GET /api/reportes/movimientos
```

Incluye:

- Total de movimientos.
- Total de entradas.
- Total de salidas.
- Unidades ingresadas.
- Unidades retiradas.
- Balance.
- Resumen por producto.
- Historial de movimientos.

---

## Autenticación

El login se realiza mediante:

```text
POST /api/auth/login
```

Ejemplo:

```json
{
  "username": "propietario",
  "password": "contraseña"
}
```

Si las credenciales son correctas, el backend devuelve un token JWT.

Los demás endpoints protegidos utilizan:

```text
Authorization: Bearer <token>
```

---

## Endpoints principales

```text
POST   /api/auth/login

POST   /api/categorias
GET    /api/categorias
GET    /api/categorias/{id}
PUT    /api/categorias/{id}
DELETE /api/categorias/{id}

POST   /api/productos
GET    /api/productos
GET    /api/productos/{id}
PUT    /api/productos/{id}
DELETE /api/productos/{id}

POST   /api/movimientos
GET    /api/movimientos
GET    /api/movimientos/producto/{productoId}

GET    /api/alertas/bajo-stock

GET    /api/reportes/inventario
GET    /api/reportes/movimientos
```

---

## Variables de entorno

Las credenciales sensibles no se almacenan directamente en el proyecto.

Antes de iniciar el backend se deben configurar las variables necesarias:

```powershell
$env:DB_PASSWORD="TU_PASSWORD_MYSQL"

$env:APP_ADMIN_USERNAME="propietario"
$env:APP_ADMIN_PASSWORD="TU_PASSWORD_ADMIN"

$env:APP_JWT_SECRET="TU_SECRETO_JWT_DE_AL_MENOS_32_CARACTERES"
```

La configuración de MySQL utiliza:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/budget_sdf}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}
```

---

## Ejecutar el backend

Desde:

```text
C:\budgetsdf\backend
```

ejecutar:

```powershell
.\mvnw.cmd spring-boot:run
```

El servidor inicia por defecto en:

```text
http://localhost:8080
```

---

## Pruebas

Para ejecutar las pruebas automatizadas:

```powershell
.\mvnw.cmd test
```

Actualmente se tienen pruebas para categorías, productos, reportes y flujo de integración.

Última validación:

```text
Tests run: 18
Failures: 0
Errors: 0
Skipped: 0

BUILD SUCCESS
```

También se realizaron pruebas manuales utilizando Postman.

---

## Migración de categorías

Durante el desarrollo, la categoría pasó de ser un texto dentro de `productos` a una relación con la tabla `categorias`.

La migración utilizada se conserva en:

```text
backend/database/migrations/001_normalizar_categorias.sql
```

Este archivo corresponde al cambio del esquema anterior y **no debe ejecutarse cada vez que inicia la aplicación**.

---

## Git

El proyecto utiliza las ramas:

```text
main
→ versión estable

develop
→ desarrollo activo
```

Actualmente el desarrollo continúa sobre `develop`.

---

## Estado del proyecto

```text
Backend  → Implementado
Frontend → Pendiente
```

