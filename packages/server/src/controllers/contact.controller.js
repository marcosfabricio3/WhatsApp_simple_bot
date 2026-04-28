import prisma from "../lib/prisma.js";
import { importService } from "../services/import.service.js";

export const contactController = {
  async create(req, res) {
    try {
      const { name, jid } = req.body;

      let finalJid = jid;

      if (!jid.includes("@s.whatsapp.net") && !jid.includes("@g.us")) {
        finalJid = `${jid}@s.whatsapp.net`;
      }

      const contact = await prisma.contact.create({
        data: {
          name,
          jid: finalJid,
          userId: 1,
        },
      });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const contacts = await prisma.contact.findMany({
        where: { userId: 1 },
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
        return res
          .status(400)
          .json({ error: "No se ha subido ningun archivo" });
      }
      const summary = await importService.importContactsFromCsv(req.file.path);

      res.json({
        message: "Importacion masiva completada",
        summary,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
