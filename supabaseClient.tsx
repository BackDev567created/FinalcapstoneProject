// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ⛳ Replace these with values from Supabase → Project → Settings → API
const SUPABASE_URL = 'https://yfpfhjyxdesqffxebmze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcGZoanl4ZGVzcWZmeGVibXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTcyMTYsImV4cCI6MjA2OTMzMzIxNn0.PMedmP5LeFOE4KNmMBwE-h1MUaQ7NyfCaaMu_SVpw0A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
