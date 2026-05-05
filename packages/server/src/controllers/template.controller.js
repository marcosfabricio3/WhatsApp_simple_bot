import prisma from "../lib/prisma.js";

export const templateController = {
  async create(req, res) {
    try {
      const { name, content } = req.body;
      const userId = req.user.userId;

      const template = await prisma.template.create({
        data: {
          name,
          content,
          userId,
        },
      });

      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.userId;
      const templates = await prisma.template.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, content } = req.body;
      const userId = req.user.userId;

      const existing = await prisma.template.findFirst({
        where: { id: parseInt(id), userId }
      });

      if (!existing) return res.status(404).json({ error: "Plantilla no encontrada" });

      const updated = await prisma.template.update({
        where: { id: parseInt(id) },
        data: { name, content },
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

      const existing = await prisma.template.findFirst({
        where: { id: parseInt(id), userId }
      });

      if (!existing) return res.status(404).json({ error: "Plantilla no encontrada" });

      await prisma.template.delete({
        where: { id: parseInt(id) },
      });

      res.json({ message: "Plantilla eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
