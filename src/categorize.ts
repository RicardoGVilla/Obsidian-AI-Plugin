// src/categorize.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function categorizeNote(noteContent: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `You are analyzing personal notes from an Obsidian vault.

Available categories:
ARCHIVE - Old notes, 2017-2023 Notion archive, past years
BUSINESS & VENTURES - Business ideas, active ventures, development funnel
CAREER - Job search, professional development, work history
EVIDENCE -  Accountability system (Daily Builds, Weekly Shipped, etc.)
FINANCES - Budget, money management
HEALTH & FITNESS - Physical health, gym, wellness
JOURNAL - Daily notes, reflections, personal thoughts
KNOWLEDGE BASE - Books, technical learning, writing, essays, philosophy
PERSONAL LIFE - Hobbies, travel, personal matters
PROJECTS - Active projects, portfolio, in development
REFERENCE - Important documents, tasks archive
SYSTEMS & HABITS - Life rules, routines
VISION & PLANNING - Annual goals, life vision, multi-year plans

ONLY the category name (one word):

${noteContent}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}