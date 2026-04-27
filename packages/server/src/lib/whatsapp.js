import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from 'baileys';
import qrcode from 'qrcode-terminal';
import logger from './logger.js';

export const connectionState = {
    status: 'connecting',
    qr: null,
    lastUpdate: new Date()
};

async function connectWhatsApp() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`usando whatsapp v${version.join('.')}, es la ultima?: ${isLatest}`);

    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');


    const sock = makeWASocket({
        auth: state,
        version: version,
        printQRInTerminal: false,
        browser: ['Chrome', 'Windows', '1.0.0'],
        // print: (msg) => console.log(msg)
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            connectionState.qr = qr;
            connectionState.status = 'qr_ready';
            qrcode.generate(qr, { small: true });
            logger.info('Nuevo codigo QR generado');
        }

        if (connection === 'close') {
            const shouldReconnect = 
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                connectionState.status = 'disconnected';
                logger.error('Conexion cerrada. Reconectando:', shouldReconnect);
                if(shouldReconnect) {
                    connectWhatsApp();
                }
        }else if (connection === 'open') {
            connectionState.status = 'connected';
            connectionState.qr = null;
            logger.info('coneccion de WhatsApp abierta con exito!');
        }
        connectionState.lastUpdate = new Date();
    });

    sock.ev.on('creds.update', saveCreds)

    return sock;
}

export default connectWhatsApp;
