import cron from "node-cron";
import logger from "./logger.js";
import { sendMessage } from "./whatsapp.js";
import prisma from "./prisma.js";

async function processMessage(content, recipientJid, userId) {
  let personalized = content;

  const contact = await prisma.contact.findFirst({
    where: {
      jid: recipientJid,
      userId: userId,
    },
  });

  if (contact && contact.name) {
    personalized = personalized.replace(/{nombre}/g, contact.name);
    personalized = personalized.replace(/{name}/g, contact.name);
  } else {
    personalized = personalized.replace(/{nombre}/g, "amigo/a");
    personalized = personalized.replace(/{name}/g, "amigo/a");
  }
  return personalized;
}

export const initScheduler = () => {
  logger.info("Motor de tareas (Scheduler) iniciado.");

  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();

      const automations = await prisma.automation.findMany({
        where: { status: "active" },
      });

      for (const auto of automations) {
        let shouldSend = false;
        const scheduleDate = new Date(auto.scheduleValue);

        if (auto.scheduleType === "once") {
          // const scheduleDate = new Date(auto.scheduleValue);
          if (scheduleDate <= now) shouldSend = true;
        } else if (auto.scheduleType === "daily") {
          if (
            scheduleDate.getHours() === currentHour &&
            scheduleDate.getMinutes() === currentMinute
          ) {
            shouldSend = true;
          }
        } else if (auto.scheduleType === "weekly") {
          if (
            scheduleDate.getDay() === currentDay &&
            scheduleDate.getHours() === currentHour &&
            scheduleDate.getMinutes() === currentMinute
          ) {
            shouldSend = true;
          }
        }

        if (shouldSend) {
          const alreadySent = await prisma.executionLog.findFirst({
            where: {
              automationId: auto.id,
              sentAt: {
                gte: new Date(new Date(now).setSeconds(0, 0)),
              },
              status: "sent",
            },
          });

          if (alreadySent) continue;

          const recipients = JSON.parse(auto.recipients);

          for (const target of recipients) {
            try {
              const findMessage = await processMessage(
                auto.messageContent,
                target,
                auto.userId,
              );

              await sendMessage(target, findMessage);

              await prisma.executionLog.create({
                data: {
                  automationId: auto.id,
                  recipient: target,
                  status: "sent",
                  sentAt: new Date(),
                },
              });
              logger.info(
                `Mensaje enviado a ${target} [${auto.scheduleType}]: ${auto.name}`,
              );
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
