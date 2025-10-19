# Runtime Error Fix - AI Not Responding

## 🔴 Issue: `/api/chat` returns 500 error

**Symptom**: Deployment successful, but AI chat doesn't respond

**Error**: `Failed to load resource: the server responded with a status of 500`

---

## 🔍 Root Cause

The most likely cause is **missing or invalid `GROQ_API_KEY`** in Vercel environment variables.

---

## ✅ Solution Steps

### Step 1: Verify Groq API Key

1. Go to https://console.groq.com
2. Sign in to your account
3. Navigate to **API Keys** section
4. Copy your API key (starts with `gsk_`)

### Step 2: Update Vercel Environment Variables

1. Go to https://vercel.com/ib-studiozs-projects/aj-studioz-07/settings/environment-variables
2. Find `GROQ_API_KEY` variable
3. Click **Edit**
4. Paste your valid API key from Groq
5. Make sure it's set for **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 3: Redeploy

After updating the environment variable:

**Option A: Automatic Redeploy**
- Go to https://vercel.com/ib-studiozs-projects/aj-studioz-07/deployments
- Click on the latest deployment
- Click **Redeploy** button

**Option B: Push a Change**
- The latest push (commit `e3a81c2`) will trigger automatic redeployment
- Wait for build to complete

---

## 🔧 How to Check Environment Variables

### In Vercel Dashboard:

1. Go to your project settings
2. Click **Environment Variables**
3. Verify these are set:

**Required:**
- ✅ `GROQ_API_KEY` - Your Groq API key (starts with `gsk_`)
- ✅ `AUTH_SECRET` - Random 32+ character string
- ✅ `POSTGRES_URL` - Database connection string

**Optional:**
- ⚪ `BLOB_READ_WRITE_TOKEN` - For file uploads
- ⚪ `REDIS_URL` - For caching

---

## 🔄 API Key Rotation (Recommended for Production)

To avoid rate limits and distribute load, you can configure multiple Groq API keys:

### Method 1: GROQ_API_KEYS (Recommended)

Set a single environment variable with comma-separated keys:

```
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3,gsk_key4,gsk_key5
```

**Benefits:**
- ✅ Easier to manage (single variable)
- ✅ Random key selection for load distribution
- ✅ Supports any number of keys
- ✅ Better for serverless deployments

### Method 2: Individual Variables (Legacy)

Set individual environment variables:

```
GROQ_API_KEY=gsk_key1
GROQ_API_KEY_2=gsk_key2
GROQ_API_KEY_3=gsk_key3
GROQ_API_KEY_4=gsk_key4
GROQ_API_KEY_5=gsk_key5
```

**Note:** The system automatically falls back to individual variables if `GROQ_API_KEYS` is not set.

### Setting in Vercel:

1. Go to https://vercel.com/ib-studiozs-projects/aj-studioz-07/settings/environment-variables
2. Add `GROQ_API_KEYS` variable
3. Paste your comma-separated keys (no spaces after commas recommended)
4. Set for **Production**, **Preview**, and **Development**
5. Click **Save**
6. Redeploy your application

### Token Management & Safety Margin

The system includes automatic token estimation and message trimming to prevent 413 errors:

- **Default Safety Margin:** 90% of token limit (configurable)
- **Max Tokens Per Request:** ~7,372 tokens (8,192 * 0.9)
- **Minimum Messages Kept:** 3 (to maintain context)

**How it works:**
1. Before each API call, the system estimates tokens for system prompt + messages
2. If over the limit, it automatically trims older messages
3. Always keeps the last 3 messages for context
4. Logs trimming activity for debugging

**To adjust the safety margin:**
Edit `lib/ai/request-utils.ts` and change `DEFAULT_SAFETY_MARGIN` (e.g., 0.8 for 80%).

---

## 🧪 Test Your API Key

To verify your Groq API key works, you can test it with curl:

```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY"
```

If it returns a list of models, your key is valid.

---

## 📊 Expected Behavior After Fix

Once the API key is correctly set:

1. ✅ Chat interface loads
2. ✅ You can type a message
3. ✅ AI responds within 2-3 seconds
4. ✅ No 500 errors in console

---

## 🔍 Debugging Steps

### Check Vercel Logs:

1. Go to https://vercel.com/ib-studiozs-projects/aj-studioz-07/deployments
2. Click on the latest deployment
3. Click **Functions** tab
4. Look for `/api/chat` logs
5. Check for error messages

### Common Error Messages:

**"GROQ_API_KEY environment variable is required"**
- Solution: Add the API key in Vercel settings

**"Invalid API key"**
- Solution: Get a new API key from Groq console

**"Rate limit exceeded"**
- Solution: Wait a few minutes or upgrade Groq plan

**"Model not found"**
- Solution: Check if the model name is correct in providers.ts

---

## 🎯 Quick Fix Checklist

- [ ] Groq API key is valid (test with curl)
- [ ] API key is set in Vercel environment variables
- [ ] API key is set for Production environment
- [ ] Redeployed after setting environment variable
- [ ] Checked Vercel function logs for errors
- [ ] Cleared browser cache and tried again

---

## 🆘 Still Not Working?

If the issue persists after setting the API key:

### Check These:

1. **Database Connection**: Verify `POSTGRES_URL` is valid
2. **Auth Secret**: Verify `AUTH_SECRET` is set
3. **API Limits**: Check if you've hit Groq API rate limits
4. **Model Availability**: Verify the model exists in Groq

### Get Detailed Logs:

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try sending a chat message
4. Click on the failed `/api/chat` request
5. Check **Response** tab for error details

---

## 📝 Current Status

**Latest Commit**: `e3a81c2` - "Add API key validation and better error handling"

**What Changed**:
- Added validation to check if `GROQ_API_KEY` exists
- Better error messages in logs
- Will now show clear error if API key is missing

**Next Deployment**:
- Will automatically redeploy with new error handling
- Check Vercel logs to see the exact error message

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ No 500 errors in browser console
2. ✅ AI responds to your messages
3. ✅ Chat history is saved
4. ✅ No errors in Vercel function logs

---

## 📞 Need Help?

If you're still stuck:

1. Check Vercel function logs for the exact error
2. Verify all environment variables are set correctly
3. Make sure your Groq API key is valid and has credits
4. Try creating a new API key from Groq console

---

**Most Common Fix**: Just add a valid `GROQ_API_KEY` to Vercel environment variables and redeploy!
