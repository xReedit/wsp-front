import { PUBLIC_API_KEY, PUBLIC_CONTROLER, PUBLIC_URL_API_PEDIDO } from '$env/static/public'
import { showToastSwal } from './mi.swal'

// ==========================================
// Helpers internos
// ==========================================

function buildHeaders(withToken: boolean): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (withToken) {
        const token = localStorage.getItem('token') || ''
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers
}

function buildUrl(baseUrl: string, controller: string, event: string): string {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    return `${baseUrl}/${controller}/${event}`
}

async function handleResponse<T>(response: Response, asJson: boolean = true): Promise<T> {
    if (!response.ok) {
        const errorMsg = `Error ${response.status}: ${response.statusText || 'Error en la solicitud'}`
        showToastSwal('error', errorMsg, 3000)
        throw new Error(errorMsg)
    }
    return asJson ? response.json() : response as unknown as T
}

async function safeFetch<T>(url: string, options: RequestInit, asJson: boolean = true): Promise<T> {
    try {
        const response = await fetch(url, options)
        return await handleResponse<T>(response, asJson)
    } catch (error: any) {
        if (error?.message?.startsWith('Error ')) {
            throw error
        }
        showToastSwal('error', 'No se pudo conectar con el servidor', 3000)
        throw error
    }
}

// ==========================================
// API Principal (PUBLIC_API_KEY)
// ==========================================

export const getData = async (controller: string, event: string, payload: any = null, withToken = true): Promise<any> => {
    const url = buildUrl(PUBLIC_API_KEY, controller, event)
    const headers = buildHeaders(withToken)

    // Si hay payload, se envía como query params (GET no debe llevar body)
    const finalUrl = payload
        ? `${url}?${new URLSearchParams(payload).toString()}`
        : url

    return await safeFetch(finalUrl, { method: 'GET', headers })
}

export const postData = async (controller: string, event: string, payload: any, withToken: boolean = true) => {
    const url = buildUrl(PUBLIC_API_KEY, controller, event)
    const headers = buildHeaders(withToken)

    return await safeFetch<Response>(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    }, false)
}

export const postDataJSON = async (controller: string, event: string, payload: any) => {
    const url = buildUrl(PUBLIC_API_KEY, controller, event)
    const headers = buildHeaders(true)

    return await safeFetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    })
}

export const putData = async (controller: string, event: string, payload: any = null, withToken = true) => {
    const url = buildUrl(PUBLIC_API_KEY, controller, event)
    const headers = buildHeaders(withToken)

    return await safeFetch<Response>(url, {
        method: 'PUT',
        headers,
        body: payload ? JSON.stringify(payload) : undefined
    }, false)
}

// ==========================================
// API Pedidos Bot (PUBLIC_URL_API_PEDIDO)
// ==========================================

export const postDataPedidoBot = async (controller: string, event: string, payload: any, withToken = false) => {
    const url = `${PUBLIC_URL_API_PEDIDO}/${controller}/${event}`
    const headers = buildHeaders(withToken)

    return await safeFetch<Response>(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    }, false)
}

export const postDataSolicitudPermiso = async (controller: string, event: string, payload: any, withToken = false) => {
    const url = `${PUBLIC_URL_API_PEDIDO}/${controller}/${event}`
    const headers = buildHeaders(withToken)

    return await safeFetch<Response>(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    }, false)
}

