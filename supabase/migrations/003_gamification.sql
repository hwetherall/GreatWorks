-- Reading streaks: one row per session per calendar day
create table reading_streaks (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  date date not null default current_date,
  sections_completed integer default 0,
  annotations_made integer default 0,
  unique(session_id, date)
);

-- Achievements: unlockable milestones
create table achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null
);

-- Which sessions have unlocked which achievements
create table session_achievements (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  achievement_id text references achievements(id),
  unlocked_at timestamptz default now(),
  unique(session_id, achievement_id)
);

-- Seed the achievements table with Book 1 milestones
insert into achievements (id, title, description, icon) values
  ('first_enrichment', 'First Enrichment', 'You enriched your first passage.', '✦'),
  ('five_enrichments', 'Close Reader', 'Five passages enriched.', '🔍'),
  ('first_section', 'The Argument Read', 'You completed your first section.', '📜'),
  ('book1_halfway', 'Through the Fire', 'Halfway through Book 1.', '🔥'),
  ('book1_complete', 'Book I Complete', 'You have read Paradise Lost Book 1.', '👑'),
  ('scholar_unlocked', 'Scholar Mode', 'You engaged at the Scholar level.', '🎓');

-- Helper function for atomic streak increment
create or replace function upsert_reading_streak(
  p_session_id text,
  p_sections integer default 0,
  p_annotations integer default 0
) returns void language plpgsql as $$
begin
  insert into reading_streaks (session_id, date, sections_completed, annotations_made)
  values (p_session_id, current_date, p_sections, p_annotations)
  on conflict (session_id, date) do update set
    sections_completed = reading_streaks.sections_completed + p_sections,
    annotations_made = reading_streaks.annotations_made + p_annotations;
end;
$$;
