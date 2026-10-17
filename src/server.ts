import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { apiRouter } from './routes/api.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const publicDirectory = process.env.VERCEL === '1'
  ? path.join(process.cwd(), 'public')
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '../public');
app.disable('x-powered-by');
app.use(express.json({ limit: '12kb' }));
app.use('/api', apiRouter);
app.use(express.static(publicDirectory, { etag: true, maxAge: '1h' }));
app.use(errorHandler);
// Vercel discovers this default export as the Express function. Keep a local
// listener for the documented npm start workflow.
export default app;
if (process.env.VERCEL !== '1') {
  app.listen(config.port, () => console.log(`Academia Knowledge Agent listening on http://localhost:${config.port}`));
}
