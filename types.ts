

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: MessageRole;
  content: string;
}

export interface SavedChat {
  id: string;
  name: string;
  timestamp: number;
  messages: Message[];
}

export type HighlightTheme = 'atom-one-dark' | 'github-dark' | 'dracula' | 'monokai' | 'nord';

export type Theme = 'light' | 'dark';

export type AppView = 'chat' | 'explore' | 'history';