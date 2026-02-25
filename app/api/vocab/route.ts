import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

type VocabResponseItem = {
  lineNumber: number;
  word: string;
  definition: string;
  etymology: string;
};

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
  const { data: cards, error: cardsError } = await supabase
    .from("vocab_cards")
    .select("line_id, word, definition, etymology")
    .in(
      "line_id",
      lines.map((line) => line.id)
    );

  if (cardsError) {
    return Response.json({ error: cardsError.message }, { status: 500 });
  }

  const result: VocabResponseItem[] = (cards ?? [])
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
