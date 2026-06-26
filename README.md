PM Agent #3: PRD Studio

**Part of the [StreamMind](https://github.com/shreya-patel-PM) AI Product Builder portfolio — 27 agents across streaming, PM automation, and pharma.**

**Live app:** [prd-generator-form.vercel.app](https://prd-generator-form.vercel.app)

## What it does

A web app where a PM fills structured product context into a phased form and receives a full PRD draft in 90 seconds. Three output formats, an AI Feature toggle that adds 8 sections most PMs miss, and a self-review checklist that tells the PM what they still need to think about.

### Three modes

| Mode | Format | Length | Inspiration |
|---|---|---|---|
| 1-Pager | Quick exploration | 400–600 words | Lenny Rachitsky |
| Full PRD | Implementation spec | 1,500–3,500 words | Kevin Yien / Asana |
| PR/FAQ | Working Backwards | 1,000–2,000 words | Amazon |

### AI Feature toggle (the differentiator)

When toggled on, 8 additional sections are generated — sourced from Anthropic, Stanford HAI, Google PAIR, and OpenAI Evals:

1. Model Selection Rationale
2. Eval Plan (offline + online)
3. Hallucination & Failure Modes
4. Fallback UX
5. Training Data & Provenance
6. Cost Model
7. Safety & Guardrails
8. Rollout Plan (shadow → % → GA with gating metrics)

### PLACEHOLDER pattern (the killer feature)

When input is thin or marked TBD, the agent does NOT fabricate. It generates a PLACEHOLDER block naming 2–3 likely candidates and tells the PM what to confirm. The self-review checklist at the end names the single weakest AI section with specific strengthening advice.

## Architecture
Browser (Next.js, v0.dev scaffold)

 → Form submit (POST /api/generate)

→ Vercel API route (server-side, API key never exposed)

→ Claude API (Sonnet 4.5, streaming, temperature 0.3, 16K max tokens)

→ Streamed Markdown response

→ react-markdown preview panel

→ Export: Copy Markdown | Download .md | Copy for Confluence | Copy for Google Docs


**Stack:** Next.js · Vercel · Claude API (Sonnet 4.5) · React · Tailwind

## Prompt design

5-layer assembly matching Deliverable 4 v2 spec:

1. **Layer 1 — Identity & Voice** (always present): PM voice, no confident fiction, problem-before-solution enforcement
2. **Layer 2 — Mode instruction** (one of three): section list, target length, mode-specific discipline
3. **Layer 3 — AI add-on** (conditional): 8-section structure with mode-specific placement
4. **Layer 4 — The 8 Rules** (always present): PLACEHOLDER pattern, no fabrication, AC as user stories, self-review with weakest AI section
5. **Layer 5 — Conciseness** (always present): per-mode word count targets and budget instruction

## Key design decisions

### Streaming over JSON
Deliverable 4 specifies JSON output. We chose Markdown streaming because JSON can't stream mid-object, and Vercel's 60-second timeout required streaming. The streaming UX (PRD appearing progressively) is a better product. Intentional deviation.

### Phase-gating enforces problem-before-solution
Phase 2 (Solution) is locked until all required Phase 1 (Problem) fields are filled. Structural enforcement, not just prompt instruction.

### Model-class agnosticism validated
The same 8-section AI structure produces correct output for LLMs (BLEU, $2M/month), classifiers (F1, $45/month), and recommenders (NDCG, $600K/month). Tested with T9 (LLM), T10 (classifier), T11 (recommender).

### Per-field required toggle
PMs can customize which fields are required per phase — makes the tool portable across orgs with different rigidity cultures.

## Form features

- 3 modes with color-coded selector (orange / blue / deep red)
- Phase-gating with visual lock indicators
- AI Feature toggle with 8 field groups (blue accent)
- Phase 4 Compliance & Review (Legal / Privacy / Security toggles + stakeholder sign-offs)
- Mode switching safeguard preserving shared fields
- Per-field required toggle for cross-org portability

## Sample PRDs generated

| Sample | Mode | AI Toggle | Input type |
|---|---|---|---|
| Smart Inbox | Full PRD | Off | Balanced |
| Pulse Dashboard | Full PRD | Off | Metrics-rich |
| QuickShip Returns | Full PRD | Off | Sparse |
| Dark Mode | 1-Pager | Off | Rich |
| Offline Downloads | 1-Pager | Off | Sparse |
| StreamMind Kids | PR/FAQ | Off | Rich |
| QuickBill | PR/FAQ | Off | Sparse |
| Smart Subtitles | Full PRD | On (LLM) | Rich |
| Ticket Routing | Full PRD | On (Classifier) | Rich |
| Cold-Start Recs | Full PRD | On (Recommender) | Rich |
| Voice Search | 1-Pager | Off | Leakage test |

## Problems solved during build

| Problem | Solution |
|---|---|
| Vercel 60-second timeout | Switched to streaming |
| Phase 3 not unlocking | Reduced AC minimum, excluded optional fields from gate |
| PR/FAQ too verbose (4,000+ words) | Per-mode conciseness rules and word count caps |
| AI sections causing truncation | max_tokens 16K + budget instruction (60/30/10 split) |
| Claude fabricating on thin input | PLACEHOLDER pattern with "never fabricate" rule |
| Problem-solution leakage undetected | Rule 1 with automatic rewrite + flagging note |
| Self-review too generic on AI PRDs | Rule 8 names single weakest AI section |
| Mode C AI sections all in one place | Split: Execution FAQ (2,3,6,8) + AI Implementation Notes appendix (1,4,5,7) |
| Agent LLM-biased on non-LLM inputs | Validated T10 (XGBoost) and T11 (two-tower neural net) |

## Design deliverables (completed before build)

1. Spec — scope, architecture, phased build plan
2. Form Field Schema — all fields across 3 modes + AI toggle
3. PRD Section Structure — output format for all modes + AI + self-review
4. Claude Prompt v2 — 5-layer assembly with 8 rules
5. Validation Plan v2 — 11 test cases including 3 AI model-class tests
6. AI-PRD Mode Spec — 8-section structure with calibration examples

## Related agents

- [PM Agent #1 — Backlog Grooming Bot](https://github.com/shreya-patel-PM/streammind-pm1-backlog-grooming)
- [Streaming #1 — Content Tagger](https://github.com/shreya-patel-PM/streammind-streaming1-content-tagger)
- [Streaming #2 — Copy Generator](https://github.com/shreya-patel-PM/streammind-streaming2-copy-generator)
- [Streaming #9 — Licensing Monitor](https://github.com/shreya-patel-PM/streammind-streaming9-licensing-monitor)

## License

MIT
