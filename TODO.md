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
- [ ] Deploy to Vercel

## Session Log

- [x] Session 1 — Project init, Next.js + Tailwind v4, Paradise Lost text (798 lines), reading view, KnowledgeToggle, API stubs, pushed to GitHub
- [x] Session 2 — Full inline annotation: ReadingContainer (shared state), Reader (selection + trigger button), AnnotationCard (streaming, Esc to close, mobile slide-up), /api/annotate (OpenRouter SSE stream), prompt quality pass
- [x] Session 3 — Section primer + chat interface: /api/primer (streaming), Primer.tsx (foreword above text), /api/chat (streaming), Chat.tsx (persistent sidebar on desktop, slide-up drawer on mobile)
- [x] Session 4 — Supabase schema + clients, Paradise Lost seed script, Gutenberg ingestion utility, offline Groq vocab generation, /api/vocab + Reader hover tooltips, annotation history persistence + /api/annotations

## Next

- Deploy to Vercel (add OPENROUTER_API_KEY env var)
- Run migration push after linking Supabase CLI (`supabase link` then `supabase db push`)
- Run one-time data scripts: `npm run seed`, `npm run vocab` (and optional `npm run ingest -- 26`)
- Optional: share/permalink for annotated passages
