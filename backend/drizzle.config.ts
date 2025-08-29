// Drizzle config for local development (optional)
// Since we're using Supabase, you can run migrations directly in Supabase dashboard
// This file is for reference only

/*
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lpg_ecommerce',
  },
  verbose: true,
  strict: true,
});
*/