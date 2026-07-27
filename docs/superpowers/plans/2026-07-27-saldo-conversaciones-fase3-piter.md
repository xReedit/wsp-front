# Saldo de conversaciones — Fase 3 (panel Piter) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El dueño del restaurante ve su saldo de conversaciones en el panel Piter (solo si su sede está en modo limitado) y recarga con Niubiz sin salir del panel.

**Architecture:** Servicio `src/services/billing.services.ts` (consume `/chat-bot/billing/*` de api-restobar vía el `httpClient` existente, que ya manda `Authorization: Bearer`), loader/wrapper del checkout de Niubiz en `src/services/niubiz.checkout.ts` (patrón nuevo: script dinámico + Promise), y dos componentes: `SaldoWidget.svelte` (card en la columna derecha del panel) + `RecargaModal.svelte` (reusa `Modal.svelte`). Backend ya listo (Fase 2).

**Tech Stack:** Svelte 4 + SvelteKit 2 + TypeScript + Tailwind 3; SweetAlert2 (`mi.swal.ts`) para toasts/confirmaciones.

## Global Constraints

- Reusar SIEMPRE lo existente: `httpClient.services.ts` (`getData`/`postDataJSON` — **leer ese archivo primero** y seguir su convención de retorno exacta: si devuelve `Response`, hacer `.json()` en el caller como hacen las páginas actuales; si devuelve JSON parseado, no), `Modal.svelte` (props `open`/`title`, slot `body`, evento `close`), `mi.swal.ts` (`showToastSwal`, `showAlertSwalDecision`), clases `.btn` de `micss.css`.
- Componentes en `src/components/` (NO `src/lib/components`). Textos de UI en español.
- El controller del endpoint es `'chat-bot/billing'` pasado al `buildUrl` existente (`${PUBLIC_API_KEY}/chat-bot/billing/<evento>`); no crear otra base URL ni tocar `.env` más allá de lo ya configurado.
- La sede sale del flujo existente del panel (`sedeApi.idsede` en `panel/+page.svelte`); el widget solo se monta cuando `sedeApi` está cargada.
- **Sede en modo `ilimitado` (o saldo no disponible): el widget no renderiza NADA** — el panel se ve exactamente como hoy. Cero regresión para las sedes actuales.
- Contratos del backend (Fase 2, verificados): `GET saldo/:idsede` → `{success, saldo:{modo, incluidas, usadas, bolsa, graciaMax, graciaUsadas, estado}}`; `GET packs` → `{success, packs:[{id, conversaciones, precio_soles}]}`; `POST pago/iniciar {idsede, id_pack}` → `{success, purchaseNumber, amount, sessionKey, merchantId, checkoutJsUrl}` (503 si Niubiz no está configurado); `POST pago/confirmar {purchaseNumber, transactionToken}` → `{success, acreditado, saldo?}` | 402 `{success:false, error, actionCode}` | 502 `{retryable:true}`.
- Niubiz checkout web (integración JS): cargar `checkoutJsUrl` una sola vez; `window.VisanetCheckout.configure({...})` con callback `complete` que entrega `params.transactionToken`; luego `VisanetCheckout.open()`. El monto que se muestra/cobra viene del backend (`amount`), nunca se calcula en el front.
- Verificación por tarea: `npm run check` (svelte-check) sin errores nuevos y `npm run build` verde.
- El repo no tiene framework de tests: no introducir uno; la verificación es check+build+smoke E2E (Task 3).

---

### Task 1: Servicios (billing + checkout Niubiz)

**Files:**
- Create: `src/services/billing.services.ts`
- Create: `src/services/niubiz.checkout.ts`

