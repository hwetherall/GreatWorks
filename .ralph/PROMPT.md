Major architectural session: wire up Supabase as the data layer, add Gutenberg 
integration for book ingestion, and pre-generate vocabulary hover cards for Book 1.

---

### STEP 1 — Supabase schema

Create a migration file at `supabase/migrations/001_initial_schema.sql` with the 
following tables:
```sql
-- Books ingested from Project Gutenberg or other sources
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  gutenberg_id integer unique,
  source_url text,
  language text default 'en',
  created_at timestamptz default now()
);

-- Chapters / books within a work (Paradise Lost has 12 books)
create table chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  number integer not null,
  title text,
  unique(book_id, number)
);

-- Individual lines of text
create table lines (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade,
  line_number integer not null,
  text text not null,
  unique(chapter_id, line_number)
);

-- Pre-generated vocabulary hover cards (generated once via Groq, not at runtime)
create table vocab_cards (
  id uuid primary key default gen_random_uuid(),
  line_id uuid references lines(id) on delete cascade,
  word text not null,
  definition text not null,
  etymology text,
  created_at timestamptz default now()
);

-- User annotation history (keyed by session for now, user_id ready for auth later)
create table annotation_history (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  chapter_id uuid references chapters(id),
  line_start integer,
  line_end integer,
  passage text not null,
  knowledge_level text not null,
  annotation_content text not null,
  created_at timestamptz default now()
);
```

Run this migration against the project's Supabase instance using the Supabase CLI.

---

### STEP 2 — Supabase client setup

Create `lib/supabase.ts` using the existing NEXT_PUBLIC_SUPABASE_URL and 
NEXT_PUBLIC_SUPABASE_ANON_KEY env vars (already in .env). Export a typed client.

---

### STEP 3 — Seed Paradise Lost Book 1 into Supabase

Create a one-time seed script at `scripts/seed-paradise-lost.ts`.

- Import the existing structured data from `lib/paradise-lost.ts`
- Insert a row into `books` for Paradise Lost (gutenberg_id: 26)
- Insert a row into `chapters` for Book 1
- Bulk insert all lines from book1.lines into the `lines` table
- Log progress and confirm counts on completion
- Make it idempotent (safe to re-run without duplicating data)

Add a script entry in package.json: `"seed": "npx ts-node --project tsconfig.json scripts/seed-paradise-lost.ts"`

---

### STEP 4 — Gutenberg ingestion utility

Create `lib/gutenberg.ts` with a function `ingestFromGutenberg(gutenbergId: number)` that:

1. Fetches the plain text file from `https://www.gutenberg.org/cache/epub/{id}/pg{id}.txt`
2. Parses it into structured chapters and lines (stripping Gutenberg header/footer boilerplate — look for "*** START OF" and "*** END OF" markers)
3. Inserts the book, chapters, and lines into Supabase using upsert (idempotent)
4. Returns a summary: `{ bookTitle, chaptersInserted, linesInserted }`

Also create `scripts/ingest-gutenberg.ts` which calls this with a gutenberg ID passed as a CLI argument: `npm run ingest -- 26`

Add the script to package.json: `"ingest": "npx ts-node scripts/ingest-gutenberg.ts"`

---

### STEP 5 — Pre-generate vocabulary hover cards via Groq

Create `scripts/generate-vocab-cards.ts`.

This script:
1. Queries Supabase for all lines in Book 1 of Paradise Lost
2. For each line, calls the Groq API (key: GROQ_API_KEY from .env) using model 
   `openai/gpt-4o-mini` (or the model string `llama-3.3-70b-versatile` if that 
   specific string doesn't resolve — check Groq's available models and use the 
   best available fast model)
3. The prompt asks: "Identify 0-2 words in this line that a modern reader would 
   benefit from a hover definition for. Focus on archaic, Latinate, theological, 
   or mythological terms. For each word return: word, definition (1 sentence, 
   intellectually serious), etymology (brief). Return JSON array, empty array if 
   no words qualify."
4. Upserts results into the `vocab_cards` table (skip lines already processed)
5. Rate-limits to avoid API throttling (100ms delay between requests)
6. Logs progress every 50 lines

Add to package.json: `"vocab": "npx ts-node scripts/generate-vocab-cards.ts"`

---

### STEP 6 — Expose vocab cards via API

Create `app/api/vocab/route.ts`:
- Accepts GET with query param `?chapterId=...`
- Returns all vocab_cards for that chapter, joined with line numbers
- Shape: `Array<{ lineNumber: number, word: string, definition: string, etymology: string }>`

---

### STEP 7 — Wire vocab cards into Reader.tsx

- On mount, fetch vocab cards for the current chapter from `/api/vocab`
- Store as a map: `Map<lineNumber, VocabCard[]>`
- For any word in a line that has a vocab card, wrap it in a span with:
  - Subtle underline dotted style (not the same as the annotation click)
  - On hover: show a small tooltip card with the word, definition, and etymology
  - The tooltip should fade in gently, styled to match the app aesthetic
- Vocab hover must not interfere with the existing click-to-annotate selection behaviour

---

### STEP 8 — Wire annotation history into Supabase

In `app/api/annotate/route.ts`, after a successful annotation is generated and 
streamed, save it to `annotation_history` in Supabase:
- session_id: read from a cookie called `gb_session` (create a random UUID and 
  set it if not present)
- Store chapter_id, line range, passage, level, and the full annotation content

Create `app/api/annotations/route.ts`:
- GET endpoint, reads `gb_session` cookie, returns last 20 annotations for that 
  session ordered by created_at desc

---

### STEP 9 — TypeScript + build check

`npx tsc --noEmit` then `npm run build` — must pass cleanly.

---

### STEP 10 — Update TODO.md

Mark this session complete:
Session 4 - Supabase schema, Gutenberg ingestion, vocab cards, annotation history


---

## Constraints

- Supabase client must use server-side client in API routes (not the browser client)
- The vocab generation script is a one-time offline tool — it must never be called 
  at request time
- Gutenberg ingestion should be robust to parsing edge cases — wrap in try/catch 
  per chapter
- Vocab tooltips must be visually distinct from the annotation trigger — different 
  underline style, appears on hover not click