# Configuraciones y Especificaciones del Backend - ImpulsaTec

**Stack Tecnológico Base:**
- **Framework:** NestJS (TypeScript)
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM

---

## 1. Seguridad y Validación Global (Endpoints)

Estas son las directrices globales que aplican a todos los endpoints de la API para garantizar la seguridad de la información y la robustez del sistema:

### 1.1. Validación de Datos (Pipes y DTOs)
- **Validación Automática:** Se utilizará `ValidationPipe` de manera global en la aplicación de NestJS.
- **Librerías:** Uso estricto de `class-validator` y `class-transformer` en todos los objetos de transferencia de datos (DTOs).
- **Sanitización:** Se habilitará `whitelist: true` y `forbidNonWhitelisted: true` en el `ValidationPipe`. Esto garantiza que si el cliente envía campos extra, maliciosos o no definidos en el DTO, la petición sea automáticamente rechazada (HTTP 400 Bad Request).

### 1.2. Autenticación y Autorización (Guards y JWT)
- **JSON Web Tokens (JWT):** Todas las rutas protegidas exigirán un token válido enviado en la cabecera HTTP (`Authorization: Bearer <token>`).
- **Estrategias Passport:** Se empleará el módulo `@nestjs/passport` (estrategia JWT) para decodificar e inyectar de forma segura el contexto del usuario (`req.user`) en los controladores.
- **Control de Acceso por Roles (RBAC):** Se diseñarán Guards personalizados (ej. decoradores como `@Roles('admin', 'creator')`) para proteger endpoints sensibles. Solo los administradores podrán cambiar estados oficiales, y un creador solo podrá editar su propio proyecto.

### 1.3. Criptografía y Protección de Datos
- **Hashing de Contraseñas:** Las contraseñas jamás se guardarán en texto plano. Se encriptarán utilizando la librería `bcrypt` (con un "salt" de alta iteración) antes de ser persistidas en PostgreSQL.
- **Aislamiento KYC:** Los datos confidenciales derivados de la verificación de identidad no serán accesibles en el perfil público, exponiéndose únicamente a administradores o al propio usuario autenticado.

### 1.4. Seguridad de Red
- **CORS (Cross-Origin Resource Sharing):** Se configurará estrictamente para aceptar peticiones solo desde los dominios del Frontend (la aplicación Next.js).
- **Rate Limiting (Limitador de peticiones):** Implementación de `@nestjs/throttler` (en memoria, sin uso de Redis) para proteger endpoints críticos (como el `/auth/login`) contra ataques de fuerza bruta o denegación de servicio (DDoS).

---

## 2. Manejo de Entornos (Desarrollo vs. Producción)

Para garantizar un ciclo de vida de desarrollo seguro y un despliegue confiable, el backend de NestJS utilizará el módulo `@nestjs/config` para gestionar las variables de entorno (`.env`). Las configuraciones cambiarán dinámicamente según el valor de `NODE_ENV`:

### 2.1. Configuración de CORS
- **En Desarrollo (`dev`):** El CORS estará configurado para apuntar a `http://localhost:3000` (o `http://localhost:3001`), facilitando las pruebas locales del equipo frontend sin bloqueos.
- **En Producción (`prod`):** El CORS se restringirá de manera estricta al dominio web oficial de la plataforma (ej. `https://impulsatec.edu.pe`), bloqueando automáticamente cualquier petición que provenga de dominios no autorizados.

### 2.2. Base de Datos (TypeORM)
- **En Desarrollo (`dev`):** Se habilitará la propiedad `synchronize: true` de TypeORM. Esto permite que el esquema de PostgreSQL se actualice automáticamente si se modifican las entidades en el código, agilizando la iteración.
- **En Producción (`prod`):** `synchronize` se establecerá forzosamente en `false` para evitar corrupciones o pérdidas accidentales de datos en tablas en vivo. Cualquier cambio en la estructura de la base de datos se ejecutará mediante **Migraciones** formales (`Migrations`).

### 2.3. Exposición de Errores y Logs
- **En Desarrollo (`dev`):** Se habilitarán logs detallados en la consola (incluyendo consultas SQL nativas) y, en caso de fallo, la API devolverá el *stack trace* completo del error para facilitar el debugging.
- **En Producción (`prod`):** Los *stack traces* se ocultarán al cliente para no revelar arquitectura interna (devolviendo un simple `HTTP 500 Internal Server Error`). Los logs detallados se escribirán a través de una librería profesional (como `Pino` o `Winston`) en archivos seguros o servicios de monitoreo, no en la respuesta HTTP.

### 2.4. Documentación de la API (Swagger)
- **En Desarrollo (`dev`):** La interfaz interactiva de Swagger (OpenAPI) estará habilitada y accesible (ej. en la ruta `/docs`) para que el equipo frontend tenga un contrato claro y visual de los endpoints.
- **En Producción (`prod`):** La ruta de Swagger estará deshabilitada para evitar exponer la estructura completa de la API al público, o en su defecto, estará protegida bajo autenticación estricta.