**Interfaces:**
- Consumes: `getData`, `postDataJSON` de `src/services/httpClient.services.ts` (leer el archivo y ajustar el manejo de retorno a su convención real).
- Produces:
  - Tipos `Saldo { modo: string; incluidas: number; usadas: number; bolsa: number; graciaMax: number; graciaUsadas: number; estado: string }`, `Pack { id: number; conversaciones: number; precio_soles: number }`, `InicioPago { purchaseNumber: string; amount: number; sessionKey: string; merchantId: string; checkoutJsUrl: string }`.
  - `getSaldoChatbot(idsede: number | string): Promise<Saldo | null>` — null si error o `!success` (el widget se oculta).
  - `getPacksChatbot(): Promise<Pack[]>` — `[]` si error.
  - `iniciarPagoChatbot(idsede: number | string, idPack: number): Promise<{ ok: true; data: InicioPago } | { ok: false; error: string }>`
  - `confirmarPagoChatbot(purchaseNumber: string, transactionToken: string): Promise<{ ok: boolean; acreditado?: boolean; saldo?: Saldo; error?: string; retryable?: boolean }>`
  - `abrirCheckoutNiubiz(cfg: { checkoutJsUrl: string; merchantId: string; sessionKey: string; purchaseNumber: string; amount: number; sedeNombre?: string }): Promise<string>` — resuelve con el `transactionToken`; rechaza con Error si el cliente cierra el checkout o el script no carga.

- [ ] **Step 1: Leer `src/services/httpClient.services.ts`** y anotar la convención de retorno de `getData`/`postDataJSON` (¿`Response` o JSON?) y cómo manejan status != 2xx los callers existentes (p.ej. `panel/+page.svelte`). Adaptar el código del Step 2 a esa convención (el código siguiente asume `Response` + `.json()` en el caller, como `login/+page.svelte:27`; si el wrapper ya parsea, quitar los `.json()`).

- [ ] **Step 2: Implementar `src/services/billing.services.ts`**

```ts
// Saldo de conversaciones del chatbot (Fase 3). Consume /chat-bot/billing/*
// de api-restobar; el httpClient ya manda el Bearer del panel.
import { getData, postDataJSON } from './httpClient.services'

const CTRL = 'chat-bot/billing'

export interface Saldo {
    modo: string
    incluidas: number
    usadas: number
    bolsa: number
    graciaMax: number
    graciaUsadas: number
    estado: string
}

export interface Pack {
    id: number
    conversaciones: number
    precio_soles: number
}

export interface InicioPago {
    purchaseNumber: string
    amount: number
    sessionKey: string
    merchantId: string
    checkoutJsUrl: string
}

/** Saldo de la sede. null = no disponible o sede sin billing → el widget se oculta. */
export const getSaldoChatbot = async (idsede: number | string): Promise<Saldo | null> => {
    try {
        const rpt = await getData(CTRL, `saldo/${idsede}`)
        const json = await rpt.json()
        return json?.success ? (json.saldo as Saldo) : null
    } catch {
        return null
    }
}

/** Paquetes de recarga en venta. */
export const getPacksChatbot = async (): Promise<Pack[]> => {
    try {
        const rpt = await getData(CTRL, 'packs')
        const json = await rpt.json()
        return json?.success ? (json.packs as Pack[]) : []
    } catch {
        return []
    }
}

/** Crea el pago pendiente y la sesión del checkout. */
export const iniciarPagoChatbot = async (
    idsede: number | string,
    idPack: number,
): Promise<{ ok: true; data: InicioPago } | { ok: false; error: string }> => {
    try {
        const rpt = await postDataJSON(CTRL, 'pago/iniciar', { idsede, id_pack: idPack })
        const json = await rpt.json()
        if (json?.success) {
            return { ok: true, data: json as InicioPago }
        }
        return { ok: false, error: json?.error || 'no se pudo iniciar el pago' }
    } catch {
        return { ok: false, error: 'no se pudo iniciar el pago' }
    }
}

/** Verifica el pago server-side y acredita. Reintentable sin riesgo (idempotente). */
export const confirmarPagoChatbot = async (
    purchaseNumber: string,
    transactionToken: string,
): Promise<{ ok: boolean; acreditado?: boolean; saldo?: Saldo; error?: string; retryable?: boolean }> => {
    try {
        const rpt = await postDataJSON(CTRL, 'pago/confirmar', { purchaseNumber, transactionToken })
        const json = await rpt.json()
        if (json?.success) {
            return { ok: true, acreditado: json.acreditado !== false, saldo: json.saldo ?? undefined }
        }
        return { ok: false, error: json?.error || 'no se pudo confirmar el pago', retryable: Boolean(json?.retryable) }
    } catch {
        return { ok: false, error: 'no se pudo confirmar el pago', retryable: true }
    }
}
```

