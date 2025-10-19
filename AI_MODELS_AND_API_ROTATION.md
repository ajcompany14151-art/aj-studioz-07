# AI Models and API Key Rotation Guide

This document explains the AI models available in the chatbot and how API key rotation works.

## Available AI Models

The chatbot now supports **3 AI models**, each optimized for different use cases:

### 1. Lynxa Lite (`chat-model-lite`)
- **Model**: `llama-3.1-8b-instant`
- **Best For**: Fast, daily conversations and quick questions
- **Style**: ChatGPT-style responses with beautiful formatting
- **Features**: 
  - ⚡ Ultra-fast responses
  - 📝 Clean, formatted output
  - 💬 Perfect for casual chats
  - ❌ No artifact creation
- **Use Cases**: Quick facts, simple explanations, casual Q&A

### 2. Lynxa Pro (`chat-model`) - Default
- **Model**: `llama-3.3-70b-versatile`
- **Best For**: Complex tasks, code generation, and artifact creation
- **Features**:
  - 🚀 Most powerful model
  - 📄 Full artifact support (documents, code, tables)
  - 🎨 Creates comprehensive content
  - ✅ Supports all tools and capabilities
- **Use Cases**: Programming, document creation, complex problem-solving, analysis

### 3. Lynxa Student Pro (`chat-model-reasoning`)
- **Model**: `llama-3.1-8b-instant` with reasoning middleware
- **Best For**: Learning and educational purposes
- **Features**:
  - 🎓 Educational tutor mode
  - 🤔 Shows reasoning process with `<think>` tags
  - 📚 Comprehensive, detailed explanations
  - 💡 Step-by-step breakdowns
  - 📊 Includes diagrams and practice questions
- **Use Cases**: Learning concepts, homework help, detailed tutorials

## API Key Rotation System

To avoid rate limits and ensure high availability, the system supports **automatic API key rotation** across up to **5 Groq API keys**.

### How It Works

1. **Round-Robin Distribution**: Requests are automatically distributed across all available API keys
2. **Smart Rotation**: Keys rotate on every request to spread the load evenly
3. **Rate Limit Handling**: If a key hits a rate limit, it's automatically marked as unavailable and skipped
4. **Auto-Reset**: When all keys become rate-limited, the system resets and tries again
5. **Logging**: The system logs rotation statistics for monitoring

### Setup Instructions

#### Step 1: Get Groq API Keys

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create **5 API keys** (you can create multiple keys per account)
5. Copy each key (they start with `gsk_`)

#### Step 2: Configure Environment Variables

Add your API keys to your `.env` file:

```env
# Primary key (required)
GROQ_API_KEY=gsk_your_actual_api_key_here

# Additional keys for rotation (optional but recommended)
GROQ_API_KEY_2=gsk_your_second_api_key_here
GROQ_API_KEY_3=gsk_your_third_api_key_here
GROQ_API_KEY_4=gsk_your_fourth_api_key_here
GROQ_API_KEY_5=gsk_your_fifth_api_key_here
```

#### Step 3: Deploy

The rotation system works automatically once the environment variables are set. No code changes needed!

### Monitoring

The system logs rotation statistics:

```
[Groq] Initialized with 5 API key(s)
[Groq] Using key #1
[Groq] Using key #2
[Groq] Marked key #3 as rate-limited
[Groq] All API keys rate-limited, resetting rotation
```

### Benefits

- **5x Capacity**: With 5 keys, you get 5x the rate limit capacity
- **Zero Downtime**: If one key fails, others continue working
- **Automatic**: No manual intervention needed
- **Smart**: Skips problematic keys automatically
- **Fair**: Distributes load evenly across all keys

## Technical Implementation

### File Structure

```
lib/ai/
├── providers.ts          # Model definitions and rotation setup
├── models.ts            # Model metadata and descriptions
├── groq-key-rotation.ts # API key rotation logic
└── entitlements.ts      # User access control
```

### Key Functions

#### `getGroqApiKey()`
Returns the next available API key using round-robin rotation.

#### `markCurrentKeyAsRateLimited()`
Marks the current key as rate-limited to skip it in future rotations.

#### `resetFailedKeys()`
Resets all failed keys (useful after cooldown period).

#### `getRotationStats()`
Returns statistics about key rotation:
- `totalKeys`: Number of API keys loaded
- `currentKeyIndex`: Current key being used
- `failedKeysCount`: Number of rate-limited keys
- `availableKeys`: Number of available keys

### Model Configuration

All models are configured in `lib/ai/providers.ts`:

```typescript
const languageModels = {
  "chat-model-lite": createRotatingGroqModel("llama-3.1-8b-instant"),
  "chat-model": createRotatingGroqModel("llama-3.3-70b-versatile"),
  "chat-model-reasoning": wrapLanguageModel({
    middleware: extractReasoningMiddleware({ tagName: "think" }),
    model: createRotatingGroqModel("llama-3.1-8b-instant"),
  }),
  "title-model": createRotatingGroqModel("llama-3.1-8b-instant"),
};
```

## Troubleshooting

### Issue: "No GROQ_API_KEY found"
**Solution**: Make sure at least `GROQ_API_KEY` is set in your `.env` file.

### Issue: "All API keys rate-limited"
**Solution**: 
1. Wait a few minutes for rate limits to reset
2. Add more API keys (up to 5 total)
3. Check your Groq dashboard for rate limit details

### Issue: AI not responding
**Solution**:
1. Check if API keys are valid
2. Verify all environment variables are loaded
3. Check server logs for errors
4. Ensure you have at least one valid API key

### Issue: Model not appearing in selector
**Solution**:
1. Check `lib/ai/entitlements.ts` for user access
2. Verify model is in `lib/ai/models.ts`
3. Clear browser cache and reload

## Best Practices

1. **Use All 5 Keys**: For maximum capacity and reliability
2. **Monitor Logs**: Watch for rate limit warnings
3. **Rotate Keys**: If possible, rotate keys periodically for security
4. **Set Alerts**: Monitor your Groq dashboard for usage patterns
5. **Test Before Deploy**: Test with one key first, then add more

## References

- [Groq Documentation](https://console.groq.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Rate Limits Guide](https://console.groq.com/docs/rate-limits)

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify your API keys are valid on console.groq.com
3. Review this documentation
4. Check GitHub issues for similar problems

---

**Last Updated**: 2025-10-19  
**Version**: 3.1.0
