# Arquitectura y Especificaciones del Cliente Frontend (Next.js)

Este documento es la **guía maestra** para los agentes encargados de construir el Frontend (interfaz de usuario) de ImpulsaTec. Todos los módulos y componentes deben guiarse bajo estas especificaciones.

## 1. Reglas Globales (Stack, Arquitectura y UI/UX)
- **Framework:** Next.js (App Router) con React.
- **Diseño (UI/UX):** Estética Premium. Uso intensivo de paletas modernas, Glassmorphism, modo oscuro elegante y micro-animaciones (Framer Motion). Prohibido diseños estáticos o aburridos.
- **Consumo de API:** `axios` configurado con Base URL (http://localhost:3000) e interceptores para manejar tokens JWT en `Authorization`.
- **Estructura Front:** Separar `/app` (rutas), `/components` (UI), `/hooks`, y `/services` (lógica Axios separada por dominio).

---

## 2. Flujos de Usuario e Integración por Módulo
*(ATENCIÓN AGENTES DE BACKEND: Llenen la sección correspondiente a su módulo especificando claramente los Endpoints HTTP (GET/POST/PUT), los DTOs exactos (JSON expected) y cómo afecta al flujo visual del frontend. Respeten el formato Markdown y NO borren el contenido de otros módulos).*

### Módulo 1: Autenticación (Auth)
<!-- AGENTE DE AUTH: Añade aquí los endpoints de Login, Register, KYC, y los payloads exactos -->
**1. Registro de Usuario (Register)**
- **Ruta:** `POST /auth/register`
- **Payload Esperado (JSON Estricto):**
  ```json
  {
    "firstName": "String (Requerido)",
    "lastName": "String (Requerido)",
    "email": "String (Formato Email, Requerido)",
    "password": "String (Mín. 6 caracteres, Requerido)",
    "role": "Enum ('creator', 'backer', 'admin', Requerido)"
  }
  ```
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "accessToken": "ey...",
    "message": "User registered successfully"
  }
  ```
- **Acción UI:** Guardar el `accessToken` (por ejemplo, en LocalStorage o Cookies), inicializar la sesión del usuario y redirigir al Dashboard principal o perfil. Mostrar notificación de éxito. En caso de HTTP 400 o 409 (Email ya en uso), mostrar alerta de error estilizada.

**2. Inicio de Sesión (Login)**
- **Ruta:** `POST /auth/login`
- **Payload Esperado (JSON Estricto):**
  ```json
  {
    "email": "String (Formato Email, Requerido)",
    "password": "String (Requerido)"
  }
  ```
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "accessToken": "ey...",
    "refreshToken": "ey...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "String",
      "lastName": "String",
      "role": "Enum",
      "isVerified": false,
      "bio": "String | null",
      "avatarUrl": "String | null",
      "createdAt": "ISOString",
      "updatedAt": "ISOString"
    }
  }
  ```
- **Acción UI:** Guardar el `accessToken` en el interceptor de Axios y el `refreshToken` en una Cookie segura (HttpOnly idealmente). Actualizar el estado global (Context/Redux) con los datos de `user`. Redirigir al Inicio. Manejar error 401 ("Credenciales inválidas").

**3. Renovación de Sesión (Refresh Token)**
- **Ruta:** `POST /auth/refresh`
- **Payload Esperado (JSON Estricto):**
  ```json
  {
    "refreshToken": "String (Requerido)"
  }
  ```
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "accessToken": "ey...",
    "refreshToken": "ey..."
  }
  ```
- **Acción UI:** Un Interceptor de Axios (`axios.interceptors.response`) debe atrapar automáticamente cualquier error `401 Unauthorized`. Si el error es por token expirado, llamar a esta ruta en *background*. Tras el éxito, guardar los nuevos tokens y reintentar silenciosamente el request original. Si este endpoint falla, desloguear al usuario forzosamente y mandarlo al Login.

**4. Verificación de Identidad (KYC)**
- **Ruta:** `POST /auth/verify-identity`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>` (Protegido por JwtAuthGuard)
- **Payload Esperado:** `multipart/form-data` con los siguientes campos:
  - `documentFront`: Archivo (Imagen/PDF, maxCount: 1)
  - `documentBack`: Archivo (Imagen/PDF, maxCount: 1)
  - `selfie`: Archivo (Imagen, maxCount: 1)
- **Respuesta Exitosa (JSON - HTTP 202):**
  ```json
  {
    "status": "accepted",
    "message": "KYC documents received successfully and are being processed.",
    "userId": "uuid"
  }
  ```