- [ ] **Step 3: Implementar `src/services/niubiz.checkout.ts`**

```ts
// Carga dinámica del checkout web de Niubiz y apertura del formulario de pago.
// Patrón nuevo en este repo (no existía loader de scripts externos): el script
// se inyecta una sola vez y la apertura devuelve una Promise que resuelve con
// el transactionToken del callback `complete`.

declare global {
    interface Window {
        VisanetCheckout?: any
    }
}

let scriptCargado: Promise<void> | null = null

const cargarScript = (url: string): Promise<void> => {
    if (scriptCargado) return scriptCargado
    scriptCargado = new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = url
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => {
            scriptCargado = null // permitir reintento si falló la carga
            reject(new Error('no se pudo cargar el checkout de Niubiz'))
        }
        document.head.appendChild(s)
    })
    return scriptCargado
}

export interface CheckoutConfig {
    checkoutJsUrl: string
    merchantId: string
    sessionKey: string
    purchaseNumber: string
    amount: number
    sedeNombre?: string
}

/**
 * Abre el checkout de Niubiz. Resuelve con el transactionToken cuando el
 * cliente completa el formulario; rechaza si cierra sin pagar o falla la carga.
 */
export const abrirCheckoutNiubiz = async (cfg: CheckoutConfig): Promise<string> => {
    await cargarScript(cfg.checkoutJsUrl)
    if (!window.VisanetCheckout) {
        throw new Error('checkout de Niubiz no disponible')
    }
    return new Promise<string>((resolve, reject) => {
        window.VisanetCheckout.configure({
            sessiontoken: cfg.sessionKey,
            channel: 'web',
            merchantid: cfg.merchantId,
            purchasenumber: cfg.purchaseNumber,
            amount: cfg.amount,
            expirationminutes: '20',
            timeouturl: 'about:blank',
            merchantname: cfg.sedeNombre || 'Recarga chatbot',
            action: '#', // no usamos form-post: el token llega por `complete`
            complete: (params: any) => {
                const token = params?.transactionToken || params?.tokenId
                if (token) {
                    resolve(String(token))
                } else {
                    reject(new Error('el pago no se completó'))
                }
            },
        })
        window.VisanetCheckout.open()
    })
}
```

- [ ] **Step 4: Verificar y commitear**

Run: `npm run check && npm run build`
Expected: sin errores nuevos de svelte-check; build verde.

```bash
git add src/services/billing.services.ts src/services/niubiz.checkout.ts
git commit -m "feat(billing): servicios de saldo/recarga y checkout Niubiz"
```

---

### Task 2: Componentes SaldoWidget + RecargaModal e integración en el panel

**Files:**
- Create: `src/components/SaldoWidget.svelte`
- Create: `src/components/RecargaModal.svelte`
- Modify: `src/routes/panel/+page.svelte` (montar el widget en la columna derecha, cerca del bloque de contadores existente)

**Interfaces:**
- Consumes: servicios de Task 1; `Modal.svelte` (props `open`, `title`, slot `body`, evento `close`); `showToastSwal`, `showAlertSwalDecision` de `mi.swal.ts`; `sedeApi` del panel.
- **Antes de escribir código:** leer `src/services/mi.swal.ts` y `src/components/Modal.svelte` y ajustar las llamadas del código de abajo a sus firmas REALES (parámetros de `showToastSwal`, forma del retorno de `showAlertSwalDecision` — el código asume `{ isConfirmed }` estilo SweetAlert2 — y nombres de props/slots del Modal).
- Produces: `<SaldoWidget idsede={...} sedeNombre={...} />` autocontenido (incluye su modal de recarga).

