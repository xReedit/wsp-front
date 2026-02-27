import { getData, postDataJSON } from "./httpClient.services"


export const getCountPedidosBot = async (infoSede: { idsede_restobar: string | number }) => {
    return await getData('', `count-pedidos-bot/${infoSede.idsede_restobar}`)    
}

export const bloquearNumeroTelefono = async (idsede: string | number, telefono: string, info: Record<string, any>) => {
    const dataSend = {
        idsede,
        telefono,
        info,
        bloqueado: true,
    }
    return await postDataJSON('', 'bloquear-telefono', dataSend)
}

export const desbloquearNumeroTelefono = async (idsede: string | number, telefono: string) => {
    const dataSend = {
        idsede,
        telefono,
        bloqueado: false,
    }
    return await postDataJSON('', 'desbloquear-telefono', dataSend)
}

export const getListNumeroTelefonoBloqueado = async (idsede: string | number) => {
    return await getData('', `list-telefonos-bloqueados/${idsede}`)
}