// src/components/auth/LogoutButton.tsx
'use client'; // This is a client component

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Your client-side Supabase client

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      router.push('/login'); // Redirect to login page after logout
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left p-2 rounded-md hover:bg-gray-700 text-red-400"
    >
      Logout
    </button>
  );
}