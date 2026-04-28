import cron from "node-cron";
import prisma from "./db.js";
import logger from "./logger.js";
import { sendMessage } from "./whatsapp.js";

export const initScheduler = () => {
  logger.info("Motor de tareas (Scheduler) iniciado.");

  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const automations = await prisma.automation.findMany({
        where: { status: "active" },
      });
      for (const auto of automations) {
        let shouldSend = false;

        if (auto.scheduleType === "once") {
          const scheduleDate = new Date(auto.scheduleValue);
          if (scheduleDate <= now) {
            shouldSend = true;
          }
        }
        if (shouldSend) {
          const recipients = JSON.parse(auto.recipients);

          for (const target of recipients) {
            try {
              await sendMessage(target, auto.messageContent);
              await prisma.executionLog.create({
                data: {
                  automationId: auto.id,
                  recipient: target,
                  status: "sent",
                  sentAt: new Date(),
                },
              });
              logger.info(`Mensaje enviado a ${target} para la automatizacion`);
            } catch (err) {
              logger.error(`Error enviando a ${target}:`, err);
              await prisma.executionLog.create({
                data: {
                  automationId: auto.id,
                  recipient: target,
                  status: "failed",
                  errorMessage: err.message,
                },
              });
            }
          }
          if (auto.scheduleType === "once") {
            await prisma.automation.update({
              where: { id: auto.id },
              data: { status: "completed" },
            });
          }
        }
      }
    } catch (error) {
      logger.error("Error en el ciclo del scheduler:", error);
    }
  });
};
