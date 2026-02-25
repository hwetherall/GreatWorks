import { createSupabaseScriptClient } from "./supabase";

interface ParsedChapter {
  number: number;
  title: string;
  lines: Array<{ lineNumber: number; text: string }>;
}

interface ParsedBook {
  title: string;
  author: string;
  chapters: ParsedChapter[];
}

export interface GutenbergIngestSummary {
  bookTitle: string;
  chaptersInserted: number;
  linesInserted: number;
}

function romanToNumber(value: string): number | null {
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  const chars = value.toUpperCase().split("");
  let total = 0;
  for (let i = 0; i < chars.length; i += 1) {
    const current = map[chars[i]];
    const next = map[chars[i + 1]];
    if (!current) return null;
    if (next && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total > 0 ? total : null;
}

function stripGutenbergBoilerplate(rawText: string): string {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line.includes("*** START OF"));
  const end = lines.findIndex((line) => line.includes("*** END OF"));

  const from = start >= 0 ? start + 1 : 0;
  const to = end >= 0 ? end : lines.length;

  return lines.slice(from, to).join("\n");
}

function parseBookText(cleanText: string, fallbackTitle: string): ParsedBook {
  const lines = cleanText.split("\n");
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);

  let title = fallbackTitle;
  if (nonEmpty.length > 0) {
    const candidate = nonEmpty.find((line) =>
      /^[A-Z][A-Z0-9 ,.'"-]{4,}$/.test(line)
    );
    if (candidate) {
      title = candidate
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  const chapters: ParsedChapter[] = [];
  let current: ParsedChapter | null = null;
  let currentLineNumber = 1;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\uFEFF/g, "").trim();
    if (!line) continue;

    const chapterMatch = line.match(/^BOOK\s+([IVXLCDM]+|\d+)\.?$/i);
    if (chapterMatch) {
      if (current && current.lines.length > 0) {
        chapters.push(current);
      }

      const token = chapterMatch[1];
      const parsed =
        /^\d+$/.test(token) ? Number(token) : romanToNumber(token) ?? chapters.length + 1;

      current = {
        number: parsed,
        title: `Book ${parsed}`,
        lines: [],
      };
      currentLineNumber = 1;
      continue;
    }

    if (!current) continue;

    current.lines.push({
      lineNumber: currentLineNumber,
      text: line,
    });
    currentLineNumber += 1;
  }

  if (current && current.lines.length > 0) {
    chapters.push(current);
  }

  return {
    title,
    author: "John Milton",
    chapters,
  };
}

export async function ingestFromGutenberg(
  gutenbergId: number
): Promise<GutenbergIngestSummary> {
  const url = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Gutenberg text: HTTP ${response.status}`);
  }

  const rawText = await response.text();
  const stripped = stripGutenbergBoilerplate(rawText);
  const parsed = parseBookText(stripped, `Gutenberg #${gutenbergId}`);
  if (parsed.chapters.length === 0) {
    throw new Error("No chapters found in Gutenberg text.");
  }

  const supabase = createSupabaseScriptClient();

  const { data: book, error: bookError } = await supabase
    .from("books")
    .upsert(
      {
        title: parsed.title,
        author: parsed.author,
        gutenberg_id: gutenbergId,
        source_url: url,
        language: "en",
      },
      { onConflict: "gutenberg_id" }
    )
    .select("id, title")
    .single();

  if (bookError || !book) {
    throw new Error(`Failed to upsert book: ${bookError?.message ?? "Unknown error"}`);
  }

  let chaptersInserted = 0;
  let linesInserted = 0;

  for (const chapter of parsed.chapters) {
    try {
      const { data: chapterRow, error: chapterError } = await supabase
        .from("chapters")
        .upsert(
          {
            book_id: book.id,
            number: chapter.number,
            title: chapter.title,
          },
          { onConflict: "book_id,number" }
        )
        .select("id")
        .single();

      if (chapterError || !chapterRow) {
        throw new Error(chapterError?.message ?? "Unknown chapter upsert error");
      }

      const lineRows = chapter.lines.map((line) => ({
        chapter_id: chapterRow.id,
        line_number: line.lineNumber,
        text: line.text,
      }));

      const { error: lineError } = await supabase
        .from("lines")
        .upsert(lineRows, { onConflict: "chapter_id,line_number" });

      if (lineError) {
        throw new Error(lineError.message);
      }

      chaptersInserted += 1;
      linesInserted += lineRows.length;
    } catch (error) {
      console.error(
        `Skipping chapter ${chapter.number} due to parse/insert error:`,
        error
      );
    }
  }

  return {
    bookTitle: book.title,
    chaptersInserted,
    linesInserted,
  };
}
