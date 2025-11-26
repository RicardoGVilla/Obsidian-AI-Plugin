import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function listModels() {
  try {
    const models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        console.log(`✅ ${modelName} works`);
      } catch (e: any) {
        console.log(`❌ ${modelName} failed: ${e.message.substring(0, 100)}`);
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

listModels();
