// middleware.ts
import { supabase } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server';



const protectedRoutes = ['/dashboard', '/contracts', '/clients', '/procurement', '/tasks', '/reports'];
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback']; export async function middleware(request: NextRequest) {

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !session) {

    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};