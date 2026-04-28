import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./lib/logger.js";
import connectWhatsApp, { connectionState } from "./lib/whatsapp.js";
import { automationController } from "./controllers/automation.controller.js";
import { initScheduler } from "./lib/scheduler.js";

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
