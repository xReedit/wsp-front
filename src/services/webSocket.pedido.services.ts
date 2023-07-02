// import WebSocket from 'websocket';
import WebSocket from 'ws';

export class WebSocketIOClient {
    private url: string;
    private connection: WebSocket | null;

    constructor(url: string, payload: any) {
        this.url = url;
        this.connection = null;

        const headers = { 'query': JSON.stringify(payload) };
        this.connection = new WebSocket(this.url, { headers });

        this.connection.on('open', () => {
            console.log('Conexión establecida con el servidor Socket.IO');
        });

        this.connection.on('message', (message: WebSocket.Data) => {
            if (typeof message === 'string') {
                const data = JSON.parse(message);
                console.log('Datos recibidos del servidor:', data);
            }
        });

        this.connection.on('close', () => {
            console.log('Conexión cerrada');
        });

        this.connection.on('error', (error: Error) => {
            console.error('Error al conectar:', error);
        });
    }

    send(data: any) {
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(data));
        } else {
            console.error('No se puede enviar el mensaje. La conexión no está disponible.');
        }
    }

    emit(eventName: string, data: any) {
        const eventData = {
            event: eventName,
            data
        };

        this.send(eventData);
    }


    close() {
        if (this.connection) {
            this.connection.close();
        }
    }
}