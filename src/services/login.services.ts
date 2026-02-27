import { PUBLIC_API_KEY, PUBLIC_URL_LOGIN_OUT_USER } from '$env/static/public'
import { showToastSwal } from './mi.swal'


export const login = async (formData: any) => {
    try {
        const url = `${PUBLIC_API_KEY}/login`
        localStorage.setItem('token', '');
        return await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: formData
        })
    } catch (error) {
        showToastSwal('error', 'Error al iniciar sesión', 3000)
        throw error
    }
}

export const loginRestobarBot = async (formData: any) => {
    try {
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
    } catch (error) {
        showToastSwal('error', 'Error al autenticar con Restobar', 3000)
        throw error
    }
}

//verify login status
export const verifyLogin = async () => {
    try {
        const url = `${PUBLIC_API_KEY}/verify-login`

        const params = {
            token: localStorage.getItem('token') || ''
        }

        return await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        })
    } catch (error) {
        showToastSwal('error', 'Error al verificar sesión', 3000)
        throw error
    }
}

//
export const isLogin = async () => {
    try {
        const rpt = await verifyLogin()

        if (rpt.status === 401) {
            window.location.href = PUBLIC_URL_LOGIN_OUT_USER
        }
    } catch (error) {
        showToastSwal('error', 'Sesión no válida, redirigiendo...', 3000)
        setTimeout(() => {
            window.location.href = PUBLIC_URL_LOGIN_OUT_USER
        }, 2000)
    }
}

export const getValueToken = (key: string): any => {
    try {
        const token = localStorage.getItem('token')?.split('.')[1] || '';
        if (!token) return false
        const _data = JSON.parse(atob(token))
        if (_data[key]) {
            return _data[key]
        } else {
            return false
        }
    } catch (error) {
        showToastSwal('error', 'Token inválido o expirado', 3000)
        return false
    }
}

// data que envia desde restobar
export const getValueTokenSys = (key: string): any => {
    try {
        const token = localStorage.getItem('sys::tk') || '';
        if (!token) return false
        const _data = JSON.parse(token)
        if (_data[key]) {
            return _data[key]
        } else {
            return false
        }
    } catch (error) {
        showToastSwal('error', 'Datos de sesión inválidos', 3000)
        return false
    }
}
