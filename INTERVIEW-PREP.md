# 🎯 Project Ownership Test (Interview Readiness)

**Instructions:** Answer every question WITHOUT looking at code. If you can't answer 90%+ fluently, you don't fully own this project yet.

---

## Architecture & High-Level Understanding

- [ ] **Explain the entire system in 2 minutes** (what it does, how features connect, tech stack)
- [ ] **Draw a box diagram** of the 7 features and how they interact
- [ ] **Why did you choose Gemini API** instead of OpenAI, local models, or other options?
- [ ] **What's the difference between your CLI and Obsidian Plugin UI?** Why build both?
- [ ] **If I deleted one feature, which would break others?** (e.g., does Q&A depend on categorize?)
- [ ] **How does data flow** from user input → Gemini API → output for each feature?

---

## Feature 1: File Categorization

- [ ] **Explain how categorization works** in 3 sentences
- [ ] **What categories does it support?** How would you add a new one?
- [ ] **What happens if the file is empty?** Does it crash or handle gracefully?
- [ ] **Why send the entire file to Gemini?** What's the alternative (e.g., send first 500 words)?
- [ ] **How would you test this feature?** What are 3 edge cases?
- [ ] **Trade-off:** Accuracy vs cost—how much does categorizing 100 files cost in API calls?

---

## Feature 2: Folder Summarization

- [ ] **Explain how folder summarization works** in 3 sentences
- [ ] **How do you handle nested folders?** Recursive or flat?
- [ ] **What if a folder has 500 files?** Do you read them all or sample?
- [ ] **Why 200-word summaries?** What if the user wants 50 or 1000 words?
- [ ] **What happens if all files are empty?** What does Gemini return?
- [ ] **How would you modify this to summarize only files from last 30 days?**

---

## Feature 3: Pattern Analysis

- [ ] **Explain pattern analysis** in 3 sentences
- [ ] **Why use a Map for word frequency?** What's the alternative (array filter)?
- [ ] **How do you handle case sensitivity?** Is "Stress" the same as "stress"?
- [ ] **What if the keyword appears 0 times?** What does the output look like?
- [ ] **How would you extend this to find top 10 keywords** without user input?
- [ ] **Trade-off:** Why search the vault yourself instead of asking Gemini to find patterns?

---

## Feature 4: CLI Interface

- [ ] **What library did you use for the CLI?** Why that one?
- [ ] **List all CLI commands** and what they do
- [ ] **How does argument parsing work?** (e.g., `npm run cli categorize <file>`)
- [ ] **What happens if the user provides invalid arguments?** Error handling?
- [ ] **How would you add a new command** for a new feature?
- [ ] **Why build a CLI first** instead of jumping straight to the Obsidian Plugin UI?

---

## Feature 5: Q&A System

- [ ] **Explain the Q&A system** in 3 sentences (context selection, scoring, Gemini)
- [ ] **How do you score files for relevance?** What's the algorithm?
- [ ] **Why send only the top 20 files?** What if the answer is in file #21?
- [ ] **What's the token limit problem?** How does your system avoid it?
- [ ] **How would you improve accuracy** without increasing API costs?
- [ ] **Edge case:** User asks "What's my favorite color?" but no files mention colors. What happens?

---

## Feature 6: Batch Processing

- [ ] **Explain batch processing** in 3 sentences (stats, sampling, AI insights)
- [ ] **What's the hybrid sampling strategy?** (40% recent, 30% important, 30% random)
- [ ] **Why not read ALL files?** What's the trade-off?
- [ ] **How do you define "important" files?** (length, links, keywords)
- [ ] **What if the vault has only 10 files?** Do you still sample or read all?
- [ ] **How long does batch processing take on a 1000-file vault?** Why?
- [ ] **What statistics do you calculate locally vs with AI?** Why split them?

---

## Feature 7: Obsidian Plugin UI

- [ ] **Explain the plugin UI structure** (side panel, tabs, ribbon icon)
- [ ] **What Obsidian API methods do you use?** (addCommand, registerView, etc.)
- [ ] **How does the plugin call your existing features?** (categorize.ts, qa.ts, etc.)
- [ ] **What happens if the user clicks a button while a feature is running?** Loading state?
- [ ] **How would you add a new tab** to the UI?
- [ ] **Why build this last** instead of first?

---

## Technical Deep Dives

- [ ] **Why TypeScript instead of JavaScript?** What benefits did you get?
- [ ] **How do you handle errors?** Try/catch blocks, or error return values?
- [ ] **What happens if Gemini API is down?** How does the user know?
- [ ] **How do you manage API keys?** Environment variables, config files?
- [ ] **What's the difference between `fs.readFile` and `vault.cachedRead`?**
- [ ] **How would you add rate limiting** to avoid Gemini API quota errors?
- [ ] **What's your testing strategy?** Manual testing, unit tests, integration tests?

---

## Modifications & Extensions

- [ ] **Add date filtering:** Modify Q&A to only search notes from last 30 days. Where do you add the code?
- [ ] **Add auto-tagging:** Suggest tags for a note. How would you architect this feature?
- [ ] **Scale to 10,000 files:** What breaks? How do you fix it?
- [ ] **Add caching:** Avoid re-reading files on every request. How would you implement it?
- [ ] **Support other AI models:** How hard would it be to swap Gemini for OpenAI?
- [ ] **Multi-language support:** What if notes are in French? Does anything break?

---

## Trade-offs & Decisions

- [ ] **Why 50 files in batch processing?** Why not 10 or 500?
- [ ] **Why hybrid sampling?** Why not just take the 50 most recent files?
- [ ] **Why CLI before UI?** What's the strategic reason?
- [ ] **Why Gemini over GPT-4?** Cost, speed, quality, API limits?
- [ ] **Why build your own tool?** Why not use existing Obsidian plugins?

---

## Debugging & Edge Cases

- [ ] **Q&A returns gibberish.** How do you debug? What's likely wrong?
- [ ] **Batch processing crashes on a specific vault.** What do you check first?
- [ ] **Categorization says "Career" for a recipe note.** Why? How do you fix it?
- [ ] **User reports "API key invalid."** Walk through your troubleshooting steps.
- [ ] **CLI command hangs forever.** What's the most likely cause?

---

## Interview Simulation (Rapid Fire)

- [ ] **"Walk me through your project"** (2-min pitch)
- [ ] **"What's the hardest part you built?"** (pick one feature and explain challenges)
- [ ] **"What would you do differently if you started over?"**
- [ ] **"How does this scale to 100,000 notes?"**
- [ ] **"Show me the most interesting piece of code you wrote"**
- [ ] **"What did you learn building this?"**
- [ ] **"How would you monetize this?"**
- [ ] **"What's the next feature you'd add?"**

---

## Scoring

**90-100% answered fluently:** You OWN this project. Ready for interviews.  
**70-89%:** You understand the project. Backfill gaps with Anki cards.  
**50-69%:** Surface-level knowledge. Re-read code and add inline comments explaining WHY.  
**<50%:** You don't own this project yet. Re-implement one feature from scratch.

---

## How to Use This File

1. **First Pass (Today):** Go through each section WITHOUT looking at code. Check boxes you can answer fluently.
2. **Identify Gaps:** Any unchecked box = create an Anki card or re-read that part of the code.
3. **Weekly Review:** Every Sunday, randomly pick 20 questions and answer them. Track your score.
4. **Before Interviews:** Go through all questions one more time. If you hit 90%+, you're ready.

---

**Last Updated:** Dec 1, 2025  
**Total Questions:** 150+  
**Target Score:** 90%+ for interview readiness
