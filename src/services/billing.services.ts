// Saldo de conversaciones del chatbot (Fase 3). Consume /chat-bot/billing/*
// de api-restobar.
//
// Nota: NO usa el httpClient compartido (getData/postDataJSON) porque este
// module necesita leer el body también en respuestas HTTP de error: el
// backend de billing comunica significado real en 402/502/503
// (pago/confirmar → 402 "decline definitivo" con actionCode, o 502
// {retryable:true}; pago/iniciar → 503 "pasarela no configurada"). El
// httpClient lanza un Error genérico ANTES de parsear el body en cualquier
// no-2xx (y encima muestra su propio toast), así que ese detalle se perdía
// y un 402 (no reintentable) terminaba marcado como reintentable. El fetch
// propio de abajo parsea siempre el JSON, sin importar el status, y no
// dispara toasts: el saldo debe poder fallar en silencio.
import { PUBLIC_API_KEY } from '$env/static/public'

const CTRL = 'chat-bot/billing'

// Mismo timeout que httpClient.services.ts: sin esto, una consulta colgada
// en el backend deja el Preload abierto para siempre.
const FETCH_TIMEOUT_MS = 30000

const billingFetch = async (
    metodo: 'GET' | 'POST',
    evento: string,
    body?: unknown,
): Promise<{ status: number; json: any }> => {
    const resp = await fetch(`${PUBLIC_API_KEY}/${CTRL}/${evento}`, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    const json = await resp.json().catch(() => null)
    return { status: resp.status, json }
}

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
        const { json } = await billingFetch('GET', `saldo/${idsede}`)
        return json?.success ? (json.saldo as Saldo) : null
    } catch {
        return null
    }
}

/** Paquetes de recarga en venta. */
export const getPacksChatbot = async (): Promise<Pack[]> => {
    try {
        const { json } = await billingFetch('GET', 'packs')
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
        const { json } = await billingFetch('POST', 'pago/iniciar', { idsede, id_pack: idPack })
        if (json?.success) {
            return { ok: true, data: json as InicioPago }
        }
        // El 503 real ("pasarela de pago no configurada") ahora llega aquí
        // en vez de perderse detrás del error genérico del httpClient.
        return { ok: false, error: json?.error || 'no se pudo iniciar el pago' }
    } catch {
        return { ok: false, error: 'no se pudo iniciar el pago' }
    }
}

/** Verifica el pago server-side y acredita. Reintentable solo si el fallo fue de red o de pasarela (502). */
export const confirmarPagoChatbot = async (
    purchaseNumber: string,
    transactionToken: string,
): Promise<{ ok: boolean; acreditado?: boolean; saldo?: Saldo; error?: string; retryable?: boolean }> => {
    try {
        const { json } = await billingFetch('POST', 'pago/confirmar', { purchaseNumber, transactionToken })
        if (json?.success) {
            return { ok: true, acreditado: json.acreditado !== false, saldo: json.saldo ?? undefined }
        }
        // Un 402 (decline definitivo) trae retryable:false/undefined y su
        // propio actionCode en el mensaje; un 502 trae retryable:true.
        return { ok: false, error: json?.error || 'no se pudo confirmar el pago', retryable: Boolean(json?.retryable) }
    } catch {
        // Fetch falló (red/timeout): no hubo veredicto del backend, así que
        // sí conviene reintentar.
        return { ok: false, error: 'no se pudo confirmar el pago', retryable: true }
    }
}
