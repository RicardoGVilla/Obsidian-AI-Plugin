// src/batch.ts
// Batch Processing - Generate vault-wide reports with statistics and AI insights

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface VaultFile {
  filePath: string;
  content: string;
  title: string;
  folder: string;
  modifiedDate: Date;
  size: number;
}

interface FolderStats {
  name: string;
  noteCount: number;
  percentage: number;
}

interface MonthlyActivity {
  month: string;
  noteCount: number;
}

interface VaultReport {
  generatedAt: Date;
  totalNotes: number;
  totalFolders: number;
  folderBreakdown: FolderStats[];
  monthlyActivity: MonthlyActivity[];
  folderSummaries: { [folder: string]: string };
  topThemes: string[];
  suggestions: string[];
}

/**
 * Read all markdown files from vault with metadata
 */
function readVaultFiles(vaultPath: string): VaultFile[] {
  const files: VaultFile[] = [];

  function readDirectory(dirPath: string, relativePath: string = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories and node_modules
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          readDirectory(fullPath, relPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const stats = fs.statSync(fullPath);
          const content = fs.readFileSync(fullPath, 'utf-8');
          const title = path.basename(entry.name, '.md');
          const folder = path.dirname(relPath) || 'Root';

          files.push({
            filePath: fullPath,
            content,
            title,
            folder,
            modifiedDate: stats.mtime,
            size: stats.size,
          });
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
 * Calculate folder statistics
 */
function calculateFolderStats(files: VaultFile[]): FolderStats[] {
  const folderCounts = new Map<string, number>();

  files.forEach((file) => {
    const topFolder = file.folder.split(path.sep)[0];
    folderCounts.set(topFolder, (folderCounts.get(topFolder) || 0) + 1);
  });

  const totalNotes = files.length;
  const stats: FolderStats[] = [];

  folderCounts.forEach((count, name) => {
    stats.push({
      name,
      noteCount: count,
      percentage: Math.round((count / totalNotes) * 100),
    });
  });

  return stats.sort((a, b) => b.noteCount - a.noteCount);
}

/**
 * Calculate monthly activity
 */
function calculateMonthlyActivity(files: VaultFile[]): MonthlyActivity[] {
  const monthCounts = new Map<string, number>();

  files.forEach((file) => {
    const monthKey = file.modifiedDate.toISOString().substring(0, 7); // YYYY-MM
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  const activity: MonthlyActivity[] = [];
  monthCounts.forEach((count, month) => {
    activity.push({ month, noteCount: count });
  });

  return activity.sort((a, b) => b.month.localeCompare(a.month)).slice(0, 12); // Last 12 months
}

/**
 * Calculate importance score for a note
 */
function calculateImportance(file: VaultFile): number {
  let score = 0;

  // Longer notes are often more important
  score += file.size / 100;

  // Recently modified = actively used
  const daysSinceModified = (Date.now() - file.modifiedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceModified < 30) score += 50;
  else if (daysSinceModified < 90) score += 25;

  // Has links to other notes = well-connected
  const linkCount = (file.content.match(/\[\[.*?\]\]/g) || []).length;
  score += linkCount * 10;

  // Has specific keywords
  if (file.content.match(/goal|important|key|critical|vision|plan/i)) {
    score += 20;
  }

  return score;
}

/**
 * Smart sampling: Select representative notes from a category
 */
function selectSampleFromCategory(categoryFiles: VaultFile[], sampleSize: number): VaultFile[] {
  if (categoryFiles.length <= sampleSize) {
    return categoryFiles;
  }

  const recentCount = Math.ceil(sampleSize * 0.4); // 40% recent
  const importantCount = Math.ceil(sampleSize * 0.3); // 30% important
  const distributedCount = sampleSize - recentCount - importantCount; // 30% distributed

  // Get recent notes
  const recentNotes = [...categoryFiles]
    .sort((a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime())
    .slice(0, recentCount);

  // Get important notes (excluding recent)
  const remaining = categoryFiles.filter((f) => !recentNotes.includes(f));
  const importantNotes = remaining
    .map((f) => ({ file: f, score: calculateImportance(f) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, importantCount)
    .map((item) => item.file);

  // Get time-distributed notes (excluding recent and important)
  const rest = remaining.filter((f) => !importantNotes.includes(f));
  const sorted = rest.sort((a, b) => a.modifiedDate.getTime() - b.modifiedDate.getTime());
  const interval = Math.floor(sorted.length / distributedCount) || 1;
  const distributedNotes: VaultFile[] = [];
  for (let i = 0; i < distributedCount && i * interval < sorted.length; i++) {
    distributedNotes.push(sorted[i * interval]);
  }

  return [...recentNotes, ...importantNotes, ...distributedNotes];
}

/**
 * Group files by top-level folder
 */
function groupByFolder(files: VaultFile[]): Map<string, VaultFile[]> {
  const groups = new Map<string, VaultFile[]>();

  files.forEach((file) => {
    const topFolder = file.folder.split(path.sep)[0];
    if (!groups.has(topFolder)) {
      groups.set(topFolder, []);
    }
    groups.get(topFolder)!.push(file);
  });

  return groups;
}

/**
 * Generate AI summaries for each folder
 */
async function generateFolderSummaries(
  folderGroups: Map<string, VaultFile[]>,
  maxNotesPerFolder: number = 15
): Promise<{ [folder: string]: string }> {
  const summaries: { [folder: string]: string } = {};

  // Build context with samples from each folder
  let context = 'Here are representative notes from each folder in the vault:\n\n';

  folderGroups.forEach((files, folderName) => {
    const sample = selectSampleFromCategory(files, Math.min(maxNotesPerFolder, files.length));

    context += `=== ${folderName} (${files.length} total notes, ${sample.length} sampled) ===\n\n`;

    sample.forEach((file) => {
      context += `--- ${file.title} ---\n`;
      context += file.content.substring(0, 1000); // Limit to 1000 chars per note
      context += '\n\n';
    });
  });

  // Ask AI to summarize each folder
  const prompt = `You are analyzing a personal knowledge vault (Obsidian notes). Below are representative samples from each folder.

${context}

For each folder, provide a 2-3 sentence thematic summary. What are the main topics and themes?

Format your response as:
FOLDER_NAME: summary here
FOLDER_NAME: summary here
...

Be concise, specific, and insightful.`;

  console.log('🤖 Generating AI summaries for folders...');
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Parse AI response into folder summaries
  const lines = response.split('\n').filter((line) => line.trim());
  lines.forEach((line) => {
    const match = line.match(/^(.+?):\s*(.+)$/);
    if (match) {
      const folderName = match[1].trim();
      const summary = match[2].trim();
      summaries[folderName] = summary;
    }
  });

  return summaries;
}

/**
 * Generate top themes across the entire vault
 */
async function generateTopThemes(files: VaultFile[], sampleSize: number = 50): Promise<string[]> {
  // Select representative sample from entire vault
  const sample = selectSampleFromCategory(files, sampleSize);

  let context = 'Here are representative notes from across the vault:\n\n';
  sample.forEach((file) => {
    context += `--- ${file.title} (${file.folder}) ---\n`;
    context += file.content.substring(0, 1000);
    context += '\n\n';
  });

  const prompt = `You are analyzing a personal knowledge vault. Based on these representative notes, identify the top 5-7 overarching themes across the entire vault.

${context}

List the main themes as a numbered list. Be specific and insightful.

Format:
1. Theme description
2. Theme description
...`;

  console.log('🤖 Generating top themes...');
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Parse numbered list
  const themes: string[] = [];
  const lines = response.split('\n').filter((line) => line.match(/^\d+\./));
  lines.forEach((line) => {
    const theme = line.replace(/^\d+\.\s*/, '').trim();
    if (theme) themes.push(theme);
  });

  return themes;
}

/**
 * Generate organization suggestions
 */
function generateSuggestions(files: VaultFile[], folderStats: FolderStats[]): string[] {
  const suggestions: string[] = [];

  // Find uncategorized notes (in Root)
  const rootNotes = files.filter((f) => f.folder === 'Root' || f.folder === '.');
  if (rootNotes.length > 0) {
    suggestions.push(`${rootNotes.length} notes in root directory - consider organizing into folders`);
  }

  // Find very small folders
  const smallFolders = folderStats.filter((f) => f.noteCount < 3 && f.name !== 'Root');
  if (smallFolders.length > 0) {
    suggestions.push(
      `${smallFolders.length} folders with less than 3 notes - consider consolidating`
    );
  }

  // Find very large folders
  const largeFolders = folderStats.filter((f) => f.noteCount > 100);
  if (largeFolders.length > 0) {
    largeFolders.forEach((f) => {
      suggestions.push(`${f.name} has ${f.noteCount} notes - consider creating subfolders`);
    });
  }

  return suggestions;
}

/**
 * Generate comprehensive vault report
 */
export async function generateVaultReport(vaultPath: string): Promise<VaultReport> {
  try {
    // Step 1: Read all files
    console.log('📖 Reading vault files...');
    const allFiles = readVaultFiles(vaultPath);
    console.log(`   Found ${allFiles.length} markdown files`);

    if (allFiles.length === 0) {
      throw new Error('No markdown files found in vault');
    }

    // Step 2: Calculate statistics (no AI needed)
    console.log('📊 Calculating statistics...');
    const folderStats = calculateFolderStats(allFiles);
    const monthlyActivity = calculateMonthlyActivity(allFiles);
    const totalFolders = new Set(allFiles.map((f) => f.folder.split(path.sep)[0])).size;

    // Step 3: Group by folder
    const folderGroups = groupByFolder(allFiles);

    // Step 4: Generate AI summaries
    const folderSummaries = await generateFolderSummaries(folderGroups);

    // Step 5: Generate top themes
    const topThemes = await generateTopThemes(allFiles);

    // Step 6: Generate suggestions
    console.log('💡 Generating organization suggestions...');
    const suggestions = generateSuggestions(allFiles, folderStats);

    return {
      generatedAt: new Date(),
      totalNotes: allFiles.length,
      totalFolders,
      folderBreakdown: folderStats,
      monthlyActivity,
      folderSummaries,
      topThemes,
      suggestions,
    };
  } catch (error: any) {
    throw new Error(`Batch processing failed: ${error.message}`);
  }
}

// CLI interface for standalone testing
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: npx ts-node batch.ts <vault-path>');
    console.log('Example: npx ts-node batch.ts "./Personal Vault"');
    process.exit(1);
  }

  const vaultPath = args[0];

  generateVaultReport(vaultPath)
    .then((report) => {
      console.log('\n' + '='.repeat(80));
      console.log('📊 VAULT REPORT');
      console.log('='.repeat(80));
      console.log(`Generated: ${report.generatedAt.toLocaleString()}\n`);

      console.log('📈 STATISTICS');
      console.log(`   Total Notes: ${report.totalNotes}`);
      console.log(`   Total Folders: ${report.totalFolders}\n`);

      console.log('📁 NOTES BY FOLDER');
      report.folderBreakdown.forEach((folder) => {
        console.log(`   ${folder.name.padEnd(25)} ${folder.noteCount} notes (${folder.percentage}%)`);
      });

      console.log('\n📅 RECENT ACTIVITY (Last 12 Months)');
      report.monthlyActivity.slice(0, 6).forEach((month) => {
        console.log(`   ${month.month}: ${month.noteCount} notes`);
      });

      console.log('\n📝 FOLDER SUMMARIES');
      Object.entries(report.folderSummaries).forEach(([folder, summary]) => {
        console.log(`\n   ${folder}:`);
        console.log(`   ${summary}`);
      });

      console.log('\n✨ TOP THEMES');
      report.topThemes.forEach((theme, idx) => {
        console.log(`   ${idx + 1}. ${theme}`);
      });

      console.log('\n💡 ORGANIZATION SUGGESTIONS');
      if (report.suggestions.length > 0) {
        report.suggestions.forEach((suggestion) => {
          console.log(`   • ${suggestion}`);
        });
      } else {
        console.log('   • Your vault is well-organized!');
      }

      console.log('\n' + '='.repeat(80) + '\n');
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
