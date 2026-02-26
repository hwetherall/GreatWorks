# Great Books — TODO & Session Log

## Feature Status

- [x] Next.js + Tailwind v4 + TypeScript project init
- [x] Paradise Lost Book 1 text (798 lines, structured JSON)
- [x] Reading view with correct typography (Cormorant Garamond / Lora)
- [x] Knowledge level toggle (UI + localStorage persistence)
- [x] API stubs for annotate / chat / primer
- [x] Inline annotation on click (streaming, calibrated to level)
- [x] Section primer — "Before You Begin" foreword (streaming)
- [x] Chat interface — persistent panel with streaming responses
- [x] Session 4 backend integration: Supabase schema + ingestion + vocab cards + annotation history
- [x] Section structure: 6 named sections, before/after SectionCards, IntersectionObserver lazy loading
- [x] ProgressBar (2px fixed top), AnnotationHistory drawer, gamification (streaks, achievements, toasts)
- [x] Pagination: Reader shows one section at a time, Prev/Next + dot indicators
- [x] onSectionVisible fires immediately on section change (not scroll-dependent)
- [x] Section card max_tokens increased to 1200 (prevent mid-sentence truncation)
- [ ] Deploy to Vercel

## Session Log

- [x] Session 1 — Project init, Next.js + Tailwind v4, Paradise Lost text (798 lines), reading view, KnowledgeToggle, API stubs, pushed to GitHub
- [x] Session 2 — Full inline annotation: ReadingContainer (shared state), Reader (selection + trigger button), AnnotationCard (streaming, Esc to close, mobile slide-up), /api/annotate (OpenRouter SSE stream), prompt quality pass
- [x] Session 3 — Section primer + chat interface: /api/primer (streaming), Primer.tsx (foreword above text), /api/chat (streaming), Chat.tsx (persistent sidebar on desktop, slide-up drawer on mobile)
- [x] Session 4 — Supabase schema + clients, Paradise Lost seed script, Gutenberg ingestion utility, offline Groq vocab generation, /api/vocab + Reader hover tooltips, annotation history persistence + /api/annotations
- [x] Session 5 — Section structure (6 sections), SectionCard before/after, IntersectionObserver lazy loading, section_progress tracking
- [x] Session 6 — ProgressBar, AnnotationHistory drawer, AchievementToast, gamification schema
- [x] Session 7 — Pagination in Reader (one section per page, Prev/Next + dots), onSectionVisible fires immediately, max_tokens raised to 1200 for section cards and primer
- [x] Session 8 — Removed Scroll/Flip mode toggle from ReadingContainer and standardized on the paginated Reader view
- [x] Session 9 — Improved section card readability with markdown formatting guidance, richer markdown rendering styles, and section-primer cache key bump

## Next

- Deploy to Vercel (add all env vars: OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL)
- Run migration push after linking Supabase CLI (`supabase link` then `supabase db push`)
- Run one-time data scripts: `npm run seed`, `npm run vocab` (and optional `npm run ingest -- 26`)
