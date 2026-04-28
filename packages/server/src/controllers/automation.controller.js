import logger from "../lib/logger.js";
import prisma from "../lib/prisma.js";

export const automationController = {
  async create(req, res) {
    try {
      const {
        name,
        messageContent,
        recipients,
        scheduleType,
        scheduleValue,
        userId,
      } = req.body;

      if (
        !name ||
        !messageContent ||
        !recipients ||
        !scheduleType ||
        !scheduleValue ||
        !userId
      ) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const automation = await prisma.automation.create({
        data: {
          name,
          messageContent,
          recipients: JSON.stringify(recipients),
          scheduleType,
          scheduleValue,
          userId: userId || 1,
        },
      });

      logger.info(`Automatizacion creada: ${name}`);
      res.status(201).json(automation);
    } catch (error) {
      logger.error("Error al crear automatizacion:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

  async list(req, res) {
    try {
      const userId = parseInt(req.query.userId) || 1;
      const automations = await prisma.automation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      const formatted = automations.map((a) => ({
        ...a,
        recipients: JSON.parse(a.recipients),
      }));

      res.json(formatted);
    } catch (error) {
      logger.error("Error al listar automatizaciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await prisma.automation.delete({
        where: { id: parseInt(id) },
      });
      res.json({ message: "Automatizacion eliminada" });
    } catch (error) {
      logger.error("Error al eliminar automatizacion:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await prisma.automation.update({
        where: { id: parseInt(id) },
        data: { status },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getLogs(req, res) {
    try {
      const { automationId } = req.query;
      const logs = await prisma.executionLog.findMany({
        where: automationId ? { automationId: parseInt(automationId) } : {},
        orderBy: { sentAt: "desc" },
        take: 50,
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
