import "dotenv/config";
import { createSupabaseScriptClient } from "../lib/supabase";

type GroqCard = {
  word: string;
  definition: string;
  etymology?: string;
};

const MODEL_CANDIDATES = ["openai/gpt-4o-mini", "llama-3.3-70b-versatile"];
const LINE_ID_QUERY_CHUNK_SIZE = 150;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCards(raw: string): GroqCard[] {
  const direct = raw.trim();
  let parsed: unknown;

  try {
    parsed = JSON.parse(direct);
  } catch {
    const arrayMatch = direct.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];
    try {
      parsed = JSON.parse(arrayMatch[0]);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item): GroqCard | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const word = typeof obj.word === "string" ? obj.word.trim() : "";
      const definition =
        typeof obj.definition === "string" ? obj.definition.trim() : "";
      const etymology =
        typeof obj.etymology === "string" ? obj.etymology.trim() : "";
      if (!word || !definition) return null;
      return { word, definition, etymology };
    })
    .filter((card): card is GroqCard => card !== null)
    .slice(0, 2);
}

async function callGroq(lineText: string, apiKey: string): Promise<GroqCard[]> {
  const prompt = [
    "Identify 0-2 words in this line that a modern reader would benefit from a hover definition for.",
    "Focus on archaic, Latinate, theological, or mythological terms.",
    "For each word return: word, definition (1 sentence, intellectually serious), etymology (brief).",
    "Return JSON array only. Return [] if no words qualify.",
    "",
    `Line: ${lineText}`,
  ].join("\n");

  for (const model of MODEL_CANDIDATES) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      if (response.status >= 500 || response.status === 429 || response.status === 404) {
        continue;
      }
      const text = await response.text();
      throw new Error(`Groq request failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "[]";
    return parseCards(content);
  }

  throw new Error("No Groq model candidate succeeded.");
}

async function loadProcessedLineIds(
  lineIds: string[],
  supabase: ReturnType<typeof createSupabaseScriptClient>
): Promise<Set<string>> {
  const processed = new Set<string>();

  for (let i = 0; i < lineIds.length; i += LINE_ID_QUERY_CHUNK_SIZE) {
    const chunk = lineIds.slice(i, i + LINE_ID_QUERY_CHUNK_SIZE);
    if (chunk.length === 0) continue;

    const { data, error } = await supabase
      .from("vocab_cards")
      .select("line_id")
      .in("line_id", chunk);

    if (error) {
      throw new Error(
        `Failed to load existing vocab cards for line ids ${i + 1}-${i + chunk.length}: ${error.message}`
      );
    }

    for (const card of data ?? []) {
      if (typeof card.line_id === "string") {
        processed.add(card.line_id);
      }
    }
  }

  return processed;
}

async function main() {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const supabase = createSupabaseScriptClient();

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("id, title")
    .eq("gutenberg_id", 26)
    .single();

  if (bookError || !book) {
    throw new Error(`Could not find Paradise Lost book row: ${bookError?.message ?? ""}`);
  }

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id, number")
    .eq("book_id", book.id)
    .eq("number", 1)
    .single();

  if (chapterError || !chapter) {
    throw new Error(`Could not find Book 1 chapter row: ${chapterError?.message ?? ""}`);
  }

  const { data: lines, error: linesError } = await supabase
    .from("lines")
    .select("id, line_number, text")
    .eq("chapter_id", chapter.id)
    .order("line_number", { ascending: true });

  if (linesError || !lines) {
    throw new Error(`Failed to load chapter lines: ${linesError?.message ?? ""}`);
  }

  const lineIds = lines.map((line) => line.id);
  const processedLineIds = await loadProcessedLineIds(lineIds, supabase);

  let processedCount = 0;
  let insertedCount = 0;

  for (const line of lines) {
    processedCount += 1;

    if (processedLineIds.has(line.id)) {
      continue;
    }

    const cards = await callGroq(line.text, groqApiKey);
    if (cards.length > 0) {
      const payload = cards.map((card) => ({
        line_id: line.id,
        word: card.word,
        definition: card.definition,
        etymology: card.etymology || null,
      }));

      const { error } = await supabase
        .from("vocab_cards")
        .upsert(payload, { onConflict: "line_id,word" });
      if (error) {
        throw new Error(`Failed to upsert vocab cards for line ${line.line_number}: ${error.message}`);
      }
      insertedCount += payload.length;
    }

    if (processedCount % 50 === 0) {
      console.log(
        `Progress: ${processedCount}/${lines.length} lines processed, ${insertedCount} cards upserted.`
      );
    }

    await sleep(100);
  }

  console.log("Vocab generation complete.");
  console.log(
    JSON.stringify(
      {
        linesProcessed: processedCount,
        cardsUpserted: insertedCount,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
