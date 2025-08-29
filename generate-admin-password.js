// Generate bcrypt hash for admin password
const bcrypt = require('bcryptjs');

async function generateAdminPassword() {
  const password = 'admin123';
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Generated bcrypt hash for admin password:');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Length:', hash.length, 'characters');
    console.log('');
    console.log('📋 Copy this hash to your database migration:');
    console.log(`INSERT INTO admins (username, password_hash) VALUES ('admin', '${hash}');`);
    console.log('');
    console.log('✅ Hash generated successfully!');
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

// Run the generator
generateAdminPassword();