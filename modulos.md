# Especificación de Módulos y Endpoints - Backend ImpulsaTec

A continuación se detalla la estructura de la API RESTful dividida por módulos según la arquitectura planteada para el sistema.

---

## 1. Módulo de Autenticación (`AuthModule`)

### 1.1 Registro de Usuario
- **Método:** `POST`
- **URL:** `/auth/register`
- **Body Request (`application/json`):** `firstName`, `lastName`, `email`, `password`, `role`.
- **Body Response (`201 Created`):** `id`, `email`, `accessToken`, `message`.

### 1.2 Inicio de Sesión
- **Método:** `POST`
- **URL:** `/auth/login`
- **Body Request (`application/json`):** `email`, `password`.
- **Body Response (`200 OK`):** `accessToken`, `refreshToken`, `user`.

### 1.3 Verificación de Identidad (KYC)
- **Método:** `POST`
- **URL:** `/auth/verify-identity`
- **Body Request (`multipart/form-data`):** `documentFront`, `documentBack`, `selfie`.
- **Body Response (`202 Accepted`):** `status`, `message`.

### 1.4 Especificaciones en Servicios
- **Manejo y Subida de Archivos (Multer):** Se utilizará el módulo nativo de **Multer** (`@nestjs/platform-express`) para la recepción y el guardado local de los archivos. Las imágenes enviadas durante el proceso de verificación de identidad (`documentFront`, `documentBack` y `selfie`) serán interceptadas y almacenadas físicamente dentro del servidor en la ruta: `./uploads/kyc/`. Desde este directorio local, el servicio tomará los archivos para encolar o enviar el payload final hacia el proveedor de verificación externa.

### 1.5 Entidades (TypeORM)
- Este módulo no posee entidades propias exclusivas. Utiliza la entidad genérica `User` del módulo de usuarios para persistir las credenciales y cambiar el estado de verificación (`isVerified`).

---

## 2. Módulo de Usuarios (`UsersModule`)

### 2.1 Obtener Perfil Propio
- **Método:** `GET`
- **URL:** `/users/me`
- **Body Response (`200 OK`):** Información completa del perfil autenticado.

### 2.2 Actualizar Perfil
- **Método:** `PUT`
- **URL:** `/users/me`
- **Body Request (`application/json`):** `bio`, `avatarUrl`, etc.
- **Body Response (`200 OK`):** Perfil actualizado.

### 2.3 Obtener Perfil Público
- **Método:** `GET`
- **URL:** `/users/:id`
- **Body Response (`200 OK`):** Información visible al público de un creador o financiador.

### 2.4 Especificaciones en Servicios
- **Gestión de Perfil Seguro:** Los servicios abstraerán las consultas de TypeORM para asegurar que, bajo ninguna circunstancia, un usuario pueda editar datos sensibles o de escalamiento de privilegios (como cambiar su estado `isVerified` o su `role`) a través de un endpoint público.

### 2.5 Entidades (TypeORM)
- **Entidad `User`:**
  - `id`: `PrimaryGeneratedColumn` (UUID o entero).
  - `firstName`, `lastName`: `Column` (varchar).
  - `email`: `Column` (varchar, `unique: true`).
  - `password`: `Column` (varchar, guardado como hash).
  - `role`: `Column` (enum: `'creator'`, `'backer'`, `'admin'`).
  - `isVerified`: `Column` (boolean, `default: false`).
  - `bio`, `avatarUrl`: `Column` (text/varchar, `nullable: true`).
  - `createdAt`, `updatedAt`: `CreateDateColumn`, `UpdateDateColumn`.

---

## 3. Módulo de Proyectos (`ProjectsModule`)

### 3.1 Listar Proyectos
- **Método:** `GET`
- **URL:** `/projects`
- **Queries:** `status`, `filter`, `page`, `limit`, `search`.

### 3.2 Crear Proyecto (Borrador)
- **Método:** `POST`
- **URL:** `/projects`
- **Body Request (`multipart/form-data`):** `title`, `description`, `targetAmount`, archivos de `sustentos`.

### 3.3 Editar Proyecto
- **Método:** `PUT`
- **URL:** `/projects/:id`
- **Body Request (`multipart/form-data` o `application/json`):** Campos a actualizar.

### 3.4 Obtener Detalle del Proyecto
- **Método:** `GET`
- **URL:** `/projects/:id`