- [ ] **Step 1: Implementar `src/components/RecargaModal.svelte`**

```svelte
<script lang="ts">
    // Modal de recarga: elige paquete → checkout Niubiz → confirmación
    // server-side. El monto mostrado viene del backend, nunca se calcula aquí.
    import { createEventDispatcher } from 'svelte'
    import Modal from './Modal.svelte'
    import {
        confirmarPagoChatbot,
        getPacksChatbot,
        iniciarPagoChatbot,
        type Pack,
        type Saldo,
    } from '../services/billing.services'
    import { abrirCheckoutNiubiz } from '../services/niubiz.checkout'
    import { showAlertSwalDecision, showToastSwal } from '../services/mi.swal'

    export let open = false
    export let idsede: number | string
    export let sedeNombre = ''

    const dispatch = createEventDispatcher<{ close: void; recargado: Saldo | null }>()

    let packs: Pack[] = []
    let cargandoPacks = false
    let pagando = false

    $: if (open && !packs.length && !cargandoPacks) {
        cargarPacks()
    }

    const cargarPacks = async () => {
        cargandoPacks = true
        packs = await getPacksChatbot()
        cargandoPacks = false
    }

    /** Reintenta la confirmación (el backend es idempotente: nunca duplica). */
    const confirmarConReintento = async (purchaseNumber: string, transactionToken: string) => {
        for (;;) {
            const conf = await confirmarPagoChatbot(purchaseNumber, transactionToken)
            if (conf.ok && conf.acreditado) {
                showToastSwal('success', 'Recarga acreditada 🎉')
                dispatch('recargado', conf.saldo ?? null)
                dispatch('close')
                return
            }
            if (conf.ok && !conf.acreditado) {
                // Pago cobrado, acreditación pendiente: reintentar es seguro.
                const de = await showAlertSwalDecision(
                    'Pago recibido',
                    'Tu pago se procesó pero la acreditación está pendiente. ¿Reintentar ahora?',
                )
                if (de?.isConfirmed) continue
                dispatch('close')
                return
            }
            if (conf.retryable) {
                const de = await showAlertSwalDecision(
                    'Pasarela ocupada',
                    'No pudimos verificar el pago todavía. ¿Reintentar?',
                )
                if (de?.isConfirmed) continue
                dispatch('close')
                return
            }
            // Rechazo definitivo (402) u otro error no reintentable.
            showToastSwal('error', conf.error || 'El pago no fue aprobado', 5000)
            return
        }
    }

    const comprar = async (pack: Pack) => {
        if (pagando) return
        pagando = true
        try {
            const inicio = await iniciarPagoChatbot(idsede, pack.id)
            if (!inicio.ok) {
                showToastSwal('error', inicio.error, 5000)
                return
            }
            let transactionToken: string
            try {
                transactionToken = await abrirCheckoutNiubiz({
                    checkoutJsUrl: inicio.data.checkoutJsUrl,
                    merchantId: inicio.data.merchantId,
                    sessionKey: inicio.data.sessionKey,
                    purchaseNumber: inicio.data.purchaseNumber,
                    amount: inicio.data.amount,
                    sedeNombre,
                })
            } catch {
                // Cerró el checkout sin pagar: sin drama, puede volver a intentar.
                return
            }
            await confirmarConReintento(inicio.data.purchaseNumber, transactionToken)
        } finally {
            pagando = false
        }
    }
</script>

<Modal {open} title="Recargar conversaciones" on:close={() => dispatch('close')}>
    <div slot="body" class="space-y-3">
        {#if cargandoPacks}
            <p class="text-sm text-gray-500"><i class="fa fa-spinner fa-spin"></i> Cargando paquetes...</p>
        {:else if !packs.length}
            <p class="text-sm text-gray-500">No hay paquetes disponibles por ahora.</p>
        {:else}
            {#each packs as pack (pack.id)}
                <button
                    class="btn btn-primary w-full flex items-center justify-between"
                    disabled={pagando}
                    on:click={() => comprar(pack)}
                >
                    <span>{pack.conversaciones} conversaciones</span>
                    <span class="font-bold">S/ {Number(pack.precio_soles).toFixed(2)}</span>
                </button>
            {/each}
            <p class="text-xs text-gray-400">
                Pago seguro con Niubiz. Las conversaciones se acreditan al instante y no vencen.
            </p>
        {/if}
    </div>
</Modal>
```

