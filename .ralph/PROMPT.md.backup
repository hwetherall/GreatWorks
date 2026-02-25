# Session 3 — Section Primer + Chat Interface

You are building the Great Books AI Reading Companion — a literary enrichment app for Paradise Lost. This is a Next.js 16 + Tailwind 4 + OpenRouter project. Sessions 1 and 2 are complete. Your job is Session 3.

Read `CLAUDE.md` and `TODO.md` at the start of every loop to stay oriented.

---

## Your Goal

Build and wire two features:
1. **Section Primer** — a spoiler-free ~300-word briefing that appears before the reader reaches the text
2. **Chat Interface** — a persistent panel for discussing ideas and asking questions while reading

Both AI prompts are already written in `lib/prompts.ts` (`getPrimerPrompt`, `getChatSystemPrompt`). Do not rewrite them. Your job is to build the APIs and UI components that use them.

---

## Work Through These Steps in Order

Check off each step as you complete it. If you restart mid-session, read this file, check what exists already, and continue from where things were left off — do not redo completed work.

---

### STEP 1 — Complete `/app/api/primer/route.ts`

The file exists but returns a 501 stub. Replace it with a real streaming implementation.

- Accept a `level` query param (values: `casual`, `student`, `scholar`)
- Import `getPrimerPrompt` from `lib/prompts.ts`
- Call the OpenRouter API using the same streaming pattern as `/app/api/annotate/route.ts` (study that file first — mirror its approach exactly)
- Stream the response back as text
- Use model: `anthropic/claude-3.5-sonnet` (same as annotate)
- If `level` is missing, return `400`

**Done when:** `curl "http://localhost:3000/api/primer?level=casual"` streams a real Milton primer, not a 501.

---

### STEP 2 — Build `components/Primer.tsx`

Create a new component that fetches and displays the primer.

Requirements:
- Accepts a `level` prop of type `KnowledgeLevel`
- On mount, fetches from `/api/primer?level={level}` and streams the response into state
- While loading: show a subtle pulsing placeholder (use the `annotation-loading` CSS class from `globals.css`)
- When loaded: display the primer text in the app's established typography — warm, editorial, not a card or box. It should feel like a foreword, not a widget.
- Include a small heading above it — something like *"Before You Begin"* — in the display serif font
- No border, no background box. Integrated into the page.

---

### STEP 3 — Wire `Primer.tsx` into the main reading view

In `app/page.tsx` (or wherever the main reading view is rendered):

- Import and render `<Primer level={currentLevel} />` above the text, before the first line of Paradise Lost
- It should re-fetch if the knowledge level changes
- Must not block the rest of the page from rendering — load it independently

---

### STEP 4 — Build `/app/api/chat/route.ts`

Create a new API route for the chat feature.

- Accept a POST request with body: `{ messages: Array<{role, content}>, level: KnowledgeLevel }`
- Import `getChatSystemPrompt` from `lib/prompts.ts`
- Use the `messages` array as the conversation history, prepending the system prompt
- Stream the response back using the same pattern as `/api/annotate`
- Return `400` if `messages` is missing or empty

**Done when:** A `curl` POST with a messages array returns a streaming literary response in character.

---

### STEP 5 — Build `components/Chat.tsx`

Create the chat panel component.

Requirements:
- Accepts a `level` prop of type `KnowledgeLevel`
- Maintains local message history state: `Array<{role: 'user'|'assistant', content: string}>`
- Input field at the bottom, send on Enter or button click
- Messages displayed above in a scrollable area — user messages right-aligned, assistant messages left-aligned
- Assistant responses stream in token by token (do not wait for full response)
- Tone of placeholder text: *"Ask about what you're reading…"*
- Typing indicator while streaming (a simple animated ellipsis is fine)
- Styled to match the app: dark background, warm cream text, no generic SaaS look
- The chat should feel like a sidebar conversation with a well-read friend, not a support widget

---

### STEP 6 — Wire `Chat.tsx` into the main reading view

- Render the chat panel as a persistent right-side panel on desktop, or a bottom drawer on mobile
- It should always be visible while reading — not hidden behind a button
- Pass `currentLevel` down to `Chat`
- The panel should not overlap the reading text — the layout must accommodate both

---

### STEP 7 — TypeScript + build check

Run `npx tsc --noEmit` and fix any type errors.
Run `npm run build` and fix any build errors.

The build must pass cleanly before this session is considered complete.

---

### STEP 8 — Update TODO.md

Mark Session 3 as complete in the session log:
```
- [x] Session 3 - Section primer + chat interface
```

---

## Constraints — Read These Carefully

**Design:** This is a literary product. Every UI decision should reflect that. Dark background, cream/warm white text, serif fonts (already established in the app), subtle interactions. No purple gradients, no generic SaaS patterns, no Inter font.

**Streaming:** Both the primer and chat must stream — do not wait for the full response before rendering. Study how `/api/annotate` and its corresponding component handle streaming and mirror that pattern exactly.

**Prompts:** `getPrimerPrompt` and `getChatSystemPrompt` in `lib/prompts.ts` are final. Do not modify them.

**Scope:** Do not build anything outside this list. Do not touch the annotation feature. Do not refactor things that are working.

**Self-sufficiency:** If you encounter an environment variable that should exist (e.g. `OPENROUTER_API_KEY`), assume it is set in `.env.local` and proceed.

---

## Definition of Done

Session 3 is complete when:
- [ ] `GET /api/primer?level=casual` streams a real primer response
- [ ] The primer appears above the text in the reading view, styled as a foreword
- [ ] `POST /api/chat` accepts a message history and streams a response
- [ ] The chat panel is visible alongside the reading view, functional, and styled consistently
- [ ] `npm run build` passes with no errors
- [ ] `TODO.md` Session 3 is marked complete