import { getData, postDataJSON } from "./httpClient.services"

const EVENTO = 'chat-bot'


export const getCountPedidosBot = async (infoSede: any) => {
    return await getData('', `count-pedidos-bot/${infoSede.idsede_restobar}`)    
}

export const bloquearNumeroTelefono = async (idsede: any, telefono: string, info: any) => {
    const dataSend = {
        idsede,
        telefono,
        info
    }
    return await postDataJSON('', 'bloquear-telefono', dataSend)
}

export const desbloquearNumeroTelefono = async (idsede: any, telefono: string) => {
    const dataSend = {
        idsede,
        telefono,
    }
    return await postDataJSON('', 'desbloquear-telefono', dataSend)
}

export const getListNumeroTelefonoBloqueado = async (idsede: any) => {
    return await getData('', `list-telefonos-bloqueados/${idsede}`)
}