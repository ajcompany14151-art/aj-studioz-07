import { GoogleGenAI, Chat, Content } from '@google/genai';
import { Message } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export function createChatSession(history?: Message[]): Chat {
  const geminiHistory: Content[] | undefined = history
    ?.filter(msg => msg.content)
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    history: geminiHistory,
    config: {
      systemInstruction: 'You are AJ STUDIOZ AI, a helpful and versatile AI assistant with a slightly edgy and highly intelligent personality. You provide clear, concise, and accurate answers. Format code blocks appropriately for readability.',
    },
  });
}
