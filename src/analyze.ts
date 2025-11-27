// src/analyze.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface KeywordMatch {
  noteTitle: string;
  snippet: string;
  date?: string; // Extracted from filename if available
}

interface PatternAnalysis {
  keyword: string;
  folderPath: string;
  totalMentions: number;
  notesWithKeyword: number;
  totalNotes: number;
  firstMention?: string;
  lastMention?: string;
  peakPeriod?: string;
  trend?: string;
  examples: KeywordMatch[];
  aiInsights?: string;
}

/**
 * Extract date from filename (e.g., "2025-01-15.md" -> "2025-01-15")
 */
function extractDateFromFilename(filename: string): string | undefined {
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : undefined;
}

/**
 * Read all markdown files in a folder and search for keyword
 */
function searchKeywordInFolder(folderPath: string, keyword: string): {
  matches: KeywordMatch[];
  totalNotes: number;
} {
  const matches: KeywordMatch[] = [];
  let totalNotes = 0;
  
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }
  
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && file.endsWith('.md')) {
      totalNotes++;
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Case-insensitive search
      const regex = new RegExp(keyword, 'gi');
      const keywordMatches = content.match(regex);
      
      if (keywordMatches) {
        // Extract snippet around each mention (50 chars before and after)
        const lines = content.split('\n');
        const snippets: string[] = [];
        
        for (const line of lines) {
          if (new RegExp(keyword, 'i').test(line)) {
            snippets.push(line.trim());
            if (snippets.length >= 2) break; // Limit to 2 snippets per note
          }
        }
        
        matches.push({
          noteTitle: file.replace('.md', ''),
          snippet: snippets.join(' ... '),
          date: extractDateFromFilename(file)
        });
      }
    }
  }
  
  return { matches, totalNotes };
}

/**
 * Analyze temporal patterns (trends over time)
 */
function analyzeTrends(matches: KeywordMatch[]): {
  firstMention?: string;
  lastMention?: string;
  peakPeriod?: string;
  trend?: string;
} {
  const datedMatches = matches.filter(m => m.date).sort((a, b) => 
    (a.date || '').localeCompare(b.date || '')
  );
  
  if (datedMatches.length === 0) {
    return {};
  }
  
  const firstMention = datedMatches[0].date;
  const lastMention = datedMatches[datedMatches.length - 1].date;
  
  // Group by month to find peak period
  const monthCounts: { [month: string]: number } = {};
  datedMatches.forEach(match => {
    if (match.date) {
      const month = match.date.substring(0, 7); // YYYY-MM
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });
  
  const peakMonth = Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  
  // Determine trend (simple: compare first half vs second half)
  const midPoint = Math.floor(datedMatches.length / 2);
  const firstHalf = datedMatches.slice(0, midPoint).length;
  const secondHalf = datedMatches.slice(midPoint).length;
  
  let trend = 'Stable';
  if (secondHalf > firstHalf * 1.5) trend = 'Increasing';
  if (firstHalf > secondHalf * 1.5) trend = 'Decreasing';
  
  return {
    firstMention,
    lastMention,
    peakPeriod: peakMonth,
    trend
  };
}

/**
 * Get AI insights about the keyword usage pattern
 */
async function getAIInsights(
  keyword: string,
  matches: KeywordMatch[],
  trend?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const exampleSnippets = matches.slice(0, 5).map(m => 
    `[${m.date || 'undated'}] ${m.noteTitle}: "${m.snippet}"`
  ).join('\n');
  
  const prompt = `Analyze the usage pattern of the keyword "${keyword}" in personal notes.

Found ${matches.length} mentions across different notes.
Trend: ${trend || 'Unknown'}

Example snippets:
${exampleSnippets}

Provide a 3-sentence insight about:
1. What this keyword reveals about the person's focus/concerns
2. How the usage pattern (${trend}) is significant
3. Any notable patterns in the context of usage

Insight:`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Analyze keyword patterns in a folder
 */
export async function analyzePattern(
  folderPath: string,
  keyword: string,
  includeAI: boolean = true
): Promise<PatternAnalysis> {
  // Search for keyword
  const { matches, totalNotes } = searchKeywordInFolder(folderPath, keyword);
  
  // Analyze trends
  const { firstMention, lastMention, peakPeriod, trend } = analyzeTrends(matches);
  
  // Get AI insights (optional)
  let aiInsights: string | undefined;
  if (includeAI && matches.length > 0) {
    aiInsights = await getAIInsights(keyword, matches, trend);
  }
  
  return {
    keyword,
    folderPath,
    totalMentions: matches.reduce((sum, m) => {
      // Count actual occurrences in snippet
      const regex = new RegExp(keyword, 'gi');
      return sum + (m.snippet.match(regex)?.length || 1);
    }, 0),
    notesWithKeyword: matches.length,
    totalNotes,
    firstMention,
    lastMention,
    peakPeriod,
    trend,
    examples: matches.slice(0, 5), // Limit to 5 examples
    aiInsights
  };
}

if (require.main === module) {
  const folderPath = process.argv[2];
  const keyword = process.argv[3];
  const noAI = process.argv.includes('--no-ai');
  
  if (!folderPath || !keyword) {
    console.error('Usage: ts-node analyze.ts <folder-path> <keyword> [--no-ai]');
    console.error('Example: ts-node analyze.ts "/vault/JOURNAL" "isolation"');
    process.exit(1);
  }
  
  analyzePattern(folderPath, keyword, !noAI)
    .then(result => {
      console.log(`\n🔍 Pattern Analysis: "${result.keyword}"`);
      console.log(`📁 Folder: ${result.folderPath}`);
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
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}
