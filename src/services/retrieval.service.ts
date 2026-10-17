import { knowledgeBase } from '../data/knowledge-base.js';
import type { KnowledgeDocument, RetrievedDocument } from '../types.js';

const stopWords = new Set('a al algo algunas algunos ante antes como con contra cual cuando de del desde donde durante e el ella en entre era es esa ese esta este fue ha hacia hasta la las le les lo los más mi mis no o para pero por porque que se sin sobre su sus te tiene tu un una unas uno unos y ya'.split(' '));
export function tokenize(text: string): string[] {
  const words = text.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z0-9]{2,}/g) ?? [];
  return words.map(word => word.length > 5 && word.endsWith('es') ? word.slice(0, -2) : word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word).filter(word => !stopWords.has(word));
}
const synonyms: Record<string, string[]> = {
  costo: ['pago', 'tarifa'], cuesta: ['costo', 'pago', 'tarifa'], valor: ['costo', 'pago', 'tarifa'], precio: ['costo', 'pago', 'tarifa'],
  matricularme: ['matricula'], matricular: ['matricula'], inscripcion: ['matricula'], inscrib: ['matricula', 'inscripcion'],
  virtual: ['modalidad'], presencial: ['modalidad'], modalidad: ['clase'],
  escribo: ['contacto'], escribir: ['contacto'], comunicacion: ['contacto'], solicitar: ['solicitud'], certificado: ['certificado'],
  nivel: ['evaluacion', 'prueba'], saben: ['nivel'], tengo: ['nivel']
};
function queryAliases(term: string): string[] {
  let normalized = term.replace(/(?:me|te|se|lo|la|los|las|nos)$/, '');
  if (normalized !== term && /(?:ar|er|ir)$/.test(normalized)) normalized = normalized.slice(0, -2);
  const roots = [term, normalized];
  if (normalized.endsWith('ar') || normalized.endsWith('er') || normalized.endsWith('ir')) roots.push(normalized.slice(0, -2));
  return [...new Set(roots.flatMap(root => [root, ...(synonyms[root] ?? [])]))];
}
function termFrequency(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  for (const [token, count] of counts) counts.set(token, count / Math.max(tokens.length, 1));
  return counts;
}
function scoreDocuments(query: string, documents: KnowledgeDocument[]): RetrievedDocument[] {
  const queryGroups = [...new Set(tokenize(query))].map(term => queryAliases(term));
  if (!queryGroups.length) return [];
  const perDoc = documents.map(document => ({ document, terms: termFrequency(tokenize(`${document.title} ${document.category} ${document.text}`)) }));
  return perDoc.map(({ document, terms }) => {
    let score = 0;
    let matchedTerms = 0;
    for (const aliases of queryGroups) {
      let bestMatch = 0;
      for (const term of aliases) {
        const documentFrequency = perDoc.filter(item => item.terms.has(term)).length;
        if (!documentFrequency) continue;
        const idf = Math.log(1 + (documents.length - documentFrequency + 0.5) / (documentFrequency + 0.5));
        const tf = terms.get(term) ?? 0;
        let contribution = idf * (tf * 2.2) / (tf + 1.2);
        if (tokenize(`${document.title} ${document.category}`).includes(term)) contribution += idf * 0.4;
        bestMatch = Math.max(bestMatch, contribution);
      }
      if (bestMatch > 0) matchedTerms += 1;
      score += bestMatch;
    }
    const normalized = score / Math.max(queryGroups.length, 1);
    const coverage = matchedTerms / queryGroups.length;
    return { ...document, score: Number(normalized.toFixed(3)), coverage: Number(coverage.toFixed(2)), excerpt: document.text };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}
export function retrieveDocuments(query: string): RetrievedDocument[] { return scoreDocuments(query, knowledgeBase); }
export function listDocuments() { return knowledgeBase.map(({ id, title, category, updatedAt }) => ({ id, title, category, updatedAt })); }
