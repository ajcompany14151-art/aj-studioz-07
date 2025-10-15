// lib/ai/models.ts
export const DEFAULT_CHAT_MODEL: string = 'chat-model-lite';

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: 'chat-model-lite',
    name: 'Lynxa Lite',
    description: '⚡ Fast, intelligent responses powered by Gemini - Your everyday AI assistant',
  },
];
