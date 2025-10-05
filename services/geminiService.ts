
import { GoogleGenAI, Chat } from '@google/genai';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export function createChatSession(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are AJ STUDIOZ AI, a helpful and versatile AI assistant with a slightly edgy and highly intelligent personality. You provide clear, concise, and accurate answers. Format code blocks appropriately for readability.',
    },
  });
}
