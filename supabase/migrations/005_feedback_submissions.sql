create table if not exists feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  rating integer not null check (rating between 1 and 5),
  feedback_text text not null,
  name text,
  created_at timestamptz default now()
);

create index if not exists idx_feedback_submissions_session_created_at
  on feedback_submissions(session_id, created_at desc);
