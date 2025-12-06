// src/vault-structure.ts
// Auto-discover vault structure and generate category descriptions

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface VaultCategory {
  name: string;
  path: string;
  description?: string;
}

/**
 * Scan vault root and discover top-level folders as categories
 */
export function discoverCategories(vaultPath: string): VaultCategory[] {
  const categories: VaultCategory[] = [];
  
  // Check if vault exists
  if (!fs.existsSync(vaultPath)) {
    throw new Error(`Vault not found: ${vaultPath}`);
  }
  
  // Read root-level items
  const items = fs.readdirSync(vaultPath);
  
  for (const item of items) {
    const itemPath = path.join(vaultPath, item);
    
    try {
      const stat = fs.statSync(itemPath);
      
      // Only process folders (skip files and hidden folders like .obsidian)
      if (stat.isDirectory() && !item.startsWith('.')) {
        categories.push({
          name: item,
          path: itemPath
        });
      }
    } catch (error) {
      // Skip items we can't read
      console.warn(`⚠️  Skipping ${item}: ${error}`);
    }
  }
  
  return categories;
}

/**
 * Recursively get all markdown files in a folder
 */
function getAllMarkdownFiles(folderPath: string, maxDepth: number = 3, currentDepth: number = 0): string[] {
  const files: string[] = [];
  
  // Limit recursion depth to avoid infinite loops
  if (currentDepth >= maxDepth) {
    return files;
  }
  
  try {
    const items = fs.readdirSync(folderPath);
    
    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      
      try {
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          // Recursive scan
          files.push(...getAllMarkdownFiles(itemPath, maxDepth, currentDepth + 1));
        } else if (stat.isFile() && item.endsWith('.md')) {
          files.push(itemPath);
        }
      } catch (error) {
        // Skip items we can't read
        continue;
      }
    }
  } catch (error) {
    // Skip folders we can't read
    console.warn(`⚠️  Cannot read folder ${folderPath}`);
  }
  
  return files;
}

/**
 * Sample a few random files from a folder (recursive)
 */
function sampleFilesFromFolder(folderPath: string, maxSamples: number): string[] {
  const allFiles = getAllMarkdownFiles(folderPath);
  const samples: string[] = [];
  
  if (allFiles.length === 0) {
    return samples;
  }
  
  // Take random samples (up to maxSamples)
  const samplesToTake = Math.min(maxSamples, allFiles.length);
  const usedIndices = new Set<number>();
  
  while (samples.length < samplesToTake && usedIndices.size < allFiles.length) {
    const randomIndex = Math.floor(Math.random() * allFiles.length);
    
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      
      try {
        const fileContent = fs.readFileSync(allFiles[randomIndex], 'utf-8');
        // First 500 chars to keep prompt size reasonable
        samples.push(fileContent.substring(0, 500));
      } catch (error) {
        // Skip files we can't read
        continue;
      }
    }
  }
  
  return samples;
}

/**
 * Ask LLM to describe what a category contains based on samples
 */
async function generateCategoryDescription(
  categoryName: string,
  sampleFiles: string[]
): Promise<string> {
  const prompt = `You are analyzing a folder called "${categoryName}" from an Obsidian vault.

Here are sample files from this folder:

${sampleFiles.map((sample, i) => `--- Sample ${i + 1} ---\n${sample}\n`).join('\n')}

In ONE sentence (max 15 words), describe what this folder contains.

Examples:
- "Daily journal entries and personal reflections"
- "Career documents including resumes and job applications"
- "Financial tracking, budgets, and investment notes"

Description:`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.warn(`⚠️  Could not generate description for ${categoryName}: ${error}`);
    return `${categoryName} folder`;
  }
}

/**
 * Generate LLM summaries for each category (with sampling to keep costs low)
 */
export async function enrichCategoriesWithSummaries(
  categories: VaultCategory[]
): Promise<VaultCategory[]> {
  const enriched: VaultCategory[] = [];
  
  console.log(`📚 Analyzing ${categories.length} categories...`);
  
  for (const category of categories) {
    // Sample a few files from the folder to understand what it contains
    const sampleFiles = sampleFilesFromFolder(category.path, 3);
    
    if (sampleFiles.length > 0) {
      console.log(`   📂 ${category.name} (${sampleFiles.length} samples)`);
      const description = await generateCategoryDescription(category.name, sampleFiles);
      enriched.push({
        ...category,
        description
      });
    } else {
      // Empty folder - no samples
      console.log(`   📂 ${category.name} (empty)`);
      enriched.push({
        ...category,
        description: `Empty ${category.name} folder`
      });
    }
  }
  
  console.log(`✅ Category analysis complete\n`);
  
  return enriched;
}

/**
 * Cache manager for categories (avoid re-scanning vault every time)
 */
export class CategoryCache {
  private categories: VaultCategory[] | null = null;
  private lastRefresh: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour
  
  /**
   * Get categories (from cache or fresh scan)
   */
  async getCategories(vaultPath: string): Promise<VaultCategory[]> {
    const now = new Date();
    
    // Refresh if cache is empty or expired
    if (!this.categories || 
        !this.lastRefresh || 
        (now.getTime() - this.lastRefresh.getTime()) > this.CACHE_DURATION) {
      
      console.log('🔄 Discovering vault categories...\n');
      const discovered = discoverCategories(vaultPath);
      this.categories = await enrichCategoriesWithSummaries(discovered);
      this.lastRefresh = now;
    }
    
    return this.categories;
  }
  
  /**
   * Invalidate cache (force refresh on next request)
   */
  invalidate(): void {
    this.categories = null;
    this.lastRefresh = null;
  }
  
  /**
   * Check if cache exists and is valid
   */
  isValid(): boolean {
    if (!this.categories || !this.lastRefresh) {
      return false;
    }
    
    const now = new Date();
    return (now.getTime() - this.lastRefresh.getTime()) < this.CACHE_DURATION;
  }
}
