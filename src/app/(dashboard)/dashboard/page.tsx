// src/app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation'; // UNCOMMENT THIS
import { createClient } from '@/utils/supabase/server';
// import prisma from '@/lib/db'; // Keep commented for now

export default async function DashboardPage() {
  console.log('DashboardPage: Render started.');
  let supabase;
  try {
    supabase = await createClient();
    console.log('DashboardPage: Supabase client created. Is it truthy?', !!supabase);
    console.log('DashboardPage: Is supabase.auth truthy?', !!supabase?.auth);
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
      console.log('DashboardPage: Attempting to get user...');
      const { data: { user } } = await supabase.auth.getUser();
      authUser = user;
      console.log('DashboardPage: User fetched. Is user truthy?', !!authUser);
      if (authUser) {
        console.log('DashboardPage: User email:', authUser.email);
      }
    } catch (userError) {
      console.error('DashboardPage: Error fetching user from auth:', userError);
      authUser = null;
    }
  } else {
    console.error('DashboardPage: Supabase client or auth property is undefined, cannot fetch user.');
  }

  // --- RE-ENABLE PROTECTION ---
  if (!authUser) {
    console.log('DashboardPage: User not found, redirecting to /login');
    redirect('/login');
  }
  // --- END RE-ENABLE PROTECTION ---

  console.log('DashboardPage: Render complete. User status:', authUser ? 'Logged in' : 'Not logged in');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your CRM Dashboard!</h1>
      <p className="text-lg">
        User status on dashboard: {authUser ? `Logged in as ${authUser.email}` : 'Not logged in.'}
      </p>
      <p className="mt-4">This is your actual dashboard content area.</p>
    </div>
  );
}