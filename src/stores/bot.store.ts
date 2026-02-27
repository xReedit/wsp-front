import { writable, get } from 'svelte/store'
import { SocketClient } from '$root/services/socket.services'
import { getCountPedidosBot } from '$root/services/api.restobar'
import { showToastSwal } from '$root/services/mi.swal'
import { getValueTokenSys } from '$root/services/login.services'
import type { SessionState, Conversacion, InfoSede } from '$root/types'

// ==========================================
// Stores reactivos
// ==========================================

export const sessionState = writable<SessionState>({
    value: false,
    scanqr: false,
    message: 'Incia Session escaneando el codigo QR'
})

export const sessionIniciada = writable<boolean>(false)
export const sessionVerify = writable<boolean>(false)
export const iniciandoSession = writable<boolean>(false)
export const countPedidosRealizadosBot = writable<number>(0)
export const newConversation = writable<Partial<Conversacion>>({})
export const respondeSocket = writable<string>('')

// Estado de mensajería
export const mensajeriaInstalada = writable<boolean>(false)
export const mensajeriaConectada = writable<boolean>(false)
export const mensajeriaVerificando = writable<boolean>(true)

// ==========================================
// Gestión del Socket
// ==========================================

let socket: SocketClient | null = null
let verifyTimeout: ReturnType<typeof setTimeout> | null = null
let beepAudio: HTMLAudioElement | null = null

export function initSocketListeners(infoSede: InfoSede, beepSrc: string) {
    socket = SocketClient.getInstance()
    beepAudio = new Audio(beepSrc)

    socket.on('message', (data: string) => {
        respondeSocket.set(data)
    })

    socket.on('image_qr_session', (data: string) => {
        sessionState.update(s => ({ ...s, scanqr: true }))
        const imgElement = document.getElementById("imgQR") as HTMLImageElement
        if (imgElement) imgElement.src = data
    })

    socket.on('session_verify', () => {
        sessionVerify.set(true)
        if (verifyTimeout) clearTimeout(verifyTimeout)
        verifyTimeout = setTimeout(() => {
            sessionVerify.set(false)
        }, 70000)
    })

    socket.on('session_init', (value: boolean) => {
        sessionState.update(s => ({
            ...s,
            value,
            message: value ? 'Session iniciada' : 'Vincule su whatsapp escaneando el codigo QR'
        }))
        sessionIniciada.set(value)
    })

    socket.on('pedidoRealizado', async () => {
        try {
            const rptCountPedidos: any = await getCountPedidosBot(infoSede)
            countPedidosRealizadosBot.set(rptCountPedidos.count)
            if (beepAudio) beepAudio.play()
        } catch (error) {
            showToastSwal('error', 'Error al obtener conteo de pedidos', 3000)
        }
    })

    socket.on('newConversation', (data: Partial<Conversacion>) => {
        newConversation.set(data)
    })

    socket.on('bot-send-message-front-end', (data: any) => {
        const telefono = data.from || data.remoteJid?.replace('@s.whatsapp.net', '') || ''
        if (telefono && !data.isGroup) {
            newConversation.set({
                telefono,
                push_name: data.pushName || telefono,
                request_human_attention: false
            })
        }
    })
}

export function sendInitBot(data: any) {
    if (!socket) return
    iniciandoSession.set(true)
    sessionState.update(s => ({ ...s, scanqr: false }))

    if (!socket.isConnected()) {
        socket.connect()
    }

    setTimeout(() => {
        socket!.sendMessage('init_bot', data)
    }, 1000)
}

export function sendUpdateNumberBlocked(telefono: string, bloqueado: boolean, idorg: string | number, idsede: string | number) {
    if (!socket) return
    socket.sendMessage('bot-update-number-blocked', {
        telefono,
        bloqueado,
        idorg,
        idsede,
        roomId: `${idorg}${idsede}`
    })
}

export function sendUpdateInfoSede(data: any) {
    if (!socket) return
    socket.sendMessage('update-info-sede', data)
    showToastSwal('success', 'Se actualizo correctamente', 3000)
}

export function sendStopBot(nomSession: string) {
    if (!socket) return
    iniciandoSession.set(false)
    socket.sendMessage('stop-chat-bot', nomSession)
    sessionIniciada.set(false)
    sessionVerify.set(false)
    socket.disconnect()
    showToastSwal('success', 'Se detuvo correctamente', 3000)
}

export function getSocketInstance(): SocketClient | null {
    return socket
}

export function pingMensajeria(idorg: string, idsede: string) {
    if (!socket) return
    mensajeriaVerificando.set(true)
    mensajeriaInstalada.set(false)
    mensajeriaConectada.set(false)

    const roomId = `${idorg}${idsede}`

    const onPong = (data: { pingId: string, success: boolean, conectado: boolean, instalado: boolean }) => {
        mensajeriaInstalada.set(data.instalado)
        mensajeriaConectada.set(data.conectado && data.success)
        mensajeriaVerificando.set(false)
        if (pongTimeout) clearTimeout(pongTimeout)
    }

    socket.on('pong-mensajeria', onPong)
    socket.sendMessage('ping-mensajeria', { roomId })

    // Timeout: si no responde en 8s, asumir no instalado
    let pongTimeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        mensajeriaVerificando.set(false)
        socket?.off('pong-mensajeria', onPong)
    }, 8000)
}
