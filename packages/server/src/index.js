import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./lib/logger.js";
import connectWhatsApp, { connectionState } from "./lib/whatsapp.js";
import { automationController } from "./controllers/automation.controller.js";
import { contactController } from "./controllers/contact.controller.js";
import { initScheduler } from "./lib/scheduler.js";
import { templateController } from "./controllers/template.controller.js";
import { triggerController } from "./controllers/trigger.controller.js";
import { automationController } from "./controllers/automation.controller.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/connection/status", (req, res) => {
  res.json(connectionState);
});

app.post("/api/automations", automationController.create);
app.get("/api/automations", automationController.list);
app.delete("/api/automations/:id", automationController.delete);
app.patch("/api/automations/:id/status", automationController.updateStatus);
app.get("/api/automations/logs", automationController.getLogs);

app.post("/api/contacts", contactController.create);
app.get("/api/contacts", contactController.list);
app.put("/api/contacts/:id", contactController.update);
app.delete("/api/contacts/:id", contactController.delete);

app.post("/api/templates", templateController.create);
app.get("/api/templates", templateController.list);
app.put("/api/templates/:id", templateController.update);
app.delete("/api/templates/:id", templateController.delete);

app.post("/api/triggers", triggerController.create);
app.get("/api/triggers", triggerController.list);
app.delete("/api/triggers/:id", triggerController.delete);
app.patch("/api/triggers/:id/status", triggerController.updateStatus);
app.post("/api/automations", automationController.create);
app.get("/api/automations", automationController.list);
app.delete("/api/automations/:id", automationController.delete);
app.get("/api/automations/logs", automationController.getLogs);

app.post(
  "/api/contacts/bulk",
  upload.single("file"),
  contactController.bulkImport,
);

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);

  initScheduler();

  try {
    await connectWhatsApp();
  } catch (error) {
    logger.error("Error al iniciar WhatsApp:", error);
  }
});

export default app;
