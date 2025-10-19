# 🔑 Vercel API Keys Setup - Production Ready

## ✅ Configure Your 5 Groq API Keys on Vercel

Your app is now configured to use **5 rotatable API keys** exactly like the reference repository. Follow these steps to set up your production environment on Vercel:

### 1. 📝 Get Your Groq API Keys

1. Go to [Groq Console](https://console.groq.com/)
2. Navigate to **API Keys** section
3. Create **5 different API keys** with these names:
   - `Production Key 1`
   - `Production Key 2` 
   - `Production Key 3`
   - `Production Key 4`
   - `Production Key 5`

### 2. 🚀 Set Environment Variables on Vercel

#### Option A: Via Vercel Dashboard
1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add these 5 variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GROQ_API_KEY_1` | `gsk_xxxxx...` | Production, Preview, Development |
| `GROQ_API_KEY_2` | `gsk_xxxxx...` | Production, Preview, Development |
| `GROQ_API_KEY_3` | `gsk_xxxxx...` | Production, Preview, Development |
| `GROQ_API_KEY_4` | `gsk_xxxxx...` | Production, Preview, Development |
| `GROQ_API_KEY_5` | `gsk_xxxxx...` | Production, Preview, Development |

#### Option B: Via Vercel CLI
```bash
vercel env add GROQ_API_KEY_1 production
vercel env add GROQ_API_KEY_2 production  
vercel env add GROQ_API_KEY_3 production
vercel env add GROQ_API_KEY_4 production
vercel env add GROQ_API_KEY_5 production
```

### 3. 📋 Environment Variables Template

Copy this template and replace with your actual API keys:

```env
# Groq API Keys for Production Rotation
GROQ_API_KEY_1=gsk_your_first_api_key_here
GROQ_API_KEY_2=gsk_your_second_api_key_here
GROQ_API_KEY_3=gsk_your_third_api_key_here
GROQ_API_KEY_4=gsk_your_fourth_api_key_here
GROQ_API_KEY_5=gsk_your_fifth_api_key_here
```

### 4. 🔄 How API Key Rotation Works

Your app now automatically:

- ✅ **Rotates** between 5 API keys on each request
- ✅ **Detects** rate limit errors (429 status)
- ✅ **Marks** rate-limited keys as failed
- ✅ **Skips** failed keys in future requests
- ✅ **Resets** failed keys after cooldown period
- ✅ **Logs** rotation statistics for monitoring

### 5. 📊 Available Models

Your production setup includes:

| Model ID | Description | Use Case |
|----------|-------------|----------|
| `chat-model` | **Lynxa Pro** (Llama 3.3 70B) | Main chat with artifacts |
| `chat-model-lite` | **Lynxa Lite** (Llama 3.1 8B) | Fast ChatGPT-style responses |
| `chat-model-reasoning` | **Lynxa Student** (Llama 3.3 70B) | Comprehensive educational content |

### 6. 🚨 Important Notes

- **All 5 keys MUST be valid** Groq API keys starting with `gsk_`
- **Deploy after** setting environment variables
- **Keys rotate automatically** - no manual intervention needed
- **Rate limits are handled** gracefully with automatic failover
- **Logs show** which key is currently active

### 7. 🧪 Test Your Setup

After deployment, your chat should:
- ✅ Respond to messages without errors
- ✅ Handle multiple concurrent users
- ✅ Automatically switch keys when rate limited
- ✅ Show rotation logs in Vercel function logs

### 8. 📈 Monitoring

Check your Vercel function logs to see:
```
[Groq] Loaded 5 API key(s) for rotation
[Groq] Marked key #3 as rate-limited  
[Chat API] Rate limited - Key rotation stats: { totalKeys: 5, currentKeyIndex: 4, failedKeysCount: 1, availableKeys: 4 }
```

## 🎉 You're All Set!

Your AI chat now has enterprise-grade API key rotation exactly like the reference repository. The system will handle high traffic and rate limits automatically! 🚀

---

**Need help?** Check the console logs in Vercel for detailed rotation information.