import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './lib/logger.js';
import connectWhatsApp, { connectionState } from './lib/whatsapp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/connection/status', (req, res) => {
    res.json(connectionState);
})

app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);

    try {
        await connectWhatsApp();
    } catch (error) {
        logger.error('Error al iniciar WhatsApp:', error);
    }
});

export default app;