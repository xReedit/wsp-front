# CLAUDE.md — Piter Chat Bot (Frontend)

## Descripción del Proyecto

Panel de administración frontend para **Piter ChatBot**, un bot de WhatsApp orientado a restaurantes (restobar). Permite gestionar sesiones del bot, configurar cartas/menús, canales de consumo, métodos de pago, costos de delivery y atender solicitudes remotas de permisos.

El sistema se integra con la plataforma **Papaya** (papaya.com.pe) para comercio de restaurantes.

## Stack Tecnológico

- **Framework:** SvelteKit 2 + Svelte 4
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS 3 + PostCSS + CSS personalizado (`micss.css`)
- **Build:** Vite 5
- **Comunicación en tiempo real:** Socket.IO Client
- **Almacenamiento de archivos:** AWS S3 (`@aws-sdk/client-s3`) con compresión de imágenes (`compressorjs`)
- **Geocodificación:** Google Maps Services
- **Búsqueda difusa:** Fuse.js
- **NLP:** Natural
- **Fechas:** date-fns
- **Alertas/Notificaciones:** SweetAlert2
- **Tema claro/oscuro:** mode-watcher

## Estructura del Proyecto

```
src/
├── types/
│   └── index.ts                 # Interfaces TypeScript (Sede, Carta, Canal, TipoPago, etc.)
├── stores/
│   └── bot.store.ts             # Store Svelte para estado del bot y socket (Singleton)
├── components/
│   ├── Button.svelte            # Botón reutilizable con loader
│   ├── Modal.svelte             # Modal genérico con animación
│   ├── Preload.svelte           # Indicador de carga fullscreen
│   ├── Toolbar.svelte           # Barra de navegación superior
│   ├── Modificar.Carta.svelte   # Edición de cartas/menús (bindings reactivos)
│   ├── Number.Handler.svelte    # Gestión de números de teléfono (bloqueo/desbloqueo)
│   ├── CartaConfig.svelte       # Configuración de cartas (extraído del panel)
│   ├── ChannelConfig.svelte     # Configuración de canales de consumo
│   ├── PaymentConfig.svelte     # Configuración de métodos de pago
│   └── DeliveryConfig.svelte    # Configuración de costos de delivery
├── routes/
│   ├── +layout.svelte           # Layout global (Toolbar + contenedor principal)
│   ├── +page.svelte             # Página raíz (conexión socket + QR)
│   ├── login/+page.svelte       # Login vía token base64 desde Restobar
│   ├── panel/+page.svelte       # Panel principal de administración del bot
│   └── solicitud-remoto/+page.svelte  # Gestión de solicitudes de permisos remotos
├── services/
│   ├── api.restobar.ts          # API específica del restobar (pedidos, bloqueo de teléfonos)
│   ├── httpClient.services.ts   # Cliente HTTP unificado (GET, POST, PUT) con manejo de errores
│   ├── login.services.ts        # Autenticación y verificación de tokens
│   ├── mi.swal.ts               # Wrappers de SweetAlert2 con temas personalizados
│   ├── s3.connect.services.ts   # Subida y optimización de imágenes a AWS S3
│   ├── socket.services.ts       # Cliente Socket.IO (patrón Singleton)
│   └── utils.ts                 # Utilidades (formato moneda, fechas, mayúsculas, clipboard)
├── styles/
│   └── micss.css                # Estilos CSS personalizados con TailwindCSS @apply
├── static/                      # Assets estáticos (imágenes, sonidos)
├── config.ts                    # Configuración (actualmente comentada, usa .env)
├── app.css
├── app.html
└── app.d.ts
```

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build de producción
npm run check        # Verificación de tipos TypeScript + Svelte
npm run check:watch  # Verificación de tipos en modo watch
```

## Variables de Entorno

Las variables se gestionan mediante `$env/static/public` de SvelteKit (prefijo `PUBLIC_`). Configurar en `.env`:

- `PUBLIC_API_KEY` — URL base de la API backend
- `PUBLIC_CONTROLER` — Controlador por defecto para las rutas API
- `PUBLIC_SOCKET_SERVER_URL` — URL del servidor Socket.IO
- `PUBLIC_URL_API_PEDIDO` — URL de la API de pedidos
- `PUBLIC_URL_LOGIN_OUT_USER` — URL de redirección al cerrar sesión
- `PUBLIC_AWS_ACCESS_KEY_ID` — AWS Access Key para S3
- `PUBLIC_AWS_SECRET_ACCESS_KEY` — AWS Secret Key para S3
- `PUBLIC_AWS_REGION` — Región AWS del bucket S3
- `PUBLIC_BUCKET_NAME` — Nombre del bucket S3
- `PUBLIC_URL_VIEW_BUCKET` — URL pública para visualizar archivos del bucket

## Arquitectura y Patrones Clave

### Autenticación
- El login se realiza desde el sistema Restobar externo, pasando datos del usuario codificados en base64 como query param (`?us=...`)
- Se genera un JWT que se almacena en `localStorage` bajo la clave `token`
- Los datos de sesión del sistema Restobar se guardan en `localStorage` bajo `sys::tk`
- El `httpClient` adjunta automáticamente el token Bearer en las peticiones

### Comunicación en Tiempo Real (Socket.IO)
- `SocketClient` implementa el patrón **Singleton**
- Eventos principales del socket:
  - `init_bot` — Iniciar el bot con la configuración de la sede
  - `stop-chat-bot` — Detener el bot
  - `update-info-sede` — Actualizar configuración en caliente
  - `image_qr_session` — Recibir QR de WhatsApp para vincular
  - `session_init` / `session_verify` — Estado de la sesión de WhatsApp
  - `pedidoRealizado` — Notificación de nuevo pedido (con sonido beep)
  - `newConversation` — Nueva conversación entrante

### Panel Principal (`/panel`)
El panel permite configurar:
1. **Cartas/Menús** — Días, horarios, imágenes de la carta
2. **Canales de Consumo** — Delivery, Recoger, Reservar (habilitar/deshabilitar)
3. **Métodos de Pago** — Selección de métodos aceptados por el chatbot
4. **Costos de Delivery** — Costo fijo o variable (por km base + km adicional)
5. **Ciudades de Atención** — Ciudades con código postal para geocodificación
6. **Link Tienda Virtual** — URL de la carta online como fallback
7. **Gestión de Números** — Bloqueo/desbloqueo de teléfonos

### Subida de Imágenes (S3)
- Las imágenes se comprimen antes de subir usando `Compressor.js`
- Máximo 1200x1200px, calidad 0.8, límite 800KB
- Se almacenan en el path `files-bot/` del bucket

## Alias de Importación

- `$root` → `src/` (configurado en `svelte.config.js`)

## Principios SOLID Aplicados

- **S (Single Responsibility):** Cada componente/servicio tiene una sola responsabilidad. El panel se descompuso en `CartaConfig`, `ChannelConfig`, `PaymentConfig`, `DeliveryConfig`
- **O (Open/Closed):** `httpClient` usa helpers extensibles (`buildHeaders`, `safeFetch`, `handleResponse`) sin modificar las funciones públicas
- **L (Liskov):** Las interfaces en `types/index.ts` permiten sustituir implementaciones
- **I (Interface Segregation):** Interfaces específicas por entidad (`Carta`, `CanalConsumo`, `TipoPago`) en vez de un `any` genérico
- **D (Dependency Inversion):** El store `bot.store.ts` abstrae la dependencia del socket, las páginas no dependen directamente de `SocketClient`

## Manejo de Errores

- Todos los servicios HTTP muestran errores vía **SweetAlert2** (`showToastSwal`)
- `httpClient` tiene manejo global: errores de red y errores HTTP (status != 2xx)
- `login.services.ts` protege `getValueToken` y `getValueTokenSys` con try/catch
- `s3.connect.services.ts` muestra alertas al fallar subida o compresión de imágenes
- Las páginas (`login`, `panel`, `solicitud-remoto`) envuelven `onMount` en try/catch/finally

## Loading / Preloader

- Todas las páginas que hacen fetch muestran `<Preload>` mientras cargan
- `panel/+page.svelte` usa `isDataLoaded` para no renderizar hasta tener datos
- `solicitud-remoto` muestra spinner individual por solicitud al aceptar (`procesandoId`)
- `Modificar.Carta.svelte` usa el `loader` del `<Button>` durante guardado

## Convenciones de Código

- Servicios en `src/services/` con extensión `.services.ts` o `.ts`
- Componentes Svelte en PascalCase con puntos como separadores (ej: `Modificar.Carta.svelte`)
- Interfaces/Types centralizados en `src/types/index.ts`
- Stores de Svelte en `src/stores/` con extensión `.store.ts`
- Variables de entorno accedidas vía `$env/static/public`
- Moneda por defecto: PEN (Soles peruanos), locale `es-PE`
- Los console.log se eliminan en producción (`drop_console: true` en vite.config.ts)
