import { getData } from "./httpClient.services"

const EVENTO = 'chat-bot'


export const getCountPedidosBot = async (infoSede: any) => {
    return await getData('', `count-pedidos-bot/${infoSede.idsede_restobar}`)    
}