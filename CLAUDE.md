# CLAUDE.md — Great Books AI Reading Companion

This file is context for Claude Code. Read it at the start of every session.

---

## What we're building

An AI-powered reading companion for the Great Books, starting with **Paradise Lost Book 1 (1674)**. Think Rap Genius meets a brilliant literary scholar - users can click any phrase or passage and get contextual enrichment that restores what a 1667 reader would have already known. There's also a section primer before reading begins, and a persistent chat interface.

The target user is an intellectually curious modern reader who wants to read the canon seriously but lacks the background knowledge that the original audience took for granted. We are NOT building a summary tool or a study guide. We are restoring depth, not replacing effort.

**This is a demo to send to Johnathan Bi (GreatBooks.io / 1.3M subscriber podcast).** Quality matters. It needs to be impressive.

---

## Stack

- **Framework:** Next.js (App Router)
- **Deployment:** Vercel
- **Database:** Supabase
- **AI:** OpenRouter (Claude via API)
- **Styling:** Tailwind CSS

---

## Key Features

### 1. Knowledge Level Toggle (IMPORTANT)
Users set their knowledge level before or during reading. This controls the tone, depth, and assumed knowledge of ALL AI outputs.

- **Complete Noob** — No prior knowledge assumed. Explain everything from scratch. Warm, welcoming tone. Who is Milton? What is an epic poem? What's going on in 17th century England?
- **Casual Reader** — Some general education assumed, but no specialist knowledge. Brief context, focus on what's surprising or non-obvious.
- **Literature Enthusiast** — Has read other canonical English literature (Chaucer, Coleridge, Shakespeare). Can reference other works and traditions without over-explaining.
- **Experienced Scholar** — Deep familiarity with the canon. Go further: contested interpretations, Milton's sources, theological debates, influence on later writers.

This toggle must be prominent and easy to change at any time. It should persist in localStorage.

### 2. Clean Reading View
- Paradise Lost Book 1 displayed beautifully
- Distraction-free, literary typography
- Lines numbered (Milton is traditionally read with line numbers)
- Passages should be selectable/clickable for annotations

### 3. Inline Annotation on Click
- User clicks/selects any word, phrase, or line
- AI generates a contextual enrichment card calibrated to their knowledge level
- Answers: "what would a 1667 reader have understood here that I don't?"
- Tone should be intellectually serious but conversational — like a brilliant friend, not a textbook

### 4. Section Primer
- Displayed before the text begins
- Spoiler-free briefing: historical moment, Milton's biography, classical/theological background
- Calibrated to knowledge level
- ~300 words, punchy and alive

### 5. Chat Interface
- Persistent panel (sidebar or bottom drawer)
- Context-aware: knows what book, knows knowledge level
- For exploring ideas, asking questions, discussing interpretations
- Should not summarise or spoil

---

## Design Direction

**Aesthetic:** Editorial / refined. Think a beautiful literary magazine, not a SaaS dashboard. Dark mode preferred (reading at night). Rich, warm tones — deep navy or near-black backgrounds, cream or warm white text, gold or amber accents. NOT purple gradients. NOT generic tech UI.

**Typography:** This is a literary product. Typography is everything.
- Display font: something with genuine character — a serif with presence (e.g. Playfair Display, Cormorant Garamond, or similar)
- Body font: highly readable for long-form reading (e.g. Lora, Source Serif, or similar)
- Line height generous, measure (line length) constrained to ~65-75 characters for comfortable reading

**Interactions:** Subtle and purposeful. Annotation cards should appear with a gentle fade. No flashy animations that distract from the text.

**Never:** Generic Inter/Roboto fonts, light grey on white, purple gradient hero sections, dashboard-style layouts.

---

## Prompt Engineering Principles

The quality of AI outputs IS the product. Every AI call should:
- Know the knowledge level and calibrate accordingly
- Sound like an intelligent person, not an encyclopedia
- Be specific to the actual passage — no generic responses
- For annotations: lead with the most surprising or non-obvious insight
- For chat: engage with the reader's actual question, don't deflect into summary

System prompt base:
> You are a brilliant literary companion helping a reader engage deeply with Paradise Lost by John Milton (1674). Your role is not to summarise or spoil — it is to enrich. You restore context that Milton's original 1667 audience already possessed: historical, theological, classical, and biographical. The reader's knowledge level is: [LEVEL]. Calibrate everything to this level.

---

## Project Structure (target)

```
/app
  /page.tsx              — Main reading view
  /api
    /annotate/route.ts   — Inline annotation endpoint
    /chat/route.ts        — Chat endpoint
    /primer/route.ts      — Section primer endpoint
/components
  /Reader.tsx            — Main reading component
  /AnnotationCard.tsx    — Popover/card for inline annotations
  /Primer.tsx            — Section primer display
  /Chat.tsx              — Chat panel
  /KnowledgeToggle.tsx   — Knowledge level selector
/lib
  /paradise-lost.ts      — Book 1 text, structured by line
  /prompts.ts            — All AI system prompts
/data
  /book1.json            — Paradise Lost Book 1, structured
```

---

## TODO Status

See TODO.md for full feature list and session log.

### Current Priority (Session 1)
1. Project init: Next.js + Tailwind + Supabase + OpenRouter
2. Load Paradise Lost Book 1 text, structured and clean
3. Basic reading view with correct typography
4. Knowledge level toggle (UI + localStorage persistence)
5. Deploy skeleton to Vercel

---

## Source Text

Paradise Lost Book 1 (1674 version):
https://www.poetryfoundation.org/poems/45718/paradise-lost-book-1-1674-version

The text should be stored locally in the repo (not fetched at runtime) as structured JSON with line numbers.

---

## What success looks like

A deployed Vercel URL where:
- Someone can read Book 1 of Paradise Lost beautifully
- Click "Pandæmonium" and get a genuinely interesting explanation calibrated to their level
- Read a primer that makes them excited to start
- Chat about what they're reading
- Feel like this was made by someone who loves the Great Books, not someone who just knows how to code