import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Doc = { id: string; title: string; category: string; text: string };
const docs: Doc[] = [
  { id: 'enrollment', title: 'Proceso de matrícula', category: 'Admisiones', text: 'Para iniciar la matrícula, completa el formulario de inscripción y espera la confirmación del equipo académico. La academia contacta al estudiante por correo electrónico para confirmar el nivel y el horario. No se confirma un cupo hasta recibir respuesta de la academia.' },
  { id: 'schedules', title: 'Horarios y modalidades', category: 'Clases', text: 'Los horarios disponibles dependen del grupo y del nivel. Las clases pueden ser presenciales o virtuales según la oferta vigente. Escribe al equipo académico para consultar disponibilidad antes de inscribirte.' },
  { id: 'placement', title: 'Prueba de nivel', category: 'Evaluación', text: 'El equipo académico puede recomendar una prueba de nivel antes de asignar un grupo. La prueba permite orientar al estudiante hacia el curso más adecuado; la academia confirma el resultado y el grupo por correo.' },
  { id: 'contact', title: 'Contacto', category: 'Atención', text: 'Para solicitar información, deja tu nombre, correo y el motivo de consulta en el formulario de contacto. El formulario prepara un mensaje para el equipo de la academia; un integrante responde personalmente.' }
];
const app = express();
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), '../public')));

function tokens(value: string): string[] { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z0-9]{2,}/g) ?? []; }
function retrieve(question: string) {
  const q = new Set(tokens(question));
  return docs.map(d => ({ ...d, score: tokens(d.title + ' ' + d.category + ' ' + d.text).reduce((n, word) => n + Number(q.has(word)), 0) }))
    .filter(d => d.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}
async function answerWithModel(question: string, sources: Doc[]): Promise<string | null> {
  const base = process.env.LLM_BASE_URL;
  if (!base || !process.env.LLM_API_KEY || !process.env.LLM_MODEL) return null;
  const response = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LLM_API_KEY}` },
    body: JSON.stringify({ model: process.env.LLM_MODEL, temperature: 0.1, messages: [
      { role: 'system', content: 'Responde en español usando únicamente las fuentes incluidas. Si falta información, dilo con claridad. No inventes fechas, precios, cupos o políticas. Al final, indica los IDs de las fuentes consultadas.' },
      { role: 'user', content: `FUENTES:\n${sources.map(s => `[${s.id}] ${s.title}: ${s.text}`).join('\n')}\n\nPREGUNTA: ${question}` }
    ] })
  });
  if (!response.ok) throw new Error(`El proveedor de IA respondió ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: process.env.LLM_BASE_URL ? 'llm-configured' : 'demo' }));
app.get('/api/documents', (_req, res) => res.json({ documents: docs.map(({ id, title, category }) => ({ id, title, category })) }));
app.post('/api/chat', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > 500) return res.status(400).json({ error: 'Escribe una pregunta de hasta 500 caracteres.' });
  const matches = retrieve(question);
  if (!matches.length || matches[0].score < 2) return res.json({ answer: 'No encuentro evidencia suficiente en los documentos disponibles. Contacta al equipo académico para confirmar.', sources: [], mode: 'abstain' });
  try {
    const answer = await answerWithModel(question, matches);
    const groundedAnswer = answer ?? `${matches[0].text} (Respuesta de demostración basada en coincidencia de términos; configura un modelo para generar una respuesta conversacional.)`;
    res.json({ answer: groundedAnswer, sources: matches.map(({ id, title, category, score }) => ({ id, title, category, score })), mode: answer ? 'llm' : 'demo' });
  } catch (error) { res.status(502).json({ error: error instanceof Error ? error.message : 'Error al consultar el proveedor.' }); }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Knowledge Agent available at http://localhost:${port}`));
