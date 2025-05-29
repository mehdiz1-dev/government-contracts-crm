// src/app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation'; // UNCOMMENT THIS
import { createClient } from '@/utils/supabase/server'; // Supabase server-side client
import prisma from '@/lib/db'; // Prisma client instance (UNCOMMENT THIS)

export default async function DashboardPage() {
  console.log('DashboardPage: Render started.'); // Keep for debugging if needed, but not strictly required
  let supabase;
  try {
    supabase = await createClient(); // AWAITING createClient()
    console.log('DashboardPage: Supabase client created. Is it truthy?', !!supabase); // Keep for debugging
    console.log('DashboardPage: Is supabase.auth truthy?', !!supabase?.auth); // Keep for debugging
  } catch (clientError) {
    console.error('DashboardPage: Error creating Supabase client:', clientError);
    return (
      <div className="p-8 text-red-500">
        <h1>Error: Could not initialize Supabase client.</h1>
        <p>{String(clientError)}</p>
      </div>
    );
  }

  let authUser = null;
  if (supabase && supabase.auth) {
    try {
      console.log('DashboardPage: Attempting to get user...'); // Keep for debugging
      const { data: { user } } = await supabase.auth.getUser();
      authUser = user;
      console.log('DashboardPage: User fetched. Is user truthy?', !!authUser); // Keep for debugging
      if (authUser) {
        console.log('DashboardPage: User email:', authUser.email); // Keep for debugging
      }
    } catch (userError) {
      console.error('DashboardPage: Error fetching user from auth:', userError);
      authUser = null; // Ensure authUser is null on error
    }
  } else {
    console.error('DashboardPage: Supabase client or auth property is undefined, cannot fetch user.'); // Keep for debugging
  }

  // --- RE-ENABLE PROTECTION (UNCOMMENT THIS) ---
  if (!authUser) {
    console.log('DashboardPage: User not found, redirecting to /login');
    redirect('/login');
  }
  // --- END RE-ENABLE PROTECTION ---

  // --- NEW: Fetch user's role from our public.users table using Prisma ---
  let userRole: string | null = null;
  let appUserEmail: string | null = authUser?.email || null; // Use optional chaining for safety

  if (authUser) { // Only fetch role if authUser is actually present
    try {
      const appUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { role: true, email: true },
      });

      if (appUser) {
        userRole = appUser.role;
        appUserEmail = appUser.email;
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      userRole = 'unknown';
    }
  }
  // --- END NEW ---
  console.log('DashboardPage: Render complete. User status:', authUser ? 'Logged in' : 'Not logged in');


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your CRM Dashboard!</h1>
      <p className="text-lg">
        You are logged in as **{appUserEmail || 'Guest'}**.
        {userRole && <span className="ml-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">({userRole.toUpperCase()})</span>}
      </p>
      <p className="mt-4">This is your actual dashboard content area.</p>
    </div>
  );
}