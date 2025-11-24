// src/categorize.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function categorizeNote(noteContent: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `You are analyzing personal notes from an Obsidian vault.

Available categories:
- CAREER (job search, professional development, work)
- HEALTH (fitness, mental health, wellness)
- JOURNAL (daily reflections, personal thoughts)
- BUSINESS (ventures, ideas, entrepreneurship)
- FINANCES (budget, investments, money)
- KNOWLEDGE (learning, books, courses)
- PROJECTS (active projects, portfolio)
- VISION (goals, life planning, future)

Based on this note, return ONLY the category name (one word):

${noteContent}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}