- **Acción UI:** En lugar de JSON, usar `FormData` nativo de JavaScript para ensamblar la petición. Implementar una animación (ej. Lottie o Framer Motion spinner) mientras se suben los archivos, manteniendo el diseño "Premium". Tras el HTTP 202, mostrar un mensaje o un Toast que indique "En revisión" y bloquear visualmente el formulario KYC para no duplicar peticiones futuras.

### Módulo 2: Usuarios (Users)
<!-- AGENTE DE USERS: Añade aquí endpoints de Perfil (GET /me), actualización de perfil y roles -->
**1. Obtener Perfil Propio (Get Me)**
- **Ruta:** `GET /users/me`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado:** Ninguno (vacío).
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "firstName": "String",
    "lastName": "String",
    "email": "user@example.com",
    "role": "Enum ('creator', 'backer', 'admin')",
    "isVerified": false,
    "bio": "String | null",
    "avatarUrl": "String | null",
    "createdAt": "ISOString",
    "updatedAt": "ISOString"
  }
  ```
- **Acción UI:** Obtener estos datos para renderizar el panel de control (Dashboard) o la vista de "Mi Perfil" del usuario autenticado. 

**2. Actualizar Perfil (Update Me)**
- **Ruta:** `PUT /users/me`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado (JSON Estricto - Todos opcionales):**
  ```json
  {
    "firstName": "String (Opcional, Max: 100)",
    "lastName": "String (Opcional, Max: 100)",
    "bio": "String (Opcional, Max: 500)",
    "avatarUrl": "String (Opcional, formato URL válida)"
  }
  ```
  *(Nota Crítica: Cualquier intento del frontend de enviar campos como `role`, `isVerified` o `password` provocará un error HTTP 400 debido al Strict ValidationPipe).*
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "firstName": "String",
    "lastName": "String",
    "email": "user@example.com",
    "role": "Enum",
    "isVerified": false,
    "bio": "String",
    "avatarUrl": "https://...",
    "createdAt": "ISOString",
    "updatedAt": "ISOString"
  }
  ```
- **Acción UI:** Enviar exclusivamente los campos modificados en el formulario de ajustes. Tras el 200 OK, actualizar el estado global (Context/Zustand/Redux) con el nuevo objeto retornado y mostrar un Toast estilizado de éxito.

**3. Obtener Perfil Público (Get Public Profile)**
- **Ruta:** `GET /users/:id`
- **Payload Esperado:** Ninguno (el UUID viaja en los parámetros de la URL).
- **Respuesta Exitosa (JSON - Solo campos seguros):**
  ```json
  {
    "id": "uuid",
    "firstName": "String",
    "lastName": "String",
    "bio": "String | null",
    "avatarUrl": "String | null",
    "role": "Enum ('creator', 'backer')",
    "createdAt": "ISOString"
  }
  ```
  *(El backend asegura que no se expongan correos ni metadatos sensibles al público).*
- **Acción UI:** Usar este endpoint al renderizar la página de un Creador (ej. perfil del autor de un proyecto). Manejar el error 404 (Not Found) renderizando un estado vacío ("Not Found State") de estilo moderno y elegante, sin romper la aplicación.

### Módulo 3: Proyectos (Projects & Manticore Search)
<!-- AGENTE DE PROYECTOS: Documenta creación (wizard), listado con Manticore, actualización y schemas JSON -->
**1. Crear Proyecto (Create)**
- **Ruta:** `POST /projects`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado:** `multipart/form-data` con los siguientes campos:
  - `title`: String (Requerido, Max 255)
  - `description`: String (Requerido)
  - `targetAmount`: Number (Requerido)
  - `durationDays`: Number (Requerido, Min 1)
  - `trlLevel`: Number (Requerido, Min 1)
  - `hasVideo`: Boolean (Opcional)
  - `category`: String (Requerido)
  - `rewards`: String JSON (Opcional, array de objetos `[{"amount": 10, "description": "Taza"}]`)
  - `sustentos`: Archivos múltiples (Imágenes/Docs, maxCount: 10)
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "title": "String",
    "description": "String",
    "targetAmount": 5000,
    "durationDays": 30,
    "trlLevel": 4,
    "category": "String",
    "aiSuccessProbability": 85.5,
    "aiFeasibilityIndex": 7.2,
    "aiRecommendations": ["Mejorar descripción", "Añadir video"],
    "createdAt": "ISOString",
    "updatedAt": "ISOString"
  }
  ```
- **Acción UI:** Usar `FormData` para construir la petición, parseando las recompensas como un string con `JSON.stringify()` antes de anexarlas. Mostrar una barra de progreso de subida. Al recibir el 201, redirigir a la vista de éxito (Wizard Completion) y mostrar las métricas de la IA en gráficos estilizados.

**2. Listar Proyectos (List)**
- **Ruta:** `GET /projects`
- **Payload Esperado (Query Params):** 
  - `page`: Number (Opcional, default 1)
  - `limit`: Number (Opcional, default 10)
  - `search`: String (Opcional, palabra clave para Manticore Search)
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "String",
        "description": "String",
        "targetAmount": 1000,
        "category": "String",
        "status": "draft",
        "createdAt": "ISOString"
      }
    ],
    "total": 1,
    "page": 1,
    "lastPage": 1
  }
  ```
