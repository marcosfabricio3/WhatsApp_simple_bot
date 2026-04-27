import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './lib/logger.js';
import prisma from './lib/db.js';

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

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

export default app;