### 3.5 Actualizar Estado del Proyecto (Administrador)
- **Método:** `PATCH`
- **URL:** `/projects/:id/status`

### 3.6 Eliminar Proyecto
- **Método:** `DELETE`
- **URL:** `/projects/:id`

### 3.7 Especificaciones en Servicios
- **Manejo y Subida de Archivos (Multer):** La recepción de archivos adjuntos (imágenes de prototipos y documentos PDF de sustento) será procesada utilizando interceptores de **Multer** (`FilesInterceptor`). Todos estos archivos se almacenarán de forma local en el servidor backend dentro del directorio: `./uploads/projects/{projectId}/`. Esto permitirá mantener los adjuntos organizados de manera estructurada por cada proyecto para servirlos posteriormente como archivos estáticos.
- **Búsqueda Full-Text (Manticore Search):**
  - **Para el `GET /projects`:** El servicio interceptará los queries textuales del usuario. En lugar de ejecutar cláusulas costosas de tipo `LIKE` en PostgreSQL, el servicio hará la consulta a Manticore Search para obtener rápidamente los IDs de los proyectos relevantes, y luego irá a PostgreSQL solo para poblar la información con TypeORM.
  - **Para el `POST /projects`:** Una vez que TypeORM confirme que el proyecto se ha guardado exitosamente en PostgreSQL (haciendo *commit* de la transacción), el servicio emitirá un evento asíncrono para insertar las columnas textuales (título, descripción, categorías) dentro del índice maestro de Manticore Search.
  - **Para el `PUT` y `PATCH`:** Al detectar modificaciones en la descripción, estado o título de un proyecto, el servicio sincronizará dichos cambios inmediatamente con el índice de Manticore (Update/Replace document) para que los motores de búsqueda de la plataforma jamás arrojen datos desactualizados.

### 3.8 Entidades (TypeORM)
- **Entidad `Project`:**
  - `id`: `PrimaryGeneratedColumn`.
  - `title`, `description`: `Column` (varchar/text).
  - `targetAmount`, `raisedAmount`: `Column` (decimal/float).
  - `durationDays`, `trlLevel`: `Column` (int).
  - `status`: `Column` (enum: `'draft'`, `'review'`, `'funding'`, `'funded'`, `'closed'`).
  - `creatorId`: Relación `ManyToOne` (hacia `User`).
  - `createdAt`, `updatedAt`: `CreateDateColumn`, `UpdateDateColumn`.
- **Entidad `Reward` (Recompensas para aportes fijos):**
  - `id`: `PrimaryGeneratedColumn`.
  - `projectId`: Relación `ManyToOne` (hacia `Project`).
  - `amount`: `Column` (decimal/float, el monto requerido).
  - `description`: `Column` (varchar, lo que se entregará).

---

## 4. Módulo de Pagos y Aportes (`PaymentsModule`)

### 4.1 Realizar Aporte a un Proyecto
- **Método:** `POST`
- **URL:** `/payments/projects/:id/pledge`
- **Body Request (`application/json`):** `amount`, `rewardId`, `paymentMethodId`.

### 4.2 Especificaciones en Servicios
- **Manejo de Transacciones (ACID):** El servicio utilizará el `QueryRunner` de TypeORM para envolver el registro del aporte, la actualización del fondo recaudado en la tabla proyectos y la validación con la pasarela externa en una sola transacción SQL protegida.

### 4.3 Entidades (TypeORM)
- **Entidad `Pledge` (Aporte financiero):**
  - `id`: `PrimaryGeneratedColumn`.
  - `amount`: `Column` (decimal/float).
  - `status`: `Column` (enum: `'pending'`, `'success'`, `'failed'`).
  - `transactionId`: `Column` (varchar, token o ID de Stripe/MercadoPago).
  - `projectId`: Relación `ManyToOne` (hacia `Project`).
  - `userId`: Relación `ManyToOne` (hacia `User` - el Financiador).
  - `rewardId`: Relación `ManyToOne` (hacia `Reward`, `nullable: true` para aportes libres).
  - `createdAt`: `CreateDateColumn`.

---

## 5. Módulo de Predicción (`PredictionsModule`)

### 5.1 Generar Predicción de Éxito
- **Método:** `POST`
- **URL:** `/predictions/projects/:id/evaluate`
- **Body Response (`200 OK`):** `successProbability`, `feasibilityIndex`, `recommendations`.

