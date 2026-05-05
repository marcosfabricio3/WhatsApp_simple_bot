import cron from "node-cron";
import logger from "./logger.js";
import prisma from "./prisma.js";
import { getSessionSock } from "./whatsapp.js";

const scheduledJobs = new Map();

export const initScheduler = async () => {
  logger.info("Inicializando Scheduler multi-usuario...");
  const automations = await prisma.automation.findMany({
    where: { status: "active" },
  });

  for (const automation of automations) {
    scheduleJob(automation);
  }
};

export const scheduleJob = (automation) => {
  if (scheduledJobs.has(automation.id)) {
    scheduledJobs.get(automation.id).stop();
  }

  const job = cron.schedule(automation.scheduleValue, async () => {
    logger.info(
      `Ejecutando automatización: ${automation.name} para usuario ${automation.userId}`,
    );

    try {
      const sock = getSessionSock(automation.userId);

      if (!sock) {
        throw new Error(
          `WhatsApp no conectado para el usuario ${automation.userId}`,
        );
      }

      const recipients = automation.recipients.split(",").map((r) => r.trim());

      for (const recipient of recipients) {
        try {
          const jid = recipient.includes("@")
            ? recipient
            : `${recipient}@s.whatsapp.net`;

          await sock.sendMessage(jid, { text: automation.messageContent });

          await prisma.executionLog.create({
            data: {
              automationId: automation.id,
              recipient,
              status: "success",
              sentAt: new Date(),
            },
          });
        } catch (error) {
          logger.error(`Error enviando a ${recipient}:`, error);
          await prisma.executionLog.create({
            data: {
              automationId: automation.id,
              recipient,
              status: "failed",
              errorMessage: error.message,
            },
          });
        }
      }
    } catch (error) {
      logger.error(`Error crítico en job ${automation.id}:`, error);
    }
  });

  scheduledJobs.set(automation.id, job);
};

export const stopJob = (automationId) => {
  if (scheduledJobs.has(automationId)) {
    scheduledJobs.get(automationId).stop();
    scheduledJobs.delete(automationId);
  }
};
