/**
 * Request Utilities for Groq API
 *
 * This module provides token estimation, message trimming, and API key selection
 * to prevent 413 errors and implement key rotation for the Groq API.
 *
 * IMPORTANT: This module should only be used on the server-side.
 */

// Only run on server-side
if (typeof window !== "undefined") {
  throw new Error(
    "request-utils.ts should only be imported on the server-side"
  );
}

/**
 * Default safety margin (90% of token limit)
 * Adjust this to be more conservative if needed
 */
export const DEFAULT_SAFETY_MARGIN = 0.9;

/**
 * Maximum tokens per request for Groq models
 * This is a conservative estimate; adjust based on the specific model
 */
export const MAX_TOKENS_PER_REQUEST = Math.floor(8192 * DEFAULT_SAFETY_MARGIN); // ~7372 tokens

/**
 * Minimum number of messages to keep when trimming
 * We always keep at least the last 3 messages for context
 */
export const MIN_MESSAGES_TO_KEEP = 3;

/**
 * Estimate the number of tokens in a text string
 * This is a simple heuristic: 1 token ≈ 4 characters
 * For more accurate estimation, consider using tiktoken or a proper tokenizer
 *
 * @param text - The text to estimate tokens for
 * @returns Estimated number of tokens
 */
export function estimateTokens(text: string): number {
  // Simple heuristic: ~4 characters per token
  // Add 10% overhead for safety
  return Math.ceil((text.length / 4) * 1.1);
}

/**
 * Estimate tokens for a message object
 * Handles different message formats (text, parts, etc.)
 *
 * @param message - Message object to estimate
 * @returns Estimated number of tokens
 */
export function estimateMessageTokens(message: any): number {
  let totalTokens = 0;

  // Add tokens for role (usually "user", "assistant", or "system")
  totalTokens += 4; // ~4 tokens for role formatting

  // Handle different message formats
  if (typeof message.content === "string") {
    totalTokens += estimateTokens(message.content);
  } else if (message.parts) {
    // Handle parts-based messages
    for (const part of message.parts) {
      if (part.type === "text" && part.text) {
        totalTokens += estimateTokens(part.text);
      } else if (typeof part === "string") {
        totalTokens += estimateTokens(part);
      }
    }
  } else if (Array.isArray(message.content)) {
    // Handle array-based content
    for (const item of message.content) {
      if (item.type === "text" && item.text) {
        totalTokens += estimateTokens(item.text);
      } else if (typeof item === "string") {
        totalTokens += estimateTokens(item);
      }
    }
  }

  return totalTokens;
}

/**
 * Estimate total tokens for system prompt and messages
 *
 * @param systemPrompt - System prompt text
 * @param messages - Array of messages
 * @returns Total estimated tokens
 */
export function estimateTotalTokens(
  systemPrompt: string,
  messages: any[]
): number {
  let totalTokens = 0;

  // Add system prompt tokens
  totalTokens += estimateTokens(systemPrompt);
  totalTokens += 4; // overhead for system message formatting

  // Add message tokens
  for (const message of messages) {
    totalTokens += estimateMessageTokens(message);
  }

  // Add overhead for chat formatting
  totalTokens += messages.length * 2; // ~2 tokens per message for formatting

  return totalTokens;
}

/**
 * Trim messages to fit within token budget
 * Strategy: Remove oldest messages first, but always keep the last MIN_MESSAGES_TO_KEEP
 *
 * @param messages - Array of messages to trim
 * @param systemPrompt - System prompt text
 * @param maxTokens - Maximum tokens allowed (default: MAX_TOKENS_PER_REQUEST)
 * @returns Trimmed array of messages
 */
