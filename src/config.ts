import 'dotenv/config';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un puerto válido.');
const retrievalMinScore = Number(process.env.RETRIEVAL_MIN_SCORE ?? 0.08);
if (!Number.isFinite(retrievalMinScore) || retrievalMinScore < 0) throw new Error('RETRIEVAL_MIN_SCORE debe ser un número no negativo.');
const retrievalMinCoverage = Number(process.env.RETRIEVAL_MIN_COVERAGE ?? 0.35);
if (!Number.isFinite(retrievalMinCoverage) || retrievalMinCoverage < 0 || retrievalMinCoverage > 1) throw new Error('RETRIEVAL_MIN_COVERAGE debe estar entre 0 y 1.');
const llmValues = [process.env.LLM_BASE_URL, process.env.LLM_API_KEY, process.env.LLM_MODEL];
if (llmValues.some(Boolean) && llmValues.some(value => !value?.trim())) throw new Error('Configura LLM_BASE_URL, LLM_API_KEY y LLM_MODEL juntos, o deja los tres vacíos.');

export const config = {
  port,
  llmBaseUrl: process.env.LLM_BASE_URL?.trim().replace(/\/$/, '') ?? '',
  llmApiKey: process.env.LLM_API_KEY?.trim() ?? '',
  llmModel: process.env.LLM_MODEL?.trim() ?? '',
  retrievalMinScore,
  retrievalMinCoverage,
  maxQuestionLength: 500
};
export const hasLlmConfig = Boolean(config.llmBaseUrl && config.llmApiKey && config.llmModel);
