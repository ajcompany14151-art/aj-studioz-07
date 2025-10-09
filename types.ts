// types.ts (Updated to include DB types)
export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export type HighlightTheme = 'atom-one-dark' | 'atom-one-light' | 'dracula' | 'github-dark' | 'github' | 'monokai' | 'nord' | 'solarized-dark' | 'vs2015' | 'ir-black';

export type Theme = 'dark' | 'light' | 'z-ai' | 'chatgpt';

export type AppView = 'chat' | 'explore' | 'history' | 'analytics';

export interface SavedChat {
  id: string;
  name: string;
  timestamp: number;
  messages: Message[];
}

// New: User type for DB
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  isPremium: boolean;
  queriesThisMonth: number;
}
