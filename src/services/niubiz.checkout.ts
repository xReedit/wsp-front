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
