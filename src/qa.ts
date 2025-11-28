// src/qa.ts
// Q&A System - Ask questions about your vault and get AI-powered answers

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface QAResult {
  question: string;
  answer: string;
  sourcesUsed: number;
  contextSizeTokens?: number;
}

/**
 * Read all markdown files from a vault path
 * Returns array of { filePath, content, title }
 */
function readVaultFiles(vaultPath: string): Array<{ filePath: string; content: string; title: string }> {
  const files: Array<{ filePath: string; content: string; title: string }> = [];

  function readDirectory(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories and node_modules
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          readDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const title = path.basename(entry.name, '.md');
          files.push({ filePath: fullPath, content, title });
        } catch (error) {
          console.warn(`Warning: Could not read ${fullPath}`);
        }
      }
    }
  }

  readDirectory(vaultPath);
  return files;
}

/**
 * Smart context selection - only include relevant notes
 * Uses keyword matching to find most relevant notes for the question
 */
function selectRelevantNotes(
  question: string,
  allFiles: Array<{ filePath: string; content: string; title: string }>,
  maxNotes: number = 20
): Array<{ filePath: string; content: string; title: string }> {
  // Extract keywords from question (simple approach: split and filter)
  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3) // Only words longer than 3 chars
    .filter((word) => !['what', 'when', 'where', 'which', 'about', 'this', 'that', 'with', 'from', 'have', 'been'].includes(word));

  // Score each file based on keyword matches
  const scoredFiles = allFiles.map((file) => {
    const contentLower = file.content.toLowerCase();
    const titleLower = file.title.toLowerCase();

    let score = 0;

    // Check each keyword
    keywords.forEach((keyword) => {
      // Title matches are worth more
      if (titleLower.includes(keyword)) {
        score += 10;
      }

      // Count occurrences in content
      const regex = new RegExp(keyword, 'gi');
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    return { ...file, score };
  });

  // Sort by score (highest first) and take top N
  return scoredFiles
    .filter((file) => file.score > 0) // Only files with at least one match
    .sort((a, b) => b.score - a.score)
    .slice(0, maxNotes);
}

/**
 * Build context string from selected notes
 * Includes note titles for better AI understanding
 */
function buildContext(notes: Array<{ filePath: string; content: string; title: string }>): string {
  let context = 'Here are the relevant notes from the vault:\n\n';

  notes.forEach((note, idx) => {
    context += `--- Note ${idx + 1}: ${note.title} ---\n`;
    context += note.content.substring(0, 2000); // Limit each note to 2000 chars
    context += '\n\n';
  });

  return context;
}

/**
 * Answer a question about the vault using AI
 * 
 * @param question - The question to answer
 * @param vaultPath - Path to the Obsidian vault
 * @param maxNotes - Maximum number of notes to include in context (default: 20)
 * @returns QAResult with answer and metadata
 */
export async function answerQuestion(
  question: string,
  vaultPath: string,
  maxNotes: number = 20
): Promise<QAResult> {
  try {
    // Step 1: Read all vault files
    console.log('📖 Reading vault files...');
    const allFiles = readVaultFiles(vaultPath);
    console.log(`   Found ${allFiles.length} markdown files`);

    if (allFiles.length === 0) {
      throw new Error('No markdown files found in vault');
    }

    // Step 2: Select most relevant notes
    console.log('🔍 Selecting relevant notes...');
    const relevantNotes = selectRelevantNotes(question, allFiles, maxNotes);
    console.log(`   Selected ${relevantNotes.length} relevant notes`);

    if (relevantNotes.length === 0) {
      // If no relevant notes found, use a random sample
      console.log('   No keyword matches - using recent notes');
      const recentNotes = allFiles.slice(0, Math.min(10, allFiles.length));
      relevantNotes.push(...recentNotes);
    }

    // Step 3: Build context
    const context = buildContext(relevantNotes);
    const contextTokens = Math.ceil(context.length / 4); // Rough token estimate

    // Step 4: Create prompt for Gemini
    const prompt = `You are an intelligent assistant helping to answer questions about a personal knowledge vault (Obsidian notes).

Context from vault:
${context}

Question: ${question}

Instructions:
- Answer based ONLY on the provided notes
- Be specific and cite note titles when relevant
- If the answer isn't in the notes, say "I don't have enough information in your vault to answer this."
- Be concise but thorough
- Use a friendly, helpful tone

Answer:`;

    // Step 5: Send to Gemini API
    console.log('🤖 Asking Gemini AI...');
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return {
      question,
      answer,
      sourcesUsed: relevantNotes.length,
      contextSizeTokens: contextTokens,
    };
  } catch (error: any) {
    throw new Error(`Q&A failed: ${error.message}`);
  }
}

// CLI interface for standalone testing
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx ts-node qa.ts <vault-path> <question>');
    console.log('Example: npx ts-node qa.ts "./Personal Vault" "What were my main goals in November?"');
    process.exit(1);
  }

  const vaultPath = args[0];
  const question = args.slice(1).join(' ');

  answerQuestion(question, vaultPath)
    .then((result) => {
      console.log('\n' + '='.repeat(80));
      console.log(`❓ Question: ${result.question}`);
      console.log('='.repeat(80));
      console.log(`\n✨ Answer:\n${result.answer}\n`);
      console.log('='.repeat(80));
      console.log(`📊 Sources used: ${result.sourcesUsed} notes`);
      console.log(`📏 Context size: ~${result.contextSizeTokens} tokens`);
      console.log('='.repeat(80) + '\n');
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
