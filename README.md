# Budget SDF

Sistema de inventario para Tienda El Paraíso.

## Tecnologías
- Java 17
- Spring Boot
- MySQL
- Maven

## Arquitectura
- **Cliente-servidor:** arquitectura donde una parte actúa como cliente y otra como servidor. En Budget SDF, el **frontend** será el cliente porque muestra la interfaz y envía solicitudes, mientras que el **backend con Spring Boot** será el servidor porque procesa esas solicitudes, aplica la lógica del sistema y consulta la base de datos.

- **API REST:** forma de comunicación entre frontend y backend mediante HTTP. El frontend enviará peticiones como `GET`, `POST`, `PUT` y `DELETE`, y el backend responderá normalmente en formato JSON. Por ejemplo, `GET /api/productos` serviría para consultar los productos registrados.

- **Monolito modular:** significa que todo el backend funciona como **una sola aplicación Spring Boot**, pero internamente está dividido en módulos según la funcionalidad. En Budget SDF tendríamos módulos como `producto`, `movimiento`, `usuario`, `alerta` y `reporte`. No son aplicaciones separadas; todas forman parte del mismo backend.

- **Arquitectura por capas:** organiza el código según la responsabilidad de cada parte. En nuestro caso:

Controller
   ↓
Service
   ↓
Repository
   ↓
Base de datos

## Backend
- producto
- movimiento
- usuario
- alerta
- reporte

## Comandos

### Ejecutar backend
cd backend
.\mvnw.cmd spring-boot:run

## Pendientes
- Crear entidad Producto
- Crear DTOs
- Crear repository
- Crear service
- Crear controller

## Para ejecutar backend

- cd backend
- .\mvnw.cmd spring-boot:run