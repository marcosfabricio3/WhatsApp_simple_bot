import prisma from "../lib/prisma.js";

export const triggerController = {
  list: async (req, res) => {
    try {
      const userId = req.user.userId;
      const triggers = await prisma.trigger.findMany({
        where: { userId },
      });
      res.json(triggers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { keyword, matchMode, responseMessage, chatIds } = req.body;
      const userId = req.user.userId;
      const newTrigger = await prisma.trigger.create({
        data: {
          userId,
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

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const existing = await prisma.trigger.findFirst({
        where: { id: parseInt(id), userId },
      });

      if (!existing)
        return res.status(404).json({ error: "Trigger no encontrado" });

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
      const userId = req.user.userId;

      const existing = await prisma.trigger.findFirst({
        where: { id: parseInt(id), userId },
      });

      if (!existing)
        return res.status(404).json({ error: "Trigger no encontrado" });

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
