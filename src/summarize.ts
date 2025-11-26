// src/summarize.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface FolderSummary {
  folderPath: string;
  noteCount: number;
  summary: string;
  themes?: string[];
}

/**
 * Read all markdown files in a folder (non-recursive) (it will not go into the subfolders)
 */
function readMarkdownFiles(folderPath: string): { title: string; content: string }[] {
  const notes: { title: string; content: string }[] = [];
  
  // Check if folder exists
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }
  
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);
    
    // Only process markdown files (not subdirectories)
    if (stat.isFile() && file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      notes.push({
        title: file.replace('.md', ''),
        content: content
      });
    }
  }
  
  return notes;
}

/**
 * Generate a 200-word summary of all notes in a folder
 */
export async function summarizeFolder(folderPath: string): Promise<FolderSummary> {
  // Read all markdown files
  const notes = readMarkdownFiles(folderPath);
  
  if (notes.length === 0) {
    return {
      folderPath,
      noteCount: 0,
      summary: "No markdown files found in this folder."
    };
  }
  
  // Prepare content for AI analysis
  const folderName = path.basename(folderPath);
  const noteContents = notes.map(note => {
    return `--- ${note.title} ---\n${note.content}\n`;
  }).join('\n');
  
  const prompt = `You are analyzing ${notes.length} personal notes from an Obsidian vault folder called "${folderName}".

Notes:
${noteContents}

Provide a 200-word summary covering:
- Main themes and recurring topics
- Time period or date range (if mentioned in notes)
- Key insights, patterns, or notable moments
- Overall tone and sentiment
- Any significant trends or changes over time

Write the summary in a narrative style, as if explaining to the note author what their folder contains. Be specific and reference concrete details from the notes.

Summary (200 words):`;

  // Generate summary with Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const summary = result.response.text().trim();
  
  return {
    folderPath,
    noteCount: notes.length,
    summary
  };
}

// CLI usage example
if (require.main === module) {
  const folderPath = process.argv[2];
  
  if (!folderPath) {
    console.error('Usage: ts-node summarize.ts <folder-path>');
    process.exit(1);
  }
  
  summarizeFolder(folderPath)
    .then(result => {
      console.log(`\n📁 Folder: ${result.folderPath}`);
      console.log(`📝 Notes analyzed: ${result.noteCount}`);
      console.log(`\n✨ Summary:\n${result.summary}\n`);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}
