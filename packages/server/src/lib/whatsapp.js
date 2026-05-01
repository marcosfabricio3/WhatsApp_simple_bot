import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "baileys";
import qrcode from "qrcode-terminal";
import logger from "./logger.js";
import { userPrismaAuthState } from "./prisma-auth.js";
import prisma from "./prisma.js";

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

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const messageText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.buttonsResponseMessage?.selectedButtonId;

      if (!messageText) continue;

      const remoteJid = msg.key.remoteJid;
      const incomingText = messageText.toLowerCase().trim();

      try {
        const allTriggers = await prisma.trigger.findMany({
          where: { status: "active" },
        });

        const matchedTrigger = allTriggers.find((t) => {
          const keyword = t.keyword.toLowerCase();
          return t.matchMode === "exact"
            ? incomingText === keyword
            : incomingText.includes(keyword);
        });

        if (matchedTrigger) {
          logger.info(
            `Auto-respondiedo a ${remoteJid} (Regla: ${matchedTrigger.keyword})`,
          );

          await sock.sendMessage(remoteJid, {
            text: matchedTrigger.responseMessage,
          });
        }
      } catch (error) {
        logger.error("Error en el auto-respondedor:", error);
      }
    }
  });

  return sock;
}

export default connectWhatsApp;
