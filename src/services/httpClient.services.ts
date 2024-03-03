import { PUBLIC_API_KEY, PUBLIC_CONTROLER, PUBLIC_URL_API_PEDIDO } from '$env/static/public'

// const PUBLIC_API_KEY = PUBLIC_API_KEY

// export function get apirest
export const getData = async (controller: string, event: string, payload: any = null, withToken = true) => {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    const url = `${PUBLIC_API_KEY}/${controller}/${event}`    
     

    let headers = {};
    if ( withToken ) {
        const token = localStorage.getItem('token')   
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    } else {
        headers = {
            'Content-Type': 'application/json'
        }
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
export const postData = async (controller: string, event: string, payload: any, withToken: boolean = true) => {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    const url = `${PUBLIC_API_KEY}/${controller}/${event}`
    

    // si viene con token
    let headers = {};
    if ( withToken ) {
        const token = localStorage.getItem('token')
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    } else {
        headers = {
            'Content-Type': 'application/json'
        }
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
export const putData = async (controller: string, event: string, payload: any = null, withToken = true) => {
    controller = controller === '' ? PUBLIC_CONTROLER : controller
    const url = `${PUBLIC_API_KEY}/${controller}/${event}`
    

    let headers = {};
    if ( withToken ) {
        const token = localStorage.getItem('token')
         headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    } else {
        headers = {
            'Content-Type': 'application/json'
        }
    }


    
    return await fetch(url, {
        method: 'PUT',
        headers,
        body: payload ? JSON.stringify(payload) : payload
    })
}

// export function post apirest
export const postDataPedidoBot = async (controller: string, event: string, payload: any, withToken = false) => {    
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

export const postDataSolicitudPermiso = async (controller: string, event: string, payload: any, withToken = false) => {    
    const url = `${PUBLIC_URL_API_PEDIDO}/${controller}/${event}`

    let headers = {};
    if ( withToken ) {
        const token = localStorage.getItem('token')
         headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    } else {
        headers = {
            'Content-Type': 'application/json'
        }
    }


    return await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    })
}


// export function post apirest

