// Test Environment Variables
require('dotenv').config();
console.log('🔍 TESTING ENVIRONMENT VARIABLES...\n');

console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);

console.log('\n📋 Current Working Directory:', process.cwd());

console.log('\n📄 .env file contents:');
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log(envContent);
  } else {
    console.log('❌ .env file not found');
  }
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}

console.log('\n' + '='.repeat(50));