- [ ] **Step 2: Implementar `src/components/SaldoWidget.svelte`**

```svelte
<script lang="ts">
    // Widget de saldo de conversaciones. Solo aparece si la sede está en modo
    // 'limitado'; en 'ilimitado' (todas las sedes actuales) no renderiza nada.
    import { onMount } from 'svelte'
    import RecargaModal from './RecargaModal.svelte'
    import { getSaldoChatbot, type Saldo } from '../services/billing.services'

    export let idsede: number | string
    export let sedeNombre = ''

    let saldo: Saldo | null = null
    let modalAbierto = false

    onMount(() => {
        refrescar()
    })

    export const refrescar = async () => {
        saldo = await getSaldoChatbot(idsede)
    }

    // Disponibles del mes + bolsa; la gracia no se muestra como disponible.
    $: disponibles = saldo ? Math.max(0, saldo.incluidas - saldo.usadas) + saldo.bolsa : 0
    $: porcentajeUsado = saldo && saldo.incluidas > 0 ? Math.min(100, Math.round((saldo.usadas / saldo.incluidas) * 100)) : 0
    $: critico = saldo ? saldo.estado === 'corte' || saldo.estado === 'gracia' : false
    $: advertencia = saldo ? !critico && disponibles > 0 && porcentajeUsado >= 80 : false
</script>

{#if saldo && saldo.modo === 'limitado'}
    <div class="rounded-lg border p-4 space-y-2 {critico ? 'border-red-400 bg-red-50' : advertencia ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}">
        <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">💬 Conversaciones del bot</h3>
            <button class="btn btn-primary text-sm" on:click={() => (modalAbierto = true)}>Recargar</button>
        </div>

        {#if critico}
            <p class="text-sm text-red-700 font-medium">
                {#if saldo.estado === 'corte'}
                    Tu saldo se agotó: el bot dejó de responder a clientes nuevos. Recarga para reactivarlo.
                {:else}
                    Saldo agotado — el bot atiende {saldo.graciaMax - saldo.graciaUsadas} conversaciones de cortesía más y luego se detiene.
                {/if}
            </p>
        {:else if advertencia}
            <p class="text-sm text-amber-700">Te quedan {disponibles} conversaciones este mes.</p>
        {/if}

        <div class="w-full bg-gray-200 rounded-full h-2">
            <div
                class="h-2 rounded-full {critico ? 'bg-red-500' : advertencia ? 'bg-amber-500' : 'bg-green-500'}"
                style="width: {porcentajeUsado}%"
            ></div>
        </div>
        <p class="text-xs text-gray-500">
            {saldo.usadas} de {saldo.incluidas} usadas este mes
            {#if saldo.bolsa > 0}· bolsa extra: {saldo.bolsa}{/if}
        </p>
    </div>

    <RecargaModal
        open={modalAbierto}
        {idsede}
        {sedeNombre}
        on:close={() => (modalAbierto = false)}
        on:recargado={(e) => { if (e.detail) saldo = e.detail; else refrescar() }}
    />
{/if}
```

- [ ] **Step 3: Integrar en `src/routes/panel/+page.svelte`**

Importar el componente junto a los imports existentes:

