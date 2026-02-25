import "dotenv/config";
import { book1 } from "../lib/paradise-lost";
import { createSupabaseScriptClient } from "../lib/supabase";

async function main() {
  const supabase = createSupabaseScriptClient();

  console.log("Seeding Paradise Lost Book 1...");

  const { data: book, error: bookError } = await supabase
    .from("books")
    .upsert(
      {
        title: "Paradise Lost",
        author: "John Milton",
        gutenberg_id: 26,
        source_url: "https://www.gutenberg.org/cache/epub/26/pg26.txt",
        language: "en",
      },
      { onConflict: "gutenberg_id" }
    )
    .select("id, title")
    .single();

  if (bookError || !book) {
    throw new Error(`Failed to upsert book: ${bookError?.message ?? "Unknown error"}`);
  }

  console.log(`Book ready: ${book.title} (${book.id})`);

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .upsert(
      {
        book_id: book.id,
        number: 1,
        title: "Book 1",
      },
      { onConflict: "book_id,number" }
    )
    .select("id, number")
    .single();

  if (chapterError || !chapter) {
    throw new Error(
      `Failed to upsert chapter: ${chapterError?.message ?? "Unknown error"}`
    );
  }

  console.log(`Chapter ready: ${chapter.number} (${chapter.id})`);

  const rows = book1.lines.map((line) => ({
    chapter_id: chapter.id,
    line_number: line.number,
    text: line.text,
  }));

  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("lines")
      .upsert(chunk, { onConflict: "chapter_id,line_number" });
    if (error) {
      throw new Error(`Failed to upsert lines ${i + 1}-${i + chunk.length}: ${error.message}`);
    }
    console.log(`Upserted lines ${i + 1}-${i + chunk.length} / ${rows.length}`);
  }

  const { count, error: countError } = await supabase
    .from("lines")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapter.id);

  if (countError) {
    throw new Error(`Failed to verify line count: ${countError.message}`);
  }

  console.log("Seeding complete.");
  console.log(
    JSON.stringify(
      {
        bookId: book.id,
        chapterId: chapter.id,
        expectedLines: rows.length,
        storedLines: count ?? 0,
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
