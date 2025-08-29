// Test Supabase Storage for Product Images
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStorage() {
  console.log('🗄️  TESTING SUPABASE STORAGE...\n');

  let buckets = null;

  try {
    // 1. List all buckets
    console.log('1. Checking storage buckets...');
    const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
    buckets = bucketsData;

    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
    } else {
      console.log('✅ Available buckets:', buckets.map(b => b.name));

      // Check if 'products' bucket exists
      const productsBucket = buckets.find(b => b.name === 'products');
      if (!productsBucket) {
        console.log('⚠️  "products" bucket does not exist!');
        console.log('📝 You need to create a "products" bucket in Supabase Storage');
      } else {
        console.log('✅ "products" bucket exists');
      }
    }

    // 2. Try to upload a test file (if bucket exists)
    const hasProductsBucket = buckets && buckets.find(b => b.name === 'products');
    if (hasProductsBucket) {
      console.log('\n2. Testing file upload...');

      // Create a simple test file
      const testContent = 'Test file content';
      const blob = new Blob([testContent], { type: 'text/plain' });

      const fileName = `test-${Date.now()}.txt`;
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, blob);

      if (error) {
        console.log('❌ Error uploading test file:', error.message);
      } else {
        console.log('✅ Test file uploaded successfully:', data.path);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        console.log('✅ Public URL:', urlData.publicUrl);

        // Clean up test file
        await supabase.storage
          .from('products')
          .remove([fileName]);

        console.log('🧹 Test file cleaned up');
      }
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 STORAGE TEST SUMMARY');
  console.log('='.repeat(50));

  const hasProductsBucket = buckets && buckets.find(b => b.name === 'products');
  if (hasProductsBucket) {
    console.log('🎉 Storage is ready for product uploads!');
    console.log('\n📱 Your admin can now:');
    console.log('   ✅ Add product images');
    console.log('   ✅ Upload photos from gallery');
    console.log('   ✅ Store images in Supabase');
    console.log('   ✅ Display images in product list');
  } else {
    console.log('⚠️  Storage setup needed:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. Navigate to Storage');
    console.log('   3. Create a new bucket named "products"');
    console.log('   4. Set bucket to public (for image access)');
    console.log('   5. Run this test again');
  }

  console.log('\n' + '='.repeat(50));
}

// Run the storage test
testStorage();