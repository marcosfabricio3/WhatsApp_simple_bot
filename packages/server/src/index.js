import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import logger from "./lib/logger.js";
import {
  getSessionStatus,
  connectWhatsApp,
  logoutSession,
  loadAllSessions,
} from "./lib/whatsapp.js";
import { automationController } from "./controllers/automation.controller.js";
import { contactController } from "./controllers/contact.controller.js";
import { initScheduler } from "./lib/scheduler.js";
import { templateController } from "./controllers/template.controller.js";
import { triggerController } from "./controllers/trigger.controller.js";
import { authController } from "./controllers/auth.controller.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

setInterval(() => {}, 1000000);

process.on("uncaughtException", (err) => {
  logger.error("CAPTURED UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("CAPTURED UNHANDLED REJECTION:", reason);
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, // Límite de 100 peticiones por IP en cada ventana de tiempo
  message: { error: "Demasiadas peticiones desde esta IP, por favor intente más tarde." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10, // Límite de 10 peticiones de autenticación por IP
  message: { error: "Demasiados intentos desde esta IP, por favor intente más tarde." }
});

app.use(cors());
app.use(express.json());

// Aplicar rate limiters
app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

app.post("/api/connection/init", authMiddleware, async (req, res) => {
  try {
    connectWhatsApp(req.user.userId).catch((err) => {
      logger.error(
        `Error al iniciar WhatsApp para user ${req.user.userId}:`,
        err,
      );
    });

    res.json({ message: "Iniciando proceso de conexión..." });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la solicitud de inicio" });
  }
});

app.get("/api/connection/status", authMiddleware, (req, res) => {
  const status = getSessionStatus(req.user.userId);
  res.json(status);
});

app.post("/api/connection/logout", authMiddleware, async (req, res) => {
  try {
    await logoutSession(req.user.userId);
    res.json({ message: "Sesión de WhatsApp cerrada" });
  } catch (error) {
    res.status(500).json({ error: "Error al cerrar sesión de WhatsApp" });
  }
});

app.post("/api/automations", authMiddleware, automationController.create);
app.get("/api/automations", authMiddleware, automationController.list);
app.delete("/api/automations/:id", authMiddleware, automationController.delete);
app.patch(
  "/api/automations/:id/status",
  authMiddleware,
  automationController.updateStatus,
);
app.get("/api/automations/logs", authMiddleware, automationController.getLogs);

app.post("/api/contacts", authMiddleware, contactController.create);
app.get("/api/contacts", authMiddleware, contactController.list);
app.put("/api/contacts/:id", authMiddleware, contactController.update);
app.delete("/api/contacts/:id", authMiddleware, contactController.delete);

app.post("/api/templates", authMiddleware, templateController.create);
app.get("/api/templates", authMiddleware, templateController.list);
app.put("/api/templates/:id", authMiddleware, templateController.update);
app.delete("/api/templates/:id", authMiddleware, templateController.delete);

app.post("/api/triggers", authMiddleware, triggerController.create);
app.get("/api/triggers", authMiddleware, triggerController.list);
app.delete("/api/triggers/:id", authMiddleware, triggerController.delete);
app.patch(
  "/api/triggers/:id/status",
  authMiddleware,
  triggerController.updateStatus,
);

app.post(
  "/api/contacts/bulk",
  authMiddleware,
  upload.single("file"),
  contactController.bulkImport,
);

app.post(
  "/api/contacts/import-whatsapp",
  authMiddleware,
  contactController.importFromWhatsApp,
);

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);

  initScheduler();

  await loadAllSessions();

  logger.info("Servidor listo. Esperando conexiones de usuarios...");
});

export default app;
