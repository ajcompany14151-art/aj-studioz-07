// lib/ai/providers.ts
import { createOpenAI } from "@ai-sdk/openai";

// Create a Groq provider using OpenAI compatibility
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const languageModels = {
  "chat-model": groq("llama-3.3-70b-versatile"),
  "chat-model-reasoning": groq("deepseek-r1-distill-llama-70b"),
  "kimi-k2": groq("llama-3.3-70b-versatile"),
  "meta-llama/llama-4-scout-17b-16e-instruct": groq(
    "llama-3.1-70b-versatile",
  ),
  "llama-3.1-8b-instant": groq("llama-3.1-8b-instant"),
  "deepseek-r1-distill-llama-70b": groq("deepseek-r1-distill-llama-70b"),
  "llama-3.3-70b-versatile": groq("llama-3.3-70b-versatile"),
  "title-model": groq("llama-3.1-8b-instant"),
  "artifact-model": groq("llama-3.3-70b-versatile"),
};

export const model = {
  languageModel: (modelId: string): any => {
    return languageModels[modelId as keyof typeof languageModels] || languageModels["chat-model"];
  }
};

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "llama-3.3-70b-versatile";

// Alias model as myProvider for backward compatibility
export const myProvider = model;
