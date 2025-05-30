// src/utils/supabase/server.ts
// This client is for use in Server Components and Server Actions.
// It is typically used to perform authenticated actions (like fetching user data)
// or to interact with your Supabase database from the server.

import { createServerClient, type CookieOptions } from '@supabase/ssr'; // IMPORT createServerClient
import { cookies } from 'next/headers'; // IMPORT cookies

export const createClient = async () => { // <--- CORRECT EXPORT NAME and async
  const cookieStore = await cookies(); // AWAIT cookies()

  // Get the Supabase project reference from the URL for logging/cookie naming
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '');
  const supabaseAuthCookieName = `sb-${projectRef}-auth-token`; // The actual cookie name

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // --- LOGS FOR DEBUGGING COOKIE ACCESS ---
          console.log(`Server Client Cookies Get: Attempting to get "${name}"`);
          const cookieValue = cookieStore.get(name)?.value;
          console.log(`Server Client Cookies Get: Found "${name}": ${!!cookieValue}`);
          // Specific check for the main Supabase auth token
          if (name === supabaseAuthCookieName) {
            console.log(`Server Client Cookies Get: Specific Auth Token "${supabaseAuthCookieName}" found: ${!!cookieValue}`);
          }
          // --- END LOGS ---
          return cookieValue;
        },
        set(name: string, value: string, options: CookieOptions) {
          // --- LOGS FOR DEBUGGING COOKIE SET ---
          console.log(`Server Client Cookies Set: Setting "${name}"`);
          // --- END LOGS ---
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn("Server client: Cookie set failed in read-only context:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          // --- LOGS FOR DEBUGGING COOKIE REMOVE ---
          console.log(`Server Client Cookies Remove: Removing "${name}"`);
          // --- END LOGS ---
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn("Server client: Cookie remove failed in read-only context:", error);
          }
        },
      },
    }
  );
};