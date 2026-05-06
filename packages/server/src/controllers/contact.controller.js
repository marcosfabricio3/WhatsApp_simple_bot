import prisma from "../lib/prisma.js";
import { importService } from "../services/import.service.js";
import { getSessionStore, getSessionStatus } from "../lib/whatsapp.js";

export const contactController = {
  async create(req, res) {
    try {
      const { name, jid } = req.body;
      const userId = req.user.userId;

      let finalJid = jid;
      if (!jid.includes("@s.whatsapp.net") && !jid.includes("@g.us")) {
        finalJid = `${jid}@s.whatsapp.net`;
      }

      const contact = await prisma.contact.create({
        data: {
          name,
          jid: finalJid,
          userId,
        },
      });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.userId;
      const contacts = await prisma.contact.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, jid } = req.body;
      const userId = req.user.userId;

      const contact = await prisma.contact.findFirst({
        where: { id: parseInt(id), userId }
      });

      if (!contact) return res.status(404).json({ error: "Contacto no encontrado" });

      const updated = await prisma.contact.update({
        where: { id: parseInt(id) },
        data: { name, jid },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const contact = await prisma.contact.findFirst({
        where: { id: parseInt(id), userId }
      });

      if (!contact) return res.status(404).json({ error: "Contacto no encontrado" });

      await prisma.contact.delete({
        where: { id: parseInt(id) },
      });
      res.json({ message: "Contacto eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async bulkImport(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se ha subido ningun archivo" });
      }
      const userId = req.user.userId;
      const summary = await importService.importContactsFromCsv(req.file.path, userId);

      res.json({
        message: "Importacion masiva completada",
        summary,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async importFromWhatsApp(req, res) {
    try {
      const userId = req.user.userId;
      const status = getSessionStatus(userId);

      if (status.status !== "connected") {
        return res.status(400).json({ error: "WhatsApp no está conectado" });
      }

      const contacts = getSessionStore(userId);
      if (!contacts) {
        return res.status(500).json({ error: "No se pudo acceder al almacén de contactos" });
      }

      const waContacts = Object.values(contacts);
      const summary = { imported: 0, errors: 0 };

      for (const contact of waContacts) {
        const { id: jid, name, notify, verifiedName } = contact;

        // Intentar obtener el nombre más descriptivo
        const finalName = name || verifiedName || notify || jid.split("@")[0];

        try {
          await prisma.contact.upsert({
            where: { jid },
            update: { 
              name: finalName,
              isGroup: jid.endsWith("@g.us")
            },
            create: {
              name: finalName,
              jid,
              userId,
              isGroup: jid.endsWith("@g.us")
            },
          });
          summary.imported++;
        } catch (err) {
          summary.errors++;
        }
      }

      res.json({
        message: "Importación desde WhatsApp completada",
        summary,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
