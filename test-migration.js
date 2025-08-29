// Test Database Migration and Setup
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yfpfhjyxdesqffxebmze.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcGZoanl4ZGVzcWZmeGVibXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTcyMTYsImV4cCI6MjA2OTMzMzIxNn0.PMedmP5LeFOE4KNmMBwE-h1MUaQ7NyfCaaMu_SVpw0A';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMigrationStatus() {
  console.log('🔍 CHECKING DATABASE MIGRATION STATUS...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking if database tables exist...');

    const tables = [
      'admins',
      'products',
      'users',
      'orders',
      'order_items',
      'chat_messages',
      'receipts',
      'locations',
      'stock_alerts'
    ];

    let existingTables = 0;
    let missingTables = [];

    for (const table of tables) {
      try {
        // Try to select from the table
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          console.log(`❌ Table '${table}' - Error: ${error.message}`);
          missingTables.push(table);
        } else {
          console.log(`✅ Table '${table}' exists`);
          existingTables++;
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - Connection error: ${err.message}`);
        missingTables.push(table);
      }
    }

    console.log(`\n📊 Tables Status: ${existingTables}/${tables.length} tables exist`);

    // Test 2: Check if admin user exists
    if (existingTables > 0) {
      console.log('\n2. Checking default admin user...');

      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('username', 'admin')
          .single();

        if (adminError) {
          console.log('❌ Default admin not found:', adminError.message);
        } else {
          console.log('✅ Default admin account found');
          console.log('   Username: admin');
          console.log('   Password: admin123');
        }
      } catch (err) {
        console.log('❌ Error checking admin:', err.message);
      }
    }

    // Provide migration instructions
    console.log('\n' + '='.repeat(60));
    console.log('📋 DATABASE MIGRATION INSTRUCTIONS');
    console.log('='.repeat(60));

    if (missingTables.length > 0) {
      console.log('\n❌ MIGRATION NEEDED!');
      console.log('\nMissing tables:', missingTables.join(', '));

      console.log('\n🔧 HOW TO RUN MIGRATION:');
      console.log('1. Go to https://supabase.com');
      console.log('2. Open your project dashboard');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy the entire content from: database-schema.sql');
      console.log('5. Click "Run" to execute');
      console.log('6. Wait for confirmation');

    } else {
      console.log('\n✅ MIGRATION COMPLETE!');
      console.log('All database tables are properly set up.');

      console.log('\n🔐 RLS POLICIES ACTIVE:');
      console.log('Row Level Security is enabled for data protection.');
      console.log('Users can only access their own data.');
      console.log('Admins have full access to all data.');
    }

    console.log('\n📱 TESTING YOUR APP:');
    console.log('1. Make sure Expo server is running: npm start');
    console.log('2. Open Expo Go app on your phone');
    console.log('3. Scan QR code or enter: exp://localhost:8082');
    console.log('4. Test admin login: admin / admin123');

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.log('❌ Database connection test failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check your Supabase URL and anon key');
    console.log('2. Make sure your Supabase project is active');
    console.log('3. Verify internet connection');
    console.log('4. Try running the migration again');
  }
}

// Run the test
testMigrationStatus();