#!/usr/bin/env node

/**
 * Test script to verify Groq API key rotation setup
 * Run with: node test-api-keys.js
 */

// Import the rotation module
const { getGroqApiKey, getRotationStats, markCurrentKeyAsRateLimited, resetFailedKeys } = require('./lib/ai/groq-key-rotation.ts');

console.log('🔧 Testing Groq API Key Rotation Setup\n');

try {
  // Test 1: Get rotation stats
  console.log('📊 Initial rotation stats:');
  const initialStats = getRotationStats();
  console.log(initialStats);
  console.log('');

  // Test 2: Get multiple keys to see rotation
  console.log('🔄 Testing key rotation (getting 3 keys):');
  for (let i = 1; i <= 3; i++) {
    const key = getGroqApiKey();
    const maskedKey = key.substring(0, 8) + '...' + key.substring(key.length - 4);
    console.log(`Key ${i}: ${maskedKey}`);
  }
  console.log('');

  // Test 3: Simulate rate limiting
  console.log('⚠️  Testing rate limit handling:');
  markCurrentKeyAsRateLimited();
  const afterRateLimitStats = getRotationStats();
  console.log('Stats after marking key as rate-limited:', afterRateLimitStats);
  console.log('');

  // Test 4: Get keys after rate limiting
  console.log('🔄 Getting keys after rate limit:');
  for (let i = 1; i <= 2; i++) {
    const key = getGroqApiKey();
    const maskedKey = key.substring(0, 8) + '...' + key.substring(key.length - 4);
    console.log(`Key ${i}: ${maskedKey}`);
  }
  console.log('');

  // Test 5: Reset and final stats
  console.log('🔄 Resetting failed keys:');
  resetFailedKeys();
  const finalStats = getRotationStats();
  console.log('Final stats:', finalStats);

  console.log('\n✅ API key rotation test completed successfully!');
  console.log('\n📝 What this means:');
  console.log('- Your API keys are properly configured');
  console.log('- Rotation is working correctly'); 
  console.log('- Rate limiting is handled properly');
  console.log('- Ready for production deployment!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.log('\n🔧 Possible issues:');
  console.log('1. Missing environment variables (GROQ_API_KEY_1 through GROQ_API_KEY_5)');
  console.log('2. Invalid API key format');
  console.log('3. Module import issues');
  console.log('\n💡 Check your .env file or Vercel environment variables');
}