import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "baileys";
import qrcode from "qrcode-terminal";
import logger from "./logger.js";
import prisma from "./db.js";
import { userPrismaAuthState } from "./prisma-auth.js";

let sock = null;

export const connectionState = {
  status: "connecting",
  qr: null,
  lastUpdate: new Date(),
};

export const sendMessage = async (jid, text) => {
  if (!sock || connectionState.status !== "connected") {
    throw new Error(
      "WhatsApp no esta conectado. no se puede enviar el mensaje.",
    );
  }
  return await sock.sendMessage(jid, { text });
};

async function connectWhatsApp() {
  const { version } = await fetchLatestBaileysVersion();
  logger.info(`Usando whatsApp v${version.join(".")}`);

  const defaultUser = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      password: "password_segura_temporal",
    },
  });

  const { state, saveCreds } = await userPrismaAuthState(defaultUser.id);

  sock = makeWASocket({
    auth: state,
    version: version,
    printQRInTerminal: false,
    browser: ["Chrome", "Windows", "1.0.0"],
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionState.qr = qr;
      connectionState.status = "qr_ready";
      qrcode.generate(qr, { small: true });
      logger.info("Nuevo codigo QR generado");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      connectionState.status = "disconnected";
      logger.error("Conexion cerrada. Reconectando:", shouldReconnect);
      if (shouldReconnect) {
        connectWhatsApp();
      }
    } else if (connection === "open") {
      connectionState.status = "connected";
      connectionState.qr = null;
      logger.info("coneccion de WhatsApp abierta con exito!");
    }
    connectionState.lastUpdate = new Date();
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

export default connectWhatsApp;
