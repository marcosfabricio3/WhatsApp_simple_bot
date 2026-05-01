import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const triggerController = {
  // Listar todos los triggers
  list: async (req, res) => {
    try {
      const triggers = await prisma.trigger.findMany({
        where: { userId: 1 }, // Por ahora hardcoded al usuario 1
      });
      res.json(triggers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear un nuevo trigger
  create: async (req, res) => {
    try {
      const { keyword, matchMode, responseMessage, chatIds } = req.body;
      const newTrigger = await prisma.trigger.create({
        data: {
          userId: 1,
          keyword,
          matchMode: matchMode || "exact",
          responseMessage,
          chatIds: chatIds || "all",
          status: "active",
        },
      });
      res.json(newTrigger);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar un trigger
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.trigger.delete({
        where: { id: parseInt(id) },
      });
      res.json({ message: "Trigger eliminado" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await prisma.trigger.update({
        where: { id: parseInt(id) },
        data: { status },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
