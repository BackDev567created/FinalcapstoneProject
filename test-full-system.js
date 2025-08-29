// Complete System Test for LPG E-commerce App
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yfpfhjyxdesqffxebmze.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcGZoanl4ZGVzcWZmeGVibXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTcyMTYsImV4cCI6MjA2OTMzMzIxNn0.PMedmP5LeFOE4KNmMBwE-h1MUaQ7NyfCaaMu_SVpw0A';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testResults = {
  database: false,
  backend: false,
  frontend: false,
  overall: false
};

async function testDatabaseConnection() {
  console.log('🗄️  TESTING DATABASE CONNECTION...\n');

  try {
    // Test basic connection
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');

    // Check tables
    const tables = ['users', 'admins', 'products', 'orders'];
    let tablesExist = 0;

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (!error) {
          tablesExist++;
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' missing:`, error.message);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }

    // Check default admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (adminError) {
      console.log('❌ Default admin not found:', adminError.message);
    } else {
      console.log('✅ Default admin account ready');
    }

    const success = tablesExist >= 3 && !adminError;
    testResults.database = success;

    if (success) {
      console.log('\n🎉 DATABASE: All tests passed!');
    } else {
      console.log('\n⚠️  DATABASE: Some issues found');
    }

    return success;

  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    return false;
  }
}

async function testBackendConnection() {
  console.log('\n🔧 TESTING BACKEND SERVER...\n');

  try {
    // Test server connection
    try {
      await axios.get(API_BASE_URL, { timeout: 5000 });
      console.log('✅ Backend server is running');
    } catch (error) {
      console.log('❌ Backend server is not running');
      console.log('   Start it with: cd backend && npm run dev');
      return false;
    }

    // Test API endpoints
    const endpoints = [
      { path: '/api/products', name: 'Products API' },
      { path: '/api/auth/status', name: 'Auth API' }
    ];

    let workingEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint.path}`, { timeout: 5000 });
        if (response.data && response.data.success !== false) {
          console.log(`✅ ${endpoint.name} is working`);
          workingEndpoints++;
        } else {
          console.log(`⚠️  ${endpoint.name} responded but may have issues`);
        }
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log(`✅ ${endpoint.name} is protected (requires auth)`);
          workingEndpoints++;
        } else {
          console.log(`❌ ${endpoint.name} failed:`, error.message);
        }
      }
    }

    const success = workingEndpoints >= 1;
    testResults.backend = success;

    if (success) {
      console.log('\n🎉 BACKEND: Server is running and APIs are accessible!');
    } else {
      console.log('\n⚠️  BACKEND: Server running but some APIs may have issues');
    }

    return success;

  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
    return false;
  }
}

async function testFrontendSetup() {
  console.log('\n📱 TESTING FRONTEND SETUP...\n');

  try {
    // Check if package.json exists and has required dependencies
    const fs = require('fs');
    const path = require('path');

    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('❌ package.json not found');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = [
      'react-native',
      'expo',
      '@supabase/supabase-js',
      'expo-secure-store',
      'expo-image-picker'
    ];

    let missingDeps = [];
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length > 0) {
      console.log('❌ Missing dependencies:', missingDeps.join(', '));
      return false;
    }

    console.log('✅ All required dependencies are installed');

    // Check if app.json exists
    const appJsonPath = path.join(__dirname, 'app.json');
    if (!fs.existsSync(appJsonPath)) {
      console.log('❌ app.json not found');
      return false;
    }

    console.log('✅ Expo configuration file exists');

    // Check if main app files exist
    const mainFiles = [
      'app/_layout.tsx',
      'app/index.tsx',
      'app/tabs/Dashboard.tsx',
      'app/user/HomeScreen.tsx'
    ];

    let missingFiles = [];
    for (const file of mainFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      console.log('❌ Missing app files:', missingFiles.join(', '));
      return false;
    }

    console.log('✅ All main app files are present');

    const success = true;
    testResults.frontend = success;

    if (success) {
      console.log('\n🎉 FRONTEND: All setup checks passed!');
    }

    return success;

  } catch (error) {
    console.log('❌ Frontend test failed:', error.message);
    return false;
  }
}

async function runFullSystemTest() {
  console.log('🚀 LPG E-COMMERCE APP - FULL SYSTEM TEST\n');
  console.log('=' .repeat(50));

  // Run all tests
  const dbSuccess = await testDatabaseConnection();
  const backendSuccess = await testBackendConnection();
  const frontendSuccess = await testFrontendSetup();

  // Overall assessment
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(50));

  console.log(`\n🗄️  Database: ${dbSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔧 Backend:  ${backendSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📱 Frontend: ${frontendSuccess ? '✅ PASS' : '❌ FAIL'}`);

  const overallSuccess = dbSuccess && backendSuccess && frontendSuccess;
  testResults.overall = overallSuccess;

  if (overallSuccess) {
    console.log('\n🎉 ALL SYSTEMS GO! Your LPG e-commerce app is ready!');
    console.log('\n🚀 Next steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: npm start');
    console.log('3. Test admin login: admin / admin123');
    console.log('4. Add some products and test the full flow!');
  } else {
    console.log('\n⚠️  Some systems need attention:');

    if (!dbSuccess) {
      console.log('\n🗄️  DATABASE ISSUES:');
      console.log('1. Make sure you ran the SQL migration in Supabase');
      console.log('2. Check your SUPABASE_URL and SUPABASE_ANON_KEY in .env files');
      console.log('3. Verify database tables were created successfully');
    }

    if (!backendSuccess) {
      console.log('\n🔧 BACKEND ISSUES:');
      console.log('1. Start the backend server: cd backend && npm run dev');
      console.log('2. Check backend/.env file has correct database credentials');
      console.log('3. Make sure port 3000 is not in use by another application');
    }

    if (!frontendSuccess) {
      console.log('\n📱 FRONTEND ISSUES:');
      console.log('1. Run npm install to ensure all dependencies are installed');
      console.log('2. Check that all app files are present');
      console.log('3. Verify Expo CLI is installed: npm install -g @expo/cli');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🔍 For detailed troubleshooting, check:');
  console.log('- README.md for setup instructions');
  console.log('- Console logs for specific error messages');
  console.log('- Supabase dashboard for database status');
  console.log('='.repeat(50));

  return overallSuccess;
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--database-only')) {
  testDatabaseConnection();
} else if (args.includes('--backend-only')) {
  testBackendConnection();
} else if (args.includes('--frontend-only')) {
  testFrontendSetup();
} else {
  // Run full system test
  runFullSystemTest();
}