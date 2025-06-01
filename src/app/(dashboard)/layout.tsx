// src/app/(dashboard)/layout.tsx
// This is a Server Component Layout that wraps all pages in the (dashboard) group

import React from 'react';
import Link from 'next/link'; // For navigation links
import { createClient } from '@/utils/supabase/server'; // For auth check in layout
import { redirect } from 'next/navigation'; // For redirecting unauthenticated users
import prisma from '@/lib/db'; // For fetching user role

// Import a client component for logout button (will create this next)
import LogoutButton from '@/components/auth/LogoutButton';
// Import a client component for sidebar toggle (will create this next)
import SidebarToggle from '@/components/layout/SidebarToggle';

// Define a type for public_users role for context (similar to DashboardPage)
interface PublicUser {
  id: string;
  email: string | null;
  role: string;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // --- Server-side Authentication & Role Fetch (for layout protection) ---
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let appUser: PublicUser | null = null;

  if (!authUser) {
    // console.log('DashboardLayout: No authUser, redirecting to /login'); // Debugging
    redirect('/login'); // Redirect unauthenticated users
  } else {
    // Fetch user's app-specific role using Prisma
    try {
      appUser = await prisma.users.findUnique({ // Corrected to prisma.users
        where: { id: authUser.id },
        select: { id: true, email: true, role: true },
      });
      // console.log('DashboardLayout: Fetched appUser role:', appUser?.role); // Debugging
    } catch (error) {
      console.error("DashboardLayout: Error fetching app user role:", error);
      // If role fetch fails, might treat as unauthorized or fallback
      redirect('/login'); // Critical error, force re-login
    }

    if (!appUser) {
      console.error("DashboardLayout: No appUser found for authUser ID, redirecting to login."); // Debugging
      redirect('/login'); // If no entry in public.users, effectively unauthorized
    }
  }
  // --- End Server-side Authentication & Role Fetch ---

  // Sidebar links structure
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contracts', label: 'Contracts' },
    { href: '/clients', label: 'Clients' },
    { href: '/procurement', label: 'Procurement' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/reports', label: 'Reports' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          CRM App
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center p-2 rounded-md hover:bg-gray-700">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">Logged in as:</p>
          <p className="text-md font-semibold">{appUser?.email}</p>
          <p className="text-xs text-gray-500">Role: {appUser?.role?.toUpperCase()}</p>
          <div className="mt-4">
            <LogoutButton /> {/* Logout button client component */}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6">
        {children} {/* This is where your page content (e.g., DashboardPage.tsx) will be rendered */}
      </main>
    </div>
  );
}