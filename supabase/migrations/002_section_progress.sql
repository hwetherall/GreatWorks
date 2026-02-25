create table if not exists section_progress (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  section_id text not null,
  completed_at timestamptz default now(),
  unique(session_id, section_id)
);
create index if not exists idx_section_progress_session on section_progress(session_id);
