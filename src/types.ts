export type KnowledgeDocument = { id: string; title: string; category: string; updatedAt: string; text: string };
export type RetrievedDocument = KnowledgeDocument & { score: number; coverage: number; excerpt: string };
export type AnswerMode = 'demo' | 'llm' | 'abstain';
export type ChatResult = { answer: string; sources: Array<Pick<RetrievedDocument, 'id' | 'title' | 'category' | 'score' | 'coverage' | 'excerpt'>>; mode: AnswerMode; retrievalScore: number };