- **Acción UI:** Construir un feed tipo "Grid" con tarjetas. Si hay texto de búsqueda, actualizar la URL con `?search=valor` y renderizar respetando el orden entregado por la API (el backend mantiene la relevancia de Manticore).

**3. Obtener Detalle de Proyecto (Get)**
- **Ruta:** `GET /projects/:id`
- **Payload Esperado:** Ninguno (UUID en parámetro de ruta)
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "title": "String",
    "description": "String",
    "targetAmount": 1000,
    "raisedAmount": 0,
    "category": "String",
    "status": "draft",
    "creator": { "id": "uuid", "firstName": "String", "lastName": "String" },
    "rewards": [
      { "id": "uuid", "amount": 10, "description": "String" }
    ],
    "createdAt": "ISOString"
  }
  ```
- **Acción UI:** Renderizar la página de detalle del proyecto (Campaign Page) con Skeleton Loaders durante la carga inicial.

**4. Actualizar Proyecto (Update)**
- **Ruta:** `PUT /projects/:id`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado:** Igual a `POST /projects` (vía `multipart/form-data`). Todos los campos son opcionales y se enviarán solo los modificados o nuevos archivos en `sustentos`.
- **Acción UI:** Renderizar formulario pre-llenado. Manejar 403 Forbidden si no es el creador.

**5. Actualizar Estado (Admin)**
- **Ruta:** `PATCH /projects/:id/status`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>` (Solo rol `admin`)
- **Payload Esperado (JSON Estricto):**
  ```json
  {
    "status": "Enum ('draft', 'review', 'funding', 'funded', 'closed')"
  }
  ```
- **Acción UI:** Visible y utilizable únicamente en el panel de Administración.

**6. Eliminar Proyecto**
- **Ruta:** `DELETE /projects/:id`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Acción UI:** Mostrar modal crítico de confirmación ("¿Estás seguro?") antes de disparar el request. Tras éxito, redirigir al Dashboard del creador.

### Módulo 4: Pagos (Payments/Donations)
<!-- AGENTE DE PAGOS: Documentar cómo el frontend envía la intención de pago (pledge) y recibe webhooks/confirmaciones -->
**1. Crear Intención de Aporte (Crear Orden en PayPal)**
- **Ruta:** `POST /payments/projects/:id/pledge`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado (JSON Estricto):**
  ```json
  {
    "amount": "Number (Requerido, Min: 1, Max: 1000000)",
    "rewardId": "uuid (Opcional)"
  }
  ```
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "pledgeId": "uuid",
    "paypalOrderId": "String (ej. 5O190127TN364715T)",
    "approvalUrl": "URL_String",
    "status": "pending"
  }
  ```
- **Acción UI:** Construir y mostrar una ventana o modal de pago. Guardar el `orderId` temporalmente. Extraer la `approvalUrl` y usarla para redirigir al usuario al entorno seguro de PayPal o abrirla en un iFrame/Popup soportado por la pasarela.

**2. Capturar Pago (Confirmar Transacción)**
- **Ruta:** `POST /payments/capture`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado (JSON Estricto):**
  ```json
  {
    "orderId": "String (El paypalOrderId recibido en el paso 1, Requerido)"
  }
  ```
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "amount": "100.00",
    "status": "success",
    "transactionId": "String",
    "paypalOrderId": "String",
    "createdAt": "ISOString",
    "project": { "id": "uuid", "title": "String", "raisedAmount": "Number" },
    "user": { "id": "uuid", "firstName": "String" },
    "reward": { "id": "uuid", "description": "String" }
  }
  ```
