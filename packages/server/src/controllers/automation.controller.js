import prisma from "../lib/prisma.js";
import { scheduleJob, stopJob } from "../lib/scheduler.js";
import logger from "../lib/logger.js";

export const automationController = {
  create: async (req, res) => {
    try {
      const { name, messageContent, recipients, scheduleType, scheduleValue } =
        req.body;
      const userId = req.user.userId;

      const automation = await prisma.automation.create({
        data: {
          name,
          messageContent,
          recipients,
          scheduleType,
          scheduleValue,
          userId,
        },
      });

      scheduleJob(automation);

      res.status(201).json(automation);
    } catch (error) {
      logger.error("Error al crear automatización:", error);
      res.status(500).json({ error: "Error al crear automatización" });
    }
  },

  list: async (req, res) => {
    try {
      const automations = await prisma.automation.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" },
      });
      res.json(automations);
    } catch (error) {
      res.status(500).json({ error: "Error al listar automatizaciones" });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      const existing = await prisma.automation.findFirst({
        where: { id: parseInt(id), userId },
      });

      if (!existing) return res.status(404).json({ error: "No encontrada" });

      const updated = await prisma.automation.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      if (status === "active") {
        scheduleJob(updated);
      } else {
        stopJob(updated.id);
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar estado" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const existing = await prisma.automation.findFirst({
        where: { id: parseInt(id), userId },
      });

      if (!existing) return res.status(404).json({ error: "No encontrada" });

      stopJob(parseInt(id));
      await prisma.automation.delete({ where: { id: parseInt(id) } });

      res.json({ message: "Eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar" });
    }
  },

  getLogs: async (req, res) => {
    try {
      const logs = await prisma.executionLog.findMany({
        where: {
          automation: { userId: req.user.userId },
        },
        include: { automation: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener logs" });
    }
  },
};
