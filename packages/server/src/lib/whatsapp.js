import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from 'baileys';
import qrcode from 'qrcode-terminal';

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
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = 
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Conexión cerrada. Reconectando:', shouldReconnect);
                if(shouldReconnect) {
                    connectWhatsApp();
                }
        }else if (connection === 'open') {
             console.log('¡Conexión de WhatsApp abierta con éxito!');
        }
    });

    sock.ev.on('creds.update', saveCreds)

    return sock;
}

export default connectWhatsApp;
