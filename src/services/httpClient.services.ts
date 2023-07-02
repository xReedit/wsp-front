import { PUBLIC_API_KEY, PUBLIC_CONTROLER, PUBLIC_URL_API_PEDIDO } from '$env/static/public'

// const PUBLIC_API_KEY = PUBLIC_API_KEY

// export function get apirest
export const getData = async (controller: string, event: string, payload: any = null) => {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    const url = `${PUBLIC_API_KEY}/${controller}/${event}`

    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

    let response;
    if (payload) {
        response = await fetch(url, {
            method: 'GET',
            headers: headers,
            body: JSON.stringify(payload)
        })
    } else {
        response = await fetch(url, {
            method: 'GET',
            headers: headers
        })
    }

    return response.json()
}

// export function post apirest
export const postData = async (controller: string, event: string, payload: any) => {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    const url = `${PUBLIC_API_KEY}/${controller}/${event}`
    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

    return await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    })
}

export const postDataJSON = async (controller: string, event: string, payload: any) => {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    const url = `${PUBLIC_API_KEY}/${controller}/${event}`
    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    const _rpt = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    })

    return _rpt.json()
}

// export function put apirest
export const putData = async (controller: string, event: string, payload: any = null) => {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    const url = `${PUBLIC_API_KEY}/${controller}/${event}`
    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    return await fetch(url, {
        method: 'PUT',
        headers,
        body: payload ? JSON.stringify(payload) : payload
    })
}

// export function post apirest
export const postDataPedidoBot = async (controller: string, event: string, payload: any) => {    
    const url = `${PUBLIC_URL_API_PEDIDO}/${controller}/${event}`
    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

    return await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    })
}