export function trimMessages(
  messages: any[],
  systemPrompt: string,
  maxTokens: number = MAX_TOKENS_PER_REQUEST
): any[] {
  // If we have few messages, no need to trim
  if (messages.length <= MIN_MESSAGES_TO_KEEP) {
    return messages;
  }

  // Calculate current token count
  let currentTokens = estimateTotalTokens(systemPrompt, messages);

  // If we're under budget, no trimming needed
  if (currentTokens <= maxTokens) {
    return messages;
  }

  console.log(
    `[Token Trimming] Current: ${currentTokens} tokens, Max: ${maxTokens} tokens`
  );

  // Start removing oldest messages (but keep last MIN_MESSAGES_TO_KEEP)
  const trimmedMessages = [...messages];
  let removedCount = 0;

  while (
    currentTokens > maxTokens &&
    trimmedMessages.length > MIN_MESSAGES_TO_KEEP
  ) {
    // Remove the oldest message (first in array)
    trimmedMessages.shift();
    removedCount++;

    // Recalculate tokens
    currentTokens = estimateTotalTokens(systemPrompt, trimmedMessages);
  }

  console.log(
    `[Token Trimming] Removed ${removedCount} message(s), New total: ${currentTokens} tokens`
  );

  // If still over budget after removing to minimum, truncate oldest messages' content
  if (currentTokens > maxTokens && trimmedMessages.length > 0) {
    console.warn(
      "[Token Trimming] Still over budget, truncating message content"
    );

    // Calculate how many tokens we need to remove
    const tokensToRemove = currentTokens - maxTokens;
    let tokensRemoved = 0;

    // Truncate messages starting from the oldest (but not the very last one)
    for (
      let i = 0;
      i < trimmedMessages.length - 1 && tokensRemoved < tokensToRemove;
      i++
    ) {
      const message = trimmedMessages[i];
      const messageTokens = estimateMessageTokens(message);

      // Calculate target size (remove proportional amount)
      const targetSize = Math.max(
        100,
        messageTokens - tokensToRemove + tokensRemoved
      );
      const targetChars = targetSize * 4; // Convert tokens back to chars

      // Truncate content
      if (typeof message.content === "string") {
        if (message.content.length > targetChars) {
          message.content = `${message.content.slice(-targetChars)}...`;
          tokensRemoved += messageTokens - estimateMessageTokens(message);
        }
      } else if (message.parts) {
        // Truncate parts-based messages
        for (const part of message.parts) {
          if (
            part.type === "text" &&
            part.text &&
            part.text.length > targetChars
          ) {
            part.text = `${part.text.slice(-targetChars)}...`;
            break; // Only truncate first text part
          }
        }
        tokensRemoved += messageTokens - estimateMessageTokens(message);
      }
    }
  }

  return trimmedMessages;
}

/**
 * Pick an API key from environment variables
 * Supports both GROQ_API_KEYS (comma-separated) and individual GROQ_API_KEY_* vars
 * Uses random selection to distribute load across keys
 *
 * @returns Selected API key
 */
export function pickApiKeyFromEnv(): string {
  // First, check for GROQ_API_KEYS (comma-separated format)
  const apiKeysEnv = process.env.GROQ_API_KEYS;
  if (apiKeysEnv) {
    const keys = apiKeysEnv
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (keys.length > 0) {
      // Random selection for load distribution
      const selectedKey = keys[Math.floor(Math.random() * keys.length)];
      const maskedKey = maskApiKey(selectedKey);
      console.log(
        `[API Key Rotation] Selected key from GROQ_API_KEYS: ...${maskedKey} (${keys.length} keys available)`
      );
      return selectedKey;
    }
  }

  // Fallback to individual GROQ_API_KEY_* environment variables
  const individualKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
  ].filter((key): key is string => Boolean(key));

  if (individualKeys.length === 0) {
    throw new Error(
      "No GROQ_API_KEY or GROQ_API_KEYS found in environment variables"
    );
  }

  // Random selection for load distribution
  const selectedKey =
    individualKeys[Math.floor(Math.random() * individualKeys.length)];
  const maskedKey = maskApiKey(selectedKey);
  console.log(
    `[API Key Rotation] Selected key: ...${maskedKey} (${individualKeys.length} keys available)`
  );
  return selectedKey;
}

/**
 * Mask API key for safe logging
 * Only shows the last 6 characters
 *
 * @param apiKey - API key to mask
 * @returns Masked API key
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 6) {
    return "***";
  }
  return apiKey.slice(-6);
}

/**
 * Check if environment variables are properly configured
 *
 * @returns Object with configuration status
 */
export function checkEnvConfiguration(): {
  hasKeys: boolean;
  keyCount: number;
  source: "GROQ_API_KEYS" | "individual" | "none";
} {
  // Check GROQ_API_KEYS first
  const apiKeysEnv = process.env.GROQ_API_KEYS;
  if (apiKeysEnv) {
    const keys = apiKeysEnv
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (keys.length > 0) {
      return {
        hasKeys: true,
        keyCount: keys.length,
        source: "GROQ_API_KEYS",
      };
    }
  }

  // Check individual keys
  const individualKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
  ].filter(Boolean);

  if (individualKeys.length > 0) {
    return {
      hasKeys: true,
      keyCount: individualKeys.length,
      source: "individual",
    };
  }

  return {
    hasKeys: false,
    keyCount: 0,
    source: "none",
  };
}
