import { io, Socket } from "socket.io-client";
import { PUBLIC_SOCKET_SERVER_URL } from "$env/static/public";
import { getValueTokenSys } from "./login.services";

type EventCallback = (...args: any[]) => void;

export class SocketClient {
    private static instance: SocketClient | null = null;
    private socket: Socket;
    private eventListeners: Map<string, EventCallback[]> = new Map<string, EventCallback[]>();

    constructor(url: string, query = {}) {        
        if (Object.keys(query).length === 0) {
            const sede = getValueTokenSys('sede');
            const org = getValueTokenSys('org');
            const idorg = org?.idorg_restobar || '';
            const idsede = sede?.idsede_restobar || '';
            query = {
                idorg,
                idsede,
                roomId: `${idorg}${idsede}`,
                isFrontMensajeria: '1',
                room: 'mensajeria',
            }
        }

        this.socket = io(url, {
            query
        });

        this.socket.on("connect", this.onConnect);
        this.socket.on("disconnect", this.onDisconnect);
    }

    public static getInstance(): SocketClient {        
        const socketServerUrl = PUBLIC_SOCKET_SERVER_URL
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient(socketServerUrl);
        }
        return SocketClient.instance;
    }

    private onConnect = () => {
    };

    private onDisconnect = () => {
    };

    public sendMessage(message: string, payload: any) {
        this.socket.emit(message, payload);
    }

    public disconnect() {
        this.socket.disconnect();
        SocketClient.instance = null;
    }

    // function verifica si esta conectado
    public isConnected(): boolean {
        return this.socket.connected;
    }

    // conecta al socket
    public connect() {
        this.socket.connect();
    }

    public on(event: string, callback: EventCallback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
        this.socket.on(event, callback);
    }

    public off(event: string, callback: EventCallback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
                this.socket.off(event, callback);
            }
        }
    }
}
