import { PUBLIC_API_KEY, PUBLIC_URL_LOGIN_OUT_USER } from '$env/static/public'


export const login = async (formData: any) => {
    const url = `${PUBLIC_API_KEY}/login`
    localStorage.setItem('token', '');
    return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formData
    })
}

export const loginRestobarBot = async (formData: any) => {
    const url = `${PUBLIC_API_KEY}/login-bot/login-bot`
    localStorage.setItem('token', '');
    localStorage.setItem('sys::tk', formData)    

    const _data = JSON.parse(formData);
    const _user = { ..._data.user, id: _data.user.idusuario_restobar, idsede: _data.sede.idsede_restobar, idorg: _data.org.idorg_restobar}

    // guardar data en localstore

    return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_user)
    })
    
}

//verify login status
export const verifyLogin = async () => {
    // try {        
    const url = `${PUBLIC_API_KEY}/verify-login`

    const params = {
        token: localStorage.getItem('token') || ''
    }

    return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    })

}

//
export const isLogin = async () => {
    const rpt = await verifyLogin()

    if (rpt.status === 401) {
        window.location.href = PUBLIC_URL_LOGIN_OUT_USER
    }
}

export const getValueToken = (key: string): any => {
    // if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token')?.split('.')[1] || '';
    const _data = JSON.parse(atob(token))
    if (_data[key]) {
        return _data[key]
    } else {
        console.log(`token key ${key} not exist`, _data);
        return false
    }
    // } else {
    //     return false
    // }
}

// data que envia desde restobar
export const getValueTokenSys = (key: string): any => {
    // if (localStorage.getItem('token')) {
    const token = localStorage.getItem('sys::tk') || '';
    const _data = JSON.parse(token)
    if (_data[key]) {
        return _data[key]
    } else {
        console.log(`token key ${key} not exist`, _data);
        return false
    }    
}
