import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "baileys";
import logger from "./logger.js";
import { userPrismaAuthState } from "./prisma-auth.js";
import prisma from "./prisma.js";

const sessions = new Map();

export async function connectWhatsApp(userId) {
  if (
    sessions.has(userId) &&
    (sessions.get(userId).status === "connected" ||
      sessions.get(userId).status === "connecting")
  ) {
    return sessions.get(userId).sock;
  }

  logger.info(`Iniciando conexión de WhatsApp para usuario ${userId}`);

  // Almacén manual de contactos para este usuario
  const contactStore = {};

  sessions.set(userId, {
    status: "connecting",
    qr: null,
    sock: null,
    contacts: contactStore,
  });

  logger.info(`Cargando sesión previa para usuario ${userId}`);
  const { state, saveCreds } = await userPrismaAuthState(userId);

  logger.info(`Inicializando socket para usuario ${userId}`);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(
    `Usando versión de WhatsApp: ${version.join(".")} (Latest: ${isLatest})`,
  );

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.0463.0"],
  });

  const userSession = sessions.get(userId);
  userSession.sock = sock;

  // Escuchar eventos de contactos para llenar nuestro almacén manual
  sock.ev.on("contacts.upsert", (newContacts) => {
    for (const contact of newContacts) {
      userSession.contacts[contact.id] = {
        ...(userSession.contacts[contact.id] || {}),
        ...contact,
      };
    }
  });

  sock.ev.on("contacts.update", (updates) => {
    for (const update of updates) {
      if (userSession.contacts[update.id]) {
        Object.assign(userSession.contacts[update.id], update);
      }
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    const userSession = sessions.get(userId);
    if (!userSession) return;

    logger.info(`Update de conexión para usuario ${userId}: ${JSON.stringify({ connection, hasQr: !!qr })}`);

    if (qr) {
      userSession.qr = qr;
      userSession.status = "qr_ready";
      logger.info(`Nuevo QR generado para usuario ${userId}`);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      userSession.status = "disconnected";
      userSession.qr = null;

      logger.error(
        `Conexión cerrada para usuario ${userId}. Status: ${statusCode}. Reconectando: ${shouldReconnect}`,
      );

      if (shouldReconnect) {
        connectWhatsApp(userId);
      } else {
        sessions.delete(userId);
      }
    } else if (connection === "open") {
      userSession.status = "connected";
      userSession.qr = null;
      logger.info(`¡WhatsApp conectado exitosamente para usuario ${userId}!`);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const messageText =
        msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      if (!messageText) continue;

      const remoteJid = msg.key.remoteJid;
      const incomingText = messageText.toLowerCase().trim();

      try {
        const userTriggers = await prisma.trigger.findMany({
          where: {
            userId: userId,
            status: "active",
          },
        });

        const matchedTrigger = userTriggers.find((t) => {
          const keyword = t.keyword.toLowerCase();
          return t.matchMode === "exact"
            ? incomingText === keyword
            : incomingText.includes(keyword);
        });

        if (matchedTrigger) {
          logger.info(
            `Auto-respondiendo a ${remoteJid} para usuario ${userId}`,
          );
          await sock.sendMessage(remoteJid, {
            text: matchedTrigger.responseMessage,
          });
        }
      } catch (error) {
        logger.error(`Error en auto-respondedor de usuario ${userId}:`, error);
      }
    }
  });

  return sock;
}

export const getSessionStatus = (userId) => {
  const session = sessions.get(userId);
  if (!session) return { status: "disconnected", qr: null };

  return {
    status: session.status,
    qr: session.qr,
  };
};

export const getSessionSock = (userId) => {
  const session = sessions.get(userId);
  return session?.status === "connected" ? session.sock : null;
};

export const getSessionStore = (userId) => {
  const session = sessions.get(userId);
  return session?.contacts || null;
};

export const logoutSession = async (userId) => {
  const session = sessions.get(userId);

  try {
    if (session?.sock) {
      await session.sock.logout().catch(() => {});
    }
  } catch (error) {
    logger.error(`Error al cerrar socket para usuario ${userId}:`, error);
  } finally {
    sessions.delete(userId);
    await prisma.whatsAppSession.deleteMany({
      where: { userId },
    });
    logger.info(`Sesión de WhatsApp eliminada para usuario ${userId}`);
  }
};

export const loadAllSessions = async () => {
  try {
    const allSessions = await prisma.whatsAppSession.findMany({
      select: { userId: true },
    });

    logger.info(`Cargando ${allSessions.length} sesiones de WhatsApp...`);

    for (const session of allSessions) {
      connectWhatsApp(session.userId).catch((err) => {
        logger.error(
          `Error reconectando sesión de usuario ${session.userId}:`,
          err,
        );
      });
    }
  } catch (error) {
    logger.error("Error al cargar sesiones iniciales:", error);
  }
};

export default connectWhatsApp;
