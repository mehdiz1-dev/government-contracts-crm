// src/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  // Get the Supabase project reference from the URL
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '');
  const supabaseAuthCookieName = `sb-${projectRef}-auth-token`; // The actual cookie name

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // --- NEW LOG ---
          console.log(`Server Client Cookies Get: Attempting to get "${name}"`);
          const cookieValue = cookieStore.get(name)?.value;
          console.log(`Server Client Cookies Get: Found "${name}": ${!!cookieValue}`);
          // --- Specific Supabase Auth Cookie Check ---
          if (name === supabaseAuthCookieName) {
            console.log(`Server Client Cookies Get: Specific Auth Token "${supabaseAuthCookieName}" found: ${!!cookieValue}`);
          }
          // --- END NEW LOG ---
          return cookieValue;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn("Server client: Cookie set failed in read-only context:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
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