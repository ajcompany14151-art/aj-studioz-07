// lib/ai/models.ts
export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: 'chat-model-lite',
    name: 'Lynxa Lite',
    description: '⚡ Fast, ChatGPT-style responses - Perfect for quick questions',
  },
  {
    id: 'chat-model',
    name: 'Lynxa Pro',
    description: '🚀 Most powerful model with artifacts - Best for complex tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Lynxa Student Pro',
    description: '🎓 Educational tutor with comprehensive explanations - Ideal for learning',
  },
];
