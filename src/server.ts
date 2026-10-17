import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { apiRouter } from './routes/api.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const publicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public');
app.disable('x-powered-by');
app.use(express.json({ limit: '12kb' }));
app.use('/api', apiRouter);
app.use(express.static(publicDirectory, { etag: true, maxAge: '1h' }));
app.use(errorHandler);
app.listen(config.port, () => console.log(`Academia Knowledge Agent listening on http://localhost:${config.port}`));
