import { BufferJSON, initAuthCreds, proto } from "baileys"; // Añadido proto
import prisma from "./db.js";

export const userPrismaAuthState = async (userId) => {
  // 1. Buscamos la sesión en la DB
  const session = await prisma.whatsAppSession.findUnique({
    where: { userId },
  });

  // 2. Inicializamos con valores por defecto seguros
  let authData = {
    creds: initAuthCreds(),
    keys: {},
  };

  // 3. Intentamos cargar los datos si existen
  if (session && session.sessionData) {
    try {
      const sessionString = Buffer.from(session.sessionData).toString("utf-8");
      const parsed = JSON.parse(sessionString, BufferJSON.reviver);
      // Validamos que lo parseado tenga la estructura correcta
      if (parsed && parsed.creds) {
        authData = parsed;
      }
    } catch (e) {
      console.error("Error al recuperar sesión de la DB:", e);
    }
  }

  return {
    state: {
      creds: authData.creds,
      keys: {
        get: (type, ids) => {
          const keyData = {};
          for (const id of ids) {
            let value = authData.keys[type]?.[id];
            if (value) {
              if (type === "app-state-sync-key") {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              keyData[id] = value;
            }
          }
          return keyData;
        },
        set: (data) => {
          for (const type in data) {
            authData.keys[type] = {
              ...authData.keys[type],
              ...data[type],
            };
          }
        },
      },
    },
    saveCreds: async () => {
      const sessionString = JSON.stringify(authData, BufferJSON.replacer);
      const sessionData = Buffer.from(sessionString, "utf-8");

      await prisma.whatsAppSession.upsert({
        where: { userId },
        update: { sessionData, updatedAt: new Date() },
        create: { userId, sessionData },
      });
    },
  };
};
