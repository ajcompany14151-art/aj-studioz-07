# 🚀 API Key Setup Guide - Fix AI Not Working

## 🔴 Current Issue
Your AI is not responding because the API keys are not configured properly.

## 📋 Step-by-Step Solution

### Step 1: Get Your Groq API Keys

1. Go to **https://console.groq.com**
2. Sign up or log in
3. Click on **"API Keys"** in the sidebar
4. Click **"Create API Key"** 
5. Give it a name (e.g., "AJ-Studioz-Key-1")
6. Copy the key (starts with `gsk_`)
7. **IMPORTANT**: Create 5 different API keys for rotation

### Step 2: Update Local Environment (.env.local)

Replace the content of `.env.local` with:

```env
# Groq API Keys (REPLACE WITH YOUR ACTUAL KEYS)
GROQ_API_KEY=gsk_your_first_actual_api_key_here
GROQ_API_KEY_2=gsk_your_second_actual_api_key_here
GROQ_API_KEY_3=gsk_your_third_actual_api_key_here
GROQ_API_KEY_4=gsk_your_fourth_actual_api_key_here
GROQ_API_KEY_5=gsk_your_fifth_actual_api_key_here

# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=2rVQrGh3WKjxiJqxHQBzUvXnpQp4bGvK

# Database URL (for local development - optional)
POSTGRES_URL=postgresql://localhost:5432/your_db

# Optional (for file uploads and caching)
BLOB_READ_WRITE_TOKEN=****
REDIS_URL=****
```

### Step 3: Update Production Environment (Vercel)

1. Go to **https://vercel.com**
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**
4. Add each key:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `GROQ_API_KEY` | Your 1st key | ✅ All |
| `GROQ_API_KEY_2` | Your 2nd key | ✅ All |
| `GROQ_API_KEY_3` | Your 3rd key | ✅ All |
| `GROQ_API_KEY_4` | Your 4th key | ✅ All |
| `GROQ_API_KEY_5` | Your 5th key | ✅ All |

**IMPORTANT**: Check all three boxes for each variable:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Step 4: Test Locally

```bash
# Start development server
pnpm dev

# Open your browser to http://localhost:5000
# Send a test message: "Hello"
# AI should respond within 2-3 seconds
```

### Step 5: Deploy to Production

After updating Vercel environment variables:

```bash
# Trigger redeploy
git commit --allow-empty -m "trigger redeploy with API keys"
git push origin main
```

Or redeploy from Vercel dashboard.

## 🔍 Verify It's Working

### Check Console Logs:
Look for this message when the server starts:
```
[Groq] Initialized with 5 API key(s)
```

### When Keys Rotate:
```
[Groq] Marked key #2 as rate-limited
```

## 📊 Benefits of 5 API Keys

- **500,000 tokens/day** instead of 100,000
- **Automatic failover** when rate limited
- **No downtime** during high usage
- **Smart recovery** after cooldowns

## 🚨 Common Mistakes

1. ❌ **Placeholder values**: Make sure to replace `gsk_your_actual_api_key_here`
2. ❌ **Not redeploying**: Environment changes require redeployment
3. ❌ **Missing environments**: Check all 3 boxes in Vercel
4. ❌ **Invalid keys**: Test each key individually first

## 🧪 Test Your API Keys

Before adding to .env, test if your keys work:

### PowerShell:
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_GROQ_API_KEY_HERE"
}
Invoke-RestMethod -Uri "https://api.groq.com/openai/v1/models" -Headers $headers
```

If it returns a list of models, your key is valid.

## ✅ Success Indicators

You'll know it's working when:

1. ✅ AI responds to your messages
2. ✅ No 500 errors in console
3. ✅ Console shows "Initialized with 5 API key(s)"
4. ✅ Chat history is saved properly

## 🆘 Still Not Working?

If AI still doesn't respond:

1. **Check Vercel Logs**: Go to your deployment → Functions → Look for errors
2. **Verify Keys**: Test each API key with curl/PowerShell
3. **Check Quotas**: Make sure you haven't hit rate limits on Groq
4. **Hard Refresh**: Clear browser cache (Ctrl+Shift+R)

---

**The most common issue is using placeholder values instead of real API keys!**