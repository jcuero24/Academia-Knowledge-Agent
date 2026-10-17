import { Router } from 'express';
import { config, hasLlmConfig } from '../config.js';
import { answerQuestion } from '../services/answer.service.js';
import { listDocuments, retrieveDocuments } from '../services/retrieval.service.js';

export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.json({ status: 'ok', mode: hasLlmConfig ? 'llm' : 'demo', knowledgeDocuments: listDocuments().length }));
apiRouter.get('/documents', (_req, res) => res.json({ documents: listDocuments() }));
apiRouter.post('/retrieve', (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > config.maxQuestionLength) return res.status(400).json({ error: `Escribe una pregunta de hasta ${config.maxQuestionLength} caracteres.` });
  res.json({ results: retrieveDocuments(question) });
});
apiRouter.post('/chat', async (req, res, next) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > config.maxQuestionLength) return res.status(400).json({ error: `Escribe una pregunta de hasta ${config.maxQuestionLength} caracteres.` });
  try { res.json(await answerQuestion(question)); } catch (error) { next(error); }
});
