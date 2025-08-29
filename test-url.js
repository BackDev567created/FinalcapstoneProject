// Test Supabase URL Accessibility
require('dotenv').config();
const https = require('https');
const http = require('http');

// Load from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';

function testUrlAccessibility(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers,
        accessible: res.statusCode < 400
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testSupabaseConnectivity() {
  console.log('🌐 TESTING SUPABASE URL ACCESSIBILITY...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('=' .repeat(50));

  try {
    console.log('1. Testing basic connectivity...');
    const result = await testUrlAccessibility(SUPABASE_URL);

    if (result.accessible) {
      console.log('✅ URL is accessible');
      console.log('   Status:', result.status);
      console.log('   Response headers:', Object.keys(result.headers).length, 'headers');
    } else {
      console.log('❌ URL returned error status:', result.status);
    }

    // Test REST API endpoint
    console.log('\n2. Testing REST API endpoint...');
    const restUrl = `${SUPABASE_URL}/rest/v1/`;
    try {
      const restResult = await testUrlAccessibility(restUrl);
      if (restResult.accessible) {
        console.log('✅ REST API is accessible');
      } else {
        console.log('❌ REST API returned error:', restResult.status);
      }
    } catch (err) {
      console.log('❌ REST API not accessible:', err.message);
    }

    // Test realtime endpoint
    console.log('\n3. Testing realtime endpoint...');
    const realtimeUrl = `https://yfpfhjyxdesqffxebmze.supabase.co/realtime/v1`;
    try {
      const realtimeResult = await testUrlAccessibility(realtimeUrl);
      if (realtimeResult.accessible) {
        console.log('✅ Realtime API is accessible');
      } else {
        console.log('❌ Realtime API returned error:', realtimeResult.status);
      }
    } catch (err) {
      console.log('❌ Realtime API not accessible:', err.message);
    }

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 POSSIBLE CAUSES:');
    console.log('1. No internet connection');
    console.log('2. Firewall blocking the connection');
    console.log('3. Supabase project is paused or deleted');
    console.log('4. DNS resolution issues');
    console.log('5. Corporate proxy blocking requests');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🔍 TROUBLESHOOTING STEPS:');
  console.log('1. Check your internet connection');
  console.log('2. Try accessing the URL in a web browser');
  console.log('3. Check if Supabase project is active');
  console.log('4. Verify project URL is correct');
  console.log('5. Try disabling VPN/firewall temporarily');
  console.log('6. Test with a different network if possible');
  console.log('='.repeat(50));
}

testSupabaseConnectivity();