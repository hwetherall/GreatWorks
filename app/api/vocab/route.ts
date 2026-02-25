import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

type VocabResponseItem = {
  lineNumber: number;
  word: string;
  definition: string;
  etymology: string;
};

const LINE_ID_QUERY_CHUNK_SIZE = 150;

async function loadVocabCardsByLineIds(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  lineIds: string[]
) {
  const cards: Array<{
    line_id: string | null;
    word: string;
    definition: string;
    etymology: string | null;
  }> = [];

  for (let i = 0; i < lineIds.length; i += LINE_ID_QUERY_CHUNK_SIZE) {
    const chunk = lineIds.slice(i, i + LINE_ID_QUERY_CHUNK_SIZE);
    if (chunk.length === 0) continue;

    const { data, error } = await supabase
      .from("vocab_cards")
      .select("line_id, word, definition, etymology")
      .in("line_id", chunk);

    if (error) {
      throw new Error(
        `Failed loading vocab cards for line ids ${i + 1}-${i + chunk.length}: ${error.message}`
      );
    }

    cards.push(...(data ?? []));
  }

  return cards;
}

export async function GET(request: NextRequest) {
  const requestedChapterId = new URL(request.url).searchParams.get("chapterId");
  if (!requestedChapterId) {
    return Response.json({ error: "chapterId is required" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  let chapterId = requestedChapterId;

  if (requestedChapterId === "book1") {
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id")
      .eq("gutenberg_id", 26)
      .single();

    if (bookError || !book) {
      return Response.json(
        { error: `Unable to resolve Paradise Lost book: ${bookError?.message ?? "Unknown error"}` },
        { status: 500 }
      );
    }

    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .select("id")
      .eq("book_id", book.id)
      .eq("number", 1)
      .single();

    if (chapterError || !chapter) {
      return Response.json(
        { error: `Unable to resolve chapter: ${chapterError?.message ?? "Unknown error"}` },
        { status: 500 }
      );
    }

    chapterId = chapter.id;
  }

  const { data: lines, error: linesError } = await supabase
    .from("lines")
    .select("id, line_number")
    .eq("chapter_id", chapterId)
    .order("line_number", { ascending: true });

  if (linesError) {
    return Response.json({ error: linesError.message }, { status: 500 });
  }

  if (!lines || lines.length === 0) {
    return Response.json([] satisfies VocabResponseItem[]);
  }

  const lineNumberById = new Map(lines.map((line) => [line.id, line.line_number]));
  let cards: Array<{
    line_id: string | null;
    word: string;
    definition: string;
    etymology: string | null;
  }> = [];
  try {
    cards = await loadVocabCardsByLineIds(
      supabase,
      lines.map((line) => line.id)
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load vocab cards",
      },
      { status: 500 }
    );
  }

  const result: VocabResponseItem[] = cards
    .map((card) => ({
      lineNumber: lineNumberById.get(card.line_id ?? "") ?? -1,
      word: card.word,
      definition: card.definition,
      etymology: card.etymology ?? "",
    }))
    .filter((item) => item.lineNumber > 0)
    .sort((a, b) => a.lineNumber - b.lineNumber);

  return Response.json(result);
}
