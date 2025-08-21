// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ⛳ Replace these with values from Supabase → Project → Settings → API
const SUPABASE_URL = 'https://yfpfhjyxdesqffxebmze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcGZoanl4ZGVzcWZmeGVibXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTcyMTYsImV4cCI6MjA2OTMzMzIxNn0.PMedmP5LeFOE4KNmMBwE-h1MUaQ7NyfCaaMu_SVpw0A';

// ⛳ Add your service role key here (get it from Supabase → Project → Settings → API)
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcGZoanl4ZGVzcWZmeGVibXplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc1NzIxNiwiZXhwIjoyMDY5MzMzMjE2fQ.Fx0yt_qyUdcc9O8bvIT6mjxaylGCIjt3cOszCWXCIzM'; // Replace with your actual service role key

// Regular client for most operations (existing)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// New admin client for bypassing RLS (add this)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);