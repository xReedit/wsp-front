// Carga dinámica del checkout web de Niubiz y apertura del formulario de pago.
// Patrón nuevo en este repo (no existía loader de scripts externos): el script
// se inyecta una sola vez y la apertura devuelve una Promise que resuelve con
// el transactionToken del callback `complete`.

declare global {
    interface Window {
        VisanetCheckout?: any
    }
}

// Cacheado por URL: si se cambia de sandbox a producción (u otra URL) dentro
// de la misma sesión de la SPA, se debe cargar el script nuevo, no reusar el viejo.
let scriptCargado: { url: string; promesa: Promise<void> } | null = null

const cargarScript = (url: string): Promise<void> => {
    if (scriptCargado && scriptCargado.url === url) return scriptCargado.promesa
    const promesa = new Promise<void>((resolve, reject) => {
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
    scriptCargado = { url, promesa }
    return promesa
}

// Márgen sobre expirationminutes ('20') para dar tiempo a que Niubiz dispare
// su propio timeout antes de que nosotros cortemos la espera.
const TIMEOUT_CHECKOUT_MS = 22 * 60 * 1000

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
        // Si el callback `complete` nunca dispara (el usuario cierra el lightbox
        // sin que Niubiz notifique, comportamiento no validado hasta probar con
        // llaves sandbox), esta Promise quedaría colgada para siempre y
        // `pagando` en RecargaModal seguiría en true hasta recargar la página.
        // El timeout garantiza que siempre se asiente. La Promise rechazada cae
        // en el catch de `comprar()` en RecargaModal (no-op: "cerró sin pagar"),
        // así que el usuario puede reintentar sin recargar.
        const timeoutId = setTimeout(() => {
            reject(new Error('checkout expirado'))
        }, TIMEOUT_CHECKOUT_MS)

        window.VisanetCheckout.configure({
            sessiontoken: cfg.sessionKey,
            channel: 'web',
            merchantid: cfg.merchantId,
            purchasenumber: cfg.purchaseNumber,
            amount: cfg.amount,
            expirationminutes: '20',
            // La URL actual, no about:blank: si la sesión de 20 min expira,
            // Niubiz redirige toda la SPA a esta URL y debe volver al panel.
            timeouturl: window.location.href,
            merchantname: cfg.sedeNombre || 'Recarga chatbot',
            action: '#', // no usamos form-post: el token llega por `complete`
            complete: (params: any) => {
                clearTimeout(timeoutId)
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
