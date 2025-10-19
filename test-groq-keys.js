#!/usr/bin/env node

/**
 * Test script to verify Groq API keys are working
 * Run with: node test-groq-keys.js
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const apiKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(key => key && !key.includes('your_'));

console.log('🔍 Testing Groq API Keys...\n');
console.log(`Found ${apiKeys.length} API key(s) to test\n`);

if (apiKeys.length === 0) {
  console.error('❌ No valid API keys found!');
  console.error('Please update your .env.local file with actual Groq API keys.');
  process.exit(1);
}

async function testApiKey(apiKey, index) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Hello! Just testing the API.' }],
      max_tokens: 10
    });

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Key #${index + 1}: Working (${apiKey.substring(0, 20)}...)`);
          resolve(true);
        } else if (res.statusCode === 429) {
          console.log(`⚠️  Key #${index + 1}: Rate limited (${apiKey.substring(0, 20)}...)`);
          resolve(false);
        } else {
          console.log(`❌ Key #${index + 1}: Invalid (${apiKey.substring(0, 20)}...) - Status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Key #${index + 1}: Error (${apiKey.substring(0, 20)}...) - ${error.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function testAllKeys() {
  console.log('Testing all API keys...\n');
  
  let workingKeys = 0;
  
  for (let i = 0; i < apiKeys.length; i++) {
    const isWorking = await testApiKey(apiKeys[i], i);
    if (isWorking) workingKeys++;
    
    // Add small delay between requests
    if (i < apiKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`✅ Working keys: ${workingKeys}/${apiKeys.length}`);
  console.log(`📈 Total capacity: ${workingKeys * 100000} tokens/day`);
  
  if (workingKeys === 0) {
    console.log('\n❌ No working API keys found!');
    console.log('Please check your API keys at https://console.groq.com');
  } else if (workingKeys < apiKeys.length) {
    console.log('\n⚠️  Some API keys are not working. Check your keys at https://console.groq.com');
  } else {
    console.log('\n🎉 All API keys are working! Your rotation system is ready.');
  }
}

testAllKeys().catch(console.error);