- **Acción UI:** Al retornar el usuario de PayPal al Frontend (ej. a una ruta `/payments/success?token=X`), extraer el token/orderId de la URL y disparar inmediatamente esta ruta para que el backend capture los fondos. Mostrar animación de "Cargando..." o *Lottie* de procesamiento. Al recibir `status: "success"`, mostrar un modal de agradecimiento premium (Glassmorphism + Animación de Check) y redirigir al dashboard de historial de aportes o al detalle del proyecto. Manejar HTTP 400 en caso de fallo y mostrar error.

**3. Webhook de PayPal (Informativo)**
- **Ruta:** `POST /payments/webhook`
- **Acción UI:** Ninguna. Esta ruta es pública y asíncrona; el Frontend no interactúa con ella. Sirve como *fallback* de seguridad para el Backend en caso de que el cliente cierre la ventana sin disparar la captura explícitamente.

**4. Historial de Aportes del Inversor (Financiador)**
- **Ruta:** `GET /payments/me/pledges`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado:** Ninguno.
- **Respuesta Exitosa (JSON):**
  ```json
  [
    {
      "id": "uuid",
      "amount": "100.00",
      "status": "success",
      "createdAt": "ISOString",
      "project": { "id": "uuid", "title": "String", "targetAmount": "Number" },
      "reward": { "id": "uuid", "description": "String" }
    }
  ]
  ```
- **Acción UI:** Renderizar el historial de inversiones del usuario autenticado en su panel principal. Utilizar listas elegantes o tablas (DataGrid) responsivas.

**5. Aportes Recibidos por Proyecto (Creador)**
- **Ruta:** `GET /payments/projects/:id/pledges`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>` (Validado: Debe ser el dueño del proyecto).
- **Payload Esperado:** Ninguno.
- **Respuesta Exitosa (JSON):**
  ```json
  [
    {
      "id": "uuid",
      "amount": "100.00",
      "status": "success",
      "createdAt": "ISOString",
      "user": { "id": "uuid", "firstName": "String", "lastName": "String", "email": "String" },
      "reward": { "id": "uuid", "description": "String" }
    }
  ]
  ```
- **Acción UI:** Renderizar en el "Creator Dashboard" (panel de administración del proyecto). Mostrar quién ha donado (respaldando con un diseño limpio) y qué recompensa hay que despachar. Mostrar alertas u ordenamientos útiles para el creador.

### Módulo 5: Inteligencia Artificial (Predicción)
<!-- AGENTE DE PREDICCION: Documenta el endpoint de evaluación y cómo consumir la IA -->
**1. Evaluar Proyecto con IA**
- **Ruta:** `POST /predictions/projects/:id/evaluate`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>` (Protegido por JwtAuthGuard. Requiere ser Creador del proyecto o Admin).
- **Payload Esperado:** Ninguno (el UUID del proyecto viaja en los parámetros de la URL).
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "successProbability": 85.5,
    "feasibilityIndex": 7.2,
    "transparencyIndex": 9.0,
    "recommendations": [
      "Mejorar la descripción de las recompensas para aumentar el atractivo.",
      "Establecer hitos más claros en el cronograma.",
      "Añadir un video explicativo del prototipo."
    ],
    "createdAt": "ISOString"
  }
  ```
- **Acción UI:** Este endpoint se puede invocar desde el Dashboard del Creador para obtener un análisis fresco. Al llamarlo, mostrar un *Lottie* o animación de "Analizando con IA" (diseño Premium). Tras recibir el HTTP 200, mostrar una gráfica circular atractiva con el `%` de probabilidad de éxito y tarjetas (*cards*) estilizadas para cada recomendación.
- **Manejo de Errores:** Interceptar HTTP 503 (Service Unavailable) si el motor de IA está apagado o entrenándose, y mostrar un Toast amigable ("Nuestra IA está temporalmente fuera de servicio"). Interceptar HTTP 403 si el usuario intenta evaluar un proyecto que no le pertenece.

### Módulo 6: Recomendaciones (Recommendations)
<!-- AGENTE DE RECOMENDACION: Documenta cómo el frontend debe pedir el Feed personalizado del usuario -->
**1. Obtener Feed Personalizado (Listar Proyectos Recomendados)**
- **Ruta:** `GET /recommendations/feed`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>` (Protegido por JwtAuthGuard).
- **Payload Esperado (Query Params):**
  - `page`: Number (Opcional, Default 1, Mínimo 1)
  - `limit`: Number (Opcional, Default 20, Mínimo 1)
