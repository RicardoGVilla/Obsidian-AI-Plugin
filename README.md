# 🧠 AI Life Assistant - Obsidian Plugin

> Transform your Obsidian vault into an intelligent knowledge assistant powered by Google Gemini

[![Obsidian](https://img.shields.io/badge/Obsidian-3666AB?style=flat&logo=obsidian&logoColor=white)](https://obsidian.md/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini API](https://img.shields.io/badge/Gemini%20API-8E75B2?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Release](https://img.shields.io/badge/Release-v1.0.0-blue.svg)](https://github.com/RicardoGVilla/Obsidian-AI-Plugin/releases)

---

## 🎯 What This Plugin Does

**AI Life Assistant** automates vault management using AI:

✨ **Categorize Notes** - Automatically suggest categories for any note  
📋 **Summarize Folders** - Get AI-generated summaries of folder contents  
🔍 **Analyze Patterns** - Search keywords and discover trends in your notes  
💬 **Ask Questions** - Natural language Q&A about your entire vault  
📊 **Vault Reports** - Generate comprehensive statistics and insights  
🎨 **Beautiful UI** - Side panel with tabs, buttons, and visual results  

All powered by **Google Gemini API** (free tier available)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Auto-Categorization** | AI suggests the best category for any note |
| **Folder Summarization** | 200-word AI summary of an entire folder |
| **Pattern Detection** | Find keyword mentions and AI-powered trend analysis |
| **Q&A System** | Ask natural language questions, get AI answers |
| **Vault Reports** | Statistics, folder breakdown, top themes |
| **Side Panel UI** | 3-tab interface inside Obsidian |
| **CLI Commands** | Run features from terminal for power users |

---

## 🚀 Quick Start

### Installation

1. **Open Obsidian** → Settings → Community Plugins → Browse
2. **Search** for "AI Life Assistant"
3. **Install** and **Enable**
4. **Go to settings** and paste your free Gemini API key

### Get Your API Key (Free)

1. Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Paste in plugin settings

### Use It

1. Click the brain icon (🧠) in the left sidebar
2. Choose a tab: **Quick Actions**, **Q&A**, or **Reports**
3. Click buttons or type questions

---

## 📖 Usage Guide

### Quick Actions Tab

**Categorize Current Note**
- Analyzes the active note
- Suggests the best category (Career, Health, Journal, Projects, etc.)
- Shows result in notification

**Summarize Current Folder**
- Reads all notes in the current folder
- Generates a 200-word AI summary
- Displays key themes and topics

**Analyze Pattern**
- Search for a keyword across your entire vault
- Finds frequency and context
- Returns AI insights on trends

### Q&A Tab

Ask questions about your vault, get AI-powered answers:

**Example questions:**
- "What were my main goals last month?"
- "What did I learn about this topic?"
- "How has my perspective on X changed?"

The plugin searches your vault, finds relevant notes, and generates an answer with sources.

### Reports Tab

Generate comprehensive vault analysis:

**See:**
- Total notes and folders
- Notes per folder (with percentages)
- Top themes across your vault
- Organization suggestions

---

## 🔧 Technical Details

### How It Works

1. **You click a button** in the side panel
2. **Plugin reads your notes** from disk (stays local)
3. **Sends content to Gemini API** (Google's free LLM)
4. **API returns analysis** (categorization, summary, insights, etc.)
5. **Results display in the plugin** (in seconds)

### Privacy & Data

✅ **Your vault stays local** - Files only read from your computer  
✅ **Optional API calls** - Only the content you request is sent to Gemini  
✅ **Free tier** - 1 million tokens/month (covers ~200 vault analyses)  
✅ **No tracking** - Plugin doesn't collect any data about you  
✅ **Open source** - Code is public on GitHub for transparency  

---

## 💡 Use Cases

**For Students & Researchers:**
- Quickly find related notes across semesters
- Summarize readings and lectures
- Discover connections between concepts

**For Writers & Journalists:**
- Analyze trends in your notes
- Organize story ideas by theme
- Generate summaries of research

**For Personal Knowledge Management:**
- Organize chaotic note-taking habits
- Find patterns in journaling
- Understand your vault at a glance

**For Project Management:**
- Categorize project notes automatically
- Generate status reports from notes
- Track project themes and patterns

---

## ⚙️ Requirements

- **Obsidian** (v1.0 or later)
- **Internet connection** (for Gemini API calls)
- **Free Google Gemini API key** (no credit card required)

---

## 🤔 FAQ

**Q: Is my data private?**  
A: Yes! Your vault files stay on your computer. Only the content you explicitly request to analyze is sent to Google's Gemini API.

**Q: Do I need to pay?**  
A: No! Google's Gemini API is free for the first 1 million tokens per month. Most users won't exceed this.

**Q: Can I use this offline?**  
A: The plugin needs internet to call Gemini API. File reading is local, but AI features require connectivity.

**Q: Will it work with my large vault?**  
A: Yes! The plugin is optimized for large vaults. Q&A searches smartly, and reports sample intelligently.

**Q: Can I run this without Obsidian?**  
A: Yes! Use the CLI commands from terminal for programmatic access.

**Q: Is this open source?**  
A: Yes! Full source code is available on [GitHub](https://github.com/RicardoGVilla/Obsidian-AI-Plugin).

---

## 🛠️ For Developers

### Building from Source

```bash
# Clone repository
git clone https://github.com/RicardoGVilla/Obsidian-AI-Plugin.git
cd Obsidian-AI-Plugin

# Install dependencies
npm install

# Build
npm run build

# Or watch for changes
npm run dev
```

### Project Structure

```
src/
├── main.ts          # Obsidian plugin entry point & UI
├── categorize.ts    # Note categorization
├── summarize.ts     # Folder summarization
├── analyze.ts       # Pattern detection
├── qa.ts            # Question answering
└── batch.ts         # Vault-wide reports
```

### Contributing

Found a bug or have a feature idea?
- [Open an issue](https://github.com/RicardoGVilla/Obsidian-AI-Plugin/issues)
- [Submit a pull request](https://github.com/RicardoGVilla/Obsidian-AI-Plugin/pulls)

---

## 📚 Resources

- **Obsidian Documentation:** [help.obsidian.md](https://help.obsidian.md)
- **Gemini API Docs:** [ai.google.dev](https://ai.google.dev)
- **GitHub Repository:** [RicardoGVilla/Obsidian-AI-Plugin](https://github.com/RicardoGVilla/Obsidian-AI-Plugin)
- **Report Issues:** [GitHub Issues](https://github.com/RicardoGVilla/Obsidian-AI-Plugin/issues)

---

## �� License

This plugin is released under the [MIT License](LICENSE) - feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- **Obsidian Team** - for building an amazing extensible platform
- **Google Gemini Team** - for free AI API access
- **Open Source Community** - for inspiration and tools

---

## 📞 Support

Having issues? Here's how to get help:

1. **Check the FAQ** above
2. **Search [GitHub Issues](https://github.com/RicardoGVilla/Obsidian-AI-Plugin/issues)**
3. **Open a new issue** with:
   - What you were trying to do
   - What error you got
   - Your Obsidian version

---

**Made with ❤️ by [Ricardo Gutierrez](https://github.com/RicardoGVilla)**

*Status: v1.0 - Fully Featured | Last Updated: December 4, 2025*
