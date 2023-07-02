import { io, Socket } from "socket.io-client";
// import { config } from "dotenv";
// import { config } from "./config";
import { PUBLIC_SOCKET_SERVER_URL } from "$env/static/public";

type EventCallback = (...args: any[]) => void;

export class SocketClient {
    private static instance: SocketClient | null = null;
    private socket: Socket;
    private eventListeners: Map<string, EventCallback[]> = new Map<string, EventCallback[]>();

    constructor(url: string, query = {}) {        
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
        console.log("Connected to Socket.IO server");
    };

    private onDisconnect = () => {
        console.log("Disconnected from Socket.IO server");
    };

    public sendMessage(message: string, payload: any) {
        this.socket.emit(message, payload);
    }

    public disconnect() {
        this.socket.disconnect();
        SocketClient.instance = null;
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