- **Respuesta Exitosa (JSON):**
  ```json
  [
    {
      "id": "uuid",
      "title": "String",
      "description": "String",
      "targetAmount": 5000,
      "raisedAmount": 1000,
      "status": "funding",
      "trlLevel": 4,
      "creator": { "id": "uuid", "firstName": "String", "lastName": "String" },
      "createdAt": "ISOString"
    }
  ]
  ```
  *(Nota: El motor interno ordena estos proyectos dinámicamente aplicando un 'Match Score' basado en el historial del usuario o un 'Cold Start' si el usuario es nuevo).*
- **Acción UI:** Al renderizar la página principal de un usuario autenticado (Feed), usar esta ruta en lugar de `/projects` genérico. Si el usuario hace scroll hacia abajo, incrementar `page` y concatenar resultados (Infinite Scroll) con micro-animaciones al revelar las tarjetas.

**2. Registrar Interacción de Usuario (View / Like)**
- **Ruta:** `POST /recommendations/interact`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado (JSON Estricto):**
  ```json
  {
    "projectId": "uuid (Requerido)",
    "interactionType": "Enum ('view', 'like', 'pledge') (Requerido)"
  }
  ```
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "id": "uuid",
    "userId": "uuid",
    "projectId": "uuid",
    "interactionType": "view",
    "score": 1,
    "createdAt": "ISOString"
  }
  ```
- **Acción UI:** 
  - Para un 'view': Cuando el usuario abre el detalle de un proyecto, enviar una petición de fondo silenciosa (background request) con `interactionType: "view"`.
  - Para un 'like': Al presionar el botón "Me Gusta/Corazón" en un proyecto, invocar esta ruta con `interactionType: "like"` e ilustrar el cambio con una micro-animación en el icono.
  - *(Nota: No enviar requests manuales para 'pledge' desde el cliente; el backend lo escucha automáticamente vía Event Emitter al completar pagos).*

### Módulo 7: Notificaciones (Notifications)
<!-- AGENTE DE NOTIFICACIONES: Documenta si se usa Socket.io, SSE o polling, y los endpoints de "marcar como leído" -->
**1. Conexión en Tiempo Real (WebSockets)**
- **Ruta / Namespace:** `ws://localhost:3000/ws/notifications`
- **Protocolo:** Socket.io (`socket.io-client`)
- **Autenticación (Handshake):** Es obligatorio enviar el JWT, ya sea en los headers (`Authorization: Bearer <accessToken>`) o como parámetro en la query de conexión (`?token=<accessToken>`).
- **Eventos a Escuchar (Cliente):**
  - `new_pledge_received`: Alerta al creador de un nuevo aporte.
  - `project_status_changed`: Alerta de cambios de estado del proyecto.
- **Acción UI:** Al iniciar la app (tras login exitoso), instanciar el cliente de Socket.io. Al recibir cualquiera de estos eventos, mostrar un *Toast* animado (Premium UI) en pantalla. Además, actualizar dinámicamente un contador rojo (badge) en el icono de notificaciones del Navbar utilizando el gestor de estado global.

**2. Obtener Historial de Notificaciones**
- **Ruta:** `GET /notifications`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado (Query Params):**
  - `page`: Number (Opcional, default 1)
  - `limit`: Number (Opcional, default 10)
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "type": "new_pledge",
        "message": "¡Has recibido un nuevo aporte de $100 en tu proyecto!",
        "isRead": false,
        "createdAt": "ISOString"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
  ```
- **Acción UI:** Al desplegar el menú de la campanita en el Navbar, cargar el historial. Diferenciar visualmente las notificaciones no leídas (`isRead: false`) con un fondo resaltado suave o un punto indicador.

**3. Marcar una Notificación como Leída**
- **Ruta:** `PATCH /notifications/:id/read`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado:** Ninguno (el ID viaja en la URL).
- **Respuesta Exitosa (JSON):** Retorna la notificación actualizada (`isRead: true`).
- **Acción UI:** Ejecutar en segundo plano (*background*) cuando el usuario hace clic sobre una notificación específica en la lista. Decrementar el contador del Navbar en -1 y quitar el resaltado visual.

**4. Marcar Todas las Notificaciones como Leídas**
- **Ruta:** `PATCH /notifications/read-all`
- **Headers Requeridos:** `Authorization: Bearer <accessToken>`
- **Payload Esperado:** Ninguno.
- **Respuesta Exitosa (JSON):**
  ```json
  {
    "success": true,
    "message": "Todas las notificaciones marcadas como leídas"
  }
  ```
- **Acción UI:** Botón de acción rápida en el menú de notificaciones ("Marcar todo como leído"). Al presionarlo, actualizar la UI instantáneamente ocultando el contador rojo y lanzando un Toast de confirmación sutil.
