// Saldo de conversaciones del chatbot (Fase 3). Consume /chat-bot/billing/*
// de api-restobar; el httpClient ya manda el Bearer del panel.
//
// Nota de convención: `getData`/`postDataJSON` de httpClient.services.ts ya
// devuelven el body parseado (JSON), no un `Response` — internamente usan
// safeFetch con asJson=true por defecto. Además, si el status HTTP no es 2xx,
// httpClient ya lanza un Error (y muestra su propio toast) antes de llegar
// aquí; por eso los catch de abajo no necesitan volver a mostrar toast, solo
// resolver al valor "vacío" que la UI espera (null / [] / ok:false).
// `postDataJSON` no declara tipo de retorno (a diferencia de `getData`, que
// es `Promise<any>`), así que TS lo infiere como `unknown`; se tipa `json`
// como `any` al recibirlo, igual que ya hace s3.connect.services.ts:19.
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
        const json = await getData(CTRL, `saldo/${idsede}`)
        return json?.success ? (json.saldo as Saldo) : null
    } catch {
        return null
    }
}

/** Paquetes de recarga en venta. */
export const getPacksChatbot = async (): Promise<Pack[]> => {
    try {
        const json = await getData(CTRL, 'packs')
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
        const json: any = await postDataJSON(CTRL, 'pago/iniciar', { idsede, id_pack: idPack })
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
        const json: any = await postDataJSON(CTRL, 'pago/confirmar', { purchaseNumber, transactionToken })
        if (json?.success) {
            return { ok: true, acreditado: json.acreditado !== false, saldo: json.saldo ?? undefined }
        }
        return { ok: false, error: json?.error || 'no se pudo confirmar el pago', retryable: Boolean(json?.retryable) }
    } catch {
        return { ok: false, error: 'no se pudo confirmar el pago', retryable: true }
    }
}
