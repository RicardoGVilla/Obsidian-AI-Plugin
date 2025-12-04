# 🧠 Obsidian AI Plugin

> AI-powered automation that transforms your Obsidian vault into an intelligent knowledge assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gemini API](https://img.shields.io/badge/Gemini-8E75B2?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## The Problem

Managing a large Obsidian vault becomes overwhelming:
- **500+ notes** across 8 years with no clear categorization
- Hard to remember what's buried in folders
- Can't find themes or patterns across notes
- Basic keyword search doesn't understand context

**What if your notes could organize themselves?**

---

## The Solution

This plugin brings **AI-powered automation** to Obsidian using Google's Gemini API:

✅ **Auto-categorize** any note (Career, Health, Journal, Projects, etc.)  
✅ **Summarize folders** (get 200-word AI summary of any folder's themes)  
✅ **Detect patterns** (search keywords, find trends, get AI insights)  
✅ **Ask questions** about your vault (Q&A system with context)  
✅ **Batch process** your entire vault (vault-wide reports and statistics)  
✅ **Visual UI** inside Obsidian (side panel with buttons, no terminal needed)  
✅ **CLI interface** for power users (run commands from terminal)

---

## Demo

### CLI Interface (Features 1-3)
```bash
# Categorize a note
$ npm run cli categorize "./Personal Vault/random-note.md"
✓ This note belongs in: CAREER

# Summarize a folder
$ npm run cli summarize "./Personal Vault/JOURNAL"
✓ Summary: 47 journal entries from 2025. Main themes: 
career anxiety, social isolation in Montreal, Grace 
incident impact on confidence, desire to escape 
PrimeFreight, job hunting challenges...

# Analyze patterns
$ npm run cli analyze "./Personal Vault/JOURNAL" "isolation"
✓ Pattern detected:
  - Mentions: 47
  - First mention: Jan 2025
  - Peak: Nov 2025
  - Trend: Increasing
  - AI Insight: Social isolation has increased since 
    moving to Montreal, with spikes after the Grace incident...
```

### Obsidian UI (Feature 7 - Coming Dec 15)
**Side Panel with 3 Tabs:**
- **Quick Actions:** Categorize note, Summarize folder, Analyze pattern (button clicks)
- **Q&A:** Ask "What were my main goals in November?" → Get AI answer with source links
- **Vault Report:** See stats, uncategorized notes, organization suggestions

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| **File Categorization** | ✅ LIVE | Analyzes note content → suggests best category |
| **Folder Summarization** | ✅ LIVE | Reads all notes in folder → 200-word AI summary |
| **Pattern Analysis** | ✅ LIVE | Keyword search → word frequency → AI insights |
| **CLI Interface** | ✅ LIVE | Professional terminal interface for all features |
| **Q&A System** | ✅ LIVE | Ask questions about your vault, get AI answers |
| **Batch Processing** | ✅ LIVE | Vault-wide analysis and reports |
| **Obsidian Plugin UI** | ✅ LIVE | Visual interface inside Obsidian (3-tab panel) |

**Current Progress:** 7/7 features complete (100%) ✅ **PROJECT COMPLETE**

---

## Tech Stack

### **Core Technologies**
- **TypeScript** - Type-safe, maintainable code
- **Node.js** - Runtime for file system access
- **Google Gemini API** - Free, powerful LLM for AI features
- **Commander.js** - Professional CLI framework

### **Why These Choices?**

**TypeScript over JavaScript:**  
Catches bugs at compile time, not runtime. Self-documenting code with strong typing.

**Gemini API over OpenAI:**  
- Free tier (no API costs)
- 1 million tokens/month
- Comparable quality for summarization tasks
- Lower latency for batch operations

**Node.js over Python:**  
Better integration with Obsidian plugin ecosystem (JavaScript/TypeScript based). Faster file I/O for large vaults.

**Modular Architecture:**  
Each feature is a separate module (`categorize.ts`, `summarize.ts`, `analyze.ts`). Easy to test, extend, and reuse. Clean separation of concerns (Gemini API wrapper, file system utilities).

---

## Installation & Usage

### **Prerequisites**
```bash
# Required
- Obsidian (v1.0+)
- Google Gemini API key (free from https://ai.google.dev)
```

### **Installation Methods**

#### **Method 1: Obsidian Community Plugins** (Recommended - Coming to Community Plugin Store)
1. Open Obsidian → Settings
2. Go to **Community Plugins** → Click **Browse**
3. Search for **"AI Life Assistant"**
4. Click **Install**, then **Enable**
5. Go to plugin settings and paste your Gemini API key
6. Click the brain icon (🧠) in the left ribbon to open the panel

#### **Method 2: Manual Installation (For Testing)**
1. Download this repository
2. Copy the plugin folder to: `.obsidian/plugins/ai-life-assistant/` in your vault
3. Enable in Obsidian Settings → Community Plugins
4. Configure API key in plugin settings

### **Getting Your Gemini API Key**
1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Paste it in plugin settings (Settings → AI Life Assistant → API Key field)

### **Using the Plugin**

**In Obsidian:**
1. Click the brain icon (🧠) in the left sidebar → Side panel opens
2. Choose a tab:

#### **Quick Actions Tab**
- **Categorize Current Note** - Suggests a category for the active note (Career, Health, Journal, etc.)
- **Summarize Current Folder** - Creates a 200-word AI summary of all notes in the folder
- **Analyze Pattern** - Search for a keyword and find trends across your vault

#### **Q&A Tab**
- Type any question: "What were my main goals in November?"
- Press Enter or click "Ask Question"
- Get AI-powered answers based on your vault content
- Results show the answer + number of sources used

#### **Reports Tab**
- Click **"Generate Vault Report"** to analyze your entire vault
- See:
  - Total notes and folders
  - Folder breakdown with percentages
  - Top themes across your vault
  - Organization suggestions

### **CLI Usage** (For Power Users)
```bash
# Build the project
npm install
npm run build

# Categorize a note
npm run cli categorize "./path/to/note.md"

# Summarize a folder
npm run cli summarize "./path/to/folder"

# Analyze keyword patterns
npm run cli analyze "./path/to/folder" "keyword"

# Ask a question
npm run cli qa "./path/to/vault" "Your question here"

# Generate full vault report
npm run cli batch "./path/to/vault"
```

### **Configuration**

Settings are accessible in Obsidian → Settings → AI Life Assistant:

| Setting | Description | Default |
|---------|-------------|---------|
| **Gemini API Key** | Your Google Gemini API key (required) | Empty |

---

## How It Works

### **Architecture**

**Backend Logic (TypeScript modules):**
- `categorize.ts` - Sends note content to Gemini, gets category suggestion
- `summarize.ts` - Reads all files in folder, combines, summarizes with Gemini
- `analyze.ts` - Keyword search across vault, word frequency analysis, AI trend detection
- `qa.ts` - Searches vault for relevant notes, scores by keyword match, sends top 10 to Gemini
- `batch.ts` - Reads entire vault, generates statistics, samples notes, creates comprehensive report

**UI Layers:**
- **Obsidian Plugin UI** (main.ts) - Side panel with 3 tabs, buttons, settings
- **CLI Interface** (index.ts) - Terminal commands for power users
- Both use the same backend functions

### **API Calls**

- **Gemini API**: Called for all AI operations (categorization, summarization, pattern analysis, Q&A)
- **Free Tier**: 1 million tokens/month = ~200 vault analyses
- **Cost**: $0 (unless you exceed free tier)
- **Latency**: ~1-3 seconds per API call

### **Privacy**

- Your vault data **never leaves your computer** (except Gemini API calls)
- API key stored locally in Obsidian's plugin data folder (`.obsidian/plugins/ai-life-assistant/data.json`)
- Files are only read from disk, not uploaded anywhere
- Only the content you request analysis on is sent to Gemini

---

## Project Structure

```
obsidian-ai-plugin/
├── src/
│   ├── categorize.ts      # Feature 1: Auto-categorization ✅
│   ├── summarize.ts       # Feature 2: Folder summaries ✅
│   ├── analyze.ts         # Feature 3: Pattern detection ✅
│   ├── index.ts           # Feature 4: CLI interface 🎯
│   ├── qa.ts              # Feature 5: Q&A system 📅
│   ├── batch.ts           # Feature 6: Batch processing 📅
│   ├── main.ts            # Feature 7: Obsidian plugin 📅
│   └── utils/
│       ├── gemini.ts      # Gemini API wrapper
│       └── fileSystem.ts  # File reading utilities
├── package.json
├── tsconfig.json
├── README.md              # This file
├── PROJECT-PLAN.md        # Internal development roadmap
└── .gitignore
```

---

## Development Journey

### **Why I Built This**

I've been using Obsidian for 8 years as my second brain. 500+ notes later, I couldn't remember what was in half my folders. Basic search wasn't enough—I needed AI to understand **context**, not just keywords.

**This project solved my real problem:** organizing chaos without manual tagging.

### **Key Challenges Solved**

**1. Context Window Management (Q&A System)**  
Challenge: Gemini has a 30K token limit. How do I let users ask questions about a 500-note vault?  
Solution: Smart chunking - only send relevant notes (keyword search → rank by relevance → send top 10). Result: Fast responses, accurate answers.

**2. Recursive File Reading (Folder Summarization)**  
Challenge: Folders can be nested 5+ levels deep. Read everything without crashes?  
Solution: Used `fs.readdir` recursively with try/catch for corrupted files. Added progress logging for large folders (user feedback during 30-second summaries).

**3. Pattern Detection (Analyze Feature)**  
Challenge: Find trends in unstructured journal entries over 8 years.  
Solution: Built word frequency counter with `Map<string, number>`, then used Gemini to interpret trends (not just count words, but explain WHY they're increasing).

**4. Error Handling (Production-Ready Code)**  
Challenge: Users will pass weird inputs (empty files, binary files, corrupted markdown).  
Solution: Graceful failures at every layer - file read errors → skip file, log warning. Gemini API errors → retry 3 times with exponential backoff. User-friendly error messages (not just stack traces).

---

## What I Learned

### **Technical Skills**
- **TypeScript async/await patterns** (proper error handling with try/catch, Promise.all for parallel API calls)
- **File system operations** (recursive directory reading, path normalization, handling edge cases)
- **API integration** (request/response flow, rate limiting, retry logic, streaming responses)
- **CLI design** (argument parsing, help menus, user-friendly output formatting)
- **Map vs Object in TypeScript** (when to use each for performance)

### **Software Engineering**
- **Modular architecture** (single responsibility principle - each feature is one file)
- **Error handling** (graceful degradation, user-facing error messages)
- **Version control** (30+ commits with clear messages, atomic commits, clean Git history)
- **Documentation** (README for users, PROJECT-PLAN for developers, inline comments for complex logic)
- **Testing strategies** (manual testing checklist, edge case handling, integration testing)

### **Problem-Solving Process**
1. **Identify real problem** (my vault was chaos)
2. **Research solutions** (explored Gemini, OpenAI, local LLMs → chose Gemini for cost + quality)
3. **Implement incrementally** (7 features over 3 weeks, not all at once)
4. **Iterate based on testing** (improved prompts after testing on real vault data)
5. **Ship working code** (3 features live, 4 more planned with deadlines)

---

## Roadmap

### **Phase 1: Foundation (Nov 25 - Dec 1)** ✅ Complete
- ✅ Feature 1: File Categorization (Nov 24)
- ✅ Feature 2: Folder Summarization (Nov 25)
- ✅ Feature 3: Pattern Analysis (Nov 26)
- ✅ Feature 4: CLI Interface (Nov 27-28)

### **Phase 2: Intelligence (Dec 2-8)** ✅ Complete
- ✅ Feature 5: Q&A System (Dec 2-3)
- ✅ Feature 6: Batch Processing (Dec 4-5)
- ✅ Integration testing, output formatting

### **Phase 3: UI & Deploy (Dec 9-15)** ✅ Complete
- ✅ Feature 7: Obsidian Plugin UI (Dec 3-4)
- ✅ All 7 features working and tested
- 🎯 Documentation (in progress)
- 📅 Demo video (Dec 14)
- 📅 v1.0 release (Dec 15)

---

## Future Improvements

**Post-Launch Ideas:**
- **Link suggestions:** AI recommends connections between notes (build knowledge graph)
- **Auto-tagging:** Generate tags based on content (beyond categories)
- **Time-based insights:** "Your focus shifted from X to Y in Q3 2025"
- **Export reports:** PDF summaries of vault analysis
- **Multi-language support:** Analyze notes in French, Spanish, etc.
- **Local LLM option:** Use Ollama for privacy-focused users (no API calls)

---

## Why This Project Matters

### **For Employers:**
1. **Solves Real Problem:** Not a tutorial project—I use this tool daily
2. **Modern Tech:** AI/LLM integration shows I'm current with emerging tech
3. **Full-Stack Thinking:** Backend logic → CLI → UI (understands user needs at every level)
4. **Self-Taught Initiative:** Built while working full-time (nights, weekends, 6 AM mornings)
5. **Production Quality:** Error handling, testing, documentation, clean Git history
6. **Deployed & Working:** Live GitHub repo, not vaporware

### **For Me:**
- **Interview Stories:** 7 features = 7 STAR stories ready
- **Live Demo:** Can show working tool in real interviews (not slides)
- **Technical Depth:** Can explain every line of code, every architectural decision
- **Problem-Solving:** Clear narrative from problem → research → implementation → iteration

---

## Performance Metrics

**Categorization:** < 2 seconds per note  
**Summarization:** ~30 seconds per folder (100 notes)  
**Pattern Analysis:** ~15 seconds per folder (keyword search + AI insights)  
**API Cost:** $0 (Gemini free tier covers 1M tokens/month)  

**Vault Tested:** 500+ notes, 8 years of data, nested folders 5 levels deep

---

## Contact & Links

**Developer:** Ricardo Gutierrez  
**Location:** Montreal, QC (originally El Salvador 🇸🇻)  
**GitHub:** [@RicardoGVilla](https://github.com/RicardoGVilla)  
**LinkedIn:** [linkedin.com/in/ricardogutierrez](https://linkedin.com/in/ricardogutierrez)  
**Project Repo:** [github.com/RicardoGVilla/Obsidian-AI-Plugin](https://github.com/RicardoGVilla/Obsidian-AI-Plugin)  
**Demo Video:** [YouTube Link - Coming Dec 15]  

---

## License

MIT License - feel free to use, modify, and distribute

---

## Acknowledgments

- **Obsidian Community** for building an extensible knowledge management tool
- **Google Gemini Team** for free AI API access
- **TypeScript Team** for making JavaScript maintainable
- **My Vault** for 8 years of chaos that inspired this solution

---

**Built with ☕ at 6 AM, while working full-time, because real problems need real solutions.**

**Status:** v1.0 COMPLETE (All 7 features live) | **Launch Date:** Dec 4, 2025 ✅

*Last Updated: Dec 4, 2025*
