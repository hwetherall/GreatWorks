export type KnowledgeLevel = "noob" | "casual" | "enthusiast" | "scholar";

export const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  "noob",
  "casual",
  "enthusiast",
  "scholar",
];

export const KNOWLEDGE_LEVEL_LABELS: Record<KnowledgeLevel, string> = {
  noob: "Complete Noob",
  casual: "Casual Reader",
  enthusiast: "Literature Enthusiast",
  scholar: "Experienced Scholar",
};

export const KNOWLEDGE_LEVEL_SHORT: Record<KnowledgeLevel, string> = {
  noob: "Noob",
  casual: "Casual",
  enthusiast: "Enthusiast",
  scholar: "Scholar",
};

export const KNOWLEDGE_LEVEL_DESCRIPTIONS: Record<KnowledgeLevel, string> = {
  noob: "No prior knowledge assumed. We explain everything from scratch.",
  casual: "Some general education assumed. Focus on what's surprising.",
  enthusiast:
    "Familiar with English literature. References other works freely.",
  scholar:
    "Deep canon familiarity. Contested readings, sources, theological debates.",
};

export function getSystemPrompt(level: KnowledgeLevel): string {
  const label = KNOWLEDGE_LEVEL_LABELS[level];
  return `You are a brilliant literary companion helping a reader engage deeply with Paradise Lost by John Milton (1674). Your role is not to summarise or spoil — it is to enrich. You restore context that Milton's original 1667 audience already possessed: historical, theological, classical, and biographical. The reader's knowledge level is: ${label}. Calibrate everything to this level.`;
}

export function getAnnotationPrompt(
  passage: string,
  lineRange: string,
  level: KnowledgeLevel
): string {
  const systemPrompt = getSystemPrompt(level);
  return `${systemPrompt}

The reader has selected the following passage from Book I (lines ${lineRange}):

"${passage}"

Enrich this passage. Lead with the most surprising or non-obvious insight. Answer: what would a 1667 reader have understood here that a modern reader might miss? Be specific to this passage — no generic responses. Sound like an intelligent person, not an encyclopedia. Keep it to 150-250 words.`;
}

export function getChatSystemPrompt(level: KnowledgeLevel): string {
  const systemPrompt = getSystemPrompt(level);
  return `${systemPrompt}

The reader is currently reading Book I of Paradise Lost. They may ask questions, raise interpretations, or want to explore ideas. Engage with their actual question — do not deflect into summary or spoilers. Be a brilliant conversation partner.`;
}

export function getPrimerPrompt(level: KnowledgeLevel): string {
  const systemPrompt = getSystemPrompt(level);
  return `${systemPrompt}

Write a spoiler-free primer for Book I of Paradise Lost (~300 words). Cover: the historical moment (English Civil War, the Restoration, why Milton was writing this now), Milton's biography and situation (blind, politically marginalised), and the classical/theological background a reader needs (the epic tradition, Satan's role, the theological stakes). Make it punchy and alive — not a textbook introduction. Make the reader want to begin.`;
}
