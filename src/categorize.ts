// src/categorize.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { CategoryCache } from './vault-structure';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Global cache instance (shared across all categorization calls)
const categoryCache = new CategoryCache();

export async function categorizeNote(noteContent: string, vaultPath: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // Get categories from vault structure (uses cache to avoid re-scanning)
  const categories = await categoryCache.getCategories(vaultPath);
  
  // Build dynamic category list for LLM
  const categoryList = categories.map(cat => {
    if (cat.description) {
      return `${cat.name} - ${cat.description}`;
    }
    return cat.name;
  }).join('\n');
  
  const prompt = `You are analyzing personal notes from an Obsidian vault.

Available categories (discovered from vault structure):
${categoryList}

Analyze this note and return ONLY the category name that best matches.
If none match well, return the closest category name.

Note content:
${noteContent}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Invalidate category cache (useful if vault structure changes)
 */
export function refreshCategories(): void {
  categoryCache.invalidate();
}

// CLI usage example
if (require.main === module) {
  const notePath = process.argv[2];
  const vaultPath = process.argv[3] || '/Users/ricardogutierrez/Desktop/Notetaking Personal Automation Project/Personal Vault';
  
  if (!notePath) {
    console.error('Usage: ts-node categorize.ts <note-file-path> [vault-path]');
    console.error('Example: ts-node categorize.ts "/path/to/note.md" "/path/to/vault"');
    process.exit(1);
  }

  // Check if file exists
  if (!fs.existsSync(notePath)) {
    console.error(`Error: File not found: ${notePath}`);
    process.exit(1);
  }

  // Read note content
  const noteContent = fs.readFileSync(notePath, 'utf-8');
  
  categorizeNote(noteContent, vaultPath)
    .then(category => {
      console.log(`\n📄 Note: ${notePath}`);
      console.log(`📁 Category: ${category}\n`);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}