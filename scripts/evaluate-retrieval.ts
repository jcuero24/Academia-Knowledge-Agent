import { config } from '../src/config.js';
import { retrieveDocuments } from '../src/services/retrieval.service.js';

const cases = [
  { query: '¿Qué pasos debo seguir para iniciar la matrícula?', expected: 'enrollment' },
  { query: '¿Qué horarios y clases virtuales están disponibles?', expected: 'schedules' },
  { query: '¿Cómo saben qué nivel tengo?', expected: 'placement' },
  { query: '¿A quién escribo para pedir información?', expected: 'contact' },
  { query: '¿Dónde consulto costos y formas de pago?', expected: 'payments' },
  { query: '¿Cómo solicito certificados de estudio?', expected: 'certificates' }
];
let hitAt1 = 0;
let hitAt3 = 0;
let passed = true;
for (const item of cases) {
  const result = retrieveDocuments(item.query);
  const rank = result.findIndex(document => document.id === item.expected);
  if (rank === 0) hitAt1 += 1;
  if (rank >= 0 && rank < 3) hitAt3 += 1;
  if (rank !== 0) passed = false;
  console.log(`${rank >= 0 ? `rank ${rank + 1}` : 'miss'} | expected=${item.expected} | ${item.query}`);
}
const unknownQuestion = '¿Qué cursos de francés ofrecen?';
const unknownMatches = retrieveDocuments(unknownQuestion);
const shouldAbstain = !unknownMatches.length || unknownMatches[0].score < config.retrievalMinScore || unknownMatches[0].coverage < config.retrievalMinCoverage;
if (!shouldAbstain) passed = false;
console.log(`${shouldAbstain ? 'abstain' : 'false positive'} | out-of-domain | ${unknownQuestion}`);
console.log(`\nHit@1: ${hitAt1}/${cases.length} (${(hitAt1 / cases.length * 100).toFixed(1)}%)`);
console.log(`Hit@3: ${hitAt3}/${cases.length} (${(hitAt3 / cases.length * 100).toFixed(1)}%)`);
console.log('Interpretación: conjunto pequeño de demostración, no una medición representativa de producción.');
if (!passed) process.exitCode = 1;
