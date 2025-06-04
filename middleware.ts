// middleware.ts
// This middleware is responsible for refreshing the user's Supabase session
// and handling cookie synchronization between Supabase and Next.js.

import { createServerClient } from '@supabase/ssr'; // <-- CORRECT IMPORT for server-side middleware
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers'; // <-- Needed for accessing cookies in middleware context

export async function middleware(request: NextRequest) {
  // Clone the request's response to enable setting cookies.
  // This is crucial for modifying headers like 'Set-Cookie'.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // --- Middleware must create its own server-side client ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // These logs will appear in Vercel's Functions/Logs tab
          console.log(`Middleware Cookies Get: Attempting to get "${name}"`);
          const cookieValue = request.cookies.get(name)?.value;
          console.log(`Middleware Cookies Get: Found "${name}": ${!!cookieValue}`);
          const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '');
          const supabaseAuthCookieName = `sb-${projectRef}-auth-token`;
          if (name === supabaseAuthCookieName) {
            console.log(`Middleware Cookies Get: Specific Auth Token "${supabaseAuthCookieName}" found: ${!!cookieValue}`);
          }
          return cookieValue;
        },
        set(name: string, value: string, options: any) {
          console.log(`Middleware Cookies Set: Setting "${name}"`);
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          console.log(`Middleware Cookies Remove: Removing "${name}"`);
          response.cookies.set(name, '', options);
        },
      },
    }
  );
  // --- End middleware client creation ---

  // IMPORTANT: This `getSession` call is crucial for refreshing and syncing session cookies.
  // It ensures the `response` object gets updated with fresh cookies for the browser.
  const { data: { session } } = await supabase.auth.getSession();

  // --- MIDDLEWARE DEBUGGING LOGS ---
  console.log(`Middleware: Request for pathname: ${request.nextUrl.pathname}`);
  console.log(`Middleware: Session found by getSession(): ${!!session}`); // What middleware sees after getSession()
  console.log(`Middleware: URL hash includes access_token: ${request.nextUrl.hash.includes('access_token=')}`);
  // console.log(`Middleware: Full URL hash: ${request.nextUrl.hash}`); // Uncomment for deeper debug if needed
  // --- END MIDDLEWARE DEBUGGING LOGS ---

  const { pathname } = request.nextUrl;
  const urlHasAccessToken = request.nextUrl.hash.includes('access_token=');

  // --- PRIMARY AUTHENTICATION LOGIC ---

  // 1. Handle /callback redirect (client-side processed, middleware forces clean redirect)
  if (pathname === '/callback') { // This is the /callback route
    if (urlHasAccessToken && session) { // If it has tokens AND middleware finds a session
      console.log('Middleware: /callback with session. FORCING CLEAN REDIRECT to /dashboard.');
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    } else if (urlHasAccessToken && !session) { // If it has tokens but middleware getSession() *didn't* find a session
      console.log('Middleware: /callback - URL has tokens but no immediate server session. Allowing client-side process.');
      return response; // Let the client-side AuthCallbackPage render and try to sync
    } else { // If just /callback without hash (e.g., direct visit or refresh on callback page)
      console.log('Middleware: /callback - No tokens in hash. Redirecting based on server session status.');
      if (!session) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      } else {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // 2. Protect routes: Redirect unauthenticated users from protected areas
  const protectedRoutes = ['/dashboard', '/contracts', '/clients', '/procurement', '/tasks', '/reports'];
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback']; // '/callback' is explicitly handled above

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 3. Conditional Redirects based on Session Status (for other pages)
  if (isProtectedRoute && !session) {
    console.log(`Middleware: Unauthorized access to ${pathname}. Redirecting to /login.`);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session) {
    console.log(`Middleware: Authenticated user trying to access auth route ${pathname}. Redirecting to /dashboard.`);
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response; // Continue to the requested page
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};