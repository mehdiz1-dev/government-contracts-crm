// src/lib/supabase.ts
// This client is for use on the client-side (browser components).

import { createBrowserClient } from '@supabase/ssr'; // <--- CORRECT IMPORT for CLIENT-SIDE

// Ensure these are environment variables available on the client-side (NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables in .env.local');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey); // <--- Use createBrowserClient