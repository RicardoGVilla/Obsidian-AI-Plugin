# ✅ Answers (Owner’s Reference)

Note: Use these to calibrate your own wording. Aim to explain, not recite.

## Architecture & High-Level Understanding
- Entire system (2 min): CLI and Obsidian plugin wrap 6 AI-backed features (categorize, summarize, analyze, Q&A, batch). Data flows: read vault → optional local processing (maps, stats) → select/summarize context → call Gemini → render outputs. Stack: TypeScript/Node, Obsidian API, Gemini.
- Why Gemini: Strong long-context reasoning, fast setup, good pricing. Local models need hardware + engineering; OpenAI comparable but Gemini chosen for cost and token window trade-offs.
- CLI vs Plugin: CLI for dev speed, automation, no Obsidian dependency; Plugin for UX inside vault (buttons/tabs). Same core logic, different interface.
- Dependencies: Q&A and batch reuse local search/sampling utilities; UI calls feature modules; features are largely independent but share utils.
- Data flow: Input (file/folder/query) → local scan/score → pick N files → Gemini request → structured result → write/report.

## Feature 1: Categorization
- How: Read file content → prompt Gemini with category schema → return best-fit label.
- Empty file: Guard returns “Unknown/Empty” without API call.
- Alt to full content: Truncate/summary first 800–1200 tokens to cut cost.
- Testing: Empty, multi-topic, short notes; asserts stable category set.
- Trade-off: Accuracy vs cost; batch categorization uses truncation and batching to reduce spend.

## Feature 2: Folder Summarization
- How: Read all MD files (recursive) → concatenate or sample → Gemini summary ~200 words.
- Large folders: Sample by recency/importance to stay in token budget.
- Word length: Param controls 50/200/1000; prompt adjusts target length.
- Empty folder: Return “No content to summarize”.
- Date filter: Apply mtime filter before aggregation.

## Feature 3: Pattern Analysis
- How: Keyword search → Map<string, number> frequency → simple trends → optional Gemini insight.
- Case sensitivity: Normalize to lowercase; strip punctuation.
- Zero matches: Return frequency 0 and “No mentions found”.
- Top 10: Build global frequency map across files, sort desc, take 10.
- Trade-off: Local counting is cheap/deterministic; AI insights only for narrative.

## Feature 4: CLI Interface
- Library: Commander/Yargs for clear command structure and help.
- Commands: categorize <file>, summarize <folder>, analyze <folder> <keyword>, plus q&a and batch when wired.
- Arg parsing/errors: Validate paths; print friendly errors and exit non-zero.
- Add new command: Define action, map to module, update help.
- Why CLI first: Faster iteration, testable pipelines, scripts/automation friendly.

## Feature 5: Q&A System
- How: Tokenize query → score files by keyword overlap → pick top ~20 → Gemini answer.
- Top 20: Balances relevance and cost; mitigates token limits; accuracy acceptable for personal vaults.
- Token limits: Keep context under model window; trim, dedupe, and summarize when needed.
- Improve accuracy: Increase N, add semantic search (embeddings), add “priority tags”.
- No-color example: Return “Insufficient context found”; suggest folders to search.

## Feature 6: Batch Processing
- How: Local stats (counts, folders, activity) → hybrid sampling (recent/important/random) → Gemini summaries/themes.
- Hybrid sampling: 40% recent, 30% important (length/links/keywords), 30% random for diversity.
- Not all files: Full read is slow/costly; sampling gives 80–90% coverage fast.
- Small vaults (<50): Read all; skip sampling.
- Local vs AI: Local stats deterministic; AI for synthesis/themes.

## Feature 7: Obsidian Plugin UI
- Structure: Ribbon → side panel view → tabs: Quick Actions, Q&A, Reports.
- APIs: addCommand, registerView, Notice, requestUrl, workspace/app access.
- Button clicks: Disable during run, show spinner/Notice, catch errors.
- New tab: Create view component, register, route actions to feature modules.
- Build last: Core logic stable first; UI is wrapper.

## Technical Deep Dives
- TypeScript: Types/interfaces improve correctness and refactors; better DX.
- Errors: Try/catch around IO/API; user feedback via Notice; structured error objects.
- API down: Fail fast, show Notice “Service unavailable”, suggest retry; log minimal detail.
- Keys: Stored in settings/env; never hard-coded; validate before calls.
- fs.readFile vs vault.cachedRead: fs is raw disk; Obsidian cachedRead knows vault, metadata, is editor-integrated.
- Rate limiting: Queue requests; exponential backoff; cap concurrent calls.
- Testing: Table-driven harness for pure functions; manual/integration runs for feature flows.

## Modifications & Extensions
- Date filtering: Insert before scoring in Q&A; filter file list by mtime.
- Auto-tagging: Reuse categorize prompt with “tags” schema; store tags in frontmatter.
- Scale to 10k: Streamed IO, caching, chunked processing, stricter sampling; avoid loading all into memory.
- Caching: Hash file content; store last processed results; skip unchanged files.
- Swap model: Abstract AI client; implement OpenAI provider; keep prompt contracts aligned.
- Multi-language: Detect language; per-language stopwords and tokenization; model supports multilingual.

## Trade-offs & Decisions
- 50 files: Empirically good coverage vs cost; adjustable via setting.
- Hybrid sampling: Prevents recency bias; captures diverse topics.
- CLI → UI: Ship value early; UI after logic is battle-tested.
- Gemini vs GPT-4: Cost, context window, availability; both viable.
- Build own tool: Tailored workflows, learning value, interview storytelling.

## Debugging & Edge Cases
- Q&A gibberish: Check input selection/scoring; reduce noise; increase N; inspect prompts.
- Batch crash: Identify offending file; guard file reads; handle binary/non-MD.
- Wrong category: Adjust prompt schema/examples; add domain-specific hints.
- Invalid API key: Validate at startup; surface Notice; recovery instructions.
- CLI hang: Await promise chains; ensure process.exit on completion/errors.

## Interview Simulation (Rapid Fire)
- Hardest part: Context management + sampling strategy balancing accuracy/cost.
- Do differently: Add embeddings early; build caching first for scale.
- Scale to 100k: Incremental indexing, on-disk DB for metadata, background workers.
- Monetize: Pro features (batch reports), hosted processing, team vault analytics.

**Last Updated:** Dec 1, 2025
