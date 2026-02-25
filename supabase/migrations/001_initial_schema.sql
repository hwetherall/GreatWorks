create extension if not exists pgcrypto;

-- Books ingested from Project Gutenberg or other sources
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  gutenberg_id integer unique,
  source_url text,
  language text default 'en',
  created_at timestamptz default now()
);

-- Chapters / books within a work (Paradise Lost has 12 books)
create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  number integer not null,
  title text,
  unique(book_id, number)
);

-- Individual lines of text
create table if not exists lines (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade,
  line_number integer not null,
  text text not null,
  unique(chapter_id, line_number)
);

-- Pre-generated vocabulary hover cards (generated once via Groq, not at runtime)
create table if not exists vocab_cards (
  id uuid primary key default gen_random_uuid(),
  line_id uuid references lines(id) on delete cascade,
  word text not null,
  definition text not null,
  etymology text,
  created_at timestamptz default now(),
  unique(line_id, word)
);

-- User annotation history (keyed by session for now, user_id ready for auth later)
create table if not exists annotation_history (
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

create index if not exists idx_lines_chapter_line_number on lines(chapter_id, line_number);
create index if not exists idx_vocab_cards_line_id on vocab_cards(line_id);
create index if not exists idx_annotation_history_session_created_at on annotation_history(session_id, created_at desc);