### 5.2 Especificaciones en Servicios
- **Implementación Gradual de IA (FastAPI):** Se define arquitectónicamente que la conexión vía HTTP (usando `@nestjs/axios`) con el modelo Random Forest desplegado en Python/FastAPI se realizará **después**. Sin embargo, en esta fase, el `PredictionsService` dejará la estructura, DTOs e interfaces de salida totalmente listas (implementando un patrón de *Mocking* temporal que devuelva predicciones estáticas). De este modo, cuando el motor de Inteligencia Artificial esté entrenado y disponible, integrar sus endpoints reales sea simplemente cambiar la dirección de las funciones internas del servicio sin tocar el resto del backend.

### 5.3 Entidades (TypeORM)
- **Entidad `Prediction`:**
  - `id`: `PrimaryGeneratedColumn`.
  - `projectId`: Relación `OneToOne` (hacia `Project`).
  - `successProbability`: `Column` (float, rango 0 a 100).
  - `feasibilityIndex`, `transparencyIndex`: `Column` (float).
  - `recommendations`: `Column` (jsonb / texto, arreglo de sugerencias de optimización).
  - `createdAt`: `CreateDateColumn`.

---

## 6. Módulo de Recomendaciones (`RecommendationsModule`)

### 6.1 Obtener Feed Personalizado (Financiador)
- **Método:** `GET`
- **URL:** `/recommendations/feed`

### 6.2 Especificaciones en Servicios
- **Lógica de Ponderación:** El servicio sentará las bases lógicas de los algoritmos de ordenamiento, agrupando proyectos en base a un "Match Score" local, sirviendo de puente para futuras expansiones cognitivas.

### 6.3 Entidades (TypeORM)
- **Entidad `Interaction` (Opcional, para poblar el Feed):**
  - `id`: `PrimaryGeneratedColumn`.
  - `userId`: Relación `ManyToOne` (hacia `User`).
  - `projectId`: Relación `ManyToOne` (hacia `Project`).
  - `interactionType`: `Column` (enum: `'view'`, `'like'`, `'pledge'`).
  - `score`: `Column` (float, el peso de la acción para el algoritmo).
  - `createdAt`: `CreateDateColumn`.

---

## 7. Módulo de Notificaciones (`NotificationsModule`)

*(Este módulo no implementa endpoints REST tradicionales HTTP, sino que abre un Gateway de conexiones activas)*

### 7.1 Rutas y Eventos (WebSocket)
- **Método:** Conexión persistente mediante Socket.io (`@nestjs/websockets`).
- **Namespace (Ruta):** `/ws/notifications`
- **Eventos de Emisión (Servidor → Cliente):**
  - `project_status_changed`: Informa que un administrador aprobó o rechazó una publicación.
  - `new_pledge_received`: Informa al creador que un financiador ha realizado un aporte a su proyecto.

### 7.2 Especificaciones en Servicios
- **Infraestructura de WebSockets:**
  - **Manejo de Conexiones:** El servicio mantendrá un diccionario en memoria o un mapeo interno para vincular el `userId` de la base de datos con el `socketId` actual. Esto es vital para poder emitir eventos y alertas privadas (unicast) de forma directa a un usuario, en lugar de inundar el canal general (broadcast).
  - **Autenticación en Sockets:** El `NotificationsGateway` debe implementar un Guard o Middleware nativo del Socket que intercepte el intento de conexión (`Handshake`) y exija la cabecera con el JWT (Access Token). Si el token es inválido o no existe, el servidor cerrará inmediatamente la conexión, previniendo ciberataques de suscripción fantasma.
  - **Patrón de Eventos (Event Emitter):** Para no acoplar fuertemente los módulos, el `NotificationsService` no será instanciado manualmente por `ProjectsModule` o `PaymentsModule`. En su lugar, el sistema usará `@nestjs/event-emitter` de manera que cuando un pago se procesa, simplemente se despache un evento genérico y el `NotificationsService` lo escuche de fondo para enviarlo por WebSockets.

### 7.3 Entidades (TypeORM)
- **Entidad `Notification` (Historial persistente):**
  - `id`: `PrimaryGeneratedColumn`.
  - `userId`: Relación `ManyToOne` (hacia `User` - el destinatario).
  - `type`: `Column` (enum: `'project_approved'`, `'new_pledge'`, `'project_rejected'`, etc.).
  - `message`: `Column` (varchar, texto de la notificación).
  - `isRead`: `Column` (boolean, `default: false`).
  - `createdAt`: `CreateDateColumn`.
