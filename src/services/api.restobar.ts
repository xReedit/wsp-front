import { getData } from "./httpClient.services"

const EVENTO = 'chat-bot'


export const getCountPedidosBot = async (infoSede: any) => {
    const rpt = await getData(EVENTO, `count-pedidos-bot/${infoSede.idsede_restobar}`)    
}