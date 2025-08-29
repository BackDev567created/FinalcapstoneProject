// Create Admin Account
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Load environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdminAccount() {
  console.log('👤 CREATING ADMIN ACCOUNT...\n');

  const adminData = {
    username: 'admin',
    password: 'admin123'
  };

  try {
    // Hash the password
    console.log('1. Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminData.password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Insert admin account
    console.log('\n2. Creating admin account in database...');
    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          username: adminData.username,
          password_hash: passwordHash
        }
      ])
      .select();

    if (error) {
      console.log('❌ Error creating admin account:', error.message);

      // If admin already exists, that's okay
      if (error.code === '23505') { // Unique constraint violation
        console.log('ℹ️  Admin account already exists');

        // Try to fetch existing admin
        const { data: existingAdmin, error: fetchError } = await supabase
          .from('admins')
          .select('*')
          .eq('username', adminData.username)
          .single();

        if (fetchError) {
          console.log('❌ Error fetching existing admin:', fetchError.message);
        } else {
          console.log('✅ Existing admin account found:');
          console.log('   Username:', existingAdmin.username);
          console.log('   Created:', existingAdmin.created_at);
        }
      }
    } else {
      console.log('✅ Admin account created successfully!');
      console.log('   Username:', data[0].username);
      console.log('   Created:', data[0].created_at);
    }

    // Verify admin account exists
    console.log('\n3. Verifying admin account...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('admins')
      .select('username, created_at')
      .eq('username', adminData.username)
      .single();

    if (verifyError) {
      console.log('❌ Error verifying admin account:', verifyError.message);
    } else {
      console.log('✅ Admin account verified:');
      console.log('   Username:', verifyData.username);
      console.log('   Password: admin123');
      console.log('   Created:', verifyData.created_at);
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎯 ADMIN ACCOUNT SETUP COMPLETE');
  console.log('=' .repeat(50));
  console.log('\n📱 You can now login to your app with:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('\n🚀 Ready to test your LPG e-commerce app!');
}

// Run the admin creation
createAdminAccount();