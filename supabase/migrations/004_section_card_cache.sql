create table if not exists section_card_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_section_card_cache_key on section_card_cache(cache_key);