```ts
import SaldoWidget from '../../components/SaldoWidget.svelte'
```

y montarlo en la columna derecha (column2), justo antes o después del bloque de contadores existente (`countPedidosRealizadosBot`, ~línea 609 — anclar en el markup real), renderizando solo cuando la sede está cargada:

```svelte
{#if sedeApi?.idsede}
    <SaldoWidget idsede={sedeApi.idsede} sedeNombre={sedeApi.nombre || ''} />
{/if}
```

(Verificar el nombre real del campo del nombre de la sede en el tipo `SedeApi`; si no existe, pasar `''`.)

- [ ] **Step 4: Verificar y commitear**

Run: `npm run check && npm run build`
Expected: sin errores nuevos; build verde.

```bash
git add src/components/SaldoWidget.svelte src/components/RecargaModal.svelte src/routes/panel/+page.svelte
git commit -m "feat(billing): widget de saldo y modal de recarga en el panel"
```

---

### Task 3: Smoke test E2E local (stack completo, sin tarjeta real)

**Files:** ninguno (verificación; scripts temporales no se commitean).

Stack: MySQL docker (como el smoke de Fase 2) + api-restobar (`npm run dev` con `DATABASE_URL` override) + chatbot-go (Postgres docker + `BILLING_API_KEY=test-key-local`) + Piter (`npm run dev` con `PUBLIC_API_KEY` apuntando al api-restobar local).

- [ ] **Step 1: Levantar el stack** igual que el smoke de Fase 2 (tablas + pack de prueba + sede 99 en modo limitado en el chatbot-go). En Piter: `.env` local ya apunta a `http://localhost:20223/api-restobar` — confirmar el puerto real del api-restobar dev y ajustar el env de arranque si difiere (override por env var al arrancar vite, sin editar `.env`).

- [ ] **Step 2: Sesión del panel sin login externo.** El login real llega por `?us=` desde Restobar; para el smoke, sembrar `localStorage` a mano (browser automation o consola): `token` = JWT firmado con la clave de `src/middleware/auth.ts` del api-restobar, `sys::tk` = JSON con `{sede:{idsede_restobar:99, ...}, org:{...}, user:{...}}` con la forma que `getValueTokenSys` espera (leerla de `login.services.ts`). Abrir `/panel`.

- [ ] **Step 3: Verificar (capturas o texto de la página):**
  - Sede 99 en `limitado` → el widget aparece con usadas/incluidas reales del chatbot-go y color correcto.
  - Sede en `ilimitado` (cambiar desde el dashboard del bot) → recargar el panel → el widget NO aparece.
  - Botón Recargar → modal con el pack de prueba (100 conv / S/ 59.00).
  - Click en el pack (sin credenciales Niubiz en api-restobar) → toast de error "pasarela de pago no configurada" y nada se rompe.
  - `confirmarPagoChatbot` del pago fake pagado de la Fase 2 (vía consola del navegador o curl) → acreditación idempotente sigue OK.

- [ ] **Step 4: Bajar el stack, limpiar, reportar.** El checkout real de Niubiz queda pendiente de las keys de sandbox (mismo gate de la Fase 2).

---

## Notas de deploy (Fase 3)

- Piter se buildea con `npm run build` (adapter-auto); mismo proceso de deploy que use hoy el panel. Sin env vars nuevas.
- El widget es invisible para toda sede en `ilimitado`: se puede desplegar antes de activar cobros.

## Riesgos anotados

- El callback `complete` del checkout JS de Niubiz se valida recién con las keys de sandbox (mismo gate de Fase 2). Si la versión del checkout exigiera form-post (`action` URL) en vez de callback, el cambio queda contenido en `niubiz.checkout.ts` + un endpoint pequeño; no afecta al resto.
- `sedeApi.idsede` es el id que la Fase 1/2 usan como `idsede` (el mismo que `chat_events.idsede` del bot). Verificado contra `panel/+page.svelte` (`get-sede/${infoSede.idsede_restobar}`).
