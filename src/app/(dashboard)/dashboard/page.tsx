'use client';
import { useAuthUser } from '@/hooks/userAuthUSer';

export default function DashboardPage() {
  const { user } = useAuthUser()

  console.log('Dashboard Page: Current user:', user);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your CRM Dashboard!</h1>
      <p className="text-lg">
        User status on dashboard: {user ? `Logged in as ${user.email}` : 'Not logged in.'}
      </p>
      <p className="mt-4">This is your actual dashboard content area.</p>
    </div>
  );
}