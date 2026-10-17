import type { ErrorRequestHandler } from 'express';
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : 'Error inesperado.';
  console.error('[api-error]', message);
  res.status(502).json({ error: 'No fue posible responder en este momento. Inténtalo más tarde.' });
};
