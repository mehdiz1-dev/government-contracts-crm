// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Get the Supabase project reference from the URL
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '');
  const supabaseAuthCookieName = `sb-${projectRef}-auth-token`; // The actual cookie name

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // --- NEW LOG ---
          console.log(`Middleware Cookies Get: Attempting to get "${name}"`);
          const cookieValue = request.cookies.get(name)?.value;
          console.log(`Middleware Cookies Get: Found "${name}": ${!!cookieValue}`);
          // --- Specific Supabase Auth Cookie Check ---
          if (name === supabaseAuthCookieName) {
            console.log(`Middleware Cookies Get: Specific Auth Token "${supabaseAuthCookieName}" found: ${!!request.cookies.get(supabaseAuthCookieName)?.value}`);
          }
          // --- END NEW LOG ---
          return cookieValue;
        },
        set(name: string, value: string, options: any) {
          console.log(`Middleware Cookies Set: Setting "${name}"`); // NEW LOG
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          console.log(`Middleware Cookies Remove: Removing "${name}"`); // NEW LOG
          response.cookies.set(name, '', options);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  console.log(`Middleware: Request for pathname: ${request.nextUrl.pathname}`);
  console.log(`Middleware: Session found by getSession(): ${!!session}`); // What middleware sees after getSession()
  console.log(`Middleware: URL hash includes access_token: ${request.nextUrl.hash.includes('access_token=')}`);
  console.log(`Middleware: Full URL hash: ${request.nextUrl.hash}`);

  const { pathname } = request.nextUrl;
  const urlHasAccessToken = request.nextUrl.hash.includes('access_token=');

  if (pathname === '/callback') {
      if (urlHasAccessToken && session) {
          console.log('Middleware: /callback with session. FORCING CLEAN REDIRECT to /dashboard.');
          const dashboardUrl = new URL('/dashboard', request.url);
          return NextResponse.redirect(dashboardUrl);
      } else if (urlHasAccessToken && !session) {
          console.log('Middleware: /callback - URL has tokens but no immediate server session. Allowing client-side process.');
          return response;
      } else {
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

  if (pathname === '/dashboard' && urlHasAccessToken) {
    if (session) {
      console.log('Middleware: /dashboard - Cleaning OAuth URL hash...');
      const redirectUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  const protectedRoutes = ['/dashboard', '/contracts', '/clients', '/procurement', '/tasks', '/reports'];
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback'];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

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

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};