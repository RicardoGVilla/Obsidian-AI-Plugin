// src/index.ts
// Interactive CLI interface for AI Vault Assistant

import * as readline from 'readline';
import { categorizeNote } from './categorize';
import { summarizeFolder } from './summarize';
import { analyzePattern } from './analyze';
import { answerQuestion } from './qa';
import { generateVaultReport } from './batch';
import * as fs from 'fs';
import * as path from 'path';

// Default vault path (can be customized)
const DEFAULT_VAULT = '/Users/ricardogutierrez/Desktop/Notetaking Personal Automation Project/Personal Vault';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisified question helper
function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('\n🧠 AI Vault Assistant - Interactive Mode\n');

  // Show menu
  console.log('What would you like to do?\n');
  console.log('  1. 📄 Categorize a note');
  console.log('  2. 📁 Summarize a folder');
  console.log('  3. 🔍 Analyze keyword patterns');
  console.log('  4. 💬 Ask a question about your vault');
  console.log('  5. 📊 Generate vault report');
  console.log('  6. ❌ Exit\n');

  const choice = await question('Enter your choice (1-6): ');

  if (choice === '6') {
    console.log('\n👋 Goodbye!\n');
    rl.close();
    process.exit(0);
  }

  // Handle each action
  try {
    switch (choice) {
      case '1':
        await handleCategorize();
        break;

      case '2':
        await handleSummarize();
        break;

      case '3':
        await handleAnalyze();
        break;

      case '4':
        await handleQA();
        break;

      case '5':
        await handleBatch();
        break;

      default:
        console.log('\n❌ Invalid choice. Please enter 1-6.\n');
        await main();
        return;
    }

    // Ask if they want to do something else
    const continueUsing = await question('\nDo you want to perform another action? (y/n): ');

    if (continueUsing.toLowerCase() === 'y' || continueUsing.toLowerCase() === 'yes') {
      await main(); // Recursive call
    } else {
      console.log('\n👋 Goodbye!\n');
      rl.close();
    }
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}\n`);
    rl.close();
    process.exit(1);
  }
}

async function handleCategorize() {
  console.log('\n📄 Categorize a note\n');
  
  const defaultPath = `${DEFAULT_VAULT}/JOURNAL/Reflections/2025/2025-01-01.md`;
  console.log(`Default path: ${defaultPath}`);
  
  let notePath = await question('Enter note path (or press Enter for default): ');
  notePath = notePath.trim() || defaultPath;

  // Validate
  if (!fs.existsSync(notePath)) {
    console.log('❌ File not found. Please try again.');
    return await handleCategorize();
  }

  if (!notePath.endsWith('.md')) {
    console.log('❌ Must be a markdown (.md) file. Please try again.');
    return await handleCategorize();
  }

  console.log('\n⏳ Categorizing note...\n');

  const noteContent = fs.readFileSync(notePath, 'utf-8');
  const category = await categorizeNote(noteContent);

  console.log(`\n📄 Note: ${path.basename(notePath)}`);
  console.log(`📁 Category: ${category}\n`);
}

async function handleSummarize() {
  console.log('\n📁 Summarize a folder\n');
  
  const defaultPath = `${DEFAULT_VAULT}/JOURNAL/Reflections/2025`;
  console.log(`Default path: ${defaultPath}`);
  
  let folderPath = await question('Enter folder path (or press Enter for default): ');
  folderPath = folderPath.trim() || defaultPath;

  // Validate
  if (!fs.existsSync(folderPath)) {
    console.log('❌ Folder not found. Please try again.');
    return await handleSummarize();
  }

  if (!fs.statSync(folderPath).isDirectory()) {
    console.log('❌ Must be a folder. Please try again.');
    return await handleSummarize();
  }

  console.log('\n⏳ Analyzing folder...\n');

  const result = await summarizeFolder(folderPath);

  console.log(`\n📁 Folder: ${path.basename(folderPath)}`);
  console.log(`📝 Notes analyzed: ${result.noteCount}`);
  console.log(`\n✨ Summary:\n${result.summary}\n`);
}

async function handleAnalyze() {
  console.log('\n🔍 Analyze keyword patterns\n');
  
  const defaultPath = `${DEFAULT_VAULT}/JOURNAL/Reflections/2025`;
  console.log(`Default path: ${defaultPath}`);
  
  let folderPath = await question('Enter folder path (or press Enter for default): ');
  folderPath = folderPath.trim() || defaultPath;

  // Validate folder
  if (!fs.existsSync(folderPath)) {
    console.log('❌ Folder not found. Please try again.');
    return await handleAnalyze();
  }

  if (!fs.statSync(folderPath).isDirectory()) {
    console.log('❌ Must be a folder. Please try again.');
    return await handleAnalyze();
  }

  const keyword = await question('Enter keyword to analyze: ');
  
  if (!keyword.trim()) {
    console.log('❌ Please enter a keyword.');
    return await handleAnalyze();
  }

  const includeAIInput = await question('Include AI insights? (y/n, default: y): ');
  const includeAI = includeAIInput.toLowerCase() !== 'n' && includeAIInput.toLowerCase() !== 'no';

  console.log(`\n⏳ Analyzing pattern for "${keyword}"...\n`);

  const result = await analyzePattern(folderPath, keyword, includeAI);

  console.log(`\n🔍 Pattern Analysis: "${result.keyword}"`);
  console.log(`📁 Folder: ${path.basename(folderPath)}`);
  console.log(`\n📊 Statistics:`);
  console.log(`   Total mentions: ${result.totalMentions}`);
  console.log(`   Notes containing keyword: ${result.notesWithKeyword}/${result.totalNotes}`);

  if (result.firstMention) {
    console.log(`\n📅 Timeline:`);
    console.log(`   First mention: ${result.firstMention}`);
    console.log(`   Last mention: ${result.lastMention}`);
    console.log(`   Peak period: ${result.peakPeriod}`);
    console.log(`   Trend: ${result.trend}`);
  }

  console.log(`\n📝 Example snippets:`);
  result.examples.forEach((ex, idx) => {
    console.log(`   ${idx + 1}. [${ex.date || 'undated'}] ${ex.noteTitle}`);
    console.log(`      "${ex.snippet.substring(0, 100)}..."`);
  });

  if (result.aiInsights) {
    console.log(`\n✨ AI Insights:`);
    console.log(`   ${result.aiInsights}\n`);
  }
}

async function handleQA() {
  console.log('\n💬 Ask a question about your vault\n');
  
  const vaultPath = DEFAULT_VAULT;

  const question_text = await question('Enter your question: ');
  
  if (!question_text.trim()) {
    console.log('❌ Please enter a question.');
    return await handleQA();
  }

  console.log('\n⏳ Searching vault and analyzing...\n');

  const result = await answerQuestion(question_text, vaultPath);

  console.log('\n' + '='.repeat(80));
  console.log(`❓ Question: ${result.question}`);
  console.log('='.repeat(80));
  console.log(`\n✨ Answer:\n${result.answer}\n`);
  console.log('='.repeat(80));
  console.log(`📊 Sources used: ${result.sourcesUsed} notes`);
  if (result.contextSizeTokens) {
    console.log(`📏 Context size: ~${result.contextSizeTokens} tokens`);
  }
  console.log('='.repeat(80) + '\n');
}

async function handleBatch() {
  console.log('\n📊 Generate vault report\n');
  
  const vaultPath = DEFAULT_VAULT;

  console.log('⏳ Analyzing vault (this may take a moment)...\n');

  const report = await generateVaultReport(vaultPath);

  console.log('\n' + '='.repeat(80));
  console.log('📊 VAULT ANALYSIS REPORT');
  console.log('='.repeat(80));
  
  console.log('\n📈 STATISTICS:');
  console.log(`   Total notes: ${report.totalNotes}`);
  console.log(`   Total folders: ${report.totalFolders}`);
  console.log(`\n   Notes by folder:`);
  report.folderBreakdown
    .sort((a, b) => b.noteCount - a.noteCount)
    .forEach(folder => {
      console.log(`      ${folder.name}: ${folder.noteCount} (${folder.percentage.toFixed(1)}%)`);
    });

  if (report.monthlyActivity.length > 0) {
    console.log(`\n   Recent activity (last 6 months):`);
    report.monthlyActivity
      .slice(0, 6)
      .forEach(activity => {
        console.log(`      ${activity.month}: ${activity.noteCount} notes`);
      });
  }

  console.log('\n📁 FOLDER SUMMARIES:');
  Object.entries(report.folderSummaries).forEach(([folder, summary]) => {
    console.log(`\n   ${folder}:`);
    console.log(`      ${summary}`);
  });

  console.log('\n🔑 TOP THEMES:');
  report.topThemes.forEach((theme, idx) => {
    console.log(`   ${idx + 1}. ${theme}`);
  });

  console.log('\n💡 SUGGESTIONS:');
  report.suggestions.forEach((suggestion, idx) => {
    console.log(`   ${idx + 1}. ${suggestion}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}


// Run main if executed directly
if (require.main === module) {
  main();
}

export { main };

